#!/usr/bin/env bash
# Hook: run build check on session stop or before commits
# Verifies the project still compiles
# Exit 0 = pass, Exit 2 = block

set -euo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null || echo '.')"

echo "Running build check..."
BUILD_OUTPUT=$(npm run build 2>&1) || {
  echo "BUILD FAILED:" >&2
  echo "$BUILD_OUTPUT" | tail -30 >&2
  exit 2
}

echo "Build passed successfully."
exit 0
