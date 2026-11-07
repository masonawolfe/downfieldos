/**
 * induced-cases.mjs: the freshness gate's induced failures (DATA_FRESHNESS_PLAN
 * v4.3 step 5, "Twelve induced cases"), run by scripts/test-freshness.mjs.
 *
 * Each case runs one gate command twice in a throwaway copy of the tree: once
 * as the tree stands (the baseline must exit 0, so the red is the case's own),
 * then after one mutation (it must exit 1 and name the file and the rule). The
 * copy is reset between cases. Cases 1 to 12 are the plan's list, in its order;
 * 13 to 17 prove the step 17 config tie, --block-on-event, --report, the
 * draft-window freeze and the nflverse scoring recompute the gate now calls.
 *
 * No season year is written here: every year comes from data/season.json
 * through ctx, so the cases survive the rollover. The one year in this file is
 * the name of step 2's committed fixture, defense2025.js (last season's table).
 *
 * ctx: { season, base, T (an ISO time just after the chain inputs' newest
 * stamp), L (the latest finished week at T), editJson, editText, write, rm,
 * read, exists, buildTimePaths }
 */

const iso = (ms) => new Date(ms).toISOString();
const HOUR = 3.6e6;

export const CASES = [
  {
    id: 1, name: 'an unregistered file',
    args: () => ['--mode', 'registration'],
    mutate: (c) => c.write('src/data/intelligence/fixture_unregistered_feed.json', '{"meta":{}}\n'),
    expect: () => ({ mode: 'registration', rule: 'unregistered', file: 'src/data/intelligence/fixture_unregistered_feed.json' }),
  },
  {
    id: 2, name: 'a stamp 30 days old',
    args: (c) => ['--mode', 'age', '--tier', 'chain_input', '--as-of', c.T],
    mutate: (c) => c.editJson(`src/data/intelligence/weekly_actuals_${c.season}.json`, d => { d.meta.generated_at = iso(Date.parse(c.T) - 30 * 24 * HOUR); }),
    expect: (c) => ({ mode: 'age', rule: 'max_age_hours', file: `src/data/intelligence/weekly_actuals_${c.season}.json` }),
  },
  {
    id: 3, name: `a fresh stamp on the games file with a played week unscored (age green, coverage red)`,
    args: (c) => ['--mode', 'coverage', '--tier', 'chain_input', '--as-of', c.T],
    // The same mutation must leave the age mode green: that is the point of coverage.
    alsoGreen: (c) => ['--mode', 'age', '--tier', 'chain_input', '--as-of', c.T],
    mutate: (c) => c.editJson(`src/data/games${c.season}.json`, d => {
      d.generated_at = iso(Date.parse(c.T) - HOUR);
      const g = d.games.find(x => x.week === c.L);
      g.played = false; g.home_score = null; g.away_score = null;
    }),
    expect: (c) => ({ mode: 'coverage', rule: 'graded_week', file: `src/data/games${c.season}.json` }),
  },
  {
    id: 4, name: 'a derived_from source newer than the served copy past its grace',
    args: (c) => ['--mode', 'lineage', '--tier', 'chain_input', '--as-of', c.T],
    mutate: (c) => {
      const actuals = c.readJson(`src/data/intelligence/weekly_actuals_${c.season}.json`).meta.generated_at;
      c.editJson(`src/data/intelligence/calibration_${c.season}.json`, d => { d.meta.generated_at = iso(Date.parse(actuals) - 40 * HOUR); });
    },
    expect: (c) => ({ mode: 'lineage', rule: 'derived_from', file: `src/data/intelligence/calibration_${c.season}.json` }),
  },
  {
    id: 5, name: 'a consumer that does not render AsOf',
    args: () => ['--mode', 'label'],
    mutate: (c) => c.editText('src/components/ui/TeamNewsCard.jsx', t => t.split('\n').filter(l => !/<AsOf\b/.test(l)).join('\n')),
    expect: () => ({ mode: 'label', rule: 'AsOf', file: 'src/data/intelligence/team_news.json' }),
  },
  {
    id: 6, name: 'an import of last season\'s current injuries file',
    args: () => ['--mode', 'imports'],
    mutate: (c) => c.editText('src/utils/injuries.js', t => t.replace(`injuries_${c.season}_current.json`, `injuries_${c.base}_current.json`)),
    expect: (c) => ({ mode: 'imports', rule: 'year', file: `src/data/intelligence/injuries_${c.base}_current.json` }),
  },
  {
    id: 7, name: 'an unstaged outputs_also',
    args: () => ['--mode', 'staging'],
    mutate: (c) => c.editText('.github/workflows/data-referees-v2.yml', t => t.replace(' src/data/intelligence/referee_appearances_compact.json', '')),
    expect: () => ({ mode: 'staging', rule: 'git-add', file: 'src/data/intelligence/referee_appearances_compact.json' }),
  },
  {
    id: 8, name: 'an import of an unread file',
    args: () => ['--mode', 'unread'],
    mutate: (c) => c.editText('src/utils/injuries.js', t => `import TRADES_FIXTURE from '../data/intelligence/trades.json';\n${t}`),
    expect: () => ({ mode: 'unread', rule: 'imported', file: 'src/data/intelligence/trades.json' }),
  },
  {
    id: 9, name: 'a wrong source_season',
    args: () => ['--mode', 'season', '--tier', 'chain_input'],
    mutate: (c) => c.editJson(`src/data/intelligence/weekly_actuals_${c.season}.json`, d => { d.meta.source_season = c.season - 1; }),
    expect: (c) => ({ mode: 'season', rule: 'source_season', file: `src/data/intelligence/weekly_actuals_${c.season}.json` }),
  },
  {
    id: 10, name: 'a git-history check run in a --depth 1 clone',
    // The baseline runs the replay in the full copy; the induced run is the same command in a depth-1 clone of it.
    args: () => ['--mode', 'age', '--replay', '--tier', 'chain_input'],
    shallow: true,
    expect: (c) => ({ mode: 'age', rule: 'replay', file: `src/data/intelligence/weekly_actuals_${c.season}.json` }),
  },
  {
    id: 11, name: 'a build_time file missing from dist',
    args: () => ['--mode', 'built'],
    prepare: (c) => { for (const p of c.buildTimePaths) c.write(`dist/${p.replace(/^public\//, '')}`, '{"fixture":true}\n'); },
    mutate: (c) => c.rm(`dist/${c.buildTimePaths[1].replace(/^public\//, '')}`),
    expect: (c) => ({ mode: 'built', rule: 'dist', file: c.buildTimePaths[1] }),
  },
  {
    id: 12, name: 'the defense file replaced by last season\'s table (age, stamp and season faked green, recomputation red)',
    args: (c) => ['--mode', 'age,season,coverage', '--tier', 'chain_input', '--as-of', c.T],
    mutate: (c) => {
      const weeks = Array.from({ length: c.L }, (_, i) => i + 1);
      const old = c.read('scripts/__fixtures__/freshness/defense2025.js');
      if (!/export const DEFENSE_\d{4}_META = \{/.test(old)) throw new Error('the defense fixture has no DEFENSE_<year>_META export');
      const faked = old.replace(/export const (DEFENSE_\d{4})_META = \{/, 'const __LAST_SEASON_META = {').replace(/export const DEFENSE_\d{4} = /, `export const DEFENSE_${c.season} = `)
        + `\nexport const DEFENSE_${c.season}_META = { ...__LAST_SEASON_META, generated: ${JSON.stringify(iso(Date.parse(c.T) - HOUR))}, source_season: ${c.season}, weeks_covered: ${JSON.stringify(weeks)}, through_week: ${c.L} };\n`;
      c.write(`src/data/defense${c.season}.js`, faked);
    },
    expect: (c) => ({ mode: 'coverage', rule: 'recompute', file: `src/data/defense${c.season}.js` }),
    // Only the recomputation may be red on this file: its age, season and weeks were faked green.
    onlyRule: true,
  },
  {
    id: 13, name: 'src/config.js against a moved base_season (step 17)',
    args: () => ['--mode', 'season'],
    mutate: (c) => c.editJson('data/season.json', d => { d.base_season = c.base - 1; }),
    expect: () => ({ mode: 'season', rule: 'config', file: 'src/config.js' }),
  },
  {
    id: 14, name: '--block-on-event push: an unregistered file fails a push and annotates a dispatch',
    args: () => ['--mode', 'registration', '--block-on-event', 'push'],
    env: { GITHUB_EVENT_NAME: 'push' },
    greenEnv: { GITHUB_EVENT_NAME: 'workflow_dispatch' },
    mutate: (c) => c.write('src/data/intelligence/fixture_unregistered_feed.json', '{"meta":{}}\n'),
    expect: () => ({ mode: 'registration', rule: 'unregistered', file: 'src/data/intelligence/fixture_unregistered_feed.json' }),
  },
  {
    id: 15, name: '--report: the same red annotates and exits 0',
    args: () => ['--mode', 'registration', '--report'],
    mutate: (c) => c.write('src/data/intelligence/fixture_unregistered_feed.json', '{"meta":{}}\n'),
    expect: () => ({ mode: 'registration', rule: 'unregistered', file: 'src/data/intelligence/fixture_unregistered_feed.json' }),
    expectExit: 0,
  },
  {
    id: 16, name: 'DRAFT_WINDOW.md: a stale board-pipeline file inside an active window reads frozen, not red',
    args: (c) => ['--mode', 'age', '--tier', 'chain_input', '--as-of', c.T],
    mutate: (c) => {
      c.editJson(`src/data/games${c.season}.json`, d => { d.generated_at = iso(Date.parse(c.T) - 30 * 24 * HOUR); });
      c.editText('DRAFT_WINDOW.md', t => `${t}\n\`\`\`yaml\n- id: fixture-window\n  draft_start: ${iso(Date.parse(c.T) + HOUR)}\n  draft_end: ${iso(Date.parse(c.T) + 4 * HOUR)}\n  freeze_start: ${iso(Date.parse(c.T) - HOUR)}\n\`\`\`\n`);
    },
    expect: (c) => ({ mode: 'age', rule: 'max_age_hours', file: `src/data/games${c.season}.json`, status: 'FROZEN' }),
    expectExit: 0,
  },
  {
    id: 17, name: 'an nflverse points column the stored components no longer explain (reconcile-actuals-scoring, on chain_input)',
    args: (c) => ['--mode', 'coverage', '--tier', 'chain_input', '--as-of', c.T],
    mutate: (c) => c.editJson(`src/data/intelligence/weekly_actuals_${c.season}.json`, d => { d.rows[0].fantasy_points_ppr = Number(d.rows[0].fantasy_points_ppr) + 1; }),
    expect: (c) => ({ mode: 'coverage', rule: 'recompute', file: `src/data/intelligence/weekly_actuals_${c.season}.json` }),
  },
];
