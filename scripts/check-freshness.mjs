#!/usr/bin/env node
/**
 * check-freshness.mjs: the freshness gate (DATA_FRESHNESS_PLAN v4.3 step 5,
 * 2026-11-07).
 *
 * Reads data/freshness_manifest.json (step 4) and data/season.json, and fails
 * red when a served file breaks its row. Ten modes:
 *
 *   registration  a file under src/data or public/data, or on also_tracked,
 *                 has no row; a row names a file that is not there; a stamp
 *                 pointer does not resolve
 *   age           a file is past its max_age_hours (change_driven rows have
 *                 no clock; in_season_only rows only age in season)
 *   coverage      the content stops short of the latest finished week,
 *                 whatever its stamp says; and for the chain inputs, the
 *                 content recomputes from a second source (the nflverse
 *                 scoring through reconcile-actuals-scoring.mjs, the defense
 *                 table through check-defense-field.mjs)
 *   lineage       a derived_from source is newer than the served copy, past
 *                 the row's lineage_grace_hours
 *   season        source_season is not the setting the row expects; a year in
 *                 a row's path is not that setting and not declared by
 *                 design; src/config.js disagrees with base_season (step 17)
 *   label         a ui_consumer of a labelled file does not render AsOf
 *   imports       src/components or src/utils import a year-named data path
 *                 whose year is not the setting and not declared by design;
 *                 a scanned directory is gone or the scan finds fewer
 *                 year-named imports than its floor
 *   staging       a declared output is missing from its workflow's git add;
 *                 a workflow names a year-named file that is not the setting
 *   unread        anything the site bundle reaches imports an unread row;
 *                 src/main.jsx is missing or not index.html's entry, or the
 *                 walk reaches fewer modules than its floor
 *   built         a build_time file is missing from dist/
 *   all           every mode above
 *
 * Flags:
 *   --mode a,b            modes to run (default all)
 *   --tier t,u            only rows of these tiers (chain_input, public, beta,
 *                         internal, unread); registration then checks only
 *                         those rows, not the whole tree
 *   --report              annotate without failing (always exit 0 on reds)
 *   --json                the report as JSON on stdout; the human lines go to
 *                         stderr
 *   --block-on-event E    fail only when GITHUB_EVENT_NAME is E (push); on any
 *                         other event the reds annotate
 *   --week N              a floor on the latest finished week, from the
 *                         caller (the Tuesday chain passes the results gate's
 *                         week, plan step 7 fix c). The gate reads the higher
 *                         of N and the week it computes at the row's grace,
 *                         so a caller's week only raises the bar
 *   --as-of DATE          proof pass: judge as if now were DATE
 *   --as-season YEAR      proof pass: judge as if data/season.json said YEAR
 *                         (base_season moves by the same amount); every
 *                         season-following file and import turns red by name,
 *                         which is the rollover checklist
 *   --replay              proof pass for the age mode: age each row from its
 *                         commit dates over the season instead of its stamp,
 *                         against its ceiling (plan step 5, QA's replay). It is
 *                         a git-history check, so it fails red in a shallow
 *                         clone rather than read every file as just built, and
 *                         on a row whose history in the window is too thin to
 *                         measure (no commit before the window and fewer than
 *                         two in it).
 *   --replay-since DATE   start the replay window at DATE instead of the
 *                         season's first kickoff. A file that existed at DATE
 *                         is aged from DATE to its first commit after it. The
 *                         manifest's max_age_replay block records the window
 *                         the ceilings were judged on and each decision.
 *
 * Exit 0 when nothing is red (or the reds only annotate), 1 on a red, 2 on a
 * usage error.
 *
 * It writes nothing to the repo: a table to $GITHUB_STEP_SUMMARY when that is
 * set, and with --json a report on stdout.
 *
 * Bare clone: the cloud drafter runs `git clone --depth 1` with no `npm
 * install`. Every mode except staging uses Node built-ins only. staging loads
 * its YAML parser (the `yaml` package) lazily, so it runs only where npm
 * install ran; it never regex-scrapes a workflow.
 *
 * It honours DRAFT_WINDOW.md: while a window is active, an age, coverage or
 * lineage red on a row whose workflow checks the draft freeze is reported as
 * frozen, not red. Finished weeks and the season window come from
 * scripts/_lib/kickoff.js over src/data/schedule<season>.js.
 *
 * Blocking dates: gate_blocking_from in the manifest is reported in the JSON;
 * whether a caller runs with --report before that date is the caller's (plan
 * step 7).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { firstKickoffUtcMs, lastKickoffUtcMs, regWeeks, weekGames, actualsCompleteness } from './_lib/kickoff.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(__dirname);
const MANIFEST = 'data/freshness_manifest.json';
const SEASON_FILE = 'data/season.json';
const MODES = ['registration', 'age', 'coverage', 'lineage', 'season', 'label', 'imports', 'staging', 'unread', 'built'];
const TIERS = ['chain_input', 'public', 'beta', 'internal', 'unread'];
const HOUR = 3.6e6;
// After the last regular-season kickoff the weekly files get one weekly
// ceiling to land their final refresh before in_season_only clocks stop.
const SEASON_TAIL_HOURS = 192;
const YEAR_RE = /20\d\d/g;
// A stamp this far ahead of now is a red, not a fresh file (clock skew allowance).
const FUTURE_SKEW_MINUTES = 10;
// Floors for the source scans, so a moved entry or directory reads red, not as
// nothing to check. Measured on 2026-11-07: 94 modules reachable from
// src/main.jsx, 39 year-named data imports in src/components and src/utils. A
// refactor that drops below a floor lowers it here, by name, in the same commit.
const ENTRY = 'src/main.jsx';
const MIN_REACHABLE_MODULES = 80;
const MIN_YEAR_IMPORTS = 30;

// ── Arguments ────────────────────────────────────────────────────────────
const USAGE = 'usage: node scripts/check-freshness.mjs [--mode a,b|all] [--tier t,u] [--report] [--json] [--block-on-event push] [--week N] [--as-of DATE] [--as-season YEAR] [--replay [--replay-since DATE]]';
function usage(msg) {
  console.error(`check-freshness: ${msg}\n${USAGE}`);
  process.exit(2);
}
function parseArgs(argv) {
  const o = { modes: null, tiers: null, report: false, json: false, blockOn: null, week: null, asOf: null, asSeason: null, replay: false, replaySince: null };
  const takes = new Set(['--mode', '--tier', '--block-on-event', '--week', '--as-of', '--as-season', '--replay-since']);
  for (let i = 0; i < argv.length; i++) {
    let [k, v] = argv[i].includes('=') ? [argv[i].slice(0, argv[i].indexOf('=')), argv[i].slice(argv[i].indexOf('=') + 1)] : [argv[i], undefined];
    if (takes.has(k) && v === undefined) {
      v = argv[++i];
      if (v === undefined) usage(`${k} needs a value`);
    }
    if (k === '--mode') o.modes = v.split(',').map(s => s.trim()).filter(Boolean);
    else if (k === '--tier') o.tiers = v.split(',').map(s => s.trim()).filter(Boolean);
    else if (k === '--report') o.report = true;
    else if (k === '--json') o.json = true;
    else if (k === '--replay') o.replay = true;
    else if (k === '--block-on-event') o.blockOn = v;
    else if (k === '--week') {
      if (!/^\d+$/.test(v)) usage(`--week takes a week number, got ${JSON.stringify(v)}`);
      o.week = Number(v);
    } else if (k === '--as-of') {
      const t = Date.parse(v);
      if (Number.isNaN(t)) usage(`--as-of takes a date, got ${JSON.stringify(v)}`);
      o.asOf = t;
    } else if (k === '--replay-since') {
      const t = Date.parse(v);
      if (Number.isNaN(t)) usage(`--replay-since takes a date, got ${JSON.stringify(v)}`);
      o.replaySince = t;
    } else if (k === '--as-season') {
      if (!/^20\d\d$/.test(v)) usage(`--as-season takes a year, got ${JSON.stringify(v)}`);
      o.asSeason = Number(v);
    } else if (k === '--help' || k === '-h') { console.log(USAGE); process.exit(0); }
    else usage(`unknown argument ${argv[i]}`);
  }
  if (o.replaySince != null && !o.replay) usage('--replay-since needs --replay');
  if (!o.modes || o.modes.includes('all')) o.modes = o.modes && o.modes.some(m => m !== 'all') ? usage('all cannot be combined with other modes') : [...MODES];
  const badMode = o.modes.filter(m => !MODES.includes(m));
  if (badMode.length) usage(`unknown mode ${badMode.join(', ')}`);
  if (o.tiers) {
    const badTier = o.tiers.filter(t => !TIERS.includes(t));
    if (badTier.length) usage(`unknown tier ${badTier.join(', ')}`);
  }
  return o;
}
const OPT = parseArgs(process.argv.slice(2));
const NOW = OPT.asOf ?? Date.now();
const EVENT = process.env.GITHUB_EVENT_NAME || '';
const BLOCKING = !OPT.report && (OPT.blockOn == null || EVENT === OPT.blockOn);

// ── Findings ─────────────────────────────────────────────────────────────
const findings = [];
const tally = Object.fromEntries(MODES.map(m => [m, { checked: 0, red: 0, frozen: 0, skipped: 0, lines: [] }]));
let FREEZE = { active: [], workflows: new Set() };
const FREEZE_MODES = new Set(['age', 'coverage', 'lineage']);

function red(mode, rule, row, file, message) {
  const frozen = FREEZE_MODES.has(mode) && FREEZE.active.length && row && (row.workflows || []).some(w => FREEZE.workflows.has(w));
  const f = { mode, rule, file, tier: row?.tier ?? null, on_stale: row?.on_stale ?? null, status: frozen ? 'frozen' : 'red', message };
  if (frozen) f.message += ` (draft window ${FREEZE.active.join(', ')} active)`;
  findings.push(f);
  tally[mode][frozen ? 'frozen' : 'red']++;
}
const note = (mode, line) => tally[mode].lines.push(line);

// ── Reading ──────────────────────────────────────────────────────────────
const abs = (p) => path.join(REPO, p);
const exists = (p) => fs.existsSync(abs(p));
const textCache = new Map();
function readText(p) {
  if (!textCache.has(p)) textCache.set(p, fs.readFileSync(abs(p), 'utf8'));
  return textCache.get(p);
}
const jsonCache = new Map();
function readJson(p) {
  if (!jsonCache.has(p)) jsonCache.set(p, JSON.parse(readText(p)));
  return jsonCache.get(p);
}
const modCache = new Map();
async function importModule(p) {
  if (!modCache.has(p)) modCache.set(p, await import(pathToFileURL(abs(p)).href));
  return modCache.get(p);
}

/**
 * A JSON pointer with two extensions the manifest uses: `*` takes every
 * element or value at that level, and a trailing " (keys)" takes the keys of
 * what it reaches. Returns { found, value }; with `*` the value is a flat list.
 */
function pointer(doc, ptr) {
  let keys = false;
  let p = ptr;
  if (/ \(keys\)$/.test(p)) { keys = true; p = p.replace(/ \(keys\)$/, ''); }
  if (p === '') return { found: doc !== undefined, value: doc };
  if (!p.startsWith('/')) return { found: false, value: undefined };
  const segs = p.split('/').slice(1).map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'));
  let cur = [doc];
  let multi = false;
  for (const s of segs) {
    const next = [];
    for (const o of cur) {
      if (o == null || typeof o !== 'object') continue;
      if (s === '*') { multi = true; next.push(...(Array.isArray(o) ? o : Object.values(o))); }
      else if (Object.prototype.hasOwnProperty.call(o, s)) next.push(o[s]);
    }
    cur = next;
  }
  if (keys) cur = cur.flatMap(o => (o && typeof o === 'object' ? Object.keys(o) : []));
  if (!multi && !keys) return cur.length ? { found: cur[0] !== undefined, value: cur[0] } : { found: false, value: undefined };
  return { found: cur.length > 0, value: cur };
}

/** The value of one stamp pointer (generated_at, source_season, verified_on or label). */
async function stampValue(row, key) {
  const s = row.stamp;
  if (!s || s.kind === 'build_time') return { ok: false, why: 'no stamp' };
  const ptr = s[key];
  if (ptr == null) return { ok: false, why: `no ${key} pointer` };
  const file = s.file || row.path;
  try {
    if (s.kind === 'header') {
      const m = readText(file).slice(0, 2048).match(new RegExp(ptr));
      return m ? { ok: true, value: m[1] } : { ok: false, why: `header pattern ${ptr} does not match the first 2 KB of ${file}` };
    }
    let doc;
    if (s.kind === 'json') doc = readJson(file);
    else if (s.kind === 'js_meta') {
      const mod = await importModule(file);
      if (!(s.export in mod)) return { ok: false, why: `${file} has no export ${s.export}` };
      doc = mod[s.export];
    } else return { ok: false, why: `unknown stamp kind ${s.kind}` };
    const r = pointer(doc, ptr);
    return r.found && r.value != null ? { ok: true, value: r.value } : { ok: false, why: `${s.kind === 'js_meta' ? s.export : file} ${ptr} does not resolve` };
  } catch (e) {
    return { ok: false, why: `cannot read ${file}: ${e.message.split('\n')[0]}` };
  }
}

/**
 * When the content was made: the stamp's generated_at, or a static row's
 * verified_on. `clock` says whether the row declares one: a declared clock
 * that does not resolve or parse is a red wherever it is read, and only a row
 * with no clock at all (a code file, an undated hand file) may be skipped.
 */
async function contentTime(row) {
  if (row.stamp?.generated_at) {
    const v = await stampValue(row, 'generated_at');
    if (!v.ok) return { ms: null, clock: true, why: v.why };
    const ms = Date.parse(v.value);
    return Number.isNaN(ms) ? { ms: null, clock: true, why: `generated_at ${JSON.stringify(v.value)} is not a time` } : { ms, clock: true, src: `stamp ${v.value}` };
  }
  if (row.static && row.verified_on) {
    // A round trip, so 2026-02-30 is not read as 2026-03-02.
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(row.verified_on) ? Date.parse(row.verified_on) : NaN;
    const ms = !Number.isNaN(parsed) && new Date(parsed).toISOString().slice(0, 10) === row.verified_on ? parsed : NaN;
    return Number.isNaN(ms) ? { ms: null, clock: true, why: `verified_on ${JSON.stringify(row.verified_on)} is not a date` } : { ms, clock: true, src: `verified_on ${row.verified_on}` };
  }
  return { ms: null, clock: false, why: 'no generated_at stamp and no verified_on' };
}

const isoH = (ms) => new Date(ms).toISOString().replace(/:\d\d\.\d{3}Z$/, 'Z');
const hours = (ms) => (ms / HOUR).toFixed(1);
function globRe(g) {
  return new RegExp('^' + g.split('*').map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*') + '$');
}
function rowFor(rows, p) {
  return rows.find(r => !r.glob && r.path === p) || rows.find(r => r.glob && globRe(r.path).test(p)) || null;
}
/** Files on disk a glob row matches (the * never crosses a slash). */
function globFiles(g) {
  const dir = path.posix.dirname(g);
  if (!exists(dir)) return [];
  const re = globRe(g);
  return fs.readdirSync(abs(dir)).map(f => `${dir}/${f}`).filter(p => re.test(p)).sort();
}
const yearsIn = (p) => (p.match(YEAR_RE) || []).map(Number);

function git(args) {
  const r = spawnSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error || r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${(r.stderr || r.error?.message || '').trim().split('\n')[0]}`);
  return r.stdout;
}

// ── Context ──────────────────────────────────────────────────────────────
let manifest;
let setting;
try {
  manifest = readJson(MANIFEST);
  if (manifest.schema !== 1 || !Array.isArray(manifest.rows)) throw new Error('not schema 1 with a rows list');
} catch (e) {
  console.error(`check-freshness: RED registration/manifest ${MANIFEST}: ${e.message}`);
  process.exit(1);
}
try {
  const { readSeasonSetting } = await import('./_lib/season.js');
  setting = readSeasonSetting(abs(SEASON_FILE));
} catch (e) {
  console.error(`check-freshness: RED season/setting ${SEASON_FILE}: ${e.message}`);
  process.exit(1);
}
const SEASON = OPT.asSeason ?? setting.season;
const BASE = setting.base_season + (SEASON - setting.season);
// A write-once row declared by design is history: its files keep the year in
// their path at every setting (the weekly_projections snapshots), so the
// rollover lists only files that must move. The next season's files are a new
// row, and registration names the first one unregistered.
const historyYear = (row) => {
  if (!(row.write_once && row.season_by_design)) return null;
  const ys = [...new Set(yearsIn(row.path))];
  return ys.length === 1 ? ys[0] : null;
};
const expectedYear = (row) => historyYear(row) ?? (row.expected_season === 'season' ? SEASON : row.expected_season === 'base_season' ? BASE : null);
const expectLabel = (row) => (historyYear(row) != null ? `write-once history ${historyYear(row)}` : `${row.expected_season} ${expectedYear(row)}`);
const ALL_ROWS = manifest.rows;
const ROWS = OPT.tiers ? ALL_ROWS.filter(r => OPT.tiers.includes(r.tier)) : ALL_ROWS;

// The schedule of the season the gate judges: finished weeks and the season window.
const SCHEDULE_PATH = `src/data/schedule${SEASON}.js`;
let SCHEDULE = null;
let scheduleWhy = null;
try {
  if (!exists(SCHEDULE_PATH)) throw new Error(`${SCHEDULE_PATH} does not exist`);
  const mod = await importModule(SCHEDULE_PATH);
  SCHEDULE = mod[`SCHEDULE_${SEASON}`] || null;
  if (!SCHEDULE?.byWeek) throw new Error(`${SCHEDULE_PATH} has no SCHEDULE_${SEASON}.byWeek`);
} catch (e) {
  SCHEDULE = null;
  scheduleWhy = e.message.split('\n')[0];
}
function seasonWindow() {
  if (!SCHEDULE) return null;
  const ws = regWeeks(SCHEDULE);
  const start = firstKickoffUtcMs(SCHEDULE, ws[0]);
  const last = lastKickoffUtcMs(SCHEDULE, ws[ws.length - 1]);
  return start == null || last == null ? null : { start, end: last + SEASON_TAIL_HOURS * HOUR };
}
const WINDOW = seasonWindow();
// Without a schedule the gate cannot say it is out of season, so it ages everything.
const IN_SEASON = WINDOW ? NOW >= WINDOW.start && NOW <= WINDOW.end : true;
/** The latest regular-season week whose last kickoff is older than graceHours, raised to the caller's --week if that is higher (a floor, never a ceiling). */
function computedFinishedWeek(graceHours) {
  if (!SCHEDULE) return null;
  let latest = 0;
  for (const w of regWeeks(SCHEDULE)) {
    const k = lastKickoffUtcMs(SCHEDULE, w);
    if (k != null && k + graceHours * HOUR <= NOW) latest = w;
  }
  return latest;
}
function latestFinishedWeek(graceHours) {
  const computed = computedFinishedWeek(graceHours);
  if (OPT.week == null) return computed;
  return computed == null ? OPT.week : Math.max(OPT.week, computed);
}
/** Where L came from, for the red line and the note. */
function weekSource(graceHours, L) {
  if (OPT.week == null) return `grace ${graceHours} h`;
  return L > OPT.week ? `grace ${graceHours} h, above --week ${OPT.week}` : 'from --week';
}

// DRAFT_WINDOW.md: the same small YAML subset .github/scripts/check-draft-freeze.mjs reads.
function draftWindows() {
  if (!exists('DRAFT_WINDOW.md')) return [];
  const out = [];
  for (const m of readText('DRAFT_WINDOW.md').matchAll(/```yaml([\s\S]*?)```/g)) {
    for (const item of m[1].split(/\n(?=- )/).map(s => s.trim()).filter(s => s.startsWith('- '))) {
      const o = {};
      for (const line of item.split('\n')) {
        const kv = line.replace(/^- /, '').trim();
        const i = kv.indexOf(':');
        if (i < 0) continue;
        let val = kv.slice(i + 1).trim();
        const h = val.indexOf('#');
        if (h > 0) val = val.slice(0, h).trim();
        o[kv.slice(0, i).trim()] = val;
      }
      if (o.id) out.push(o);
    }
  }
  return out;
}
{
  const active = draftWindows().filter(w => {
    const s = Date.parse(w.freeze_start); const e = Date.parse(w.draft_end);
    return !Number.isNaN(s) && !Number.isNaN(e) && s <= NOW && NOW < e;
  }).map(w => w.id);
  const wfDir = '.github/workflows';
  const workflows = new Set(exists(wfDir) ? fs.readdirSync(abs(wfDir)).filter(f => /\.ya?ml$/.test(f) && readText(`${wfDir}/${f}`).includes('check-draft-freeze')) : []);
  FREEZE = { active, workflows };
}

// ── registration ─────────────────────────────────────────────────────────
async function modeRegistration() {
  const T = tally.registration;
  if (!OPT.tiers) {
    let tracked;
    try {
      // Tracked plus untracked-not-ignored: a producer's new file counts before it is committed.
      tracked = git(['ls-files', '-co', '--exclude-standard', '--', 'src/data', 'public/data']).split('\n').filter(Boolean);
    } catch (e) {
      red('registration', 'listing', null, 'src/data, public/data', `cannot list files: ${e.message}`);
      return;
    }
    const want = [...new Set([...tracked, ...(manifest.also_tracked || [])])];
    let ok = 0;
    for (const p of want) {
      T.checked++;
      if (rowFor(ALL_ROWS, p)) ok++;
      else red('registration', 'unregistered', null, p, 'no row in data/freshness_manifest.json');
    }
    for (const p of manifest.also_tracked || []) if (!exists(p)) red('registration', 'missing', rowFor(ALL_ROWS, p), p, 'on also_tracked but not in the tree');
    note('registration', `${ok} of ${want.length} registered (src/data and public/data ${tracked.length}, also_tracked ${(manifest.also_tracked || []).length})${BLOCKING ? '' : ' (report)'}`);
  } else note('registration', `tier ${OPT.tiers.join(',')}: rows and stamps only; the unregistered-file sweep runs without --tier`);

  let ptrs = 0; let ptrOk = 0;
  for (const r of ROWS) {
    if (!r.glob && r.stamp?.kind !== 'build_time' && !exists(r.path)) red('registration', 'row-without-file', r, r.path, 'the row names a file that is not in the tree');
    if (r.static && !(/^\d{4}-\d{2}-\d{2}$/.test(r.verified_on || '') && r.label)) red('registration', 'static-row', r, r.path, 'a static row needs verified_on and label');
    if (!r.static && !r.stamp) red('registration', 'no-stamp', r, r.path, 'a non-static row needs a stamp inside the file');
    if (!r.stamp || r.stamp.kind === 'build_time' || r.glob || !exists(r.stamp.file || r.path)) continue;
    for (const k of ['generated_at', 'source_season', 'verified_on', 'label']) {
      if (!r.stamp[k]) continue;
      ptrs++;
      const v = await stampValue(r, k);
      if (!v.ok) { red('registration', 'stamp-pointer', r, r.path, v.why); continue; }
      if (k === 'generated_at' && Number.isNaN(Date.parse(v.value))) { red('registration', 'stamp-pointer', r, r.path, `generated_at ${JSON.stringify(v.value)} is not a time`); continue; }
      if (k === 'verified_on' && String(v.value).slice(0, 10) !== r.verified_on) { red('registration', 'stamp-pointer', r, r.path, `the file says verified_on ${v.value}, the row ${r.verified_on}`); continue; }
      if (k === 'label' && v.value !== r.label) { red('registration', 'stamp-pointer', r, r.path, `the file says label ${JSON.stringify(v.value)}, the row ${JSON.stringify(r.label)}`); continue; }
      ptrOk++;
    }
  }
  note('registration', `${ptrOk} of ${ptrs} stamp pointers resolve`);
}

// ── age (and --replay) ──────────────────────────────────────────────────
function ageRows() {
  return ROWS.filter(r => r.max_age_hours != null && !r.change_driven && !r.glob && r.stamp?.kind !== 'build_time');
}
async function modeAge() {
  const T = tally.age;
  if (OPT.replay) return replay();
  for (const r of ageRows()) {
    if (r.in_season_only && !IN_SEASON) { T.skipped++; continue; }
    T.checked++;
    const t = await contentTime(r);
    if (t.ms == null) { red('age', 'no-time', r, r.path, `cannot age it: ${t.why}`); continue; }
    const age = (NOW - t.ms) / HOUR;
    if (t.ms > NOW + FUTURE_SKEW_MINUTES * 60e3) { red('age', 'future', r, r.path, `stamped ${hours(t.ms - NOW)} hours after ${isoH(NOW)} (${t.src}); a stamp from the future cannot be aged`); continue; }
    if (age > r.max_age_hours) red('age', 'max_age_hours', r, r.path, `${hours(NOW - t.ms)} hours old, ceiling ${r.max_age_hours} (${t.src})`);
  }
  note('age', `${T.checked} rows aged at ${isoH(NOW)}${T.skipped ? `, ${T.skipped} out of season` : ''}`);
}

function replay() {
  const T = tally.age;
  const rows = ageRows().filter(r => !r.static);
  let shallow;
  try { shallow = git(['rev-parse', '--is-shallow-repository']).trim(); } catch (e) {
    for (const r of rows) red('age', 'replay', r, r.path, `git history unavailable: ${e.message}`);
    return;
  }
  if (shallow !== 'false') {
    for (const r of rows) red('age', 'replay', r, r.path, 'shallow clone: its history stops at HEAD, so every file would read as just built; a git-history check fails here rather than pass');
    note('age', `replay refused: git rev-parse --is-shallow-repository printed ${shallow}`);
    return;
  }
  const start = OPT.replaySince ?? WINDOW?.start ?? null;
  if (start == null) { red('age', 'replay', null, SCHEDULE_PATH, `no season window: ${scheduleWhy || 'schedule has no kickoffs'}`); return; }
  if (start >= NOW) { red('age', 'replay', null, SCHEDULE_PATH, `the replay window starts ${isoH(start)}, not before ${isoH(NOW)}`); return; }
  note('age', `replay window ${isoH(start)} to ${isoH(NOW)}${OPT.replaySince != null ? ' (--replay-since)' : ' (season start)'}`);
  for (const r of rows) {
    T.checked++;
    const dates = git(['log', '--format=%cI', 'HEAD', '--', r.path]).split('\n').filter(Boolean).map(Date.parse).filter(t => t <= NOW).sort((a, b) => a - b);
    const inWin = dates.filter(t => t >= start);
    const prior = dates.filter(t => t < start).pop();
    // A file that existed at the window start is aged from the start to its
    // first commit after it (the prior commit stands in for the start).
    const series = prior != null ? [prior, ...inWin] : inWin;
    if (!series.length) { red('age', 'replay', r, r.path, `no commit before ${isoH(NOW)}`); continue; }
    // Born inside the window with one commit: no gap to measure, so every file
    // of a one-commit history would read as just built. Red, not a pass.
    if (prior == null && inWin.length < 2) {
      note('age', `${r.path}: first commit ${isoH(inWin[0])}, inside the window, and ${inWin.length} commit in it`);
      red('age', 'replay', r, r.path, `history too thin to replay: first commit ${isoH(inWin[0])} is inside the window and it has ${inWin.length} commit there, so no gap can be measured`);
      continue;
    }
    let worst = { gap: 0, from: null, to: null };
    for (let i = 1; i < series.length; i++) {
      const from = Math.max(series[i - 1], start);
      const gap = (series[i] - from) / HOUR;
      if (gap > worst.gap) worst = { gap, from, to: series[i] };
    }
    const open = (NOW - Math.max(series[series.length - 1], start)) / HOUR;
    const line = `${r.path}: ${inWin.length} commits since ${isoH(start)}, largest gap ${worst.gap.toFixed(1)} h${worst.from ? ` (${isoH(worst.from)} to ${isoH(worst.to)})` : ''}, open ${open.toFixed(1)} h, ceiling ${r.max_age_hours}`;
    note('age', line);
    if (worst.gap > r.max_age_hours) red('age', 'replay', r, r.path, `commit gap ${worst.gap.toFixed(1)} h from ${isoH(worst.from)} to ${isoH(worst.to)} is over the ceiling ${r.max_age_hours}`);
    if (open > r.max_age_hours) red('age', 'replay', r, r.path, `no commit for ${open.toFixed(1)} h at ${isoH(NOW)}, over the ceiling ${r.max_age_hours}`);
  }
}

// ── coverage ─────────────────────────────────────────────────────────────
function recompute(r) {
  const run = (script, args) => {
    const p = spawnSync(process.execPath, [path.join(__dirname, script), ...args], { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const out = `${p.stdout || ''}${p.stderr || ''}`;
    if (p.status === 0) return;
    const why = out.split('\n').filter(l => /FAIL|✗|cannot|Error/.test(l)).slice(0, 4).map(l => l.trim()).join(' | ') || `exit ${p.status}`;
    red('coverage', 'recompute', r, r.path, `${script} exit ${p.status}: ${why}`);
  };
  let m = r.path.match(/^src\/data\/intelligence\/weekly_actuals_(20\d\d)\.json$/);
  if (m) { tally.coverage.checked++; return run('reconcile-actuals-scoring.mjs', [r.path]); }
  m = r.path.match(/^src\/data\/defense(20\d\d)\.js$/);
  if (m) { tally.coverage.checked++; return run('check-defense-field.mjs', ['--file', r.path, '--actuals', `src/data/intelligence/weekly_actuals_${m[1]}.json`]); }
}
const RECOMPUTED = /^src\/data\/(intelligence\/weekly_actuals_20\d\d\.json|defense20\d\d\.js)$/;

async function coverageDoc(r) {
  const file = r.stamp?.file || r.path;
  if (r.path.endsWith('.json')) return readJson(r.path);
  if (r.stamp?.kind === 'js_meta') return (await importModule(file))[r.stamp.export];
  throw new Error(`no reader for ${r.path}`);
}
const asWeeks = (v) => (Array.isArray(v) ? v.map(Number).filter(Number.isInteger) : null);

async function modeCoverage() {
  const T = tally.coverage;
  const used = new Map();
  for (const r of ROWS.filter(x => x.coverage)) {
    if (r.in_season_only && !IN_SEASON) { T.skipped++; continue; }
    if (!SCHEDULE && OPT.week == null) { red('coverage', 'no-schedule', r, r.path, `cannot find finished weeks: ${scheduleWhy}`); continue; }
    const L = latestFinishedWeek(r.coverage_grace_hours);
    used.set(r.coverage_grace_hours, L);
    if (!L) { T.skipped++; continue; }
    T.checked++;
    let doc;
    try { doc = await coverageDoc(r); } catch (e) { red('coverage', r.coverage, r, r.path, `cannot read: ${e.message.split('\n')[0]}`); continue; }
    const cr = r.coverage_read || {};
    const get = (k) => (cr[k] ? pointer(doc, cr[k]) : { found: false });
    const needWeeks = SCHEDULE ? regWeeks(SCHEDULE).filter(w => w <= L) : Array.from({ length: L }, (_, i) => i + 1);
    const short = [];
    if (r.coverage === 'graded_week') {
      if (cr.weeks) {
        const g = get('weeks');
        const weeks = g.found ? asWeeks(g.value) : null;
        if (!weeks) short.push(`${cr.weeks} does not resolve to a list of weeks`);
        else {
          const missing = needWeeks.filter(w => !weeks.includes(w));
          if (missing.length) short.push(`${cr.weeks} lacks week ${missing.join(',')}`);
        }
      }
      if (cr.through_week) {
        const g = get('through_week');
        if (!g.found || !(Number(g.value) >= L)) short.push(`${cr.through_week} is ${g.found ? g.value : 'missing'}, not week ${L} or later`);
      }
      if (cr.rows && cr.week_field) {
        const g = get('rows');
        const rows = g.found && Array.isArray(g.value) ? g.value : null;
        if (!rows) short.push(`${cr.rows} does not resolve to rows`);
        else if (cr.scored_field) {
          for (const w of needWeeks) {
            const games = rows.filter(x => Number(x[cr.week_field]) === w);
            const scheduled = SCHEDULE ? weekGames(SCHEDULE, w).length : null;
            const scored = games.filter(x => x[cr.scored_field] === true && Number.isInteger(x.home_score) && Number.isInteger(x.away_score));
            if (scored.length < games.length || (scheduled != null && scored.length < scheduled)) short.push(`week ${w} has ${scored.length} scored of ${scheduled ?? games.length} games`);
          }
        } else if (SCHEDULE) {
          const c = actualsCompleteness(SCHEDULE, rows)[L];
          if (!c?.complete) short.push(`week ${L} has rows for ${c?.games_seen ?? 0} of ${weekGames(SCHEDULE, L).length} games`);
        }
      }
      if (!cr.weeks && !cr.through_week && !cr.rows) short.push('coverage_read names nothing to read');
    } else if (r.coverage === 'report_week') {
      const g = get('week');
      if (!g.found) short.push(`${cr.week} does not resolve`);
      else if (!(Number(g.value) >= L)) short.push(`report week ${g.value}, not week ${L} or later`);
    } else if (r.coverage === 'season_present') {
      const g = get('seasons');
      const seasons = g.found ? [].concat(g.value).map(Number) : [];
      const want = expectedYear(r) ?? SEASON;
      if (!g.found) short.push(`${cr.seasons} does not resolve`);
      else if (!seasons.includes(want)) short.push(`${cr.seasons} holds ${[...new Set(seasons)].sort().join(',') || 'nothing'}, not ${want}`);
    } else if (r.coverage === 'games_finished') {
      const g = get('games');
      const want = SCHEDULE ? needWeeks.reduce((n, w) => n + weekGames(SCHEDULE, w).length, 0) : null;
      if (!g.found) short.push(`${cr.games} does not resolve`);
      else if (want != null && !(Number(g.value) >= want)) short.push(`${g.value} games synced, weeks 1 to ${L} hold ${want}`);
    } else short.push(`unknown coverage ${r.coverage}`);
    for (const s of short) red('coverage', r.coverage, r, r.path, `${s} (latest finished week ${L}, ${weekSource(r.coverage_grace_hours, L)})`);
  }
  // The second-source recomputes run on the chain inputs only (plan step 5: the gate calls them on chain_input).
  for (const r of ROWS.filter(x => x.tier === 'chain_input' && RECOMPUTED.test(x.path))) recompute(r);
  note('coverage', `latest finished week ${[...used].map(([g, L]) => `${L} at ${g} h grace`).join(', ') || 'not computed'}${OPT.week != null ? ` (--week ${OPT.week} is a floor)` : ''}; ${T.checked} checks`);
}

// ── lineage ──────────────────────────────────────────────────────────────
async function modeLineage() {
  const T = tally.lineage;
  for (const r of ROWS.filter(x => x.derived_from?.length && x.lineage_grace_hours != null)) {
    T.checked++;
    const served = await contentTime(r);
    if (served.ms == null) { red('lineage', 'served-time', r, r.path, `cannot date the served copy: ${served.why}`); continue; }
    for (const src of r.derived_from) {
      const sr = rowFor(ALL_ROWS, src);
      if (!sr) { red('lineage', 'source-row', r, r.path, `source ${src} has no row`); continue; }
      const st = await contentTime(sr);
      if (st.ms == null && st.clock) { red('lineage', 'source-time', r, r.path, `cannot date source ${src}: ${st.why}`); continue; }
      if (st.ms == null) continue; // a source with no clock (a code file, an undated hand file) cannot be newer by stamp
      if (st.ms > served.ms + r.lineage_grace_hours * HOUR) {
        red('lineage', 'derived_from', r, r.path, `source ${src} (${st.src}) is ${hours(st.ms - served.ms)} hours newer than the served copy (${served.src}), grace ${r.lineage_grace_hours}`);
      }
    }
  }
  note('lineage', `${T.checked} derived rows checked`);
}

// ── season ───────────────────────────────────────────────────────────────
async function modeSeason() {
  const T = tally.season;
  if (OPT.asSeason != null) note('season', `as season ${SEASON} (base_season ${BASE}); data/season.json says ${setting.season} (base_season ${setting.base_season})`);
  for (const r of ROWS.filter(x => historyYear(x) != null)) note('season', `${r.path}: write-once history, held at ${historyYear(r)} at every setting${historyYear(r) !== SEASON ? `; season ${SEASON}'s files need a row of their own` : ''}`);
  if (!SCHEDULE) red('season', 'schedule', null, SCHEDULE_PATH, `no schedule for season ${SEASON}: ${scheduleWhy}`);
  for (const r of ROWS) {
    const want = expectedYear(r);
    const ys = yearsIn(r.path);
    if (ys.length) {
      T.checked++;
      const ok = want != null ? ys.every(y => y === want) : (r.season_by_design || ys.every(y => y === SEASON));
      const byDesignNoClock = want == null && r.season_by_design;
      if (!ok && !byDesignNoClock) red('season', 'path-year', r, r.path, want != null ? `the path names ${ys.join(',')}, the row expects ${expectLabel(r)}` : `the path names ${ys.join(',')}, not ${SEASON}, with no season_by_design reason`);
    }
    if (want == null || !r.stamp?.source_season) continue;
    // A glob row's stamp sits in each file it matches.
    const targets = r.glob ? globFiles(r.path).map(p => ({ ...r, glob: false, path: p })) : [r];
    for (const t of targets) {
      T.checked++;
      const v = await stampValue(t, 'source_season');
      if (!v.ok) { red('season', 'source_season', r, t.path, `cannot read source_season: ${v.why}`); continue; }
      if (Number(v.value) !== want) red('season', 'source_season', r, t.path, `source_season ${v.value}, the row expects ${expectLabel(r)}`);
    }
  }
  // Step 17: src/config.js holds the last complete season of play data and must equal base_season.
  const cfgRow = ROWS.find(r => r.path === 'src/config.js');
  if (cfgRow || !OPT.tiers) {
    T.checked++;
    if (!exists('src/config.js')) red('season', 'config', cfgRow, 'src/config.js', 'missing');
    else {
      const src = readText('src/config.js');
      // Step 17 renamed CURRENT_SEASON to LAST_COMPLETE_SEASON (merged with release 2, 2026-11-07).
      // The old name is a red wherever it appears in src.
      const m = src.match(/export\s+const\s+(LAST_COMPLETE_SEASON)\s*=\s*(\d{4})\s*;/);
      const codeFiles = [...ALL_SRC].filter(f => CODE_RE.test(f));
      for (const f of codeFiles) {
        const i = readText(f).search(/\bCURRENT_SEASON\b/);
        if (i >= 0) red('season', 'config', cfgRow, 'src/config.js', `${f}:${readText(f).slice(0, i).split('\n').length} names CURRENT_SEASON, the name step 17 retired for LAST_COMPLETE_SEASON`);
      }
      const s = src.match(/export\s+const\s+SEASONS\s*=\s*\[([^\]]*)\]/);
      const list = s ? s[1].split(',').map(x => Number(x.trim())).filter(Number.isInteger) : [];
      if (!m) red('season', 'config', cfgRow, 'src/config.js', 'no LAST_COMPLETE_SEASON constant');
      else {
        if (Number(m[2]) !== BASE) red('season', 'config', cfgRow, 'src/config.js', `${m[1]} is ${m[2]}, base_season is ${BASE}`);
        if (list[list.length - 1] !== Number(m[2])) red('season', 'config', cfgRow, 'src/config.js', `SEASONS ends ${list[list.length - 1] ?? 'nowhere'}, not ${m[1]} ${m[2]}`);
        note('season', `src/config.js ${m[1]} ${m[2]}, SEASONS ${list.join(',')}, base_season ${BASE}`);
      }
    }
  }
  note('season', `${T.checked} checks against season ${SEASON}, base_season ${BASE}`);
}

// ── label ────────────────────────────────────────────────────────────────
function modeLabel() {
  const T = tally.label;
  for (const r of ROWS.filter(x => x.ui_consumers?.length || x.label_route)) {
    if (!r.label) red('label', 'label', r, r.path, 'it has ui_consumers or a label_route but no label');
    for (const c of r.ui_consumers || []) {
      T.checked++;
      if (!exists(c)) { red('label', 'AsOf', r, r.path, `ui_consumer ${c} does not exist`); continue; }
      const src = readText(c);
      const renders = /<AsOf\b/.test(src);
      const imports = /import\s*\{[^}]*\bAsOf\b[^}]*\}\s*from\s*['"][^'"]*\/AsOf(?:\.jsx?)?['"]/.test(src);
      if (!renders || !imports) red('label', 'AsOf', r, r.path, `ui_consumer ${c} ${renders ? 'does not import' : 'does not render'} AsOf`);
    }
  }
  note('label', `${T.checked} consumers read for AsOf`);
}

// ── source scan (imports and unread) ─────────────────────────────────────
const CODE_RE = /\.(m?jsx?|tsx?)$/;
function walk(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(abs(dir), { withFileTypes: true }).flatMap(e => {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) return e.name === 'node_modules' ? [] : walk(p);
    return [p];
  });
}
const SPEC_RE = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"`])([^'"`\n]+)\1|(['"`])(\/data\/[^'"`\n]+)\3/g;
const ALL_SRC = new Set(walk('src'));
function resolveSpec(from, spec) {
  if (spec.startsWith('/data/')) return `public${spec}`;
  if (!spec.startsWith('.')) return null;
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
  for (const c of [base, `${base}.js`, `${base}.jsx`, `${base}.mjs`, `${base}.ts`, `${base}.tsx`, `${base}.json`, `${base}/index.js`, `${base}/index.jsx`]) {
    if (ALL_SRC.has(c)) return c;
  }
  return base;
}
const specCache = new Map();
function specsOf(file) {
  if (!specCache.has(file)) {
    const out = [];
    const src = readText(file);
    for (const m of src.matchAll(SPEC_RE)) {
      const spec = m[2] ?? m[4];
      const line = src.slice(0, m.index).split('\n').length;
      const target = resolveSpec(file, spec);
      if (target) out.push({ spec, target, line });
    }
    specCache.set(file, out);
  }
  return specCache.get(file);
}
const isData = (p) => /^(src\/data|public\/data)\//.test(p);

function modeImports() {
  const T = tally.imports;
  const dirs = ['src/components', 'src/utils'];
  for (const d of dirs) if (!walk(d).some(f => CODE_RE.test(f))) red('imports', 'scan', null, d, 'no code files to scan: the directory moved or is empty, so the imports mode would check nothing');
  const files = dirs.flatMap(walk).filter(f => CODE_RE.test(f));
  let found = 0;
  for (const f of files) {
    for (const { spec, target, line } of specsOf(f)) {
      if (!isData(target)) continue;
      const ys = yearsIn(target.replace(/^(src|public)\/data\//, ''));
      if (!ys.length) continue;
      found++;
      const r = rowFor(ALL_ROWS, target);
      if (OPT.tiers && !(r && OPT.tiers.includes(r.tier))) continue;
      T.checked++;
      if (!r) { red('imports', 'unregistered', null, target, `${f}:${line} imports ${spec}, a year-named file with no row`); continue; }
      if (ys.every(y => y === SEASON)) continue;
      const want = expectedYear(r);
      const byDesign = r.season_by_design && r.tier !== 'unread' && (want == null || ys.every(y => y === want));
      if (!byDesign) {
        const why = r.tier === 'unread' && r.season_by_design ? `its season_by_design reason covers an archive (tier unread), not a reader` : r.season_by_design ? `the row expects ${expectLabel(r)}` : 'the row declares no season_by_design reason';
        red('imports', 'year', r, r.path, `${f}:${line} imports ${spec}: the year ${ys.join(',')} is not ${SEASON} and ${why}`);
      }
    }
  }
  if (found < MIN_YEAR_IMPORTS) red('imports', 'scan', null, dirs.join(', '), `${found} year-named data imports found in ${files.length} code files, under the floor of ${MIN_YEAR_IMPORTS}: the scan is not reaching the imports`);
  note('imports', `${T.checked} year-named data imports checked (${found} found in ${files.length} code files, floor ${MIN_YEAR_IMPORTS}), season ${SEASON}`);
}

function modeUnread() {
  const T = tally.unread;
  const code = [...ALL_SRC].filter(f => CODE_RE.test(f));
  const reach = new Set();
  const via = new Map();
  if (!ALL_SRC.has(ENTRY)) red('unread', 'entry', null, ENTRY, 'the site entry is missing, so nothing reachable can be checked');
  if (exists('index.html')) {
    const m = readText('index.html').match(/<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']\/?([^"']+)["']/);
    if (!m) red('unread', 'entry', null, 'index.html', `has no module script, so ${ENTRY} is not shown to be the site entry`);
    else if (m[1] !== ENTRY) red('unread', 'entry', null, 'index.html', `loads ${m[1]}, not ${ENTRY}: the reach is walked from the wrong entry`);
  }
  const stack = [ENTRY];
  while (stack.length) {
    const f = stack.pop();
    if (reach.has(f)) continue;
    reach.add(f);
    if (!CODE_RE.test(f) || !ALL_SRC.has(f)) continue;
    for (const { target, line } of specsOf(f)) {
      if (!via.has(target)) via.set(target, `${f}:${line}`);
      if (!reach.has(target)) stack.push(target);
    }
  }
  for (const r of ROWS.filter(x => x.tier === 'unread')) {
    T.checked++;
    const hit = r.glob ? [...reach].find(p => globRe(r.path).test(p)) : reach.has(r.path) ? r.path : null;
    if (hit) red('unread', 'imported', r, r.path, `marked unread, but the site bundle reaches it from ${via.get(hit)}`);
  }
  const reached = [...reach].filter(f => code.includes(f)).length;
  if (reached < MIN_REACHABLE_MODULES) red('unread', 'reach', null, ENTRY, `${reached} modules reachable, under the floor of ${MIN_REACHABLE_MODULES}: the walk is not reaching the site bundle`);
  note('unread', `${T.checked} unread rows against ${reached} modules reachable from ${ENTRY} (floor ${MIN_REACHABLE_MODULES})`);
}

// ── staging ──────────────────────────────────────────────────────────────
async function modeStaging() {
  const T = tally.staging;
  let YAML;
  try { YAML = await import('yaml'); } catch {
    red('staging', 'parser', null, '.github/workflows', 'cannot load the yaml package; staging runs only where npm install ran');
    return;
  }
  const parsed = new Map();
  function runsOf(wf) {
    if (!parsed.has(wf)) {
      const p = `.github/workflows/${wf}`;
      if (!exists(p)) { parsed.set(wf, { error: 'no such workflow' }); return parsed.get(wf); }
      try {
        const doc = YAML.parse(readText(p));
        const runs = [];
        for (const job of Object.values(doc?.jobs || {})) for (const step of job?.steps || []) if (typeof step?.run === 'string') runs.push(step.run);
        parsed.set(wf, { runs });
      } catch (e) { parsed.set(wf, { error: `does not parse: ${e.message.split('\n')[0]}` }); }
    }
    return parsed.get(wf);
  }
  function gitAddArgs(runs) {
    const args = [];
    for (const run of runs) {
      const text = run.replace(/\\\n/g, ' ');
      for (const line of text.split('\n')) {
        for (const m of line.matchAll(/\bgit\s+add\b([^;&|\n]*)/g)) {
          for (const tok of m[1].trim().split(/\s+/)) {
            if (!tok || /^\d?>/.test(tok)) break;
            args.push(tok.replace(/^['"]|['"]$/g, ''));
          }
        }
      }
    }
    return args;
  }
  const covers = (tok, p) => {
    if (tok === '-A' || tok === '--all' || tok === '.') return true;
    if (tok.startsWith('-')) return false;
    if (tok.endsWith('/')) return p.startsWith(tok);
    if (tok.includes('*')) return globRe(tok).test(p) || (p.includes('*') && tok === p);
    return tok === p;
  };
  for (const r of ROWS.filter(x => x.producer && x.workflows?.length && x.stamp?.kind !== 'build_time')) {
    for (const wf of r.workflows) {
      const w = runsOf(wf);
      if (w.error) { red('staging', 'workflow', r, r.path, `${wf} ${w.error}`); continue; }
      const args = gitAddArgs(w.runs);
      for (const p of [r.path, ...(r.outputs_also || [])]) {
        T.checked++;
        if (!args.some(a => covers(a, p))) red('staging', 'git-add', r, p, `${wf} runs ${r.producer} but its git add does not stage ${p}${p !== r.path ? ` (outputs_also of ${r.path})` : ''}`);
      }
    }
  }
  // A year-named file a workflow downloads, reads or stages must be the setting's year, or a by-design row.
  if (!OPT.tiers) {
    const dir = '.github/workflows';
    for (const wf of exists(dir) ? fs.readdirSync(abs(dir)).filter(f => /\.ya?ml$/.test(f)).sort() : []) {
      const w = runsOf(wf);
      if (w.error) { red('staging', 'workflow', null, `${dir}/${wf}`, w.error); continue; }
      const seen = new Set();
      for (const run of w.runs) {
        for (const m of run.matchAll(/[\w./-]*20\d\d[\w./-]*\.(?:json|js|mjs|md|csv|gz|parquet|rds)\b/g)) {
          // One finding per file name per workflow: a download URL, its local path and an echo name the same file.
          const name = m[0].startsWith('//') ? `${m[0].slice(2).split('/')[0]}/.../${path.posix.basename(m[0])}` : m[0];
          const key = path.posix.basename(name);
          if (seen.has(key)) continue;
          seen.add(key);
          const ys = yearsIn(key);
          if (!ys.length || ys.every(y => y === SEASON)) continue;
          const r = rowFor(ALL_ROWS, name);
          if (r?.season_by_design) continue;
          T.checked++;
          red('staging', 'year-named', r, `${dir}/${wf}`, `names ${name}, a year other than ${SEASON}, with no season_by_design row`);
        }
      }
    }
  }
  note('staging', `${T.checked} staged outputs and year-named paths checked`);
}

// ── built ────────────────────────────────────────────────────────────────
function modeBuilt() {
  const T = tally.built;
  const rows = ROWS.filter(r => r.stamp?.kind === 'build_time');
  for (const r of rows) {
    T.checked++;
    const d = `dist/${r.path.replace(/^public\//, '')}`;
    if (!exists(d)) { red('built', 'dist', r, r.path, `${d} is missing${exists('dist') ? '' : ' (no dist/: run npm run build first)'}`); continue; }
    const size = fs.statSync(abs(d)).size;
    if (!size) { red('built', 'dist', r, r.path, `${d} is empty`); continue; }
    if (d.endsWith('.json')) { try { JSON.parse(readText(d)); } catch (e) { red('built', 'dist', r, r.path, `${d} does not parse: ${e.message}`); } }
  }
  note('built', `${T.checked} build_time files looked for in dist/`);
}

// ── Run ──────────────────────────────────────────────────────────────────
const RUNNERS = { registration: modeRegistration, age: modeAge, coverage: modeCoverage, lineage: modeLineage, season: modeSeason, label: modeLabel, imports: modeImports, staging: modeStaging, unread: modeUnread, built: modeBuilt };
for (const m of MODES) if (OPT.modes.includes(m)) await RUNNERS[m]();

const reds = findings.filter(f => f.status === 'red');
const frozen = findings.filter(f => f.status === 'frozen');
const exitCode = reds.length && BLOCKING ? 1 : 0;
const head = `check-freshness ${OPT.modes.length === MODES.length ? 'all' : OPT.modes.join(',')}${OPT.tiers ? ` tier ${OPT.tiers.join(',')}` : ''} at ${isoH(NOW)}${OPT.asOf != null ? ' (--as-of)' : ''}, season ${SEASON}${OPT.asSeason != null ? ' (--as-season)' : ''}`;
const lines = [head];
for (const m of MODES) {
  if (!OPT.modes.includes(m)) continue;
  const t = tally[m];
  lines.push(`${t.red ? 'RED ' : 'ok  '} ${m}: ${t.red} red${t.frozen ? `, ${t.frozen} frozen` : ''}`);
  for (const l of t.lines) lines.push(`       ${l}`);
}
for (const f of findings) lines.push(`${f.status === 'red' ? 'RED   ' : 'FROZEN'} ${f.mode}/${f.rule}  ${f.file}  ${f.message}`);
const verdict = !reds.length ? 'PASS' : BLOCKING ? 'FAIL' : `REPORT (not blocking${OPT.report ? ': --report' : `: event ${EVENT || 'none'}, blocks on ${OPT.blockOn}`})`;
lines.push(`${verdict}: ${reds.length} red${frozen.length ? `, ${frozen.length} frozen` : ''}`);
(OPT.json ? console.error : console.log)(lines.join('\n'));
if (!BLOCKING && reds.length && process.env.GITHUB_ACTIONS) {
  for (const f of reds.slice(0, 50)) console.error(`::warning title=freshness ${f.mode}/${f.rule}::${f.file}: ${f.message}`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const esc = (s) => String(s).replace(/\|/g, '\\|');
  const md = [`### Freshness gate: ${verdict}`, '', `${head}`, '', '| Mode | Red | Frozen | Notes |', '|---|---|---|---|'];
  for (const m of MODES) if (OPT.modes.includes(m)) md.push(`| ${m} | ${tally[m].red} | ${tally[m].frozen} | ${esc(tally[m].lines.join('; '))} |`);
  if (findings.length) {
    md.push('', '| Status | Mode | Rule | File | Tier | Why |', '|---|---|---|---|---|---|');
    for (const f of findings) md.push(`| ${f.status} | ${f.mode} | ${f.rule} | ${esc(f.file)} | ${f.tier ?? ''} | ${esc(f.message)} |`);
  }
  try { fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md.join('\n') + '\n'); } catch { /* the summary is a courtesy */ }
}

if (OPT.json) {
  const report = {
    tool: 'check-freshness', schema: 1, as_of: new Date(NOW).toISOString(), as_of_flag: OPT.asOf != null,
    season: SEASON, base_season: BASE, as_season_flag: OPT.asSeason != null,
    modes: OPT.modes, tiers: OPT.tiers, week_from_caller: OPT.week, replay: OPT.replay,
    in_season: IN_SEASON, latest_finished_week: { grace_6h: latestFinishedWeek(6), grace_36h: latestFinishedWeek(36) },
    gate_blocking_from: manifest.gate_blocking_from ?? null, event: EVENT || null, block_on_event: OPT.blockOn, report_flag: OPT.report,
    blocking: BLOCKING, draft_windows_active: FREEZE.active,
    summary: Object.fromEntries(MODES.filter(m => OPT.modes.includes(m)).map(m => [m, { checked: tally[m].checked, red: tally[m].red, frozen: tally[m].frozen, skipped: tally[m].skipped, notes: tally[m].lines }])),
    red_files: [...new Set(reds.map(f => f.file))],
    findings, verdict, exit: exitCode,
  };
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}
process.exitCode = exitCode;
