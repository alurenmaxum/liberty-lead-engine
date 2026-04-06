# Messaging Framework Update

**Date:** 2026-04-06  
**Driven by:** Kiru feedback — less AI, more human, risk-led, segmented, variants

---

## Key Problems Found

### 1. `src/modules/bot/messages.ts` — Generic, product-led, single variant
- Opener: *"Thanks for reaching out about your cover review"* — sounds like a chatbot auto-reply
- No risk framing — jumped straight to process ("I need your consent to collect some basic details")
- Every state had exactly one message — no A/B learning possible
- Result messages were passive and vague ("A Liberty adviser will be in touch")
- Nudge function just prepended "Hey there! 👋 Just to keep things moving —" to the full question — robotic

### 2. `src/modules/nurture/engine.ts` — Product-led, no segmentation, no variants
- WARM message: *"we'd love to help you explore your options around retirement planning"* — generic marketing copy
- COLD message: *"We wanted to share a quick tip on financial planning"* — no hook, no reason to engage
- No segmentation — same message regardless of employment type, dependants, or cover status
- Single variant per tier — no way to learn what resonates

### 3. `src/modules/nurture/ai-generator.ts` — Wrong persona, no segmentation signals
- System prompt persona: *"helpful, professional financial education assistant"* — produces educational AI copy
- No risk-led framing instruction
- Passed only concern topic keywords to the AI — no employment, dependants, or cover context
- No variant support

### 4. `src/modules/compliance/ai-checker.ts` — Blocked legitimate risk framing
- Listed *"aggressive urgency/fear"* as non-compliant — this would flag or block risk-led messages like *"1 in 4 people can't work at some point"*, which are factually accurate and FAIS-compliant

---

## New Framework Structure

### Tone principle
Every message is written as if Kiru — a top Liberty adviser who genuinely cares — sent it personally. Short, direct, warm. No corporate filler.

### Message structure
```
[Risk hook or real-life consequence]
[Segment-specific context line if available]
[Single CTA]
```

### Variants
Key states (CONSENT, RESULT_HOT, RESULT_WARM, RESULT_COLD) now have 2–3 variants. Caller selects by `variantIndex` (e.g. `leadId hash % variants.length`). This enables passive A/B learning from reply rates.

### Segmentation signals used
| Signal | Message adjustment |
|---|---|
| `SELF_EMPLOYED` / `BUSINESS_OWNER` | "As someone running their own income, a gap in cover hits harder than most." |
| `hasDependants: true` | "With people depending on you, the stakes are higher than average." |
| `hasExistingCover: "NO"` | "You mentioned you don't have cover yet — that's exactly where we can help." |

### Risk hooks by concern (2 variants each)
- **LIFE_COVER** — family financial gap / "would your family be okay today?"
- **DISABILITY** — 1 in 4 stat / income as biggest asset
- **RETIREMENT** — average SA retires with <10% / compound growth timing
- **INVESTMENT** — inflation erosion / returns left on table
- **NOT_SURE** — underinsurance stat / 15-min conversation value

### AI generator persona
Changed from "financial education assistant" to **Kiru, a top Liberty adviser**. System prompt now:
- Instructs risk-led framing before product framing
- Passes employment type, dependants, and cover status as segment context
- Supports `variantIndex` to force fresh angles
- Keeps FAIS rules intact (no specific advice, no rates, no guaranteed eligibility)

### Compliance checker fix
Removed "aggressive urgency/fear" from the block list. Added explicit note: *"Mentioning real-life risks (income loss, underinsurance, family protection) is COMPLIANT as long as no specific product or return is recommended."*

---

## Files Changed

| File | Change |
|---|---|
| `src/modules/bot/messages.ts` | Risk-led CONSENT variants, shorter questions, human nudge/retry copy, variant support |
| `src/modules/nurture/engine.ts` | Risk hooks per concern, `buildSegmentedNurtureMessage` with segment lines, variants, WARM/COLD tone split |
| `src/modules/nurture/ai-generator.ts` | Advisor persona, risk angle mapping, segmentation signals, variant index |
| `src/modules/compliance/ai-checker.ts` | Fixed over-blocking of risk-led framing |
| `tests/modules/nurture/engine.test.ts` | New tests for segmentation, variants, WARM/COLD CTA tone |
| `tests/modules/nurture/ai-generator.test.ts` | Tests for segmentation signal passing and variant index |
| `tests/lib/pipeline.test.ts` | Updated assertions to match new message content |

---

## Tests / Build

- **87/87 tests pass**
- **`npx tsc --noEmit`** — clean
- **`npm run build`** — clean
