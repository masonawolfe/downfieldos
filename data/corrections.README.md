# `corrections.jsonl` — the DFOS self-correction ledger

**Purpose.** Every data consumer that cites a fact — the site, the intel-brief
workflow, The Audible, ad-hoc analysis — checks this file first. If a claim it's
about to make has been corrected or flagged here, it must either use the corrected
version or not cite it at all.

The Aug 20 draft failure is the reason this exists. The Aug 17 intel brief
carried a correction to the Aug 10 brief; iCloud evicted the Aug 17 file mid-draft;
the assistant read the Aug 10 file and cited a claim that had already been retracted
four days earlier. DFOS's self-correction was defeated by the storage layer. This
file lives in git precisely so that can't happen again.

## Format

One JSON object per line. Newlines are the record separator. Empty lines are
allowed. No comments (strict JSONL). Append-only in practice — corrections are
never edited or deleted; if one turns out to be wrong, a new correction supersedes
it and the earlier record's `status` is set to `superseded`.

## Fields

Every record has:

| Field | Type | Description |
|---|---|---|
| `id` | string (kebab-case) | Stable unique ID. Convention: `cor-YYYY-MM-DD-{short-slug}`. |
| `issued` | date (YYYY-MM-DD) | When the correction was made. |
| `type` | enum | `correction`, `flag`, or `rejection`. See below. |
| `topic` | string | Human-readable label for what this is about. |
| `tags` | array of strings | Filterable tags — team codes (`SEA`, `NE`), player last-names, categories (`contract`, `injury`, `archetype`). |
| `severity` | enum | `material` (would change downstream analysis) or `minor` (typo, phrasing, low-impact). |
| `status` | enum | `active` (still stands), `superseded` (replaced by a later record — link via `superseded_by`), `resolved` (the underlying question is settled and no correction is needed going forward). |
| `evidence` | array of URLs | Sources that support the `now` / `caution` claim. |

### Type-specific fields

**`type: correction`** — the DFOS output said X; the truth is Y.
- `was` (string) — the incorrect claim, quoted or paraphrased tight.
- `now` (string) — the corrected claim.
- `supersedes` (object) — where the incorrect claim was published:
  - `source` — file path (`intel-briefs/2026-08-10-intel.md`), URL, or DFOS data file (`repo/src/data/dna.js`).
  - `claim` — one-line description of what was said.

**`type: flag`** — a claim has surfaced that we cannot verify. Don't cite it
until it's confirmed.
- `claim` (string) — the unverified claim.
- `caution` (string) — what specifically not to say.

**`type: rejection`** — a source is contaminated (prior-season, fabricated, bot
output). Don't use it at all.
- `source` (string) — the URL/file/description of the rejected material.
- `reason` (string) — why it's rejected.

### Optional fields

- `superseded_by` (string) — the `id` of a later correction that replaces this one.
- `applies_to` (array of strings) — file paths or component names the correction
  applies to (`src/data/dna.js`, `TeamIntel.jsx`). Used when a correction targets a
  specific consumer.
- `next_review` (date) — when a `flag` should be re-checked.
- `notes` (string) — free-form context. Kept short.

## Reading

The utility at `src/utils/corrections.js` exposes:

```js
import { correctionsFor, flagsFor, allActive } from '../utils/corrections';

// Every active record tagged with 'SEA'
const seaCorrections = correctionsFor('SEA');

// Every active `flag` record (don't-cite-until-verified)
const openFlags = flagsFor();

// All active corrections
const active = allActive();
```

Consumers pass a tag (team code, player name slug, topic) and get back the
subset that applies. Empty array means "no corrections found, cite freely."

## Writing

Two paths in.

**By hand for a one-off correction** — append a line to
`repo/data/corrections.jsonl`. Use a distinctive `id`. Commit.

**Programmatically from a workflow** (once Layer 2 lands) — the intel-brief
workflow's `Corrections and Flags` section is the source of truth for new
records. The workflow parses its own output section and appends to the JSONL.

## Anti-patterns to avoid

- **Editing existing lines.** If a correction is wrong, add a new record with
  `type: correction` that supersedes it. Set the old record's `status` to
  `superseded` and add `superseded_by`. Never rewrite history.
- **Vague `was` / `now` fields.** Both should be concrete enough that a
  consumer can `.includes()` on them and get useful matches. "Bad archetype"
  is not useful; "SEA archetype 'Geno Under Pressure' does not match a team
  that won SB LX without Geno at QB" is.
- **Adding a correction without evidence.** A correction with no `evidence`
  array is itself an unverified claim. Every record must cite at least one
  source (URL, official statement, DFOS canonical fact file).
- **Silent staleness.** If a `flag` has aged past `next_review` and no one has
  resolved it, that's a bug. A future cron job should surface open flags older
  than 30 days.
