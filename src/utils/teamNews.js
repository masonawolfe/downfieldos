// Helpers over team_news_raw.json (ESPN feed). This is the RAW wire — headline,
// timestamp, link. The editorial team_news.json remains a separate curated feed.

import raw from '../data/intelligence/team_news_raw.json';

function flatten() {
  const out = [];
  for (const [team, items] of Object.entries(raw.teams || {})) {
    for (const it of items) out.push({ team, ...it });
  }
  return out.sort((a, b) => (b.published || '').localeCompare(a.published || ''));
}

let cached = null;
function all() {
  if (!cached) cached = flatten();
  return cached;
}

// Global latest N headlines across every team, most recent first.
export function latestLeagueHeadlines(limit = 6) {
  return all().slice(0, limit);
}

// Latest N headlines for one team code.
export function latestTeamHeadlines(team, limit = 5) {
  return all().filter(h => h.team === team).slice(0, limit);
}

// Metadata about the raw feed (publish timestamps, source, cap).
export function teamNewsMeta() {
  return raw.meta || null;
}
