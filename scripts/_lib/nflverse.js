// Shared helpers for nflverse-CSV-fed scrapers. Small on purpose — CSV parse,
// team normalization, and a lenient number coerce. Everything else stays in the
// individual scrapers so each is readable end-to-end.

import { createGunzip } from 'zlib';
import { Readable } from 'stream';

export const TEAM_MAP = { OAK: 'LV', STL: 'LAR', SD: 'LAC', WSH: 'WAS', LA: 'LAR' };

export const ALL_TEAMS = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB',
  'HOU','IND','JAX','KC','LAC','LAR','LV','MIA','MIN','NE','NO','NYG',
  'NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS',
];

export function normTeam(t) {
  const u = (t || '').trim().toUpperCase();
  return TEAM_MAP[u] || u;
}

export function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parseCSV(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const vals = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = (vals[idx] ?? '').trim(); });
    rows.push(row);
  }
  return rows;
}

export function num(s) {
  if (s == null || s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function int(s) {
  if (s == null || s === '') return null;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

export async function fetchCSV(url, label) {
  console.log(`  Fetching ${label}: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${label}`);
  const text = await res.text();
  console.log(`  ${(text.length / 1024 / 1024).toFixed(1)}MB downloaded`);
  return parseCSV(text);
}

export async function fetchGzippedCSV(url, label) {
  console.log(`  Fetching gzipped ${label}: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${label}`);
  const compressed = Buffer.from(await res.arrayBuffer());
  console.log(`  ${(compressed.length / 1024 / 1024).toFixed(1)}MB compressed`);
  const chunks = [];
  await new Promise((resolve, reject) => {
    Readable.from(compressed)
      .pipe(createGunzip())
      .on('data', c => chunks.push(c))
      .on('end', resolve)
      .on('error', reject);
  });
  const text = Buffer.concat(chunks).toString('utf8');
  console.log(`  ${(text.length / 1024 / 1024).toFixed(1)}MB decompressed`);
  return parseCSV(text);
}
