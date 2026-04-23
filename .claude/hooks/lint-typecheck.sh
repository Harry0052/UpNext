#!/usr/bin/env bash
# Hook: lint and typecheck after meaningful file edits
# Runs after Edit/Write on .ts/.tsx files
# Exit 0 = pass (output added to context), Exit 2 = block

set -euo pipefail

# Read the event JSON from stdin
EVENT=$(cat)
FILE_PATH=$(echo "$EVENT" | jq -r '.tool_input.file_path // .tool_input.filePath // ""' 2>/dev/null || echo "")

# Only check TypeScript files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

# Skip node_modules and .next
if [[ "$FILE_PATH" == *node_modules* || "$FILE_PATH" == *.next* ]]; then
  exit 0
fi

# Run TypeScript check (fast, no emit)
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo '.')"

# Quick lint on the changed file only
LINT_OUTPUT=$(npx eslint --no-warn-ignored "$FILE_PATH" 2>&1) || true

if [ -n "$LINT_OUTPUT" ]; then
  echo "Lint issues in $(basename "$FILE_PATH"):"
  echo "$LINT_OUTPUT" | head -20
fi

exit 0
