#!/usr/bin/env bash
# test-push-retry.sh (2026-11-18, freshness plan R3): induced races against
# scripts/_lib/push-retry.sh, the push the Tuesday chain runs.
#
# Each case builds a throwaway bare remote with main and a branch `proof`
# (main one commit ahead, as on a real branch dispatch), clones a runner
# that commits, then pushes a competing commit from a second clone first, so
# the runner's first push is really rejected by git. Local only: no network.
#  1. branch race: the runner lands on top of the competitor; main's extra
#     commit does not enter `proof`.
#  2. the old loop (rebase onto origin/main) on the same race does import
#     main's commit into `proof`: the defect this script fixes.
#  3. main race: unchanged behaviour on main.
#  4. a rebase conflict exits 1, aborts the rebase and leaves the remote as
#     the competitor left it.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PUSH="${PUSH_SCRIPT:-$HERE/_lib/push-retry.sh}"
G=(git -c user.name=push-retry-fixture -c user.email=fixture@localhost -c commit.gpgsign=false -c core.hooksPath=/dev/null -c init.defaultBranch=main -c advice.detachedHead=false)
TMP="$(mktemp -d "${TMPDIR:-/tmp}/push-retry-XXXXXX")"
pass=0; fail=0
check() { if eval "$2"; then pass=$((pass+1)); else fail=$((fail+1)); echo "  FAIL $1"; fi; }

setup() { # $1 case dir; $2 branch the runner works on
  local d="$TMP/$1"; mkdir -p "$d"
  "${G[@]}" init -q --bare "$d/origin.git"
  "${G[@]}" clone -q "$d/origin.git" "$d/seed" 2>/dev/null
  ( cd "$d/seed" && echo base > a.txt && echo x > shared.txt && "${G[@]}" add -A && "${G[@]}" commit -qm base && "${G[@]}" push -q origin HEAD:main \
    && "${G[@]}" push -q origin HEAD:refs/heads/proof \
    && echo main-only > main-only.txt && "${G[@]}" add -A && "${G[@]}" commit -qm "main only" && "${G[@]}" push -q origin HEAD:main )
  "${G[@]}" clone -q -b "$2" "$d/origin.git" "$d/runner" 2>/dev/null
  "${G[@]}" clone -q -b "$2" "$d/origin.git" "$d/rival" 2>/dev/null
}
commit_in() { ( cd "$1" && echo "$3" > "$2" && "${G[@]}" add -A && "${G[@]}" commit -qm "$4" ); }
run_push() { ( cd "$1" && GITHUB_REF_NAME="$2" PUSH_SLEEP=0 GIT_CONFIG_COUNT=2 GIT_CONFIG_KEY_0=user.name GIT_CONFIG_VALUE_0=push-retry-fixture GIT_CONFIG_KEY_1=user.email GIT_CONFIG_VALUE_1=fixture@localhost bash "$PUSH" ) >"$TMP/out.log" 2>&1; }
log_of() { "${G[@]}" --git-dir="$1/origin.git" log --format=%s "$2"; }

# 1. branch race
setup c1 proof
commit_in "$TMP/c1/rival" rival.txt r "rival commit"; ( cd "$TMP/c1/rival" && "${G[@]}" push -q origin HEAD:refs/heads/proof )
commit_in "$TMP/c1/runner" chain.txt c "chain commit"
run_push "$TMP/c1/runner" proof; rc=$?
check "1 exit 0 after a lost race" '[ $rc -eq 0 ]'
check "1 git really rejected the first push" 'grep -q "\[rejected\]" "$TMP/out.log"'
check "1 proof is chain, rival, base" '[ "$(log_of "$TMP/c1" proof | tr "\n" ,)" = "chain commit,rival commit,base," ]'
check "1 main-only commit not in proof" '! log_of "$TMP/c1" proof | grep -q "main only"'
check "1 main untouched" '[ "$(log_of "$TMP/c1" main | tr "\n" ,)" = "main only,base," ]'

# 2. the old loop on the same race: rebase onto origin/main
setup c2 proof
commit_in "$TMP/c2/rival" rival.txt r "rival commit"; ( cd "$TMP/c2/rival" && "${G[@]}" push -q origin HEAD:refs/heads/proof )
commit_in "$TMP/c2/runner" chain.txt c "chain commit"
( cd "$TMP/c2/runner" && for attempt in 1 2 3; do
    if "${G[@]}" push -q; then break; fi
    if [ "$attempt" = "3" ]; then exit 1; fi
    "${G[@]}" fetch -q origin main; "${G[@]}" rebase -q --autostash origin/main || { "${G[@]}" rebase --abort; exit 1; }
  done ) >"$TMP/old.log" 2>&1; old_rc=$?
# The rebase onto main drops the rival's branch commit, so every retry is
# rejected again: the old loop fails a branch run on any lost race.
check "2 old loop fails the branch push after its retries" '[ $old_rc -ne 0 ] && [ "$(grep -c "\[rejected\]" "$TMP/old.log")" -ge 3 ]'
check "2 old loop: the runner's HEAD carries main's commit, not the rival's" '( cd "$TMP/c2/runner" && git log --format=%s | grep -q "main only" && ! git log --format=%s | grep -q "rival commit" )'
check "2 old loop: proof still ends at the rival commit" '[ "$(log_of "$TMP/c2" proof | head -1)" = "rival commit" ]'

# 3. main race, unchanged behaviour
setup c3 main
commit_in "$TMP/c3/rival" rival.txt r "rival commit"; ( cd "$TMP/c3/rival" && "${G[@]}" push -q origin HEAD:main )
commit_in "$TMP/c3/runner" chain.txt c "chain commit"
run_push "$TMP/c3/runner" main; rc=$?
check "3 main: exit 0, chain on top of rival" '[ $rc -eq 0 ] && [ "$(log_of "$TMP/c3" main | head -2 | tr "\n" ,)" = "chain commit,rival commit," ]'

# 4. a rebase conflict
setup c4 proof
commit_in "$TMP/c4/rival" shared.txt rival-side "rival edits shared"; ( cd "$TMP/c4/rival" && "${G[@]}" push -q origin HEAD:refs/heads/proof )
commit_in "$TMP/c4/runner" shared.txt chain-side "chain edits shared"
run_push "$TMP/c4/runner" proof; rc=$?
check "4 conflict exits 1" '[ $rc -eq 1 ]'
check "4 rebase aborted, runner clean" '[ ! -d "$TMP/c4/runner/.git/rebase-merge" ] && [ -z "$(cd "$TMP/c4/runner" && git status --porcelain)" ]'
check "4 remote proof is as the rival left it" '[ "$(log_of "$TMP/c4" proof | head -1)" = "rival edits shared" ]'

# 5. a tag dispatch is refused before any push
setup c5 proof
commit_in "$TMP/c5/runner" chain.txt c "chain commit"
( cd "$TMP/c5/runner" && GITHUB_REF_NAME=v1 GITHUB_REF_TYPE=tag bash "$PUSH" ) >"$TMP/out.log" 2>&1; rc=$?
check "5 tag ref exits 1 and creates no branch" '[ $rc -eq 1 ] && ! "${G[@]}" --git-dir="$TMP/c5/origin.git" show-ref --verify -q refs/heads/v1'

rm -rf "$TMP"
echo "test-push-retry: $pass passed, $fail failed"
[ $fail -eq 0 ]
