export interface KeywordResult {
  result: "pass" | "flag" | "block";
  reason?: string;
}

const BLOCK_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /guarante\w*/i, reason: "guaranteed returns claim" },
  { pattern: /best\s+(investment|product|plan)\s+in/i, reason: "unsubstantiated best-of claim" },
  { pattern: /you\s+will\s+retire\s+rich/i, reason: "unrealistic promise" },
  { pattern: /double\s+your\s+money/i, reason: "unrealistic return claim" },
  { pattern: /you\s+(definitely|certainly|absolutely)\s+qualify/i, reason: "blanket qualification promise" },
  { pattern: /act\s+now\s+or/i, reason: "aggressive urgency language" },
  { pattern: /regret\s+it\s+forever/i, reason: "aggressive urgency language" },
  { pattern: /risk[\s-]*free/i, reason: "risk-free claim" },
  { pattern: /no[\s-]*risk/i, reason: "no-risk claim" },
  { pattern: /100%\s+safe/i, reason: "safety guarantee" },
];

const FLAG_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /you\s+should\s+\w*\s*(get|buy|take|choose|sign\s+up)/i, reason: "possible product recommendation" },
  { pattern: /\d+%\s+(return|growth|interest|yield)/i, reason: "specific return/growth claim" },
  { pattern: /expect\s+(around|about|approximately)?\s*\d+%/i, reason: "return expectation claim" },
  { pattern: /(liberty|sanlam|old\s+mutual|discovery)\s+\w+\s+(plan|product|policy)/i, reason: "specific product recommendation" },
  { pattern: /better\s+than\s+(other|competing|alternative)/i, reason: "unsubstantiated comparison" },
  { pattern: /cheapest|lowest\s+premium/i, reason: "unsubstantiated price claim" },
  { pattern: /tax[\s-]*(free|saving|benefit)\s+of\s+R?\d/i, reason: "specific tax benefit claim" },
];

export function checkKeywords(content: string): KeywordResult {
  for (const { pattern, reason } of BLOCK_PATTERNS) {
    if (pattern.test(content)) return { result: "block", reason };
  }
  for (const { pattern, reason } of FLAG_PATTERNS) {
    if (pattern.test(content)) return { result: "flag", reason };
  }
  return { result: "pass" };
}
