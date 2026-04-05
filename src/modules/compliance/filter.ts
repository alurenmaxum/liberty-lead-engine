import { checkKeywords, KeywordResult } from "./keyword-filter";
import { checkTone, ToneCheckResult } from "./ai-checker";
import { db } from "@/lib/db";

export interface ComplianceCheckResult {
  result: "pass" | "flag" | "block";
  reason?: string;
  keywordResult: KeywordResult;
  aiResult?: ToneCheckResult;
}

interface ComplianceContext {
  leadName?: string;
  concern?: string;
  conversationSummary?: string;
}

const SEVERITY: Record<string, number> = { pass: 0, flag: 1, block: 2 };

function worst(
  a: "pass" | "flag" | "block",
  b: "pass" | "flag" | "block"
): "pass" | "flag" | "block" {
  return SEVERITY[a] >= SEVERITY[b] ? a : b;
}

export async function checkMessage(
  messageId: string,
  content: string,
  context: ComplianceContext
): Promise<ComplianceCheckResult> {
  const keywordResult = checkKeywords(content);

  if (keywordResult.result === "block") {
    await logCheck(messageId, "keyword", keywordResult.result, keywordResult.reason);
    return { result: "block", reason: keywordResult.reason, keywordResult };
  }

  const aiResult = await checkTone(content, context);
  const finalResult = worst(keywordResult.result, aiResult.result);
  const reason =
    finalResult === "pass"
      ? undefined
      : [keywordResult.reason, aiResult.reason].filter(Boolean).join("; ");

  const checkType = keywordResult.result !== "pass" ? "keyword" : "ai";
  await logCheck(messageId, checkType, finalResult, reason);

  return { result: finalResult, reason, keywordResult, aiResult };
}

async function logCheck(
  messageId: string,
  checkType: string,
  result: string,
  reason?: string
) {
  try {
    await db.complianceLog.create({
      data: {
        messageId,
        checkType,
        result: result as "PASS" | "FLAG" | "BLOCK",
        reason,
      },
    });
  } catch {
    console.error("Failed to log compliance check", { messageId, result });
  }
}
