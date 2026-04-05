import { BotState, STATES, getNextState } from "./states";
import { parseResponse, isCasualGreeting } from "./parser";
import { getMessageForState, getRetryMessage, getCasualNudgeMessage } from "./messages";

export interface BotContext {
  currentStep: BotState;
  retryCount: number;
  leadData: Record<string, unknown>;
}

export interface BotAction {
  type: "send_message" | "score_lead" | "offer_booking" | "flag_human";
  payload: Record<string, unknown>;
}

export interface BotResult {
  nextStep: BotState;
  retryCount: number;
  leadData: Record<string, unknown>;
  actions: BotAction[];
}

const FIELD_MAP: Partial<Record<BotState, string>> = {
  Q1_NAME: "firstName",
  Q2_AGE: "ageRange",
  Q3_EMPLOYMENT: "employmentType",
  Q4A_MARITAL: "maritalStatus",
  Q4B_DEPENDANTS: "hasDependants",
  Q5_COVER: "hasExistingCover",
  Q6_CONCERN: "primaryConcern",
  Q7_CONTACT_TIME: "preferredContactTime",
};

export function processInput(ctx: BotContext, rawInput: string): BotResult {
  const state = STATES[ctx.currentStep];
  const actions: BotAction[] = [];
  const leadData: Record<string, unknown> = {};

  const parsed = parseResponse(rawInput, state.responseType, state.options);

  if (parsed === null) {
    // Casual greetings at structured-answer states should not burn a retry
    if (state.responseType !== "free_text" && isCasualGreeting(rawInput)) {
      actions.push({ type: "send_message", payload: { body: getCasualNudgeMessage(ctx.currentStep) } });
      return { nextStep: ctx.currentStep, retryCount: ctx.retryCount, leadData, actions };
    }

    if (ctx.retryCount >= state.maxRetries) {
      actions.push({ type: "send_message", payload: { body: getMessageForState("HUMAN_TAKEOVER") } });
      actions.push({ type: "flag_human", payload: {} });
      return { nextStep: "HUMAN_TAKEOVER", retryCount: 0, leadData, actions };
    }
    actions.push({ type: "send_message", payload: { body: getRetryMessage(ctx.currentStep) } });
    return { nextStep: ctx.currentStep, retryCount: ctx.retryCount + 1, leadData, actions };
  }

  const field = FIELD_MAP[ctx.currentStep];
  if (field) {
    leadData[field] = field === "hasDependants" ? parsed === "true" : parsed;
  }

  if (ctx.currentStep === "CONSENT" && parsed === "declined") {
    actions.push({ type: "send_message", payload: { body: getMessageForState("CONSENT_DECLINED") } });
    return { nextStep: "CONSENT_DECLINED", retryCount: 0, leadData, actions };
  }

  const nextStep = getNextState(ctx.currentStep, parsed);

  if (nextStep === "SCORING") {
    actions.push({ type: "score_lead", payload: {} });
  } else {
    const msg = getMessageForState(nextStep, leadData.firstName as string | undefined);
    if (msg) actions.push({ type: "send_message", payload: { body: msg } });
  }

  return { nextStep, retryCount: 0, leadData, actions };
}
