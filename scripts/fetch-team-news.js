#!/usr/bin/env node
/**
 * fetch-team-news.js
 *
 * Pulls recent per-team news metadata from ESPN's public JSON API.
 *
 * Field reduction 2026-09-05 per counsel (2026-09-05 review):
 *   Kept:    link, published, categories, type
 *   Dropped: headline, description
 *
 * Reason: ESPN's terms (Disney §2.B.x, §2.B.viii, §3.G) bar automated
 * access AND commercial use with no paid-tier carve-out. Storing ESPN's
 * verbatim `headline` + `description` in a public repo is copying and
 * storing expression, which is distinct from linking to the underlying
 * article. Reducing the fields to metadata + link keeps the pipeline
 * running without republishing ESPN's written prose. A link is not the
 * expression.
 *
 * Output: src/data/intelligence/team_news_raw.json
 *
 * Usage:
 *   node scripts/fetch-team-news.js
 *   LIMIT_PER_TEAM=10 node scripts/fetch-team-news.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../src/data/intelligence/team_news_raw.json');
const LIMIT = parseInt(process.env.LIMIT_PER_TEAM || '8', 10);

// ESPN team IDs — canonical mapping (fetched once from ESPN's teams API).
const ESPN_TEAM_IDS = {
  ARI: 22, ATL: 1, BAL: 33, BUF: 2, CAR: 29, CHI: 3, CIN: 4, CLE: 5,
  DAL: 6, DEN: 7, DET: 8, GB: 9, HOU: 34, IND: 11, JAX: 30, KC: 12,
  LAC: 24, LAR: 14, LV: 13, MIA: 15, MIN: 16, NE: 17, NO: 18, NYG: 19,
  NYJ: 20, PHI: 21, PIT: 23, SEA: 26, SF: 25, TB: 27, TEN: 10, WAS: 28,
};

async function fetchTeamNews(abbr, teamId) {
  const url = `https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=${LIMIT}&team=${teamId}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'DownfieldOS/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${abbr}`);
  const data = await res.json();
  const articles = data.articles || [];

  return articles
    // Filter dead-on-arrival types at build time. `Media` = ESPN video
    // clips (espn.com/video/clip/...) which the public site now returns
    // 404 for — 100% of sampled Media links dead 2026-09-15 (QA lane-1;
    // Story / HeadlineNews / Recap sampled 100% live). Dropping the type
    // at build removes the dead-link category entirely without needing a
    // per-link HEAD-check on every build.
    .filter(a => (a.type || '').toLowerCase() !== 'media')
    .map(a => ({
      // Counsel 2026-09-05: `headline` and `description` intentionally
      // dropped to stop republishing ESPN's expression. Retained metadata:
      type: a.type || null,                              // Story / HeadlineNews / Recap
      published: a.published || null,
      last_modified: a.lastModified || null,
      link: a.links?.web?.href || a.links?.mobile?.href || null,
      // Categories: bucket labels only (Player / Team / Injury / etc.).
      // Dropped `c.description` inside each — same reason as above.
      categories: (a.categories || []).map(c => ({
        type: c.type,
        teamId: c.teamId,
        team: c.team?.abbreviation,
        athleteId: c.athleteId,
        athlete: c.athlete?.displayName,
      })),
    }));
}

async function main() {
  console.log('DownfieldOS — Team News (ESPN)');
  console.log('==============================\n');

  const teams = Object.entries(ESPN_TEAM_IDS);
  const results = {};
  let totalItems = 0;
  let failed = 0;

  // Concurrency=6 keeps us under ESPN's implicit rate limits without slowing
  // down the run over 32 teams.
  const inflight = new Set();
  const queue = [...teams];
  async function drain() {
    while (queue.length || inflight.size) {
      while (inflight.size < 6 && queue.length) {
        const [abbr, id] = queue.shift();
        const p = fetchTeamNews(abbr, id)
          .then(items => { results[abbr] = items; totalItems += items.length; })
          .catch(err => { failed++; console.log(`  ⚠ ${abbr} (${id}): ${err.message}`); results[abbr] = []; })
          .finally(() => { inflight.delete(p); });
        inflight.add(p);
      }
      if (inflight.size) await Promise.race(inflight);
    }
  }
  await drain();

  const payload = {
    meta: {
      source: 'ESPN — site.web.api.espn.com (public NFL news feed)',
      generated: new Date().toISOString(),
      teams_covered: Object.keys(results).filter(k => results[k].length > 0).length,
      teams_failed: failed,
      total_headlines: totalItems,
      per_team_cap: LIMIT,
      notes: 'Raw headlines only — headline, description, timestamp, ESPN link. No editorial interpretation. Replace nothing in the existing curated team_news.json; the editorial layer is the responsibility of the Layer 2 reasoning workflow.',
    },
    teams: results,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload));

  console.log(`  ${totalItems} headlines across ${Object.keys(results).length} teams (${failed} failed)`);
  console.log(`\nWrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
