#!/bin/bash
# PreToolUse hook: blocks writes to out-of-scope paths during Phase 1
# Receives hook event JSON on stdin

INPUT=$(cat)
TOOL=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | sed 's/"tool_name":"//;s/"//')
PATH_VAL=$(echo "$INPUT" | grep -o '"path":"[^"]*"' | head -1 | sed 's/"path":"//;s/"//')

# Only act on write tool
if [[ "$TOOL" != "fs_write" && "$TOOL" != "write" ]]; then
  exit 0
fi

# Out-of-scope patterns during Phase 1
OUT_OF_SCOPE=(
  "src/lib/inngest"
  "src/lib/whatsapp/client"
  "src/app/api/webhooks"
  "node_modules"
  ".next"
)

for pattern in "${OUT_OF_SCOPE[@]}"; do
  if echo "$PATH_VAL" | grep -q "$pattern"; then
    echo "SCOPE GUARD: Write to '$PATH_VAL' blocked — matches out-of-scope pattern '$pattern'. This is a Phase 2+ path. If you intended to write here, re-read .kiro/steering/scope-rules.md." >&2
    exit 2
  fi
done

exit 0
