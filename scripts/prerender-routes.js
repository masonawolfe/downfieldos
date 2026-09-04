#!/usr/bin/env node
/**
 * prerender-routes.js — Q-001 (2026-09-05).
 *
 * The problem QA caught: every route on downfieldos.com returned a
 * byte-identical body (the homepage `index.html`). Meaning `og:url`,
 * `og:title`, `og:description`, `twitter:*` and `<title>` all read the
 * homepage on every deep link. Twitter and LinkedIn crawlers do not
 * execute JS — they see the static HTML, so every shared link unfurled
 * as the homepage. TWITTER_LAUNCH_PLAYBOOK.md is the week-1 acquisition
 * channel for the Beehiiv KPI. This is not deferred SEO; it is live
 * acquisition damage.
 *
 * Fix: after `vite build`, generate `dist/<route>/index.html` for each
 * known route, with the same JS bundle reference as `dist/index.html`
 * but with route-specific meta. GitHub Pages serves `/route/index.html`
 * when the browser requests `/route`, so a request for
 * `/matchup-preview` returns HTTP 200 with the correct meta.
 *
 * The React app boots as normal. React Router sees the URL, matches
 * the route, renders the same page it would have rendered from the
 * SPA fallback — no behavior change for users, but crawlers now see
 * the right meta and users get 200 status.
 *
 * If a Cloudflare Transform Rule ever gets added to normalize status
 * codes across the board, this script is still the right layer for
 * the meta content — a Transform Rule can't rewrite the body.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST = path.join(__dirname, '..', 'dist');
const BASE = 'https://downfieldos.com';

// Routes to prerender. Keep in sync with the sitemap and React Router routes
// in DownfieldOS.jsx. Each route needs a distinct title/description because
// that is what Twitter/LinkedIn unfurl.
const ROUTES = [
  { path: '/matchup-preview', title: 'Matchup Preview — DownfieldOS', description: 'Weekly NFL matchup grades and player-level scouting for every game. DownfieldOS pairs projected performance with matchup intelligence — defense, coaching, environment.' },
  { path: '/this-week',       title: 'This Week — DownfieldOS',       description: 'Every NFL game this week, with grades, mismatch flags, and the Game of the Week called from the data.' },
  { path: '/team-intel',      title: 'Team Intel — DownfieldOS',      description: '32 team dashboards — scheme profile, DNA, roster context, fan sentiment. The team lens beyond box scores.' },
  { path: '/fantasy-intel',   title: 'Fantasy Intel — DownfieldOS',   description: 'Fantasy-relevant matchup grades, boom/bust flags, and opportunity signals — sortable by slot and by team.' },
  { path: '/war-room',        title: 'War Room — DownfieldOS',        description: 'Draft-board view — team needs, positional depth, and prospect fit scoring.' },
  { path: '/so-what',         title: 'So What? — DownfieldOS',        description: 'League-wide storylines, misery index, weekly drama rankings — the entertainment layer.' },
  { path: '/dashboard',       title: 'Home Dashboard — DownfieldOS',  description: 'Your team\'s next matchup, intelligence signals, and headlines around the league.' },
  // Added 2026-09-05 (QA 2026-09-04c P2): route was in sitemap and router but
  // missed from prerender + smoke test, so /2026-preview kept returning 404
  // with homepage og:url while the other 7 routes returned 200 with correct meta.
  { path: '/2026-preview',    title: '2026 Season Preview — DownfieldOS', description: 'Preseason narrative, DNA, sentiment and matchup preview for every team heading into 2026.' },
];

function main() {
  const indexPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('Fatal: dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }
  const template = fs.readFileSync(indexPath, 'utf8');
  console.log('DFOS — prerender per-route HTML for social unfurl');
  console.log('=================================================');

  let written = 0;
  for (const r of ROUTES) {
    const canonical = BASE + r.path;
    const html = template
      // <title>DownfieldOS — Football Intelligence Operating System</title>
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(r.title)}</title>`)
      // <meta name="description" ...>
      .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeAttr(r.description)}"`)
      // <meta property="og:title" ...>
      .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeAttr(r.title)}"`)
      // <meta property="og:description" ...>
      .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapeAttr(r.description)}"`)
      // <meta property="og:url" ...>
      .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${canonical}"`)
      // <meta name="twitter:title" ...>
      .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escapeAttr(r.title)}"`)
      // <meta name="twitter:description" ...>
      .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${escapeAttr(r.description)}"`)
      // <link rel="canonical" href="...">
      .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonical}"`);

    const outDir = path.join(DIST, r.path.replace(/^\//, ''));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log(`  ${r.path.padEnd(24)} → ${path.relative(DIST, path.join(outDir, 'index.html'))}`);
    written++;
  }

  // Report byte-differences vs the source index.html so a regression that
  // silently disabled the substitutions is visible in the build log.
  console.log(`\n  wrote ${written} route stubs`);
  const homepageSize = fs.statSync(indexPath).size;
  const sample = fs.readFileSync(path.join(DIST, 'matchup-preview', 'index.html'), 'utf8');
  const matchesHomepage = sample === template;
  console.log(`  homepage bytes: ${homepageSize} | /matchup-preview stub matches homepage: ${matchesHomepage} (should be false)`);
  if (matchesHomepage) {
    console.error('  ⚠ regression: substitutions produced identical output. Meta tag patterns may have drifted.');
    process.exit(2);
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

main();
