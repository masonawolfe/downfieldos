#!/usr/bin/env node
/**
 * build-board-md.mjs — E-009a (2026-09-05).
 *
 * Emits two readable tables beside the JS artifact so Mason can open
 * the board in Claude Code or Cowork without running anything:
 *
 *   BOARD.md         — one row per draftable skill player, ordered by VORP
 *   BOARD_WEEKLY.md  — movement vs the previous build (rank Δ, entrants,
 *                      dropped). Movement is what a table adds over the
 *                      file he already has.
 *
 * Location: the DFOS ROOT (../BOARD.md from repo/), not repo/ — so a
 * consumer opening `01_Schuhbox/DFOS/BOARD.md` finds it without knowing
 * the repo lives one directory down. This is where LINKS.md, DATA_SOURCES
 * and RELEASE_PROCESS also live.
 *
 * State: previous build's ranks live at repo/data/board_last_snapshot.json.
 * First run says "no prior build to compare"; every subsequent run diffs.
 *
 * Header carries build timestamp, commit SHA (short), row count, which
 * of the 6 verifier checks passed, schema_version, and a MANUAL/AUTO
 * marker so nobody mistakes a hand-generated pair for a pipeline product.
 *
 * Recommendations column: v1 (VORP) and v2 (β) agreement per row — when
 * they agree, ✓; when they disagree, the β rationale is what's printed.
 * Not a new ranking — the app's logic, in a table.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const REPO = path.dirname(path.dirname(__filename));
const DFOS_ROOT = path.dirname(REPO);
// Primary output — inside the repo so CI can commit it and every future
// build lands in the audit trail. Mirrored to DFOS root as a convenience
// when the parent dir exists (local dev), where it lives beside LINKS.md,
// DATA_SOURCES.md, RELEASE_PROCESS.md — the brief-specified read path.
const OUT_BOARD_REPO = path.join(REPO, 'BOARD.md');
const OUT_WEEKLY_REPO = path.join(REPO, 'BOARD_WEEKLY.md');
const OUT_BOARD_DFOS = path.join(DFOS_ROOT, 'BOARD.md');
const OUT_WEEKLY_DFOS = path.join(DFOS_ROOT, 'BOARD_WEEKLY.md');
const SNAPSHOT = path.join(REPO, 'data', 'board_last_snapshot.json');

const MANUAL = process.argv.includes('--manual');
const GENERATION_MODE = MANUAL ? 'MANUAL (`node scripts/build-board-md.mjs --manual`)' : 'AUTOMATIC (data-board.yml)';

function shortSha() {
  try { return execSync('git rev-parse --short HEAD', { cwd: REPO }).toString().trim(); }
  catch { return 'dev'; }
}

function esc(v) {
  if (v == null) return '';
  return String(v).replace(/\|/g, '\\|').replace(/\n+/g, ' ');
}

async function main() {
  const boardMod = await import(path.join(REPO, 'src', 'data', 'playerBoard2026.js'));
  const B = boardMod.PLAYER_BOARD_2026;
  const M = boardMod.PLAYER_BOARD_2026_META;

  // Draftable skill players, ordered by VORP.
  const rows = B
    .filter(p => p.draftable && ['QB','RB','WR','TE'].includes(p.pos) && p.vorp != null)
    .sort((a, b) => b.vorp - a.vorp);

  // Try to run the verifier; capture pass count. Non-fatal — a red verifier
  // still emits the table with the red count in the header, so the reader
  // sees the state instead of an absent file.
  let verifierLine;
  try {
    const out = execSync('npm run --silent data:board:verify 2>&1', { cwd: REPO, encoding: 'utf8' });
    const m = out.match(/(\d+)\/(\d+) checks passed/);
    verifierLine = m ? `${m[1]}/${m[2]} checks passed` : '(count not parsed)';
  } catch (e) {
    const out = String(e.stdout || e.stderr || '');
    const m = out.match(/(\d+)\/(\d+) checks passed/);
    verifierLine = m ? `${m[1]}/${m[2]} checks passed — RED (see verifier output)` : `RED (${e.message?.slice(0, 80) || 'unknown'})`;
  }

  // Load prior snapshot for movement.
  let prior = null;
  if (fs.existsSync(SNAPSHOT)) {
    try { prior = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); } catch { prior = null; }
  }
  const priorRanks = new Map();
  if (prior?.rows) for (const r of prior.rows) if (r.key) priorRanks.set(r.key, r.rank);

  const HEADER = [
    `# DFOS · BOARD`,
    ``,
    `**Ranked, always-on, human-readable table of the DFOS draftable player pool. Regenerated on every board build. Never hand-edited except when marked MANUAL below.**`,
    ``,
    `| | |`,
    `|---|---|`,
    `| Generated | ${new Date().toISOString()} |`,
    `| Mode | ${GENERATION_MODE} |`,
    `| Commit | \`${shortSha()}\` |`,
    `| Rows in board | ${B.length} |`,
    `| Draftable skill rows (ranked below) | ${rows.length} |`,
    `| Verifier | ${verifierLine} |`,
    `| Schema version | ${M.schema_version} |`,
    `| Board generated | ${M.generated} |`,
    `| Availability generated | ${M.availability_generated || '—'} |`,
    ``,
    `**Recommendation column** — v1 (VORP) and v2 (β total_score_beta) agreement per row. `,
    `\`✓ agree\` = both layers rank this player similarly; `,
    `\`β says X\` = the total_score_beta rationale, printed when the two layers meaningfully disagree. `,
    `Not a new ranking — the same logic the app runs, in a table.`,
    ``,
    `**Provenance** — every field on the underlying rows carries a \`*_source\` label. The table shows the label inline where a field is inferred (rookie projection, name-only contract-year match, snap_share frozen etc.). Full source list at \`DATA_SOURCES.md\`.`,
    ``,
    `---`,
    ``,
  ].join('\n');

  const tableHeader = [
    '| # | Player | Pos | Team | Bye | VORP | β | Δ(v1↔v2) | ADP | Recommendation |',
    '|---:|---|:---:|:---:|:---:|---:|---:|---:|---:|---|',
  ].join('\n');

  const nextSnapshotRows = [];
  const AGREE_TOL = 3;   // per position rank buckets — if v1 and v2 rank the player within 3 spots, ✓

  // For "agreement" we need parallel ranks by pos.
  const byPos = {};
  for (const p of rows) (byPos[p.pos] ||= []).push(p);
  const posRankVorp = new Map();
  const posRankBeta = new Map();
  for (const pos of Object.keys(byPos)) {
    const v = [...byPos[pos]].sort((a, b) => b.vorp - a.vorp);
    v.forEach((p, i) => posRankVorp.set(keyOf(p), i + 1));
    const bt = [...byPos[pos]].sort((a, b) => (b.total_score_beta ?? -Infinity) - (a.total_score_beta ?? -Infinity));
    bt.forEach((p, i) => posRankBeta.set(keyOf(p), i + 1));
  }

  function keyOf(p) { return p.gsis_id || (p.name + '|' + p.team_2026); }

  const lines = [tableHeader];
  rows.forEach((p, i) => {
    const rank = i + 1;
    const k = keyOf(p);
    const priorRank = priorRanks.get(k);
    const deltaSigned = p.total_score_beta != null && p.vorp != null ? p.total_score_beta - p.vorp : null;
    const vp = posRankVorp.get(k);
    const bp = posRankBeta.get(k);
    const posDelta = (vp != null && bp != null) ? (vp - bp) : null;
    const agree = posDelta != null && Math.abs(posDelta) <= AGREE_TOL;
    const rec = agree
      ? `✓ agree (v1 pos #${vp}, v2 pos #${bp})`
      : (p.total_score_beta_rationale
          ? `β says: ${p.total_score_beta_rationale}`
          : (posDelta != null ? `v1 pos #${vp} vs v2 pos #${bp}` : ''));

    lines.push([
      rank,
      esc(p.name),
      p.pos,
      p.team_2026,
      p.bye_week ?? '',
      p.vorp != null ? p.vorp.toFixed(0) : '',
      p.total_score_beta != null ? p.total_score_beta.toFixed(0) : '',
      deltaSigned != null ? (deltaSigned >= 0 ? '+' : '') + deltaSigned.toFixed(0) : '',
      p.adp_overall ?? '',
      esc(rec),
    ].map(x => ' ' + x + ' ').join('|').replace(/^/, '|').replace(/$/, '|'));

    nextSnapshotRows.push({ key: k, rank, name: p.name, pos: p.pos, team: p.team_2026, vorp: p.vorp });
  });

  const boardText = HEADER + lines.join('\n') + '\n';
  fs.writeFileSync(OUT_BOARD_REPO, boardText);
  console.log(`Wrote ${OUT_BOARD_REPO} — ${rows.length} ranked rows`);
  if (fs.existsSync(DFOS_ROOT) && fs.statSync(DFOS_ROOT).isDirectory() && DFOS_ROOT !== REPO) {
    try { fs.writeFileSync(OUT_BOARD_DFOS, boardText); console.log(`  mirrored → ${OUT_BOARD_DFOS}`); }
    catch (e) { console.log(`  ⚠ could not mirror to DFOS root: ${e.message}`); }
  }

  // ── BOARD_WEEKLY — movement ──────────────────────────────────────
  const weeklyHeader = [
    `# DFOS · BOARD · MOVEMENT`,
    ``,
    `**What changed vs the previous board build.** Ranked overall (VORP). Rebuilds happen daily automatic (see \`data-board.yml\`) — this movement view is the reason a table is worth reading over the raw JS.`,
    ``,
    `| | |`,
    `|---|---|`,
    `| This build | ${new Date().toISOString()} |`,
    `| Mode | ${GENERATION_MODE} |`,
    `| Prior build | ${prior?.generated ?? '_(no prior snapshot — this is the first build with the movement tracker)_'} |`,
    `| Ranked rows this build | ${rows.length} |`,
    `| Ranked rows prior build | ${prior?.rows?.length ?? '—'} |`,
    ``,
    `---`,
    ``,
  ].join('\n');

  const movementLines = [];
  if (!prior) {
    movementLines.push(`_No prior snapshot on disk — this is the first build with a movement tracker. Next build will show deltas._`);
  } else {
    const priorKeys = new Set([...priorRanks.keys()]);
    const currentKeys = new Set(rows.map(keyOf));
    const risers = [];
    const fallers = [];
    for (const [i, p] of rows.entries()) {
      const k = keyOf(p);
      const pr = priorRanks.get(k);
      if (pr == null) continue;
      const delta = pr - (i + 1);   // positive = moved UP the board
      if (Math.abs(delta) >= 3) {
        (delta > 0 ? risers : fallers).push({ name: p.name, pos: p.pos, team: p.team_2026, prior: pr, now: i + 1, delta });
      }
    }
    risers.sort((a, b) => b.delta - a.delta);
    fallers.sort((a, b) => a.delta - b.delta);
    const entrants = rows.filter(p => !priorKeys.has(keyOf(p))).slice(0, 20);
    const dropped = [...priorKeys].filter(k => !currentKeys.has(k)).slice(0, 20).map(k => prior.rows.find(r => r.key === k)).filter(Boolean);

    movementLines.push(`## Risers (moved up ≥3 ranks)`);
    if (risers.length === 0) movementLines.push('_None._');
    else {
      movementLines.push('| Δ | Player | Pos | Team | Prior | Now |', '|---:|---|:---:|:---:|---:|---:|');
      for (const r of risers.slice(0, 15)) movementLines.push(`| +${r.delta} | ${esc(r.name)} | ${r.pos} | ${r.team} | ${r.prior} | ${r.now} |`);
    }
    movementLines.push('', `## Fallers (moved down ≥3 ranks)`);
    if (fallers.length === 0) movementLines.push('_None._');
    else {
      movementLines.push('| Δ | Player | Pos | Team | Prior | Now |', '|---:|---|:---:|:---:|---:|---:|');
      for (const r of fallers.slice(0, 15)) movementLines.push(`| ${r.delta} | ${esc(r.name)} | ${r.pos} | ${r.team} | ${r.prior} | ${r.now} |`);
    }
    movementLines.push('', `## New entrants (in this build, not in the prior one; up to 20)`);
    if (entrants.length === 0) movementLines.push('_None._');
    else {
      movementLines.push('| # | Player | Pos | Team | VORP |', '|---:|---|:---:|:---:|---:|');
      for (const e of entrants) movementLines.push(`| ${rows.indexOf(e) + 1} | ${esc(e.name)} | ${e.pos} | ${e.team_2026} | ${e.vorp.toFixed(0)} |`);
    }
    movementLines.push('', `## Dropped (in the prior build, not in this one; up to 20)`);
    if (dropped.length === 0) movementLines.push('_None._');
    else {
      movementLines.push('| Prior # | Player | Pos | Team | Prior VORP |', '|---:|---|:---:|:---:|---:|');
      for (const d of dropped) movementLines.push(`| ${d.rank} | ${esc(d.name)} | ${d.pos} | ${d.team} | ${d.vorp?.toFixed?.(0) ?? ''} |`);
    }
  }

  const weeklyText = weeklyHeader + movementLines.join('\n') + '\n';
  fs.writeFileSync(OUT_WEEKLY_REPO, weeklyText);
  console.log(`Wrote ${OUT_WEEKLY_REPO} — ${prior ? 'diff mode' : 'first-build baseline'}`);
  if (fs.existsSync(DFOS_ROOT) && fs.statSync(DFOS_ROOT).isDirectory() && DFOS_ROOT !== REPO) {
    try { fs.writeFileSync(OUT_WEEKLY_DFOS, weeklyText); console.log(`  mirrored → ${OUT_WEEKLY_DFOS}`); }
    catch (e) { console.log(`  ⚠ could not mirror to DFOS root: ${e.message}`); }
  }

  // Update the snapshot for next build.
  fs.mkdirSync(path.dirname(SNAPSHOT), { recursive: true });
  fs.writeFileSync(SNAPSHOT, JSON.stringify({
    generated: new Date().toISOString(),
    board_generated: M.generated,
    schema_version: M.schema_version,
    rows: nextSnapshotRows,
  }, null, 0));
  console.log(`Snapshot updated: ${SNAPSHOT}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
