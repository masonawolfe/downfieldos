#!/usr/bin/env node
/**
 * test-load-export.mjs (2026-11-13)
 *
 * Fixture test for scripts/_lib/load-export.js, the loader the board build
 * uses for playerStats2025.js and schedule2026.js. The case it guards: a
 * META block with an array in it, written after the data. On 2026-11-11 that
 * shape broke the old first-`[`-to-last-`]` slice and the board stopped
 * building for four runs. The test also runs the old slice on the same
 * fixture, so it shows the shape really does break it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadExport } from './_lib/load-export.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(__dirname, '__fixtures__', 'load-export');
const stats = path.join(FIX, 'stats-meta-with-array.js');
const schedule = path.join(FIX, 'schedule-meta-after.js');

let passed = 0, failed = 0;
const check = (name, ok) => { if (ok) passed++; else { failed++; console.log(`  FAIL ${name}`); } };
const throws = async fn => { try { await fn(); return false; } catch { return true; } };

// 1. The array export parses whole, META array and all.
const rows = await loadExport(stats, 'PLAYER_STATS_2025', 'array');
check('stats: array export loads', Array.isArray(rows));
check('stats: both rows, in order', rows.length === 2 && rows[0].gsis_id === '00-0000001' && rows[1].gsis_id === '00-0000002');
const meta = await loadExport(stats, 'PLAYER_STATS_2025_META', 'object');
check('stats: META keeps its sources array', Array.isArray(meta.sources) && meta.sources.length === 1);

// 2. The object export parses with a second export after it.
const sched = await loadExport(schedule, 'SCHEDULE_2026', 'object');
check('schedule: object export loads', sched.KC && sched.KC.bye === 10 && sched.KC.games.length === 1);

// 3. Wrong name or wrong kind throws, so a rename cannot yield an empty board.
check('missing export throws', await throws(() => loadExport(stats, 'PLAYER_STATS_2024', 'array')));
check('array asked, object found, throws', await throws(() => loadExport(stats, 'PLAYER_STATS_2025_META', 'array')));
check('object asked, array found, throws', await throws(() => loadExport(stats, 'PLAYER_STATS_2025', 'object')));

// 4. The old slice fails on these fixtures: they reproduce the 11-12 defect.
const oldArray = src => JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
const oldObject = src => JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
check('old array slice fails on the stats fixture', await throws(() => oldArray(fs.readFileSync(stats, 'utf8'))));
check('old object slice fails on the schedule fixture', await throws(() => oldObject(fs.readFileSync(schedule, 'utf8'))));

console.log(`test-load-export: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
