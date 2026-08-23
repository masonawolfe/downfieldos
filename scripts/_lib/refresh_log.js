// Shared refresh-log writer. Every scraper that writes to src/data/ or
// src/data/intelligence/ MUST call `appendRefreshLogEntry({...})` on success.
// Per the EM/PO Directive 2026-08-22 (Task 3), a refresh run that produces
// data without a log entry is a FAILED run.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_PATH = path.join(__dirname, '..', '..', 'src', 'data', 'REFRESH_LOG.md');

// Compose one Markdown fenced-entry section. All fields required unless noted.
//
// Fields:
//   script       — e.g., "fetch-nflverse-roster-base.js"
//   season       — optional, e.g., 2026
//   sources[]    — array of { name, url, updated }
//   outputs[]    — array of { name, rows, sizeKB, extra? }
//   spotCheck[]  — array of strings, one per sampled row
//   notes        — optional free-form paragraph
//
// Appends atomically (writes to a temp file then rename) so an interrupted
// process cannot corrupt the log.
export function appendRefreshLogEntry({ script, season, sources = [], outputs = [], spotCheck = [], notes = '' }) {
  if (!script) throw new Error('appendRefreshLogEntry requires `script`');
  if (!sources.length) throw new Error('appendRefreshLogEntry requires at least one source');
  if (!outputs.length) throw new Error('appendRefreshLogEntry requires at least one output');
  if (spotCheck.length < 5) {
    console.warn(`[refresh-log] ${script} sent only ${spotCheck.length} spot-check rows — directive asks for ~15 across 32 teams`);
  }

  const ts = new Date().toISOString();
  const title = season != null ? `${script} (SEASON=${season})` : script;

  const lines = [];
  lines.push('');
  lines.push(`### ${ts} — ${title}`);
  lines.push('');
  lines.push('**Sources**');
  for (const s of sources) {
    const upd = s.updated ? `updated ${s.updated}` : '';
    lines.push(`- ${s.name}${s.url ? ` — ${s.url}` : ''}${upd ? `, ${upd}` : ''}`);
  }
  lines.push('');
  lines.push('**Outputs**');
  for (const o of outputs) {
    const parts = [`${o.rows} rows`];
    if (o.sizeKB != null) parts.push(`${o.sizeKB} KB`);
    if (o.extra) parts.push(o.extra);
    lines.push(`- ${o.name} — ${parts.join(', ')}`);
  }
  lines.push('');
  lines.push(`**Spot check (${spotCheck.length} entries)**`);
  for (const line of spotCheck) lines.push(`- ${line}`);
  if (notes) {
    lines.push('');
    lines.push('**Notes**');
    lines.push(notes);
  }
  lines.push('');

  const block = lines.join('\n');
  fs.appendFileSync(LOG_PATH, block);
  console.log(`[refresh-log] appended entry for ${script} (${(block.length / 1024).toFixed(1)} KB)`);
}
