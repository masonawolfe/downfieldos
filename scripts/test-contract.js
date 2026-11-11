#!/usr/bin/env node
/**
 * test-contract.js: fixture tests for the freshness contract (DATA_FRESHNESS_PLAN
 * step 4, 2026-11-07). Run: npm test
 *
 * Covers the season setting (scripts/_lib/season.js), the contract stamp
 * (scripts/_lib/stamp.js), that no producer or workflow carries a literal
 * season default, and the shape of data/freshness_manifest.json.
 * Every check reads only files the engineer edits by hand, never a file a
 * data job writes, so a bot commit can never turn this test (and the deploy
 * that runs it) red. Whether each data file has a row is the gate's
 * registration mode (step 5), which annotates on a bot's dispatch instead.
 *
 * No expected value is a year literal: each reads data/season.json, so
 * moving the setting to 2027 needs no edit here. The one check that turns
 * red by design at the rollover (a year in a row's path other than the
 * setting, without a season_by_design reason) is structural: it fails on a
 * push or a local run and only annotates on any other GITHUB_EVENT_NAME,
 * so a bot-dispatched deploy keeps shipping (plan section "What changed",
 * row 7). Step 5's season and imports modes take it over under
 * --block-on-event push.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { readSeasonSetting, SEASON, BASE_SEASON, seasonWindow, seasonFrom } from './_lib/season.js';
import { contractMeta } from './_lib/stamp.js';
import { isDay } from './_lib/gate-blocking.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(__dirname);
const FIX = path.join(__dirname, '__fixtures__', 'contract');
const EVENT = process.env.GITHUB_EVENT_NAME || '';
const STRUCTURAL_BLOCKS = EVENT === '' || EVENT === 'push';

let passed = 0;
let failed = 0;
let annotated = 0;
function assert(condition, message) {
  if (condition) { passed++; console.log(`  ✅ ${message}`); }
  else { failed++; console.error(`  ❌ ${message}`); }
}
/** Fails on a push or a local run; annotates on any other event. */
function structural(condition, message) {
  if (condition || STRUCTURAL_BLOCKS) return assert(condition, message);
  annotated++;
  console.log(`::warning title=test-contract (structural, ${EVENT})::${message}`);
}
function throws(fn) { try { fn(); return null; } catch (e) { return e.message; } }
const read = (p) => fs.readFileSync(p, 'utf8');

console.log('Season setting');
const setting = readSeasonSetting();
assert(SEASON === setting.season && BASE_SEASON === setting.base_season, `SEASON and BASE_SEASON exports equal data/season.json (${setting.season}, ${setting.base_season})`);
// The reason is rewritten at a rollover, so this is structural too.
structural(/E-034 v2/.test(setting.base_season_reason), 'base_season_reason names E-034 v2');
assert(throws(() => readSeasonSetting(path.join(FIX, 'season_bad_year.json')))?.includes('season must be an integer year'), 'a string season is refused');
assert(throws(() => readSeasonSetting(path.join(FIX, 'season_base_after.json')))?.includes('is after season'), 'a base_season after season is refused');
assert(throws(() => readSeasonSetting(path.join(FIX, 'season_no_reason.json')))?.includes('base_season_reason'), 'a missing base_season_reason is refused');
assert(throws(() => readSeasonSetting(path.join(FIX, 'missing.json')))?.includes('unreadable'), 'a missing file is refused');
assert(readSeasonSetting(path.join(FIX, 'season_2027.json')).season === 2027, 'the 2027 rollover fixture reads 2027');
assert(JSON.stringify(seasonWindow(3)) === JSON.stringify([SEASON - 2, SEASON - 1, SEASON]), `seasonWindow(3) is ${SEASON - 2} to ${SEASON}`);
assert(JSON.stringify(seasonWindow(3, 2027)) === '[2025,2026,2027]', 'seasonWindow(3, 2027) is 2025 to 2027');
assert(seasonFrom('') === SEASON && seasonFrom(undefined) === SEASON, 'a blank explicit season falls through to the setting');
assert(seasonFrom('', BASE_SEASON) === BASE_SEASON, 'a blank explicit season with the base fallback is base_season');
assert(seasonFrom('2024') === 2024, 'an explicit season wins');
assert(throws(() => seasonFrom('20x6')) != null, 'a malformed explicit season is refused');
const cli = (...a) => execFileSync(process.execPath, [path.join(__dirname, '_lib', 'season.js'), ...a], { encoding: 'utf8' }).trim();
assert(cli('season') === String(SEASON) && cli('base_season') === String(BASE_SEASON) && cli('window', '3') === seasonWindow(3).join(','), 'the shell form prints the setting\'s season, base_season and window');

console.log('\nContract stamp');
const t = new Date('2026-11-07T12:00:00Z');
const s = contractMeta({ sourceSeason: 2026, sources: ['a.csv'], now: t });
assert(JSON.stringify(Object.keys(s)) === '["generated_at","source_season","sources"]', 'contractMeta returns generated_at, source_season and sources only');
assert(s.generated_at === '2026-11-07T12:00:00.000Z' && s.source_season === 2026 && s.sources[0] === 'a.csv', 'contractMeta carries the time, season and sources it was given');
assert(throws(() => contractMeta({ sourceSeason: '2026', sources: ['a'] })) != null, 'a string sourceSeason is refused');
assert(throws(() => contractMeta({ sourceSeason: 2026, sources: [] })) != null, 'empty sources are refused');
assert(throws(() => contractMeta({ sourceSeason: 2026, sources: [''] })) != null, 'a blank source is refused');
assert(throws(() => contractMeta({ sourceSeason: 2026, sources: ['a'], now: 'not a time' })) != null, 'a bad time is refused');

console.log('\nProducers on the contract');
const CONTRACT_PRODUCERS = ['fetch-weekly-actuals.js', 'build-calibration.js', 'build-games-2026.js', 'build-defense.js', 'fetch-injuries.js', 'fetch-referees.js', 'build-player-stats.js'];
const callsContract = (src) => /import \{ contractMeta \} from '\.\/_lib\/stamp\.js'/.test(src) && /contractMeta\(\{/.test(src);
for (const p of CONTRACT_PRODUCERS) assert(callsContract(read(path.join(__dirname, p))), `${p} imports and calls contractMeta`);

// A literal season default or a date rule, in code (usage lines such as
// " *   SEASON=2025 node scripts/x.js" are not code and do not match).
const SEASON_LITERAL_RULES = [
  ['an or-literal default', /\|\|\s*['"]?20\d\d\b/g],
  ['a nullish-literal default', /\?\?\s*['"]?20\d\d\b/g],
  ['a pinned season constant', /\b(?:const|let|var)\s+[A-Z_]*(?:SEASON|YEAR)[A-Z_]*\s*=\s*['"]?20\d\d\b/g],
  ['the March date rule', /\bcurrentNflSeason\s*\(|\b_current_nfl_season\s*\(/g],
];
function seasonLiteralHits(src) {
  const hits = [];
  for (const [rule, re] of SEASON_LITERAL_RULES) for (const m of src.matchAll(re)) hits.push({ rule, text: src.slice(src.lastIndexOf('\n', m.index) + 1, src.indexOf('\n', m.index) < 0 ? undefined : src.indexOf('\n', m.index)).trim() });
  return hits;
}
for (const [fixture, rule] of [['producer_or_season.txt', 'an or-literal default'], ['producer_nullish_season.txt', 'a nullish-literal default'], ['producer_const_season.txt', 'a pinned season constant'], ['producer_date_rule.txt', 'the March date rule']]) {
  assert(seasonLiteralHits(read(path.join(FIX, fixture))).some(h => h.rule === rule), `induced: ${fixture} is caught as ${rule}`);
}
assert(seasonLiteralHits(read(path.join(FIX, 'producer_clean.txt'))).length === 0, 'the clean producer fixture passes (a usage line naming a year is not code)');

const SEASON_PRODUCERS = [
  'fetch-injuries.js', 'build-defense.js', 'build-referee-tendencies.js', 'build-player-stats.js', 'check-player-stats-floor.mjs',
  'fetch-weekly-actuals.js', 'build-calibration.js', 'build-games-2026.js',
  'fetch-schedule.js', 'fetch-availability.js', 'fetch-contracts.js', 'fetch-nflverse-rosters.js', 'fetch-nflverse-roster-base.js',
  'verify-schedule-upstream.mjs', 'reconcile-actuals-scoring.mjs', 'build-weekly-transactions.js', 'build-player-board.js',
  'snapshot-weekly-projections.mjs',
];
for (const p of SEASON_PRODUCERS) {
  const src = read(path.join(__dirname, p));
  const hits = seasonLiteralHits(src);
  assert(/from '\.\/_lib\/season\.js'/.test(src) && hits.length === 0, `${p} takes its default season from season.js, with no literal or date rule${hits.length ? ` (${hits.map(h => `${h.rule}: ${h.text}`).join('; ')})` : ''}`);
}
const pbpPy = read(path.join(__dirname, 'pbp', 'process_pbp.py'));
assert(/data" \/ "season\.json"/.test(pbpPy) && /YEAR = int\(_env_year\) if _env_year else _season_setting\(\)/.test(pbpPy) && seasonLiteralHits(pbpPy).length === 0, 'pbp/process_pbp.py defaults to data/season.json, with no date rule');

// Every other hit in scripts/ is named here with its reason, so a new
// literal anywhere in the population fails by file and line.
const SEASON_LITERAL_DEFERRED = [
  ['fetch-nflverse-pbp.js', "process.env.LATEST_SEASON || '2025'", 'season_by_design: the site fetches exactly plays-2023.json to plays-2025.json (plan step 4(b))'],
  ['fetch-referees.js', "process.env.MIN_SEASON || '2021'", 'a history floor, not a season default: the feed grows from 2021 and nothing stays behind at the rollover'],
  ['fetch-trades.js', "process.env.MIN_SEASON || '2024'", 'a history floor, not a season default: the feed grows from 2024 and nothing stays behind at the rollover'],
  ['verify-player-board.mjs', 'function currentNflSeason()', 'a verifier, not a producer: check #12, which plan step 4(e) replaces with the coachingTrees.js clock in the gate (step 5)'],
  ['verify-player-board.mjs', 'const currentYear = currentNflSeason();', 'the same check #12'],
];
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (e.isDirectory()) return ['node_modules', '__fixtures__'].includes(e.name) ? [] : walk(path.join(dir, e.name));
    return /\.(m?js|py)$/.test(e.name) ? [path.join(dir, e.name)] : [];
  });
}
// This file is left out: its rule table and deferral list quote the patterns.
const swept = [...walk(__dirname), ...walk(path.join(REPO, '.github', 'scripts'))].filter(f => f !== fileURLToPath(import.meta.url));
const undeclaredHits = swept.flatMap(f => seasonLiteralHits(read(f)).map(h => ({ f: path.relative(__dirname, f), ...h })))
  .filter(h => !SEASON_LITERAL_DEFERRED.some(([file, text]) => h.f === file && h.text.includes(text)));
assert(undeclaredHits.length === 0, `no script carries a literal season default or date rule outside the ${SEASON_LITERAL_DEFERRED.length} named deferrals (${swept.length} files swept)${undeclaredHits.length ? `; not ${undeclaredHits.map(h => `${h.f} (${h.rule}: ${h.text})`).join('; ')}` : ''}`);
const staleDeferrals = SEASON_LITERAL_DEFERRED.filter(([file, text]) => !read(path.join(__dirname, file)).includes(text));
assert(staleDeferrals.length === 0, `every named deferral still matches its file${staleDeferrals.length ? ` (not ${staleDeferrals.map(d => d[0]).join(', ')})` : ''}`);

console.log('\nWorkflows carry no season literal default');
const WORKFLOW_LITERAL_RULES = [
  ['an input default', /^\s*default:\s*['"]20\d\d['"]/gm],
  ['an or-literal expression', /\|\|\s*['"]20\d\d/g],
  ['a literal season env value', /^\s*[A-Z_]*(?:SEASON|YEAR)[A-Z_]*:\s*['"]?20\d\d/gm],
  ['the March date rule', /date -u \+%m/g],
  ['a literal season list', /\bSEASONS=20\d\d/g],
  ['a literal season loop', /\bfor \w+ in 20\d\d/g],
];
const workflowHits = (src) => WORKFLOW_LITERAL_RULES.flatMap(([rule, re]) => [...src.matchAll(re)].map(m => ({ rule, line: src.slice(0, m.index).split('\n').length })));
const wfFixtureRules = new Set(workflowHits(read(path.join(FIX, 'workflow_literal_season.txt'))).map(h => h.rule));
assert(WORKFLOW_LITERAL_RULES.every(([rule]) => wfFixtureRules.has(rule)), `induced: workflow_literal_season.txt is caught by all ${WORKFLOW_LITERAL_RULES.length} rules (${wfFixtureRules.size})`);
assert(workflowHits(read(path.join(FIX, 'workflow_clean.txt'))).length === 0, 'the clean workflow fixture passes (a year in a download URL is a file name, not a default)');
const WF_DIR = path.join(REPO, '.github', 'workflows');
const wfFiles = fs.readdirSync(WF_DIR).filter(f => /\.ya?ml$/.test(f));
const wfHits = wfFiles.flatMap(f => workflowHits(read(path.join(WF_DIR, f))).map(h => `${f}:${h.line} (${h.rule})`));
assert(wfHits.length === 0, `no workflow carries a literal season default (${wfFiles.length} files)${wfHits.length ? `; not ${wfHits.join(', ')}` : ''}`);
const pbpJs = read(path.join(__dirname, 'fetch-nflverse-pbp.js'));
assert(/LATEST_SEASON \|\| '2025'/.test(pbpJs), "fetch-nflverse-pbp.js stays at '2025' (season_by_design)");

console.log('\nManifest shape');
const m = JSON.parse(read(path.join(REPO, 'data', 'freshness_manifest.json')));
const FIELDS = ['path', 'producer', 'outputs_also', 'workflows', 'stamp', 'expected_season', 'season_by_design', 'max_age_hours', 'change_driven', 'in_season_only', 'coverage', 'coverage_read', 'coverage_grace_hours', 'derived_from', 'lineage_grace_hours', 'ui_consumers', 'label_route', 'consumers', 'tier', 'on_stale', 'static', 'verified_on', 'label', 'note'];
const rows = m.rows;
assert(m.schema === 1, 'schema 1');
assert(m.season_file === 'data/season.json', 'season_file names data/season.json');
// The deploy and the chain read this date through scripts/_lib/gate-blocking.mjs,
// so the check is the helper's own isDay(): a bad date fails CI here, before main.
assert(isDay(m.gate_blocking_from), `gate_blocking_from is a real day, by gate-blocking.mjs's isDay() (${m.gate_blocking_from})`);
assert(!isDay('2026-11-31') && !isDay('2026-02-29') && isDay('2028-02-29'), 'induced: isDay() refuses 2026-11-31 and 2026-02-29 and takes 2028-02-29');
{
  const gb = (args, event) => {
    const env = { ...process.env };
    if (event == null) delete env.GITHUB_EVENT_NAME; else env.GITHUB_EVENT_NAME = event;
    try { return { code: 0, out: execFileSync(process.execPath, [path.join(__dirname, '_lib', 'gate-blocking.mjs'), ...args], { encoding: 'utf8', env, stdio: ['ignore', 'pipe', 'pipe'] }) }; }
    catch (e) { return { code: e.status, out: e.stdout || '' }; }
  };
  const before = gb(['--as-of', '2000-01-01']);
  const after = gb(['--as-of', '9999-12-31']);
  assert(before.code === 0 && before.out === '--report\n' && after.code === 0 && after.out === '', 'gate-blocking.mjs prints --report before the date and nothing on or after it');
  assert(gb(['--as-of', '2026-11-31']).code === 2, 'induced: gate-blocking.mjs exits 2 on a bad --as-of');
}
const missingFields = rows.filter(r => FIELDS.some(f => !(f in r))).map(r => r.path);
assert(missingFields.length === 0, `every row carries all ${FIELDS.length} fields${missingFields.length ? ` (missing on ${missingFields.join(', ')})` : ''}`);
const paths = rows.map(r => r.path);
assert(new Set(paths).size === paths.length, `row paths are unique (${paths.length})`);
const kinds = new Set(['json', 'js_meta', 'header', 'build_time']);
assert(rows.every(r => r.stamp == null || kinds.has(r.stamp.kind)), 'every stamp kind is json, js_meta, header or build_time');
assert(!JSON.stringify(m).includes('"kind":"git"'), 'no row uses a git stamp');
const noStamp = rows.filter(r => !r.static && !r.stamp).map(r => r.path);
assert(noStamp.length === 0, `every non-static row carries a stamp${noStamp.length ? ` (none on ${noStamp.join(', ')})` : ''}`);
const badStatic = rows.filter(r => r.static && !(/^\d{4}-\d{2}-\d{2}$/.test(r.verified_on || '') && r.label)).map(r => r.path);
assert(badStatic.length === 0, `every static row carries verified_on and label${badStatic.length ? ` (not ${badStatic.join(', ')})` : ''}`);
const yearRows = rows.filter(r => { const ys = (r.path.match(/20\d\d/g) || []).map(Number); return ys.some(y => y !== SEASON); });
const undeclared = yearRows.filter(r => !(typeof r.season_by_design === 'string' && r.season_by_design.trim())).map(r => r.path);
structural(undeclared.length === 0, `a year in a path other than ${SEASON} carries a season_by_design reason (${yearRows.length} rows)${undeclared.length ? `; not ${undeclared.join(', ')}` : ''}`);
assert(rows.every(r => r.season_by_design == null || (typeof r.season_by_design === 'string' && r.season_by_design.trim())), 'every season_by_design is null or a reason');
assert(rows.every(r => [null, 'season', 'base_season'].includes(r.expected_season)), 'expected_season is season, base_season or null');
assert(rows.every(r => ['chain_input', 'public', 'beta', 'internal', 'unread'].includes(r.tier)), 'every tier is in the plan\'s list');
assert(rows.every(r => ['block_chain', 'block_deploy', 'red'].includes(r.on_stale)), 'every on_stale is in the plan\'s list');
assert(rows.every(r => [null, 'graded_week', 'report_week', 'season_present', 'games_finished'].includes(r.coverage)), 'every coverage is in the plan\'s list');
assert(rows.every(r => (r.coverage == null) === (r.coverage_read == null) && (r.coverage == null) === (r.coverage_grace_hours == null)), 'coverage, coverage_read and coverage_grace_hours come together');
// Year-free names: which family a file is in does not depend on the setting.
const yearFree = (p) => path.basename(p).replace(/20\d\d/g, 'YYYY');
const cov = (k) => rows.filter(r => r.coverage === k).map(r => yearFree(r.path)).sort().join(',');
assert(cov('graded_week') === 'calibration_YYYY.json,defenseYYYY.js,gamesYYYY.json,weekly_actuals_YYYY.json', `graded_week rows are actuals, calibration, games and defense (${cov('graded_week')})`);
assert(cov('report_week') === 'injuries_YYYY_current.json', 'report_week is the current injuries file');
assert(cov('season_present') === 'referee_appearances.json,referee_appearances_compact.json,referee_tendencies.json', 'season_present rows are the three referee files');
assert(cov('games_finished') === 'pbp_sync_metadata.json', 'games_finished is pbp_sync_metadata.json');
const games = rows.filter(r => /^src\/data\/games20\d\d\.json$/.test(r.path));
assert(games.length === 1 && games[0].coverage_read?.scored_field === 'played' && games[0].coverage_read?.scored_count, 'the games file reads a scored count per week');
assert(rows.filter(r => r.tier === 'chain_input').every(r => r.coverage_grace_hours === 6 && r.on_stale === 'block_chain'), 'chain inputs use a 6-hour coverage grace and block_chain');
assert(rows.every(r => r.max_age_hours == null || (Number.isInteger(r.max_age_hours) && r.max_age_hours > 0)), 'every max_age_hours is null or a positive integer');
assert(rows.filter(r => r.change_driven).every(r => r.max_age_hours == null), 'change_driven rows carry no age clock');

// Lineage grace: at least one producer cadence plus 8 hours (plan step 4(d)),
// the cadence read from the row's family ceiling.
const FAMILY_CADENCE = { 48: 24, 144: 120, 192: 168, 768: 744 };
const lineageRows = rows.filter(r => r.derived_from.length);
const badGrace = lineageRows.filter(r => {
  if (r.lineage_grace_hours == null) return !(typeof r.lineage_grace_reason === 'string' && r.lineage_grace_reason.trim());
  const cadence = FAMILY_CADENCE[r.max_age_hours];
  return cadence == null || !Number.isInteger(r.lineage_grace_hours) || r.lineage_grace_hours < cadence + 8;
}).map(r => `${r.path} (grace ${r.lineage_grace_hours}, ceiling ${r.max_age_hours}, floor ${FAMILY_CADENCE[r.max_age_hours] == null ? 'none' : FAMILY_CADENCE[r.max_age_hours] + 8})`);
assert(badGrace.length === 0, `every derived row has a lineage grace of at least its cadence plus 8, or a lineage_grace_reason (${lineageRows.length} rows)${badGrace.length ? `; not ${badGrace.join(', ')}` : ''}`);
assert(rows.filter(r => !r.derived_from.length).every(r => r.lineage_grace_hours == null), 'a row with no derived_from carries no lineage grace');

// Stamp pointers: a row whose producer writes contractMeta points at the
// contract keys now, or names them in stamp_next for the repoint after the
// producer's next scheduled run. Only rows of the season the producer
// defaults to count: build-player-stats.js defaults to base_season, the rest
// to season, so an archive written only on a backfill (injuries_2025*) is
// left out.
const defaultSeasonOf = (producer) => (path.basename(producer || '') === 'build-player-stats.js' ? 'base_season' : 'season');
const contractRows = rows.filter(r => ['json', 'js_meta'].includes(r.stamp?.kind)
  && CONTRACT_PRODUCERS.includes(path.basename(r.producer || ''))
  && r.expected_season === defaultSeasonOf(r.producer));
const notContract = contractRows.filter(r => {
  const p = r.stamp_next || r.stamp;
  return !(/\/generated_at$/.test(p.generated_at || '') && /\/source_season$/.test(p.source_season || ''));
}).map(r => r.path);
assert(contractRows.length >= 9 && notContract.length === 0, `every contractMeta row points at generated_at and source_season, now or in stamp_next (${contractRows.length} rows)${notContract.length ? `; not ${notContract.join(', ')}` : ''}`);
const badNext = rows.filter(r => r.stamp_next && !(/^\d{4}-\d{2}-\d{2}$/.test(r.stamp_next.since || '') && r.stamp_next.generated_at && r.stamp_next.source_season)).map(r => r.path);
assert(badNext.length === 0, `every stamp_next is dated and names both pointers${badNext.length ? ` (not ${badNext.join(', ')})` : ''}`);
assert(typeof m.fields?.stamp_next === 'string' && /next scheduled run/.test(m.fields.stamp_next), 'the manifest says what stamp_next is and when it is repointed');

const unread = rows.filter(r => r.tier === 'unread').map(r => path.basename(r.path));
assert(['contracts.json', 'referee_tendencies.json', 'history_2023_2024.json', 'REFRESH_LOG.md'].every(f => unread.includes(f)), 'contracts, referee_tendencies, history_2023_2024 and REFRESH_LOG are unread');
assert(rows.find(r => r.path === 'src/data/REFRESH_LOG.md')?.superseded_by === 'data/freshness_manifest.json', 'REFRESH_LOG.md is superseded_by the manifest');
assert(rows.filter(r => r.glob).length === 1 && rows.find(r => r.glob).write_once === true && /weekly_projections\/20\d\d-w\*\.json$/.test(rows.find(r => r.glob).path), 'one write-once glob row covers weekly_projections');
const bt = rows.filter(r => r.stamp?.kind === 'build_time').map(r => path.basename(r.path)).sort().join(',');
assert(bt === 'plays-2023.json,plays-2024.json,plays-2025.json,plays-meta.json', `build_time rows are the four deploy-time play files (${bt})`);
const AT = ['src/config.js', 'public/sitemap.xml', 'public/robots.txt', 'BOARD.md', 'BOARD_WEEKLY.md', 'CALIBRATION.md', 'DATA_SOURCES.md', 'DRAFT_WINDOW.md', 'data/board_last_snapshot.json', 'data/corrections.jsonl'];
assert(JSON.stringify([...m.also_tracked].sort()) === JSON.stringify([...AT].sort()), 'also_tracked is the plan\'s ten files');
assert(m.also_tracked.every(p => paths.includes(p)), 'every also_tracked path has a row');
const missingUi = rows.flatMap(r => r.ui_consumers.filter(c => !fs.existsSync(path.join(REPO, c))));
assert(missingUi.length === 0, `every ui_consumer exists${missingUi.length ? ` (not ${missingUi.join(', ')})` : ''}`);
const dna = rows.filter(r => /src\/data\/dna(2026)?\.js$/.test(r.path));
assert(dna.length === 2 && dna.every(r => r.ui_consumers.length === 0 && /buildDynamicDNA/.test(r.note)), 'dna.js and dna2026.js have no ui_consumers and say buildDynamicDNA overwrites them');
assert(/Step 13 was not done/.test(rows.find(r => r.path === 'src/data/faMoves2026.js')?.note || ''), 'faMoves2026.js says step 13 was not done');
assert(rows.filter(r => /former_teammates_/.test(r.path)).every(r => /step 13 not done/.test(r.note)), 'both former_teammates files say step 13 was not done');

console.log(`\n${passed} passed, ${failed} failed${annotated ? `, ${annotated} structural annotated (event ${EVENT})` : ''}`);
if (failed > 0) process.exit(1);
