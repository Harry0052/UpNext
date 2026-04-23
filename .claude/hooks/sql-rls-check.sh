#!/usr/bin/env bash
# Hook: block SQL changes that don't include RLS review
# Runs after Edit/Write on .sql files
# Exit 0 = pass, Exit 2 = block with message

set -euo pipefail

EVENT=$(cat)
FILE_PATH=$(echo "$EVENT" | jq -r '.tool_input.file_path // .tool_input.filePath // ""' 2>/dev/null || echo "")

# Only check SQL files
if [[ "$FILE_PATH" != *.sql ]]; then
  exit 0
fi

# Check if the SQL file contains CREATE TABLE without RLS
if grep -qi "CREATE TABLE" "$FILE_PATH" 2>/dev/null; then
  if ! grep -qi "ENABLE ROW LEVEL SECURITY\|ALTER TABLE.*ENABLE RLS" "$FILE_PATH" 2>/dev/null; then
    echo "WARNING: SQL file creates a table without enabling RLS." >&2
    echo "Every table in UpNext MUST have Row Level Security enabled." >&2
    echo "Add: ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;" >&2
    echo "" >&2
    echo "Also ensure you add:" >&2
    echo "  - RLS policies (SELECT/INSERT/UPDATE/DELETE)" >&2
    echo "  - Indexes on foreign keys" >&2
    echo "  - updated_at trigger if applicable" >&2
    exit 2
  fi
fi

# Check for DROP TABLE (dangerous)
if grep -qi "DROP TABLE" "$FILE_PATH" 2>/dev/null; then
  echo "WARNING: SQL file contains DROP TABLE." >&2
  echo "Dropping tables is destructive and irreversible in production." >&2
  echo "Consider using ALTER TABLE or soft-delete patterns instead." >&2
  exit 2
fi

# Passed checks
echo "SQL review: RLS and safety checks passed for $(basename "$FILE_PATH")"
exit 0
