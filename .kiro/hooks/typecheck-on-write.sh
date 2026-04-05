#!/bin/bash
# PostToolUse hook: runs tsc --noEmit after any TypeScript write
# Runs lightweight incremental check — catches type errors before they accumulate

INPUT=$(cat)
TOOL=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | sed 's/"tool_name":"//;s/"//')
PATH_VAL=$(echo "$INPUT" | grep -o '"path":"[^"]*"' | head -1 | sed 's/"path":"//;s/"//')

# Only run on .ts or .tsx files
if [[ "$TOOL" != "fs_write" && "$TOOL" != "write" ]]; then
  exit 0
fi

if ! echo "$PATH_VAL" | grep -qE '\.(ts|tsx)$'; then
  exit 0
fi

# Skip generated files
if echo "$PATH_VAL" | grep -q "generated/prisma"; then
  exit 0
fi

cd /home/ubuntu/.openclaw/workspace-dev/liberty-lead-engine/liberty

RESULT=$(npx tsc --noEmit 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "TypeScript errors after writing $PATH_VAL:"
  echo "$RESULT"
fi

exit 0
