#!/usr/bin/env node
/**
 * test-contract.js: fixture tests for the freshness contract (DATA_FRESHNESS_PLAN
 * step 4, 2026-11-07). Run: npm test
 *
 * Covers the season setting (scripts/_lib/season.js), the contract stamp
 * (scripts/_lib/stamp.js) and the shape of data/freshness_manifest.json.
 * Every check reads only files the engineer edits by hand, never a file a
 * data job writes, so a bot commit can never turn this test (and the deploy
 * that runs it) red. Whether each data file has a row is the gate's
 * registration mode (step 5), which annotates on a bot's dispatch instead.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { readSeasonSetting, SEASON, BASE_SEASON, seasonWindow, seasonFrom } from './_lib/season.js';
import { contractMeta } from './_lib/stamp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(__dirname);
const FIX = path.join(__dirname, '__fixtures__', 'contract');

let passed = 0;
let failed = 0;
function assert(condition, message) {
  if (condition) { passed++; console.log(`  ✅ ${message}`); }
  else { failed++; console.error(`  ❌ ${message}`); }
}
function throws(fn) { try { fn(); return null; } catch (e) { return e.message; } }

console.log('Season setting');
const setting = readSeasonSetting();
assert(setting.season === 2026 && setting.base_season === 2025, `data/season.json reads season 2026, base_season 2025 (got ${setting.season}, ${setting.base_season})`);
assert(SEASON === setting.season && BASE_SEASON === setting.base_season, 'SEASON and BASE_SEASON exports equal the file');
assert(/E-034 v2/.test(setting.base_season_reason), 'base_season_reason names E-034 v2');
assert(throws(() => readSeasonSetting(path.join(FIX, 'season_bad_year.json')))?.includes('season must be an integer year'), 'a string season is refused');
assert(throws(() => readSeasonSetting(path.join(FIX, 'season_base_after.json')))?.includes('is after season'), 'a base_season after season is refused');
assert(throws(() => readSeasonSetting(path.join(FIX, 'season_no_reason.json')))?.includes('base_season_reason'), 'a missing base_season_reason is refused');
assert(throws(() => readSeasonSetting(path.join(FIX, 'missing.json')))?.includes('unreadable'), 'a missing file is refused');
assert(readSeasonSetting(path.join(FIX, 'season_2027.json')).season === 2027, 'the 2027 rollover fixture reads 2027');
assert(JSON.stringify(seasonWindow(3)) === '[2024,2025,2026]', 'seasonWindow(3) is 2024 to 2026');
assert(JSON.stringify(seasonWindow(3, 2027)) === '[2025,2026,2027]', 'seasonWindow(3, 2027) is 2025 to 2027');
assert(seasonFrom('') === SEASON && seasonFrom(undefined) === SEASON, 'a blank explicit season falls through to the setting');
assert(seasonFrom('', BASE_SEASON) === 2025, 'a blank explicit season with the base fallback is 2025');
assert(seasonFrom('2024') === 2024, 'an explicit season wins');
assert(throws(() => seasonFrom('20x6')) != null, 'a malformed explicit season is refused');
const cli = (...a) => execFileSync(process.execPath, [path.join(__dirname, '_lib', 'season.js'), ...a], { encoding: 'utf8' }).trim();
assert(cli('season') === '2026' && cli('base_season') === '2025' && cli('window', '3') === '2024,2025,2026', 'the shell form prints 2026, 2025 and 2024,2025,2026');

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
for (const p of ['fetch-weekly-actuals.js', 'build-calibration.js', 'build-games-2026.js', 'build-defense.js', 'fetch-injuries.js', 'fetch-referees.js']) {
  const src = fs.readFileSync(path.join(__dirname, p), 'utf8');
  assert(/import \{ contractMeta \} from '\.\/_lib\/stamp\.js'/.test(src) && /contractMeta\(\{/.test(src), `${p} imports and calls contractMeta`);
}
for (const p of ['fetch-injuries.js', 'build-defense.js', 'build-referee-tendencies.js', 'build-player-stats.js', 'check-player-stats-floor.mjs', 'fetch-weekly-actuals.js', 'build-calibration.js', 'build-games-2026.js']) {
  const src = fs.readFileSync(path.join(__dirname, p), 'utf8');
  assert(/from '\.\/_lib\/season\.js'/.test(src) && !/\|\| '20\d\d'|\|\| 20\d\d\b|currentNflSeason\(\)/.test(src), `${p} takes its default season from season.js, with no literal or date rule`);
}
const pbp = fs.readFileSync(path.join(__dirname, 'fetch-nflverse-pbp.js'), 'utf8');
assert(/LATEST_SEASON \|\| '2025'/.test(pbp), "fetch-nflverse-pbp.js stays at '2025' (season_by_design)");

console.log('\nManifest shape');
const m = JSON.parse(fs.readFileSync(path.join(REPO, 'data', 'freshness_manifest.json'), 'utf8'));
const FIELDS = ['path', 'producer', 'outputs_also', 'workflows', 'stamp', 'expected_season', 'season_by_design', 'max_age_hours', 'change_driven', 'in_season_only', 'coverage', 'coverage_read', 'coverage_grace_hours', 'derived_from', 'lineage_grace_hours', 'ui_consumers', 'label_route', 'consumers', 'tier', 'on_stale', 'static', 'verified_on', 'label', 'note'];
const rows = m.rows;
assert(m.schema === 1, 'schema 1');
assert(m.season_file === 'data/season.json', 'season_file names data/season.json');
assert(/^\d{4}-\d{2}-\d{2}$/.test(m.gate_blocking_from), `gate_blocking_from is a date (${m.gate_blocking_from})`);
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
assert(undeclared.length === 0, `a year in a path other than ${SEASON} carries a season_by_design reason (${yearRows.length} rows)${undeclared.length ? `; not ${undeclared.join(', ')}` : ''}`);
assert(rows.every(r => r.season_by_design == null || (typeof r.season_by_design === 'string' && r.season_by_design.trim())), 'every season_by_design is null or a reason');
assert(rows.every(r => [null, 'season', 'base_season'].includes(r.expected_season)), 'expected_season is season, base_season or null');
assert(rows.every(r => ['chain_input', 'public', 'beta', 'internal', 'unread'].includes(r.tier)), 'every tier is in the plan\'s list');
assert(rows.every(r => ['block_chain', 'block_deploy', 'red'].includes(r.on_stale)), 'every on_stale is in the plan\'s list');
assert(rows.every(r => [null, 'graded_week', 'report_week', 'season_present', 'games_finished'].includes(r.coverage)), 'every coverage is in the plan\'s list');
assert(rows.every(r => (r.coverage == null) === (r.coverage_read == null) && (r.coverage == null) === (r.coverage_grace_hours == null)), 'coverage, coverage_read and coverage_grace_hours come together');
const cov = (k) => rows.filter(r => r.coverage === k).map(r => path.basename(r.path)).sort().join(',');
assert(cov('graded_week') === 'calibration_2026.json,defense2026.js,games2026.json,weekly_actuals_2026.json', `graded_week rows are actuals, calibration, games and defense (${cov('graded_week')})`);
assert(cov('report_week') === 'injuries_2026_current.json', 'report_week is injuries_2026_current.json');
assert(cov('season_present') === 'referee_appearances.json,referee_appearances_compact.json,referee_tendencies.json', 'season_present rows are the three referee files');
assert(cov('games_finished') === 'pbp_sync_metadata.json', 'games_finished is pbp_sync_metadata.json');
const games = rows.find(r => r.path === 'src/data/games2026.json');
assert(games?.coverage_read?.scored_field === 'played' && games?.coverage_read?.scored_count, 'games2026.json reads a scored count per week');
assert(rows.filter(r => r.tier === 'chain_input').every(r => r.coverage_grace_hours === 6 && r.on_stale === 'block_chain'), 'chain inputs use a 6-hour coverage grace and block_chain');
assert(rows.every(r => r.max_age_hours == null || (Number.isInteger(r.max_age_hours) && r.max_age_hours > 0)), 'every max_age_hours is null or a positive integer');
assert(rows.filter(r => r.change_driven).every(r => r.max_age_hours == null), 'change_driven rows carry no age clock');
assert(rows.filter(r => r.derived_from.length && r.lineage_grace_hours != null).every(r => r.lineage_grace_hours >= 8), 'every lineage grace is at least 8 hours');
const unread = rows.filter(r => r.tier === 'unread').map(r => path.basename(r.path));
assert(['contracts.json', 'referee_tendencies.json', 'history_2023_2024.json', 'REFRESH_LOG.md'].every(f => unread.includes(f)), 'contracts, referee_tendencies, history_2023_2024 and REFRESH_LOG are unread');
assert(rows.find(r => r.path === 'src/data/REFRESH_LOG.md')?.superseded_by === 'data/freshness_manifest.json', 'REFRESH_LOG.md is superseded_by the manifest');
assert(rows.filter(r => r.glob).length === 1 && rows.find(r => r.glob).write_once === true && rows.find(r => r.glob).path.endsWith('weekly_projections/2026-w*.json'), 'one write-once glob row covers weekly_projections');
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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
