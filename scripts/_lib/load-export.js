/**
 * load-export.js: read one named export from a generated data module.
 *
 * Written 2026-11-13 for the board stats loader. build-player-board.js used
 * to parse src/data/playerStats2025.js from the first `[` to the LAST `]` in
 * the file. The 2026-11-11 refresh (10697be) added a `sources` array to
 * PLAYER_STATS_2025_META, below the data, so the last `]` moved into the META
 * block and every board build from 11-12 died in JSON.parse. Importing the
 * module reads the export itself, so whatever a META block holds, or however
 * many exports the file has, the loader gets the one it names.
 *
 * Node built-ins only. Library:
 *   import { loadExport } from './_lib/load-export.js'
 *   const rows = await loadExport(file, 'PLAYER_STATS_2025', 'array')
 *
 * Throws when the export is missing or is not the kind asked for, so a
 * renamed export fails the build instead of yielding an empty board.
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadExport(file, name, kind) {
  const mod = await import(pathToFileURL(path.resolve(file)).href);
  if (!Object.prototype.hasOwnProperty.call(mod, name)) {
    throw new Error(`${file} has no export ${name} (exports: ${Object.keys(mod).join(', ') || 'none'})`);
  }
  const value = mod[name];
  const isArray = Array.isArray(value);
  const ok = kind === 'array' ? isArray
    : kind === 'object' ? (value !== null && typeof value === 'object' && !isArray)
    : true;
  if (!ok) throw new Error(`${file} export ${name} is not an ${kind}`);
  return value;
}
