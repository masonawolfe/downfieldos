// Reader over data/corrections.jsonl — the DFOS self-correction ledger.
// See repo/data/corrections.README.md for the schema.
//
// Consumers pattern:
//
//   import { correctionsFor, flagsFor, allActive } from '@/utils/corrections';
//
//   // Before citing something about Seattle:
//   const seaCorrections = correctionsFor('SEA');
//   if (seaCorrections.length) { /* factor in the corrections */ }
//
// The file is imported as raw text at build time (Vite `?raw`), then parsed
// line-by-line. Empty lines are skipped. Any line that fails to parse is
// logged to console but does NOT throw — a corrupted line must not brick the
// consumer.

import raw from '../../data/corrections.jsonl?raw';

// One-time parse at module load. The file is small enough (~9 lines seeded,
// grows slowly) that we don't need lazy parsing.
const RECORDS = parseAll(raw);

function parseAll(text) {
  const out = [];
  const lines = String(text || '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      out.push(JSON.parse(line));
    } catch (err) {
      // Don't throw — a bad line shouldn't take out downstream citing.
      // eslint-disable-next-line no-console
      console.warn(`[corrections] line ${i + 1} failed to parse:`, err.message);
    }
  }
  return out;
}

// Every active (non-superseded, non-resolved) record.
export function allActive() {
  return RECORDS.filter(r => r.status !== 'superseded' && r.status !== 'resolved');
}

// Records tagged with `tag`. Tags are exact-match (case-insensitive). Returns
// only active records unless `includeInactive` is true.
export function correctionsFor(tag, { includeInactive = false } = {}) {
  if (!tag) return [];
  const needle = String(tag).toLowerCase();
  const pool = includeInactive ? RECORDS : allActive();
  return pool.filter(r => (r.tags || []).some(t => String(t).toLowerCase() === needle));
}

// Only the open flags (`type: flag` records still active). Optional `tag`
// filter.
export function flagsFor(tag) {
  const base = allActive().filter(r => r.type === 'flag');
  if (!tag) return base;
  const needle = String(tag).toLowerCase();
  return base.filter(r => (r.tags || []).some(t => String(t).toLowerCase() === needle));
}

// Rejected sources — anything the ledger says do-not-use.
export function rejections() {
  return allActive().filter(r => r.type === 'rejection');
}

// Records that apply to a specific file path or component name.
export function appliesTo(pathOrComponent) {
  if (!pathOrComponent) return [];
  const needle = String(pathOrComponent);
  return allActive().filter(r =>
    (r.applies_to || []).some(a => a === needle || needle.endsWith(a))
  );
}

// Records issued on or after `date` (YYYY-MM-DD). Useful for "what's new
// since I last checked."
export function issuedSince(dateString) {
  if (!dateString) return allActive();
  return allActive().filter(r => (r.issued || '') >= dateString);
}

// Quick predicate — "is there anything I should know about {tag}?"
export function hasCorrection(tag) {
  return correctionsFor(tag).length > 0;
}

// Metadata about the loaded ledger — count, latest issue date, distinct tags.
export function meta() {
  const active = allActive();
  const tags = new Set();
  let latest = null;
  for (const r of RECORDS) {
    for (const t of r.tags || []) tags.add(t);
    if (r.issued && (!latest || r.issued > latest)) latest = r.issued;
  }
  return {
    total: RECORDS.length,
    active: active.length,
    flags: active.filter(r => r.type === 'flag').length,
    rejections: active.filter(r => r.type === 'rejection').length,
    corrections: active.filter(r => r.type === 'correction').length,
    latest_issued: latest,
    distinct_tags: tags.size,
  };
}
