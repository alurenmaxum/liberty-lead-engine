import { db } from "@/lib/db";
import { processInput, BotContext } from "@/modules/bot/engine";
import { getMessageForState } from "@/modules/bot/messages";
import { scoreLead } from "@/modules/scoring/scorer";
import { generateBriefing } from "@/modules/appointments/briefing";
import { buildBookingMessage } from "@/modules/appointments/booking";
import { buildNurtureMessage } from "@/modules/nurture/engine";
import type {
  LeadTier,
  LeadStage,
  MessageDirection,
  MessageSource,
} from "@/app/generated/prisma/enums";

export interface IntakePayload {
  from: string;
  text: string;
  profileName?: string;
  source?: string;
}

export interface IntakeResult {
  leadId: string;
  conversationId: string;
  stage: string;
  tier: string;
  outgoingMessages: string[];
}

export async function processIntake(payload: IntakePayload): Promise<IntakeResult> {
  const { from, text, profileName, source } = payload;

  // Upsert lead
  let lead = await db.lead.findUnique({ where: { phone: from } });
  if (!lead) {
    lead = await db.lead.create({
      data: {
        phone: from,
        firstName: profileName ?? null,
        source: source ?? "simulate",
        stage: "NEW" as LeadStage,
      },
    });
  }

  // Upsert active conversation
  let conversation = await db.conversation.findFirst({
    where: { leadId: lead.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        leadId: lead.id,
        currentStep: "CONSENT",
      },
    });
  }

  // Persist inbound message
  await db.message.create({
    data: {
      conversationId: conversation.id,
      direction: "IN" as MessageDirection,
      content: text,
      source: "HUMAN" as MessageSource,
    },
  });

  const currentStep = (conversation.currentStep ?? "CONSENT") as BotContext["currentStep"];

  // Rebuild leadData from lead record
  const leadData: Record<string, unknown> = {
    firstName: lead.firstName,
    ageRange: lead.ageRange,
    employmentType: lead.employmentType,
    maritalStatus: lead.maritalStatus,
    hasDependants: lead.hasDependants,
    hasExistingCover: lead.hasExistingCover,
    primaryConcern: lead.primaryConcern,
    preferredContactTime: lead.preferredContactTime,
  };

  const ctx: BotContext = {
    currentStep,
    retryCount: conversation.retryCount,
    leadData,
  };

  const result = processInput(ctx, text);

  // Merge updated lead fields
  const updatedLeadFields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(result.leadData)) {
    if (v !== undefined && v !== null) updatedLeadFields[k] = v;
  }

  const outgoingMessages: string[] = [];

  // Handle scoring terminal state
  if (result.nextStep === "SCORING") {
    const merged = { ...leadData, ...result.leadData };
    const responseTimeMinutes = Math.round(
      (Date.now() - lead.createdAt.getTime()) / 60000
    );
    const scoreResult = scoreLead({
      hasDependants: merged.hasDependants as boolean | null,
      hasExistingCover: merged.hasExistingCover as string | null,
      employmentType: merged.employmentType as string | null,
      ageRange: merged.ageRange as string | null,
      primaryConcern: merged.primaryConcern as string | null,
      responseTimeMinutes,
    });

    updatedLeadFields.score = scoreResult.score;
    updatedLeadFields.tier = scoreResult.tier as LeadTier;

    const firstName = (merged.firstName ?? lead.firstName) as string | null | undefined;

    if (scoreResult.tier === "HOT") {
      const bookingUrl = process.env.CALENDLY_BOOKING_URL ?? "https://calendly.com/liberty-adviser";
      const msg = buildBookingMessage(firstName, bookingUrl);
      outgoingMessages.push(msg);

      const briefing = generateBriefing({
        firstName: firstName ?? null,
        lastName: lead.lastName,
        phone: lead.phone,
        ageRange: merged.ageRange as string | null,
        employmentType: merged.employmentType as string | null,
        maritalStatus: merged.maritalStatus as string | null,
        hasDependants: merged.hasDependants as boolean | null,
        hasExistingCover: merged.hasExistingCover as string | null,
        primaryConcern: merged.primaryConcern as string | null,
        isHomeowner: lead.isHomeowner,
        score: scoreResult.score,
        tier: scoreResult.tier,
      });

      await db.appointment.create({
        data: {
          leadId: lead.id,
          scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          briefing: briefing as object,
          status: "PENDING",
        },
      });

      updatedLeadFields.stage = "BOOKING" as LeadStage;
      result.nextStep = "RESULT_HOT";
    } else {
      const tier = scoreResult.tier as "WARM" | "COLD";
      const concern = merged.primaryConcern as string | null | undefined;
      const msg = buildNurtureMessage(firstName, tier, concern);
      outgoingMessages.push(msg);
      updatedLeadFields.stage = "NURTURING" as LeadStage;
      result.nextStep = scoreResult.tier === "WARM" ? "RESULT_WARM" : "RESULT_COLD";
    }
  } else {
    // Collect send_message actions
    for (const action of result.actions) {
      if (action.type === "send_message") {
        outgoingMessages.push(action.payload.body as string);
      }
    }
    // Update stage based on step
    if (result.nextStep === "CONSENT_DECLINED") {
      updatedLeadFields.stage = "LOST" as LeadStage;
    } else if (lead.stage === "NEW") {
      updatedLeadFields.stage = "QUALIFYING" as LeadStage;
    }
  }

  // If first message and no stage set yet, move to QUALIFYING
  if (!updatedLeadFields.stage && lead.stage === "NEW") {
    updatedLeadFields.stage = "QUALIFYING" as LeadStage;
  }

  // Persist outgoing messages
  for (const body of outgoingMessages) {
    await db.message.create({
      data: {
        conversationId: conversation.id,
        direction: "OUT" as MessageDirection,
        content: body,
        source: "BOT_SCRIPTED" as MessageSource,
        sentAt: new Date(),
      },
    });
  }

  // Update conversation step
  await db.conversation.update({
    where: { id: conversation.id },
    data: {
      currentStep: result.nextStep,
      retryCount: result.retryCount,
      status: ["CONSENT_DECLINED", "RESULT_HOT", "RESULT_WARM", "RESULT_COLD", "HUMAN_TAKEOVER"].includes(result.nextStep)
        ? "CLOSED"
        : "ACTIVE",
    },
  });

  // Update lead
  if (Object.keys(updatedLeadFields).length > 0) {
    await db.lead.update({
      where: { id: lead.id },
      data: updatedLeadFields,
    });
  }

  const finalLead = await db.lead.findUniqueOrThrow({ where: { id: lead.id } });

  return {
    leadId: lead.id,
    conversationId: conversation.id,
    stage: finalLead.stage,
    tier: finalLead.tier,
    outgoingMessages,
  };
}

export async function getLeadWithConversation(leadId: string) {
  return db.lead.findUnique({
    where: { id: leadId },
    include: {
      conversations: {
        include: { messages: { orderBy: { createdAt: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
      appointments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export async function getAllLeads() {
  return db.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      conversations: {
        where: { status: "ACTIVE" },
        take: 1,
      },
    },
  });
}
