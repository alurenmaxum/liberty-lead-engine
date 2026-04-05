#!/bin/bash
# Stop hook: runs npm test and surfaces failures at end of each turn
# Only runs if test files exist to avoid noise on scaffolding-only turns

cd /home/ubuntu/.openclaw/workspace-dev/liberty-lead-engine/liberty

TEST_COUNT=$(find tests -name "*.test.ts" 2>/dev/null | wc -l | tr -d ' ')

if [ "$TEST_COUNT" = "0" ]; then
  exit 0
fi

RESULT=$(npm test 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  # Surface failures — Kiro will see this and fix before next prompt
  echo "=== TEST FAILURES ($TEST_COUNT test files found) ==="
  echo "$RESULT" | tail -30
  exit 0  # exit 0 so it's a warning not a blocker, but output is shown
fi

# Extract pass summary line
SUMMARY=$(echo "$RESULT" | grep -E "Tests.*passed" | tail -1)
echo "✓ All tests passing: $SUMMARY"
exit 0
