#!/usr/bin/env bash
# push-retry.sh: push HEAD to the branch this run checked out, and on a lost
# race fetch that branch, rebase onto it and try again.
#
# Written 2026-11-18 (freshness plan R3, the chain rebase fix). The Tuesday
# chain's loop fetched and rebased onto origin/main whatever branch it ran
# on. On main that is the same thing. On a branch dispatch (a proof run), a
# lost race rebased the branch's commit onto main and pushed main's commits
# into the branch. This script rebases onto origin/$BRANCH instead.
#
# Usage, from a job step after `git commit`:
#   bash scripts/_lib/push-retry.sh
# BRANCH comes from PUSH_BRANCH, else GITHUB_REF_NAME (set by Actions).
# PUSH_ATTEMPTS (default 3) and PUSH_SLEEP (default 3 to 10 s, random) exist
# for scripts/test-push-retry.sh. Exit 0 once pushed; exit 1 after the last
# attempt or on a rebase conflict, which is aborted so the tree is clean.
set -euo pipefail
BRANCH="${PUSH_BRANCH:-${GITHUB_REF_NAME:-}}"
if [ -z "$BRANCH" ]; then echo "push-retry: no branch (set GITHUB_REF_NAME or PUSH_BRANCH)"; exit 1; fi
# A tag dispatch would push a new branch named after the tag: refuse it.
if [ -n "${GITHUB_REF_TYPE:-}" ] && [ "${GITHUB_REF_TYPE}" != "branch" ] && [ -z "${PUSH_BRANCH:-}" ]; then echo "push-retry: ref ${GITHUB_REF_NAME:-} is a ${GITHUB_REF_TYPE}, not a branch"; exit 1; fi
ATTEMPTS="${PUSH_ATTEMPTS:-3}"
for attempt in $(seq 1 "$ATTEMPTS"); do
  if git push origin "HEAD:refs/heads/${BRANCH}"; then exit 0; fi
  if [ "$attempt" = "$ATTEMPTS" ]; then echo "push failed after ${ATTEMPTS} attempts"; exit 1; fi
  echo "  push attempt ${attempt} lost race; fetching origin/${BRANCH} and rebasing onto it"
  git fetch origin "$BRANCH"
  git rebase --autostash "origin/${BRANCH}" || { git rebase --abort || true; echo "  rebase failed, aborting"; exit 1; }
  sleep "${PUSH_SLEEP:-$((RANDOM % 8 + 3))}"
done
