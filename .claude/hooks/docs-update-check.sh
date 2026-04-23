#!/usr/bin/env bash
# Hook: remind about docs updates after architecture-affecting changes
# Runs after Edit/Write on key architectural files
# Exit 0 = advisory only

set -euo pipefail

EVENT=$(cat)
FILE_PATH=$(echo "$EVENT" | jq -r '.tool_input.file_path // .tool_input.filePath // ""' 2>/dev/null || echo "")

# Files that indicate architectural changes
ARCH_PATTERNS=(
  "proxy.ts"
  "next.config.ts"
  "lib/supabase/"
  "supabase/migrations/"
  "types/database.ts"
  "lib/validations.ts"
  "lib/constants.ts"
  "app/layout.tsx"
  "app/(main)/layout.tsx"
)

NEEDS_DOCS=false
for pattern in "${ARCH_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    NEEDS_DOCS=true
    break
  fi
done

if [ "$NEEDS_DOCS" = true ]; then
  echo "Architecture-affecting file changed: $(basename "$FILE_PATH")"
  echo "Consider updating these docs if the change is significant:"
  echo "  - docs/ARCHITECTURE.md (system design)"
  echo "  - docs/DATA_MODEL.md (if DB schema changed)"
  echo "  - docs/DECISIONS.md (if a design decision was made)"
  echo "  - CLAUDE.md (if conventions changed)"
fi

exit 0
