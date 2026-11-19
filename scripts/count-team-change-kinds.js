#!/usr/bin/env node
/**
 * count-team-change-kinds.js — team news plan step 4 (2026-11-19).
 *
 * Plan: 01_Schuhbox/DFOS/TEAM_NEWS_OWN_FEED_PLAN_2026-11-17.md, part 6 step 4
 * and part 4, on Mason's "Yeah, build our own team news" (relayed by CoS).
 *
 * Reads our own publication's feed, thetendencyreport.substack.com/feed, and
 * nothing else on the network. Applies the plan's part 4 rules to every issue
 * and writes data/team_changes_weights.json: the counts per kind, the rules,
 * the issues counted and "counted through week N". build-team-changes.js
 * reads the counts to order the card's kinds, so the card is ranked by what
 * our issues judged worth a reader's time.
 *
 * The record only grows: an issue seen once is kept even after it drops off
 * the feed. A failed read (any error, a non-200, no items) writes nothing, so
 * the last weights stay and the board run goes on; the freshness gate's
 * coverage row on the file carries the red when the count falls behind.
 *
 * Usage:
 *   node scripts/count-team-change-kinds.js [--out FILE] [--now ISO]
 *   TEAM_CHANGES_FEED_FILE=path  read a saved feed instead (tests only)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SEASON } from './_lib/season.js';
import { regWeeks, lastKickoffUtcMs } from './_lib/kickoff.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(__dirname);
export const FEED_URL = 'https://thetendencyreport.substack.com/feed';
const OUT_REL = 'data/team_changes_weights.json';
const SCHEDULE_REL = `src/data/schedule${SEASON}.js`;
const USER_AGENT = 'DownfieldOS team-changes weights (our own feed)';

// The sentence rules are plan part 4's, printed exactly (corrected 2026-11-18
// 09:25); the rank rule is not in the plan (see RULES.rank). The feed is HTML,
// so a heading becomes a "#" line, a rule "---" and each paragraph, list item
// or quote its own line before these rules run.
export const RULES = {
  lines: 'each block (paragraph, heading, list item, quote) of the issue\'s HTML is one line, stripped of spaces at both ends; headings get a leading "#" and a rule is "---", as in the issue files',
  skip: 'a line that is empty or starts with any of: http  [  !  |  #  *The Tendency Report  The Tendency Report  ---, plus Substack\'s subscribe box, "Thanks for reading The Tendency Report" and "Subscribe for free to receive new posts" (not in the issue files)',
  split: 're.split(r"(?<=[.!?])\\s+", line)',
  keep: 'a piece of 6 or more words by whitespace split',
  match: 'case-insensitive search; a sentence counts once per kind and can count under two kinds',
  week: 'an issue counts for the latest regular-season week whose last game kicked off before the issue was published, in the season it was published; counted_through_week reads only this season\'s issues, while the kind counts keep every season (the record keeps growing)',
  merge: 'one record per issue: a feed item with the same publish time as a counted issue replaces it under its new key, so a changed address is not counted twice; a re-read with under half the sentences of the counted copy keeps the counted copy, and a read whose overlap with the record carries under half its sentences is refused (nothing written)',
  rank: 'not in the plan: the engineer\'s reading (2026-11-19), for CoS to rule. Card kinds (out_or_back, role, roster_move) are ranked by sentence count, highest first; a kind shares the rank of the kind just above it when its count is at least 80 percent of that kind\'s count. Never betting or next year\'s draft',
};
export const KINDS = {
  out_or_back: /\b(injur\w*|inactive|ruled out|out for|out with|sidelined|IR|injured reserve|concussion|returned from|back from|activated|questionable|doubtful)\b/i,
  role: /\b(snaps?|snap share|targets?|carries|touches|starters?|first start|benched|workload)\b/i,
  roster_move: /\b(signed|signs|traded|trade|released|waived|claimed|acquired|elevated|practice squad)\b/i,
  play_caller: /\b(coordinator|play-?callers?|play-?calling|head coach|calls? (the )?plays)\b/i,
  betting: /\b(odds|spread|betting|sportsbook|moneyline|over\/under|parlay)\b/i,
  next_draft: /\b(mock draft|draft prospects?|draft class)\b/i,
};
// IR stays case-sensitive in spirit: the plan's rule runs with re.I, so "ir"
// inside a word is excluded by the word boundaries already.
const CARD_KINDS = ['out_or_back', 'role', 'roster_move'];
const SKIP_PREFIX = ['http', '[', '!', '|', '#', '*The Tendency Report', 'The Tendency Report', '---', 'Thanks for reading The Tendency Report', 'Subscribe for free to receive new posts'];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', hellip: '…' };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}
const cdata = (s) => (s || '').replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '');
const tag = (xml, name) => { const m = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`).exec(xml); return m ? cdata(m[1]) : null; };

/** The feed's items: title, link, guid, pubDate, html. */
export function parseFeed(xml) {
  if (!/<rss\b|<channel\b/.test(xml)) throw new Error('not an RSS feed');
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)].map((m) => {
    const it = m[1];
    return { title: decode(tag(it, 'title') || '').trim(), link: (tag(it, 'link') || '').trim(), guid: (tag(it, 'guid') || '').trim(), pub_date: (tag(it, 'pubDate') || '').trim(), html: tag(it, 'content:encoded') || '' };
  });
}

/** HTML to the issue-file lines the plan's rules were written for. */
export function htmlLines(html) {
  const s = html
    .replace(/<(script|style|form)\b[\s\S]*?<\/\1>/gi, '\n')
    .replace(/<hr\b[^>]*>/gi, '\n---\n')
    .replace(/<h[1-6]\b[^>]*>/gi, '\n# ')
    .replace(/<\/(p|h[1-6]|li|blockquote|div|ul|ol)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(p|li|blockquote|div|ul|ol)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return decode(s).split('\n').map((l) => l.replace(/\s+/g, ' ').trim());
}

export function countIssue(html) {
  const counts = Object.fromEntries(Object.keys(KINDS).map((k) => [k, 0]));
  let kept = 0;
  for (const line of htmlLines(html)) {
    if (!line || SKIP_PREFIX.some((p) => line.startsWith(p))) continue;
    for (const piece of line.split(/(?<=[.!?])\s+/)) {
      if (piece.split(/\s+/).filter(Boolean).length < 6) continue;
      kept++;
      for (const [k, re] of Object.entries(KINDS)) if (re.test(piece)) counts[k]++;
    }
  }
  return { kept, counts };
}

/** The latest REG week whose last kickoff is before ms. */
export function issueWeek(schedule, ms) {
  let w = null;
  for (const wk of regWeeks(schedule)) { const k = lastKickoffUtcMs(schedule, wk); if (k != null && k < ms) w = wk; }
  return w;
}

export function rankKinds(kinds) {
  const order = CARD_KINDS.map((k) => [k, kinds[k]?.sentences ?? 0]).sort((a, b) => b[1] - a[1] || CARD_KINDS.indexOf(a[0]) - CARD_KINDS.indexOf(b[0]));
  const rank = {};
  let r = 0; let prev = null;
  for (const [k, n] of order) {
    if (prev == null || n < 0.8 * prev) r++;
    rank[k] = r;
    prev = n;
  }
  return rank;
}

/** Pure: the feed's items, the last file and the schedule in, the new file out. Throws on a read it refuses. */
export function buildWeights({ items, prior, schedule, now, read }) {
  const priorSeason = prior?.meta?.season ?? SEASON;
  const byKey = new Map();
  for (const is of prior?.issues || []) byKey.set(is.key, { season: priorSeason, ...is });
  const fresh = [];
  for (const it of items) {
    const ms = Date.parse(it.pub_date);
    if (Number.isNaN(ms)) continue;
    const key = it.guid || it.link || `${it.title}|${it.pub_date}`;
    const published = new Date(ms).toISOString();
    const { kept, counts } = countIssue(it.html);
    fresh.push({ key, title: it.title, published, season: SEASON, week: issueWeek(schedule, ms), sentences_kept: kept, counts });
  }
  if (!fresh.length) throw new Error('no feed item has a usable publish date');
  // The same issue under a new address: match by publish time first.
  const keyFor = (f) => (byKey.has(f.key) ? f.key : [...byKey.values()].find((p) => p.published === f.published)?.key ?? null);
  let overlapPrior = 0; let overlapNew = 0;
  for (const f of fresh) { const k = keyFor(f); if (k) { overlapPrior += byKey.get(k).sentences_kept; overlapNew += f.sentences_kept; } }
  if (overlapPrior && overlapNew < 0.5 * overlapPrior) throw new Error(`the counted issues re-read at ${overlapNew} sentences against ${overlapPrior} counted, under half: an excerpt feed or a broken read`);
  const shrunk = [];
  for (const f of fresh) {
    const k = keyFor(f);
    const old = k ? byKey.get(k) : null;
    if (old && f.sentences_kept < 0.5 * old.sentences_kept) { shrunk.push(f.title); continue; }
    if (k && k !== f.key) byKey.delete(k);
    byKey.set(f.key, f);
  }
  const issues = [...byKey.values()].sort((a, b) => a.published.localeCompare(b.published));
  const kinds = Object.fromEntries(Object.keys(KINDS).map((k) => [k, {
    sentences: issues.reduce((s, is) => s + (is.counts[k] || 0), 0),
    issues: issues.filter((is) => (is.counts[k] || 0) > 0).length,
  }]));
  const weeks = issues.filter((is) => is.season === SEASON).map((is) => is.week).filter(Number.isInteger);
  return {
    meta: {
      season: SEASON,
      source_season: SEASON,
      generated_at: now,
      generated_by: 'scripts/count-team-change-kinds.js',
      source: FEED_URL,
      read,
      issues_counted: issues.length,
      sentences_kept: issues.reduce((s, is) => s + is.sentences_kept, 0),
      counted_through_week: weeks.length ? Math.max(...weeks) : null,
      counted_through_week_basis: `issues published in season ${SEASON} only`,
      kept_counted_copy: shrunk,
      rules: RULES,
      patterns: Object.fromEntries(Object.entries(KINDS).map(([k, re]) => [k, re.source])),
    },
    kinds,
    card_kind_rank: rankKinds(kinds),
    issues,
  };
}

async function readFeed() {
  if (process.env.TEAM_CHANGES_FEED_FILE) {
    return { status: 'file', text: fs.readFileSync(process.env.TEAM_CHANGES_FEED_FILE, 'utf8') };
  }
  // Tests only: a local server on 127.0.0.1, never any other host.
  const testUrl = process.env.TEAM_CHANGES_FEED_URL_TEST;
  if (testUrl && !/^http:\/\/127\.0\.0\.1:\d+\/feed$/.test(testUrl)) throw new Error('TEAM_CHANGES_FEED_URL_TEST must be a 127.0.0.1 address ending in /feed');
  const url = testUrl || FEED_URL;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30000);
  try {
    // redirect manual: no second request is ever sent, to our host or any other.
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/xml;q=0.9' }, signal: ctl.signal, redirect: 'manual' });
    if (res.status >= 300 && res.status < 400) throw new Error(`HTTP ${res.status}, a redirect to ${res.headers.get('location') || 'nowhere'}, not followed`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (res.url && res.url !== url) throw new Error(`answered from ${res.url}, not ${url}`);
    return { status: res.status, text: await res.text() };
  } finally { clearTimeout(timer); }
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const now = opt('--now') || new Date().toISOString();
  const outFile = path.resolve(REPO, opt('--out') || OUT_REL);
  let prior = null;
  if (fs.existsSync(outFile)) prior = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  let feed; let items; let out;
  try {
    feed = await readFeed();
    items = parseFeed(feed.text);
    if (!items.length) throw new Error('the feed has no items');
    console.log(`team_changes_weights: feed read, status ${feed.status}, ${items.length} items`);
    for (const it of items) console.log(`  ${it.pub_date} | ${it.title}`);
    const mod = await import(pathToFileURL(path.join(REPO, SCHEDULE_REL)).href);
    const schedule = mod[`SCHEDULE_${SEASON}`];
    if (!schedule?.byWeek) throw new Error(`${SCHEDULE_REL} has no SCHEDULE_${SEASON}.byWeek`);
    out = buildWeights({ items, prior, schedule, now, read: { status: feed.status, items: items.length, at: now } });
  } catch (e) {
    console.log(`team_changes_weights: feed read failed or refused (${e.message}); the last weights stay${prior ? ` (counted through week ${prior.meta?.counted_through_week}, generated ${prior.meta?.generated_at})` : ' (no weights file yet)'}`);
    return;
  }
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  const k = out.kinds;
  console.log(`team_changes_weights: ${out.meta.issues_counted} issues, ${out.meta.sentences_kept} sentences, counted through week ${out.meta.counted_through_week}; out or back ${k.out_or_back.sentences}, role ${k.role.sentences}, roster moves ${k.roster_move.sentences}; card ranks ${JSON.stringify(out.card_kind_rank)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(`count-team-change-kinds: ${e.message}`); process.exit(1); });
}
