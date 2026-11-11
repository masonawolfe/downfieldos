#!/usr/bin/env node
/**
 * test-freshness.mjs: runs the freshness gate's induced cases
 * (scripts/__fixtures__/freshness/induced-cases.mjs, DATA_FRESHNESS_PLAN v4.3
 * step 5). Run: npm run test:freshness
 *
 * For each case, in a throwaway copy of this tree (a git repo of its own, in
 * the system temp directory; nothing in the real tree is touched):
 *   1. the case's gate command on the unmutated copy must exit 0, so the red
 *      that follows is the case's own and not a real red already in the tree;
 *   2. after the case's one mutation, the same command must exit 1 (or the
 *      case's expectExit) and print the file and the rule;
 *   3. the copy is reset to its base commit (a case's prepare may add commits,
 *      for the replay cases).
 *
 * Every command and both exit codes are printed, so the log is the proof.
 *
 * Not part of `npm test`: the baselines read the committed data files, and
 * `npm test` runs in the deploy, where a data job's commit must never turn a
 * test red (the rule scripts/test-contract.js keeps). A baseline that is red
 * because the tree holds a real red is reported as such, never passed.
 *
 *   node scripts/test-freshness.mjs            all cases
 *   node scripts/test-freshness.mjs 3 12       the named cases
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CASES } from './__fixtures__/freshness/induced-cases.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(__dirname);
const only = process.argv.slice(2).map(Number).filter(Number.isInteger);

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts });
  if (r.error) throw r.error;
  return r;
}
function must(cmd, args, opts) {
  const r = sh(cmd, args, opts);
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited ${r.status}: ${(r.stderr || r.stdout).trim().split('\n').slice(-3).join(' | ')}`);
  return r.stdout;
}
const GIT = ['-c', 'user.name=freshness-fixture', '-c', 'user.email=fixture@localhost', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null'];

// ── The copy ─────────────────────────────────────────────────────────────
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'freshness-fixture-'));
const WORK = path.join(TMP, 'tree');
fs.mkdirSync(WORK);
const files = must('git', ['ls-files', '-z', '-co', '--exclude-standard'], { cwd: REPO }).split('\0').filter(Boolean);
for (const f of files) {
  const src = path.join(REPO, f);
  if (!fs.existsSync(src) || fs.statSync(src).isDirectory()) continue;
  fs.mkdirSync(path.dirname(path.join(WORK, f)), { recursive: true });
  fs.copyFileSync(src, path.join(WORK, f));
}
// The staging mode's YAML parser; ignored by the copy's .gitignore, so a reset never removes it.
if (fs.existsSync(path.join(REPO, 'node_modules'))) fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(WORK, 'node_modules'));
must('git', ['init', '-q', '-b', 'fixture'], { cwd: WORK });
must('git', [...GIT, 'add', '-A'], { cwd: WORK });
must('git', [...GIT, 'commit', '-q', '-m', 'fixture base'], { cwd: WORK });
const BASE = must('git', ['rev-parse', 'HEAD'], { cwd: WORK }).trim();
const BASE_TIME = Date.parse(must('git', ['log', '-1', '--format=%cI', BASE], { cwd: WORK }).trim());
const reset = () => {
  must('git', ['reset', '-q', '--hard', BASE], { cwd: WORK });
  must('git', ['clean', '-fdq'], { cwd: WORK });
  fs.rmSync(path.join(WORK, 'dist'), { recursive: true, force: true });
};

// ── Context ──────────────────────────────────────────────────────────────
const rel = (p) => path.join(WORK, p);
const readJson = (p) => JSON.parse(fs.readFileSync(rel(p), 'utf8'));
const setting = readJson('data/season.json');
const manifest = readJson('data/freshness_manifest.json');
const season = setting.season;
const base = setting.base_season;

// T: one hour after the newest chain-input stamp, so every case judges one fixed instant.
function pointer(doc, ptr) { return ptr.split('/').slice(1).reduce((o, k) => (o == null ? undefined : o[k]), doc); }
let newest = 0;
for (const r of manifest.rows.filter(x => x.tier === 'chain_input')) {
  const s = r.stamp;
  const doc = s.kind === 'json' ? readJson(r.path) : (await import(pathToFileURL(rel(r.path)).href))[s.export];
  const t = Date.parse(pointer(doc, s.generated_at));
  if (!Number.isNaN(t)) newest = Math.max(newest, t);
}
const T = new Date(newest + 3.6e6).toISOString();
const probe = JSON.parse(must(process.execPath, ['scripts/check-freshness.mjs', '--mode', 'coverage', '--tier', 'chain_input', '--as-of', T, '--json'], { cwd: WORK }));
const L = probe.latest_finished_week.grace_6h;
const ctx = {
  season, base, T, L, baseTime: BASE_TIME, manifest,
  buildTimePaths: manifest.rows.filter(r => r.stamp?.kind === 'build_time').map(r => r.path),
  read: (p) => fs.readFileSync(rel(p), 'utf8'),
  readJson,
  exists: (p) => fs.existsSync(rel(p)),
  write: (p, text) => { fs.mkdirSync(path.dirname(rel(p)), { recursive: true }); fs.writeFileSync(rel(p), text); },
  rm: (p) => fs.rmSync(rel(p)),
  mv: (from, to) => fs.renameSync(rel(from), rel(to)),
  list: (dir) => fs.readdirSync(rel(dir)).sort(),
  // One commit of the whole copy, author and committer dated at ms (the replay reads %cI).
  commitAt: (ms, msg) => {
    const date = new Date(ms).toISOString();
    must('git', [...GIT, 'add', '-A'], { cwd: WORK });
    must('git', [...GIT, 'commit', '-q', '-m', msg], { cwd: WORK, env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } });
  },
  // Back to the single fixture commit: the one-commit history the replay must refuse.
  dropHistory: () => must('git', ['reset', '-q', '--hard', BASE], { cwd: WORK }),
  editText: (p, fn) => {
    const before = fs.readFileSync(rel(p), 'utf8');
    const after = fn(before);
    if (after === before) throw new Error(`mutation left ${p} unchanged`);
    fs.writeFileSync(rel(p), after);
  },
  editJson: (p, fn) => { const d = readJson(p); fn(d); fs.writeFileSync(rel(p), JSON.stringify(d, null, 2) + '\n'); },
};
console.log(`freshness induced cases in ${WORK}`);
console.log(`season ${season}, base_season ${base}; T = ${T} (an hour after the newest chain-input stamp); latest finished week at T: ${L}\n`);

// ── Run ──────────────────────────────────────────────────────────────────
function gate(cwd, args, env = {}) {
  const e = { ...process.env, ...env };
  delete e.GITHUB_STEP_SUMMARY;
  if (!('GITHUB_EVENT_NAME' in env)) delete e.GITHUB_EVENT_NAME;
  const r = sh(process.execPath, ['scripts/check-freshness.mjs', ...args], { cwd, env: e });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}
const show = (args, env) => `${env && Object.keys(env).length ? Object.entries(env).map(([k, v]) => `${k}=${v} `).join('') : ''}node scripts/check-freshness.mjs ${args.join(' ')}`;

let pass = 0;
let fail = 0;
for (const c of CASES.filter(x => !only.length || only.includes(x.id))) {
  const args = c.args(ctx);
  const exp = c.expect(ctx);
  const wantExit = c.expectExit ?? 1;
  const tag = `${exp.status || 'RED'} ${exp.mode}/${exp.rule}`;
  const problems = [];
  const lines = [`case ${c.id}: ${c.name}`];
  try {
    if (c.prepare) c.prepare(ctx);
    const b = gate(WORK, args, c.greenEnv || {});
    lines.push(`  baseline  ${show(args, c.greenEnv)}  -> exit ${b.code}`);
    if (b.code !== 0) problems.push(`baseline exit ${b.code}, not 0 (a real red in the tree, so this case proves nothing): ${b.out.split('\n').filter(l => /^RED   |^FAIL/.test(l)).slice(0, 4).join(' | ')}`);
    let cwd = WORK;
    if (c.shallow) {
      const clone = path.join(TMP, `shallow-${c.id}`);
      must('git', ['clone', '-q', '--depth', '1', `file://${WORK}`, clone]);
      lines.push(`  clone     git clone --depth 1 file://${WORK} ${clone}  (is-shallow: ${must('git', ['rev-parse', '--is-shallow-repository'], { cwd: clone }).trim()})`);
      cwd = clone;
    } else c.mutate(ctx);
    const r = gate(cwd, args, c.env || {});
    lines.push(`  induced   ${show(args, c.env)}  -> exit ${r.code}`);
    const want = `${(exp.status || 'RED').padEnd(6)} ${exp.mode}/${exp.rule}  ${exp.file}`;
    const hit = r.out.split('\n').find(l => l.startsWith(want));
    if (hit) lines.push(`            ${hit.slice(0, 240)}`);
    if (r.code !== wantExit) problems.push(`induced exit ${r.code}, not ${wantExit}`);
    if (!hit) problems.push(`no line "${want}"`);
    if (c.onlyRule) {
      const others = r.out.split('\n').filter(l => /^RED   /.test(l) && l.includes(`  ${exp.file}  `) && !l.startsWith(want));
      if (others.length) problems.push(`other reds on ${exp.file}: ${others.join(' | ')}`);
      else lines.push(`            and no other red names ${exp.file} (age, season and weeks stayed green)`);
    }
    if (c.alsoGreen) {
      const g = gate(cwd, c.alsoGreen(ctx));
      lines.push(`  same tree ${show(c.alsoGreen(ctx))}  -> exit ${g.code}`);
      if (g.code !== 0) problems.push(`the same mutation should leave ${c.alsoGreen(ctx).join(' ')} green, exit ${g.code}`);
    }
    if (c.greenEnv) {
      const g = gate(cwd, args, c.greenEnv);
      lines.push(`  same tree ${show(args, c.greenEnv)}  -> exit ${g.code}`);
      if (g.code !== 0) problems.push(`with ${JSON.stringify(c.greenEnv)} the red should annotate, exit ${g.code}`);
    }
  } catch (e) {
    problems.push(`error: ${e.message}`);
  }
  reset();
  if (problems.length) { fail++; lines.push(`  FAIL ${tag}: ${problems.join('; ')}`); }
  else { pass++; lines.push(`  PASS ${tag} names ${exp.file}`); }
  console.log(lines.join('\n') + '\n');
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
