# DFOS · draft-window freeze

**Automated + manual writes to `playerBoard2026.js` and its downstream
tables are blocked during an active draft window.** The daily
availability + board pipeline is deterministic and fine; humans are the
risk. This file names the windows.

The freeze covers the engineer too. On 2026-09-03 the board changed
twice within 40 minutes of live picks. Never again.

## Active windows

Format: one row per window, `<yaml-block>` fenced. `check-draft-freeze.mjs`
in `.github/scripts/` parses these. **Any window whose `freeze_start` ≤ now
< `draft_end` is active.**

```yaml
- id: 2026-09-07-monday-league
  draft_start: 2026-09-07T23:00:00Z   # ~6pm CT Monday
  draft_end:   2026-09-08T05:00:00Z   # 12am CT Tuesday (padded)
  freeze_start: 2026-09-06T23:00:00Z  # 24h prior — Sunday 6pm CT
  note: Mason's Monday draft. First window under E-009b.
```

## Override

Pass `override_freeze: yes` when dispatching a workflow to bypass the
gate. Use it only for genuine emergencies (data pipeline broken in a
way that would leave the board wrong during the draft). Every use is
logged in the workflow run.

Locally, set `DRAFT_FREEZE_OVERRIDE=yes` in the environment for the
same effect.

## What the gate blocks

- `data-board.yml` — the primary automated rebuild.
- Manual `npm run data:board` when run inside `.github/scripts/check-draft-freeze.mjs`
  guard (not currently enforced at the shell layer — the workflow layer
  is where writes to `main` originate).

## What it does NOT block

- `data-availability.yml` — availability refreshes are read-only and
  land in `intelligence/availability_2026.json`. They do not touch
  `playerBoard2026.js` on their own.
- Reads. Copilot sessions read the board freely during the freeze.
- The site deploy pipeline. If a board is already committed, its
  downstream deploy still runs.

## Adding a window

Append a new `- id: …` block to the YAML above. Commit. The gate reads
this file at workflow time — no additional wiring required.
