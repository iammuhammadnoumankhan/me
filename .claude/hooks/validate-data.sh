#!/usr/bin/env bash
# PostToolUse hook: after Claude edits a content file or schema, re-run the
# content validation and feed any errors straight back (exit 2 = shown to Claude).
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  */src/_data/*.yaml|*/src/_data/*.yml|*/schemas/*.json) ;;
  *) exit 0 ;;
esac
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
if ! out=$(node scripts/validate.js 2>&1); then
  echo "$out" >&2
  exit 2
fi
