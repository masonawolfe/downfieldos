#!/usr/bin/env bash
# Parse-check every workflow file under .github/workflows/ with a real YAML
# parser. Fail loudly on any file that does not load — the tell for those
# is that GitHub silently registers them under their path with `name = path`,
# creates 0-second "workflow file issue" ghost runs on every push, and
# returns 422 on `workflow_dispatch` because it cannot see the trigger.
#
# One-line diagnosis of the pattern that shipped 12 broken workflows for
# nearly a month: a `git commit -m "…"` inside a `run: |` block scalar
# with the continuation lines at column 0. The block ends at the first
# non-empty line indented less than the block, so the parser leaves the
# `run:` value, unwinds to the document root, and meets a bare sentence
# that is not `key: value`. Fix: indent the continuation lines to match
# the block.
#
# E-026 (2026-09-16): verify with a parser before theorizing about the
# platform. GitHub Actions' behaviour under an unparseable file is
# consistent and, once you know the tell, unmistakable.

set -euo pipefail

if ! command -v ruby >/dev/null 2>&1; then
  echo "ruby not on PATH — cannot run YAML parse check" >&2
  exit 2
fi

WORKFLOW_DIR="${WORKFLOW_DIR:-.github/workflows}"
if [ ! -d "$WORKFLOW_DIR" ]; then
  echo "no workflow directory at $WORKFLOW_DIR" >&2
  exit 2
fi

fail=0
total=0
for f in "$WORKFLOW_DIR"/*.yml "$WORKFLOW_DIR"/*.yaml; do
  [ -e "$f" ] || continue
  total=$((total + 1))
  if err=$(ruby -ryaml -e 'YAML.safe_load(File.read(ARGV[0]), aliases: false, permitted_classes: [Symbol])' "$f" 2>&1); then
    echo "  ok  $f"
  else
    echo "  FAIL $f"
    echo "$err" | sed 's/^/       /' >&2
    fail=$((fail + 1))
  fi
done

echo
if [ "$fail" -gt 0 ]; then
  echo "$fail of $total workflow file(s) failed to parse. GitHub will register these under their path with name=path, ghost every push, and 422 on dispatch. Fix before pushing." >&2
  exit 1
fi
echo "all $total workflow file(s) parsed cleanly"
