/**
 * season.js: the one season setting (DATA_FRESHNESS_PLAN step 4(b), 2026-11-07).
 *
 * data/season.json holds the in-season year (`season`), the last complete
 * season the projections are built on (`base_season`) and why. Every
 * season-following producer takes its default from here instead of a
 * literal or a date rule, so moving the setting to 2027 moves them all.
 * An explicit SEASON (env or argument) still wins, for backfills.
 *
 * Node built-ins only: the freshness gate and the cloud drafter read this
 * in a bare `git clone --depth 1` with no `npm install`.
 *
 * Library:  import { SEASON, BASE_SEASON, seasonWindow, seasonFrom } from './_lib/season.js'
 * Shell:    node scripts/_lib/season.js season          prints 2026
 *           node scripts/_lib/season.js base_season     prints 2025
 *           node scripts/_lib/season.js window 3        prints 2024,2025,2026
 *
 * A malformed setting throws (and the CLI exits 1), so no producer runs on
 * a guessed season.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SEASON_FILE = path.resolve(__dirname, '..', '..', 'data', 'season.json');

function isYear(v) {
  return Number.isInteger(v) && v >= 1999 && v <= 2100;
}

/** Read and validate a season setting. Throws on anything malformed. */
export function readSeasonSetting(file = SEASON_FILE) {
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`season setting ${file} is unreadable: ${err.message}`);
  }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new Error(`season setting ${file} is not an object`);
  const { season, base_season: baseSeason, base_season_reason: reason } = doc;
  if (!isYear(season)) throw new Error(`season setting ${file}: season must be an integer year, got ${JSON.stringify(season)}`);
  if (!isYear(baseSeason)) throw new Error(`season setting ${file}: base_season must be an integer year, got ${JSON.stringify(baseSeason)}`);
  if (baseSeason > season) throw new Error(`season setting ${file}: base_season ${baseSeason} is after season ${season}`);
  if (typeof reason !== 'string' || !reason.trim()) throw new Error(`season setting ${file}: base_season_reason must be a non-empty string`);
  return { season, base_season: baseSeason, base_season_reason: reason };
}

const SETTING = readSeasonSetting();
export const SEASON = SETTING.season;
export const BASE_SEASON = SETTING.base_season;
export const BASE_SEASON_REASON = SETTING.base_season_reason;

/** The last `n` seasons ending at `season`, oldest first: seasonWindow(3) is [2024, 2025, 2026]. */
export function seasonWindow(n, season = SEASON) {
  if (!Number.isInteger(n) || n < 1) throw new Error(`seasonWindow: n must be a positive integer, got ${n}`);
  return Array.from({ length: n }, (_, i) => season - n + 1 + i);
}

/**
 * A producer's season: the explicit value when one is given (an env var or
 * argument, for backfills), else `fallback` (SEASON unless the caller names
 * BASE_SEASON). Empty strings count as not given, so a workflow input left
 * blank falls through to the setting.
 */
export function seasonFrom(explicit, fallback = SEASON) {
  if (explicit == null || String(explicit).trim() === '') return fallback;
  const n = Number(String(explicit).trim());
  if (!isYear(n)) throw new Error(`bad season: ${JSON.stringify(explicit)}`);
  return n;
}

function cli(argv) {
  const [key, arg] = argv;
  if (key === 'season') return String(SEASON);
  if (key === 'base_season') return String(BASE_SEASON);
  if (key === 'window') return seasonWindow(Number(arg)).join(',');
  throw new Error(`usage: node scripts/_lib/season.js season | base_season | window <n>`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    console.log(cli(process.argv.slice(2)));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
