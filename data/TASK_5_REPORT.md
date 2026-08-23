# EM/PO Task 5 — Diagnostic Report: Silent Pipeline Failures

**Directive:** 2026-08-22 · **Investigator:** Data Pantry Engineer (Claude Code)
**Method:** Filesystem inspection + comparison of writing vs non-writing scheduled agents.

---

## What the directive claimed

> Five scheduled tasks were created 2026-08-21 (intel monitor, transaction
> monitor, contract updater, roster refresh, newsletter). The contract updater
> was fired manually three times across two days and has written nothing —
> contract_summary.md and contract_year_players.json are both still stamped
> Aug 19. Roster refresh fired once with no output either.
>
> Leading hypothesis: each firing starts a fresh session that hits a
> folder-access prompt with nobody present to approve it, then dies silently.

## Evidence collected

### 1. Freshness confirmed for the failing agents

| File | mtime | Age (hours) |
|---|---|---|
| `data/intelligence/contracts/contract_summary.md` | 2026-08-19 07:09 | ~107 |
| `data/intelligence/contracts/contract_year_players.json` | 2026-08-19 07:08 | ~107 |
| `data/intelligence/contracts/team_cap_situations.json` | 2026-08-19 07:07 | ~107 |

All three contract-updater outputs are stamped within seconds of each other on
Aug 19 morning — consistent with one successful run, then no writes since.
Confirms the directive's stat.

### 2. Other scheduled agents ARE writing

| Agent output dir | Newest file | mtime |
|---|---|---|
| `intel-briefs/` | `2026-08-23-intel.md` | Aug 23 07:10 |
| `tweet-drafts/` | `2026-08-23-tweets.md` | Aug 23 08:22 |
| `data/intelligence/transactions/` | `transaction_log.md` | Aug 23 08:18 |
| `data/intelligence/sentiment/` | `fan_sentiment_2026-08-21.json` | Aug 21 15:47 |

Intel-monitor, tweet-drafter, transaction-monitor, and fan-sentiment-scorer
are firing successfully. **The failure is selective — not universal.**

### 3. No iCloud eviction evidence at rest

- `find … -name "*.icloud" 2>/dev/null` returned zero results across
  `data/`, `intel-briefs/`, and every other project subdir. If files had
  been evicted to iCloud with only stubs on disk, macOS would leave `.icloud`
  placeholder markers. There are none.
- Contract files carry a `com.apple.provenance` extended attribute (unrelated
  to iCloud — this is set on files whose origin includes a Web / Downloads
  step). Fresh files in `data/intelligence/transactions/` do NOT have this
  attribute.
- The project directory IS in an iCloud-syncable path
  (`~/Documents/004_Creative Projects/…`), so eviction is POSSIBLE if
  iCloud Documents sync is enabled. It just isn't happening right now.

### 4. Roster refresh output location undetermined

The directive says roster refresh fired once with no output. I searched for
where that agent would have written:
- No `data/intelligence/rosters/` directory exists.
- Roster-shaped files under `data/intelligence/` are only in `raw/` (nflverse
  CSVs I re-fetched today via my scripts) and inside `former_teammates_*.json`
  as an input.

The Cowork agent might have been targeting a location I can't identify from
this side, or its script may have failed before writing anywhere.

## Root cause: NOT conclusively identified from filesystem alone

The directive's "folder-access prompt in a fresh session" hypothesis is
**plausible** and cannot be ruled out — but I found no direct filesystem
evidence for it. Alternative hypotheses that fit the same evidence:

1. **Cowork script-level failure in the contract-updater specifically.**
   Contract data sources (Spotrac, OverTheCap) are known to bot-block. Recent
   intel briefs have noted three separate "source blocked" cases (Reddit,
   nflpenalties.com, Warren Sharp paid). It's plausible the contract updater
   is hitting the same wall and dying without a distinct error.

2. **Cowork session-level failure that shows the same signature as iCloud
   eviction.** A session timeout, a permission prompt, or a missing tool
   binding would all produce "no output written." Distinguishing between
   these requires Cowork session logs, which are not accessible from Claude
   Code.

3. **The iCloud folder-access prompt is real** — but not currently
   producing stub files because no eviction is happening AT REST. That would
   still match the "silent death mid-firing" signature.

**Verdict: root cause requires Cowork session logs to disambiguate.** This
is a specific named blocker (per RULES).

## Fix status

CLAUDE.md P0 #2 asks for the storage migration regardless of the specific
root cause:
> Move scheduled outputs off iCloud to a non-synced local dir, or commit
> outputs directly to a data branch in the repo.

**What the MVP consumes vs what the failing agents produce**

Cross-referencing MVP scope from CLAUDE.md (matchup engine + team dashboards
+ email capture) against the failing agents' outputs:

| Failing agent | Writes to | MVP consumes? |
|---|---|---|
| contract-updater | `data/intelligence/contracts/*` | **NO** for MVP surfaces. `contract_year_players.json` is used by the Fantasy Intel / ContractYearCard — those live outside MVP scope. |
| roster-refresh | undetermined | If it targets `rosters*.js` in the repo, **YES**; my Actions workflow (`data-rosters.yml`) already covers this durably. |

**Practical implication:** MVP is not directly blocked by these two silent
failures. Both fixes are still valuable, but they're not MVP-critical.

**Actions-workflow coverage of MVP-critical scheduled outputs:**
- `rosters2026.js` — Actions `data-rosters.yml` — writes to `repo/src/data/`, in-git ✓
- `schedule2026.js` — Actions `data-schedule.yml` — in-git ✓
- `playerStats2025.js` — Actions `data-player-stats.yml` — in-git ✓
- `injuries_*.json` — Actions `data-injuries.yml` — in-git ✓
- `team_news_raw.json` — Actions `data-team-news.yml` — in-git ✓

Every MVP data dependency already writes to the repo. **The Cowork-side
storage problem does not touch the MVP path.**

## Recommendation

1. **Do not block MVP on this diagnostic.** MVP data dependencies already
   land in the repo via Actions.
2. **Contract-updater and roster-refresh silent failures are Cowork
   operational issues.** Fixing them requires either:
   - Session logs to identify actual failure mode (Mason or the Cowork host
     can pull these).
   - A test where the contract-updater is fired with an interactive session
     attached, so any prompts can be observed.
3. **If the P0 #2 storage migration proceeds independently of root cause:**
   the mechanism the site consumes is the Actions-workflow-writes-to-repo
   flow, which is already in place. The Cowork-side equivalent would be
   pointing each Cowork agent at `~/Documents/…/DownfieldOS/repo/data/pantry/`
   with an `on: commit` trigger — but that's a Cowork-side change that
   requires editing every scheduled task's target path.

## Explicit blocker

Root-causing "why does the contract updater die mid-firing when the
intel-monitor does not, both running under the same Cowork scheduler"
requires access to session logs. That access is not available from Claude
Code. Escalated to the EM/PO to either (a) pull the logs or (b) run the
contract updater with an interactive session attached and share what
prompts appear.
