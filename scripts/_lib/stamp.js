/**
 * stamp.js: the contract stamp every served file carries in its own meta
 * (DATA_FRESHNESS_PLAN step 4(a), 2026-11-07).
 *
 *   const meta = { ...contractMeta({ sourceSeason: 2026, sources: [URL] }), ... };
 *
 * returns { generated_at, source_season, sources }. The freshness gate
 * reads these three through each file's row in data/freshness_manifest.json:
 * generated_at for age, source_season for the season test and sources for
 * lineage. A git commit date never stands in for the stamp, because the
 * chain, the deploy and the drafter all check out at depth 1.
 *
 * Producers that already wrote another stamp key (meta.generated,
 * meta.generated_utc) keep it beside this one, because builders and
 * verifiers read those keys today; the manifest row names whichever key the
 * committed file carries.
 *
 * Node built-ins only. Bad input throws, so a producer never writes a file
 * the gate cannot date.
 */

function isYear(v) {
  return Number.isInteger(v) && v >= 1999 && v <= 2100;
}

export function contractMeta({ sourceSeason, sources, now = new Date() } = {}) {
  if (!isYear(sourceSeason)) throw new Error(`contractMeta: sourceSeason must be an integer year, got ${JSON.stringify(sourceSeason)}`);
  if (!Array.isArray(sources) || sources.length === 0) throw new Error('contractMeta: sources must be a non-empty array');
  for (const s of sources) {
    if (typeof s !== 'string' || !s.trim()) throw new Error(`contractMeta: every source must be a non-empty string, got ${JSON.stringify(s)}`);
  }
  const t = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(t.getTime())) throw new Error(`contractMeta: bad time ${JSON.stringify(now)}`);
  return { generated_at: t.toISOString(), source_season: sourceSeason, sources: [...sources] };
}
