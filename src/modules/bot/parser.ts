type ResponseType = "free_text" | "options" | "yes_no" | "terminal";

interface Option {
  id: string;
  label: string;
}

const YES_WORDS = ["yes", "yeah", "yep", "yea", "y", "sure", "ok", "okay"];
const NO_WORDS = ["no", "nah", "nope", "n", "not"];

export function parseResponse(
  input: string,
  responseType: ResponseType,
  options?: Option[]
): string | null {
  const trimmed = input.trim();

  if (responseType === "free_text") return trimmed || null;

  if (responseType === "yes_no") {
    const lower = trimmed.toLowerCase();
    if (YES_WORDS.includes(lower)) return "true";
    if (NO_WORDS.includes(lower)) return "false";
    return null;
  }

  if (responseType === "options" && options) {
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && num >= 1 && num <= options.length) {
      return options[num - 1].id;
    }
    const lower = trimmed.toLowerCase();
    const byLabel = options.find((o) => o.label.toLowerCase() === lower);
    if (byLabel) return byLabel.id;
    const byId = options.find((o) => o.id === trimmed);
    if (byId) return byId.id;
    return null;
  }

  return null;
}
