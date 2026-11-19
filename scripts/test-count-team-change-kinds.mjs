#!/usr/bin/env node
/**
 * test-count-team-change-kinds.mjs — team news plan step 4 (2026-11-19).
 *
 * Checks scripts/count-team-change-kinds.js on a made-up feed
 * (scripts/__fixtures__/team-changes/feed-sample.xml) and the real schedule,
 * then reads the committed data/team_changes_weights.json. No network: the
 * script reads a saved file through TEAM_CHANGES_FEED_FILE.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FEED_URL, parseFeed, htmlLines, countIssue, issueWeek, rankKinds, buildWeights } from './count-team-change-kinds.js';
import { kindRankFrom } from './build-team-changes.js';
import { SEASON } from './_lib/season.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(__dirname);
const FIX = path.join(__dirname, '__fixtures__/team-changes/feed-sample.xml');
let pass = 0; let fail = 0;
function check(ok, msg) { if (ok) { pass++; console.log(`  ✅ ${msg}`); } else { fail++; console.log(`  ❌ ${msg}`); } }

// ── 1. it reads our own feed and nothing else ───────────────────────────
console.log('network scope');
const SRC = fs.readFileSync(path.join(__dirname, 'count-team-change-kinds.js'), 'utf8');
export function hostFindings(src) {
  const urls = [...src.matchAll(/https?:\/\/[^\s'"`)]+/g)].map((m) => m[0]);
  return urls.filter((u) => u !== 'https://thetendencyreport.substack.com/feed');
}
check(FEED_URL === 'https://thetendencyreport.substack.com/feed', 'the one feed it reads is our own, /feed');
check(hostFindings(SRC).length === 0, `no other web address in the script (${hostFindings(SRC).join(', ') || 'none'})`);
check(hostFindings(SRC + "\nconst x = 'https://thetendencyreport.substack.com/archive';").length === 1, 'induced: a planted second path, even on our own host, is caught (only /feed is allowed)');
check((SRC.match(/\bfetch\s*\(/g) || []).length === 1 && /fetch\(url,/.test(SRC) && /const url = testUrl \|\| FEED_URL;/.test(SRC), 'fetch is called once, with FEED_URL (or a 127.0.0.1 test address)');
check(/redirect: 'manual'/.test(SRC) && !/redirect: 'follow'/.test(SRC), 'redirects are never followed');
check(/127\\.0\\.0\\.1/.test(SRC), 'the test address hook accepts only 127.0.0.1');

// ── 2. the plan's rules on the made-up feed ──────────────────────────────
console.log('rules');
const items = parseFeed(fs.readFileSync(FIX, 'utf8'));
check(items.length === 2 && items[0].title === 'Issue One & Two' && items[0].guid === 'one', 'two items parsed, CDATA and entities decoded');
const lines = htmlLines(items[0].html);
check(lines.includes('---') && lines.some((l) => l.startsWith('# ')), 'a rule becomes "---" and a heading a "#" line');
const c1 = countIssue(items[0].html);
check(c1.kept === 4, `four sentences kept: the heading, the masthead, the http line and the short piece are skipped (kept ${c1.kept})`);
check(c1.counts.out_or_back === 2, 'out or back: "ruled out" and "injured reserve" (2)');
check(c1.counts.role === 2 && c1.counts.roster_move === 1, 'one sentence with "signed" and "targets" counts under both role and roster move; "starter" in the reserve sentence is role too, as the plan\'s rule reads (role 2)');
check(c1.counts.betting === 1 && c1.counts.next_draft === 0, 'betting counted (1), next year\'s draft none');
check(countIssue(items[1].html).counts.play_caller === 1, 'play caller: "coordinator"');

// ── 3. weeks from the real schedule ──────────────────────────────────────
console.log('weeks');
const sched = (await import(pathToFileURL(path.join(REPO, `src/data/schedule${SEASON}.js`)).href))[`SCHEDULE_${SEASON}`];
check(issueWeek(sched, Date.parse('2026-09-15T12:00:00Z')) === 1, 'the 9-15 issue counts for week 1');
check(issueWeek(sched, Date.parse('2026-11-11T06:05:21Z')) === 9, 'the 11-11 issue counts for week 9 (week 10 had not kicked off its last game)');
check(issueWeek(sched, Date.parse('2026-11-17T20:23:17Z')) === 10, 'the 11-17 issue counts for week 10');

// ── 4. ranks ─────────────────────────────────────────────────────────────
console.log('ranks');
const rk = (a, b, c) => rankKinds({ out_or_back: { sentences: a }, role: { sentences: b }, roster_move: { sentences: c } });
check(JSON.stringify(rk(47, 30, 20)) === JSON.stringify({ out_or_back: 1, role: 2, roster_move: 3 }), '47, 30, 20: three ranks (20 is under 80 percent of 30)');
check(JSON.stringify(rk(48, 29, 29)) === JSON.stringify({ out_or_back: 1, role: 2, roster_move: 2 }), '48, 29, 29: role and roster moves level, as the plan read');
check(JSON.stringify(rk(30, 25, 5)) === JSON.stringify({ out_or_back: 1, role: 1, roster_move: 2 }), '30, 25, 5: 25 is within 80 percent, so it shares the top rank');
check(JSON.stringify(rk(100, 85, 70)) === JSON.stringify({ out_or_back: 1, role: 1, roster_move: 1 }), 'chained: 70 is within 80 percent of 85, the kind just above, so all three share (as RULES.rank prints)');
check(JSON.stringify(kindRankFrom({ card_kind_rank: { out_or_back: 1, role: 2, roster_move: 3 } })) === JSON.stringify({ out_or_back: 1, role: 2, roster_move: 3 }), 'the card build takes the weights file\'s ranks');
check(JSON.stringify(kindRankFrom(null)) === JSON.stringify({ out_or_back: 1, role: 2, roster_move: 2 }) && JSON.stringify(kindRankFrom({ card_kind_rank: { out_or_back: 'x' } })) === JSON.stringify({ out_or_back: 1, role: 2, roster_move: 2 }), 'with no file, or a broken one, the card build uses the plan\'s order');

// ── 5. the record keeps growing ──────────────────────────────────────────
console.log('record');
const w1 = buildWeights({ items, prior: null, schedule: sched, now: '2026-11-19T00:00:00Z', read: { status: 'file' } });
check(w1.meta.issues_counted === 2 && w1.meta.counted_through_week === 10, 'two issues counted, through week 10');
const w2 = buildWeights({ items: [items[1]], prior: w1, schedule: sched, now: '2026-11-20T00:00:00Z', read: { status: 'file' } });
check(w2.meta.issues_counted === 2 && w2.issues.some((is) => is.key === 'one'), 'an issue that dropped off the feed is kept');
check(w2.kinds.out_or_back.sentences === w1.kinds.out_or_back.sentences, 'and its counts stay in the totals');

// ── 5b. the review's cases (2026-11-19) ──────────────────────────────────
console.log('review cases');
{
  const boiler = countIssue('<p>Thanks for reading The Tendency Report! Subscribe for free to receive new posts and support my work.</p><p>The left tackle was ruled out with a knee injury before kickoff.</p>');
  check(boiler.kept === 1, 'Substack\'s subscribe box is not counted');
  const renamed = [{ ...items[0], guid: 'one-renamed', link: 'one-renamed' }, items[1]];
  const w3 = buildWeights({ items: renamed, prior: w1, schedule: sched, now: '2026-11-20T00:00:00Z', read: { status: 'file' } });
  check(w3.meta.issues_counted === 2 && w3.issues.some((is) => is.key === 'one-renamed') && !w3.issues.some((is) => is.key === 'one'), 'an issue whose address changes is replaced, not counted twice');
  const big = { title: 'Big Issue', link: 'big', guid: 'big', pub_date: 'Tue, 22 Sep 2026 12:00:00 GMT', html: Array.from({ length: 12 }, (_, n) => `<p>Sentence number ${n} has more than six words in it.</p>`).join('') };
  const wBig = buildWeights({ items: [...items, big], prior: null, schedule: sched, now: '2026-11-19T00:00:00Z', read: { status: 'file' } });
  const short = [{ ...items[0], html: '<p>The left tackle was ruled out with a knee injury.</p>' }, items[1], big];
  const w4 = buildWeights({ items: short, prior: wBig, schedule: sched, now: '2026-11-20T00:00:00Z', read: { status: 'file' } });
  check(w4.issues.find((is) => is.key === 'one').sentences_kept === 4 && w4.meta.kept_counted_copy.includes('Issue One & Two'), 'a re-read with under half the sentences keeps the counted copy');
  let refused = false;
  try { buildWeights({ items: items.map((it) => ({ ...it, html: '<p>Too short.</p>' })), prior: w1, schedule: sched, now: '2026-11-20T00:00:00Z', read: { status: 'file' } }); } catch { refused = true; }
  check(refused, 'a read whose counted issues come back with under half their sentences is refused');
  let noDate = false;
  try { buildWeights({ items: items.map((it) => ({ ...it, pub_date: '' })), prior: null, schedule: sched, now: '2026-11-20T00:00:00Z', read: { status: 'file' } }); } catch { noDate = true; }
  check(noDate, 'a feed with no usable publish date is refused');
  const lastSeason = { meta: { season: SEASON - 1 }, issues: [{ key: 'old', title: 'Old', published: '2025-12-30T12:00:00.000Z', week: 17, sentences_kept: 50, counts: { out_or_back: 5, role: 0, roster_move: 0, play_caller: 0, betting: 0, next_draft: 0 } }] };
  const w5 = buildWeights({ items: [items[0]], prior: lastSeason, schedule: sched, now: '2026-11-20T00:00:00Z', read: { status: 'file' } });
  check(w5.meta.counted_through_week === 1 && w5.issues.find((is) => is.key === 'old').season === SEASON - 1 && w5.kinds.out_or_back.sentences === 7, 'last season\'s week 17 does not count toward this season\'s counted_through_week, but its counts stay in the record');
}

// ── 6. a failed read keeps the last file and exits 0 ─────────────────────
console.log('failure');
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'weights-'));
  const out = path.join(tmp, 'w.json');
  const run = (env) => spawnSync(process.execPath, [path.join(__dirname, 'count-team-change-kinds.js'), '--out', out, '--now', '2026-11-19T12:00:00Z'], { cwd: REPO, encoding: 'utf8', env: { ...process.env, ...env } });
  const ok = run({ TEAM_CHANGES_FEED_FILE: FIX });
  check(ok.status === 0 && JSON.parse(fs.readFileSync(out, 'utf8')).meta.issues_counted === 2, 'a good read writes the file');
  const before = fs.readFileSync(out, 'utf8');
  const missing = run({ TEAM_CHANGES_FEED_FILE: path.join(tmp, 'no-such-feed.xml') });
  check(missing.status === 0 && fs.readFileSync(out, 'utf8') === before && /feed read failed/.test(missing.stdout), 'induced: an unreadable feed exits 0, says so and leaves the last file byte-identical');
  fs.writeFileSync(path.join(tmp, 'empty.xml'), '<rss><channel></channel></rss>');
  const empty = run({ TEAM_CHANGES_FEED_FILE: path.join(tmp, 'empty.xml') });
  check(empty.status === 0 && fs.readFileSync(out, 'utf8') === before, 'induced: a feed with no items exits 0 and leaves the last file');
  fs.writeFileSync(path.join(tmp, 'html.xml'), '<html><body>blocked</body></html>');
  const html = run({ TEAM_CHANGES_FEED_FILE: path.join(tmp, 'html.xml') });
  check(html.status === 0 && fs.readFileSync(out, 'utf8') === before, 'induced: an HTML page instead of a feed exits 0 and leaves the last file');
}

// ── 7. the committed file ────────────────────────────────────────────────
console.log('committed file');
{
  const d = JSON.parse(fs.readFileSync(path.join(REPO, 'data/team_changes_weights.json'), 'utf8'));
  check(d.meta.source === FEED_URL && Number.isInteger(d.meta.counted_through_week) && d.meta.issues_counted >= 10, `our own feed, ${d.meta.issues_counted} issues, counted through week ${d.meta.counted_through_week}`);
  check(d.issues.every((is) => !('text' in is) && !('html' in is) && Object.keys(is).every((k) => ['key', 'title', 'published', 'season', 'week', 'sentences_kept', 'counts'].includes(k))), 'no issue text is stored, only titles, dates, weeks and counts');
  check(d.meta.rules && d.meta.patterns && Object.keys(d.meta.patterns).length === 6, 'the rules and the six patterns are printed in the file');
  const card = JSON.parse(fs.readFileSync(path.join(REPO, `src/data/intelligence/team_changes_${SEASON}.json`), 'utf8'));
  check(JSON.stringify(card.meta.kind_rank) === JSON.stringify(d.card_kind_rank), 'the committed card was ranked with the committed weights');
}

// ── 8. a redirect is never followed (two local servers) ───────────────────
console.log('redirect');
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'weights-redirect-'));
  const out = path.join(tmp, 'w.json');
  fs.writeFileSync(out, '{"meta":{"note":"last good file"}}\n');
  const before = fs.readFileSync(out, 'utf8');
  let secondHit = 0;
  const second = http.createServer((q, r) => { secondHit++; r.end(fs.readFileSync(FIX)); });
  await new Promise((res) => second.listen(0, '127.0.0.1', res));
  const first = http.createServer((q, r) => { r.writeHead(302, { Location: `http://127.0.0.1:${second.address().port}/feed` }); r.end(); });
  await new Promise((res) => first.listen(0, '127.0.0.1', res));
  const runAsync = (env) => new Promise((res) => {
    const c = spawn(process.execPath, [path.join(__dirname, 'count-team-change-kinds.js'), '--out', out, '--now', '2026-11-19T12:00:00Z'], { cwd: REPO, env: { ...process.env, ...env } });
    let so = ''; c.stdout.on('data', (d) => { so += d; }); c.on('close', (code) => res({ code, so }));
  });
  const r1 = await runAsync({ TEAM_CHANGES_FEED_URL_TEST: `http://127.0.0.1:${first.address().port}/feed` });
  check(r1.code === 0 && secondHit === 0 && fs.readFileSync(out, 'utf8') === before && /302/.test(r1.so), 'induced: a 302 is not followed (the second server is never contacted), the run exits 0 and the last file stays');
  const r2 = await runAsync({ TEAM_CHANGES_FEED_URL_TEST: `http://127.0.0.1:${second.address().port}/feed` });
  check(r2.code === 0 && JSON.parse(fs.readFileSync(out, 'utf8')).meta.issues_counted === 2 && /status 200, 2 items/.test(r2.so), 'a 200 from the test server writes the file and logs the status and item count');
  const r3 = await runAsync({ TEAM_CHANGES_FEED_URL_TEST: 'http://10.0.0.1:80/feed' });
  check(r3.code === 0 && /must be a 127\.0\.0\.1 address/.test(r3.so), 'the test hook refuses any address but 127.0.0.1');
  first.close(); second.close();
}

console.log(`\ntest-count-team-change-kinds: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
