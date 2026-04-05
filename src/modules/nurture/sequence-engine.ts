import { db } from "@/lib/db";

export interface NurtureStep {
  delay: string;
  type: "template" | "ai" | "action";
  templateId?: string;
  aiPrompt?: string;
  action?: string;
}

export interface StepAction {
  type: string;
  templateId?: string;
  prompt?: string;
}

export function getNextStepAction(step: NurtureStep): StepAction {
  switch (step.type) {
    case "template":
      return { type: "send_template", templateId: step.templateId };
    case "ai":
      return { type: "ai_generate", prompt: step.aiPrompt };
    case "action":
      return { type: step.action ?? "unknown" };
  }
}

export function parseDelay(delay: string): number {
  const match = delay.match(/^(\d+)(d|h|m)$/);
  if (!match) return 24 * 60 * 60 * 1000;

  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case "d": return value * 24 * 60 * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "m": return value * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}

export async function enrollLead(leadId: string, sequenceId: string): Promise<string> {
  const sequence = await db.nurtureSequence.findUniqueOrThrow({ where: { id: sequenceId } });
  const steps = sequence.steps as unknown as NurtureStep[];
  const firstDelay = steps.length > 0 ? parseDelay(steps[0].delay) : 0;

  const enrollment = await db.nurtureEnrollment.create({
    data: {
      leadId,
      sequenceId,
      currentStep: 0,
      status: "ACTIVE",
      nextRunAt: new Date(Date.now() + firstDelay),
    },
  });

  await db.lead.update({ where: { id: leadId }, data: { stage: "NURTURING" } });
  return enrollment.id;
}

export async function advanceEnrollment(enrollmentId: string): Promise<void> {
  const enrollment = await db.nurtureEnrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
    include: { sequence: true },
  });

  const steps = enrollment.sequence.steps as unknown as NurtureStep[];
  const nextStepIndex = enrollment.currentStep + 1;

  if (nextStepIndex >= steps.length) {
    await db.nurtureEnrollment.update({
      where: { id: enrollmentId },
      data: { status: "COMPLETED", nextRunAt: null },
    });
    return;
  }

  await db.nurtureEnrollment.update({
    where: { id: enrollmentId },
    data: {
      currentStep: nextStepIndex,
      nextRunAt: new Date(Date.now() + parseDelay(steps[nextStepIndex].delay)),
    },
  });
}

export async function pauseEnrollment(enrollmentId: string): Promise<void> {
  await db.nurtureEnrollment.update({
    where: { id: enrollmentId },
    data: { status: "PAUSED", nextRunAt: null },
  });
}

export async function resumeEnrollment(enrollmentId: string): Promise<void> {
  const enrollment = await db.nurtureEnrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
    include: { sequence: true },
  });

  const steps = enrollment.sequence.steps as unknown as NurtureStep[];
  const delay = parseDelay(steps[enrollment.currentStep]?.delay ?? "1d");

  await db.nurtureEnrollment.update({
    where: { id: enrollmentId },
    data: { status: "ACTIVE", nextRunAt: new Date(Date.now() + delay) },
  });
}
