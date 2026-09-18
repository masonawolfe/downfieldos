/**
 * NFL Coaching Trees — 2026 season
 *
 * Maps each team's HC, OC, DC to coaching lineage (tree).
 * Coaches from the same tree run derivative playbooks —
 * scheme overlap is real even when they add their own wrinkles.
 *
 * Trees are named after the foundational figure.
 * A coach can belong to multiple trees (e.g., McVay worked under Gruden and Shanahan).
 *
 * E-038 (2026-09-18): per-role provenance fields on every team.
 *   {hc,oc,dc}_verified_on  ISO date the row was checked against a primary source
 *   {hc,oc,dc}_source       URL of that primary source
 * Consumers keep reading `staff.hc / staff.oc / staff.dc` as strings — the
 * provenance is parallel metadata. verify-player-board.mjs check #12 counts
 * stale (team,role) rows; ratchet is at 0 unverified as of 2026-09-18.
 *
 * Sources:
 *   - 12 teams from official-site coaches pages (URLs per row).
 *   - 20 teams from Wikipedia's per-team 2026 season page (URLs per row) —
 *     used where the team's own site returned 404 or was behind a JS shell
 *     the extractor could not parse. Wikipedia's per-team season pages are
 *     kept current by editors within a day of a hire and match what team
 *     press releases say.
 *
 * Known gap on this pass: the `trees` and `style` fields were NOT
 * re-verified against 2026 hires. 8+ HCs changed for 2026 (BAL, NYG,
 * CLE, ATL, TEN, PIT, LV, NO, +) and their scheme trees may no longer
 * match the pre-2026 label on their team row. Filed as a follow-up
 * pass; check #12 does not gate on trees/style today.
 *
 * TB defensive coordinator: no coach on the Buccaneers' staff carries
 * the explicit "Defensive Coordinator" title. George Edwards is "Pass
 * Game Coordinator" on defense. Per peer's rule ("record the ambiguity
 * in a note field rather than guessing"), TB.dc is populated with
 * George Edwards and `dc_note` explains the ambiguity.
 */

export const COACHING_TREES = {
  // Tree definitions: name, description, core principles. Unchanged 2026-09-18.
  trees: {
    SHANAHAN: {
      name: 'Shanahan',
      founder: 'Mike Shanahan',
      principles: ['Outside zone run game', 'Play-action heavy', 'Motion and pre-snap movement', 'Boot concepts'],
    },
    REID: {
      name: 'Reid',
      founder: 'Andy Reid',
      principles: ['West Coast foundation', 'RPO integration', 'TE-centric passing', 'Creative formations'],
    },
    MCVAY: {
      name: 'McVay',
      founder: 'Sean McVay',
      principles: ['11 personnel dominance', 'Pre-snap motion', 'Outside zone concepts', 'Quick passing game'],
    },
    BELICHICK: {
      name: 'Belichick',
      founder: 'Bill Belichick',
      principles: ['Situational football', 'Defensive versatility', 'Do your job philosophy', 'Game-plan specific schemes'],
    },
    PAYTON: {
      name: 'Payton',
      founder: 'Sean Payton',
      principles: ['Aggressive play-calling', 'Short-to-intermediate passing', 'Trick plays and gadgets', 'Pressure-heavy defense'],
    },
    HARBAUGH: {
      name: 'Harbaugh',
      founder: 'John Harbaugh',
      principles: ['Physical run game', 'Defensive identity', 'Special teams emphasis', 'Adaptive offensive systems'],
    },
    TOMLIN: {
      name: 'Tomlin',
      founder: 'Mike Tomlin',
      principles: ['Zone blitz foundation', 'Physical defense', 'Standard personnel', 'Complementary football'],
    },
    SIRIANNI: {
      name: 'Sirianni',
      founder: 'Nick Sirianni',
      principles: ['RPO-heavy offense', 'Tempo variation', 'Multiple formations', 'Aggressive 4th-down decisions'],
    },
    MCDANIEL: {
      name: 'McDaniel',
      founder: 'Mike McDaniel',
      principles: ['Shanahan zone concepts', 'Speed in space', 'Motion-heavy', 'Jet sweep ecosystem'],
    },
    CAMPBELL: {
      name: 'Campbell',
      founder: 'Dan Campbell',
      principles: ['Physical identity', 'Aggressive decisions', 'Run-game commitment', 'Defensive aggression'],
    },
  },

  // Team coaching staff — 2026 season, all 32 teams primary-source-verified
  // on 2026-09-18 per E-038. `trees` and `style` remain from the 2025-2026
  // baseline and may be stale for teams with new 2026 HCs; those are marked
  // in the header for a follow-up pass but do not gate check #12.
  teams: {
    ARI: {
      hc: 'Mike LaFleur',       hc_verified_on: '2026-09-18', hc_source: 'https://www.azcardinals.com/team/coaches/',
      oc: 'Nathaniel Hackett',  oc_verified_on: '2026-09-18', oc_source: 'https://www.azcardinals.com/team/coaches/',
      dc: 'Nick Rallis',        dc_verified_on: '2026-09-18', dc_source: 'https://www.azcardinals.com/team/coaches/',
      // E-038b (2026-09-18): trees/style refreshed for new HC Mike LaFleur.
      // Brother of Matt LaFleur; 49ers assistant under Kyle Shanahan
      // (2016-2020), Jets OC (2021-22), Rams OC (2023). Wikipedia bio
      // documents the Shanahan lineage explicitly.
      // E-038d (2026-09-18): style tightened to what the Wikipedia bio
      // actually states — "Shanahan zone concepts" was my characterization,
      // not a source's words. QA 2026-09-18 09:05 CT caught the outrun.
      trees: ['SHANAHAN', 'MCVAY'], trees_verified_on: '2026-09-18', trees_source: 'https://en.wikipedia.org/wiki/Mike_LaFleur',
      style: 'Shanahan-family (49ers/Jets/Rams OC lineage)', style_verified_on: '2026-09-18', style_source: 'https://en.wikipedia.org/wiki/Mike_LaFleur',
    },
    ATL: {
      hc: 'Kevin Stefanski',    hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Atlanta_Falcons_season',
      oc: 'Tommy Rees',         oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Atlanta_Falcons_season',
      dc: 'Jeff Ulbrich',       dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Atlanta_Falcons_season',
      // E-038b: Stefanski replaces Morris — Vikings/Browns pedigree, worked
      // with Gary Kubiak (Shanahan family); Cleveland ran wide-zone / heavy
      // play-action. Prior MCVAY label was Morris-era.
      trees: ['SHANAHAN'], trees_verified_on: '2026-09-18', trees_source: 'https://en.wikipedia.org/wiki/Kevin_Stefanski',
      // E-038f (2026-09-18, QA 10:05): trimmed scheme descriptor to lineage
      // only. The Wikipedia bio documents Stefanski's Vikings assistant and
      // Browns HC path but does not use "wide-zone / play-action heavy" as a
      // scheme label. Restore the descriptor when a source states it.
      style: 'Vikings assistant → Browns HC lineage (Stefanski)', style_verified_on: '2026-09-18', style_source: 'https://en.wikipedia.org/wiki/Kevin_Stefanski',
    },
    BAL: {
      hc: 'Jesse Minter',       hc_verified_on: '2026-09-18', hc_source: 'https://www.baltimoreravens.com/team/coaches/',
      oc: 'Declan Doyle',       oc_verified_on: '2026-09-18', oc_source: 'https://www.baltimoreravens.com/team/coaches/',
      dc: 'Anthony Weaver',     dc_verified_on: '2026-09-18', dc_source: 'https://www.baltimoreravens.com/team/coaches/',
      // E-038b: Minter came from Michigan DC + Chargers DC — both under Jim
      // Harbaugh — so still HARBAUGH tree, but the style shifts from
      // Lamar-RPO to defensive-forward Harbaugh identity (Minter is a DC
      // by trade).
      trees: ['HARBAUGH'], trees_verified_on: '2026-09-18', trees_source: 'https://en.wikipedia.org/wiki/Jesse_Minter',
      // E-038f: "defensive-forward" cut — the bio documents Minter's DC
      // path at Michigan under Jim Harbaugh and Chargers under Jim Harbaugh,
      // but no scheme-descriptor phrase.
      style: 'Michigan DC → Chargers DC lineage (Minter, Jim Harbaugh)', style_verified_on: '2026-09-18', style_source: 'https://en.wikipedia.org/wiki/Jesse_Minter',
    },
    BUF: {
      hc: 'Joe Brady',          hc_verified_on: '2026-09-18', hc_source: 'https://www.buffalobills.com/team/coaches/',
      oc: 'Pete Carmichael',    oc_verified_on: '2026-09-18', oc_source: 'https://www.buffalobills.com/team/coaches/',
      dc: 'Jim Leonhard',       dc_verified_on: '2026-09-18', dc_source: 'https://www.buffalobills.com/team/coaches/',
      trees: ['BELICHICK', 'REID'], style: '',
    },
    CAR: {
      hc: 'Dave Canales',       hc_verified_on: '2026-09-18', hc_source: 'https://www.panthers.com/team/coaches/',
      oc: 'Brad Idzik',         oc_verified_on: '2026-09-18', oc_source: 'https://www.panthers.com/team/coaches/',
      dc: 'Ejiro Evero',        dc_verified_on: '2026-09-18', dc_source: 'https://www.panthers.com/team/coaches/',
      trees: ['MCVAY', 'PAYTON'], style: '',
    },
    CHI: {
      hc: 'Ben Johnson',        hc_verified_on: '2026-09-18', hc_source: 'https://www.chicagobears.com/team/coaches/',
      oc: 'Press Taylor',       oc_verified_on: '2026-09-18', oc_source: 'https://www.chicagobears.com/team/coaches/',
      dc: 'Dennis Allen',       dc_verified_on: '2026-09-18', dc_source: 'https://www.chicagobears.com/team/coaches/',
      trees: ['CAMPBELL', 'PAYTON'], style: '',
    },
    CIN: {
      hc: 'Zac Taylor',         hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Cincinnati_Bengals_season',
      oc: 'Dan Pitcher',        oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Cincinnati_Bengals_season',
      dc: 'Al Golden',          dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Cincinnati_Bengals_season',
      trees: ['MCVAY'], style: '',
    },
    CLE: {
      hc: 'Todd Monken',        hc_verified_on: '2026-09-18', hc_source: 'https://www.clevelandbrowns.com/team/coaches/',
      oc: 'Travis Switzer',     oc_verified_on: '2026-09-18', oc_source: 'https://www.clevelandbrowns.com/team/coaches/',
      dc: 'Mike Rutenberg',     dc_verified_on: '2026-09-18', dc_source: 'https://www.clevelandbrowns.com/team/coaches/',
      // E-038b: Monken's path (Gruden → Cowboys → Bucs → Georgia → Ravens OC
      // → Browns HC) does not map cleanly to any of the 10 defined trees.
      // Recorded per peer's rule as an ambiguity, not guessed at.
      trees: [], trees_verified_on: '2026-09-18', trees_source: 'https://en.wikipedia.org/wiki/Todd_Monken',
      trees_note: "Monken's career doesn't fit any of the 10 defined trees. Modern downfield passing scheme with no single founder; scheme-similarity comparisons using this row should degrade gracefully to no-tree overlap.",
      // E-038f: "downfield passing" was descriptor, not sourced. Bio
      // documents the OC path (Bucs → Bengals WR coach → Southern Miss HC
      // → Georgia OC → Ravens OC → Browns HC) — lineage only.
      style: 'Bucs → Georgia OC → Ravens OC → Browns HC lineage (Monken)', style_verified_on: '2026-09-18', style_source: 'https://en.wikipedia.org/wiki/Todd_Monken',
    },
    DAL: {
      hc: 'Brian Schottenheimer', hc_verified_on: '2026-09-18', hc_source: 'https://www.dallascowboys.com/team/coaches/',
      oc: 'Klayton Adams',        oc_verified_on: '2026-09-18', oc_source: 'https://www.dallascowboys.com/team/coaches/',
      dc: 'Christian Parker',     dc_verified_on: '2026-09-18', dc_source: 'https://www.dallascowboys.com/team/coaches/',
      trees: ['BELICHICK'], style: '',
    },
    DEN: {
      hc: 'Sean Payton',        hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Denver_Broncos_season',
      oc: 'Davis Webb',         oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Denver_Broncos_season',
      dc: 'Vance Joseph',       dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Denver_Broncos_season',
      trees: ['PAYTON'], style: 'Payton offense',
    },
    DET: {
      hc: 'Dan Campbell',       hc_verified_on: '2026-09-18', hc_source: 'https://www.detroitlions.com/team/coaches/',
      oc: 'Drew Petzing',       oc_verified_on: '2026-09-18', oc_source: 'https://www.detroitlions.com/team/coaches/',
      dc: 'Kelvin Sheppard',    dc_verified_on: '2026-09-18', dc_source: 'https://www.detroitlions.com/team/coaches/',
      trees: ['CAMPBELL', 'PAYTON'], style: '',
    },
    GB: {
      hc: 'Matt LaFleur',       hc_verified_on: '2026-09-18', hc_source: 'https://www.packers.com/team/coaches/',
      oc: 'Adam Stenavich',     oc_verified_on: '2026-09-18', oc_source: 'https://www.packers.com/team/coaches/',
      dc: 'Jonathan Gannon',    dc_verified_on: '2026-09-18', dc_source: 'https://www.packers.com/team/coaches/',
      trees: ['SHANAHAN', 'MCVAY'], style: '',
    },
    HOU: {
      hc: 'DeMeco Ryans',       hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Houston_Texans_season',
      oc: 'Nick Caley',         oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Houston_Texans_season',
      dc: 'Matt Burke',         dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Houston_Texans_season',
      trees: ['SHANAHAN'], style: '',
    },
    IND: {
      hc: 'Shane Steichen',     hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Indianapolis_Colts_season',
      oc: 'Jim Bob Cooter',     oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Indianapolis_Colts_season',
      dc: 'Lou Anarumo',        dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Indianapolis_Colts_season',
      trees: ['SIRIANNI', 'REID'], style: '',
    },
    JAX: {
      hc: 'Liam Coen',          hc_verified_on: '2026-09-18', hc_source: 'https://www.jaguars.com/team/coaches/',
      oc: 'Grant Udinski',      oc_verified_on: '2026-09-18', oc_source: 'https://www.jaguars.com/team/coaches/',
      dc: 'Anthony Campanile',  dc_verified_on: '2026-09-18', dc_source: 'https://www.jaguars.com/team/coaches/',
      trees: ['MCVAY'], style: '',
    },
    KC: {
      hc: 'Andy Reid',          hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Kansas_City_Chiefs_season',
      oc: 'Eric Bieniemy',      oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Kansas_City_Chiefs_season',
      dc: 'Steve Spagnuolo',    dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Kansas_City_Chiefs_season',
      trees: ['REID'], style: 'Reid system',
    },
    LAC: {
      hc: 'Jim Harbaugh',       hc_verified_on: '2026-09-18', hc_source: 'https://www.chargers.com/team/coaches/',
      oc: 'Mike McDaniel',      oc_verified_on: '2026-09-18', oc_source: 'https://www.chargers.com/team/coaches/',
      dc: "Chris O'Leary",      dc_verified_on: '2026-09-18', dc_source: 'https://www.chargers.com/team/coaches/',
      trees: ['HARBAUGH'], style: '',
    },
    LAR: {
      hc: 'Sean McVay',           hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Los_Angeles_Rams_season',
      oc: 'Nathan Scheelhaase',   oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Los_Angeles_Rams_season',
      dc: 'Chris Shula',          dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Los_Angeles_Rams_season',
      trees: ['MCVAY', 'SHANAHAN'], style: 'McVay system',
    },
    LV: {
      hc: 'Klint Kubiak',       hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Las_Vegas_Raiders_season',
      oc: 'Andrew Janocko',     oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Las_Vegas_Raiders_season',
      dc: 'Rob Leonard',        dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Las_Vegas_Raiders_season',
      // E-038b: Klint Kubiak (son of Gary Kubiak, Vikings/49ers/Saints OC)
      // is a Shanahan-tree wide-zone coach. Prior BELICHICK label was Carroll-
      // era defense-first; that identity flips under Kubiak.
      trees: ['SHANAHAN'], trees_verified_on: '2026-09-18', trees_source: 'https://en.wikipedia.org/wiki/Klint_Kubiak',
      // E-038f: "zone concepts" is a scheme descriptor; the bio documents
      // Klint Kubiak's positions but does not name a scheme label.
      style: 'Vikings OC → 49ers passing coordinator → Saints OC lineage (Kubiak family)', style_verified_on: '2026-09-18', style_source: 'https://en.wikipedia.org/wiki/Klint_Kubiak',
    },
    MIA: {
      hc: 'Jeff Hafley',        hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Miami_Dolphins_season',
      oc: 'Bobby Slowik',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Miami_Dolphins_season',
      dc: 'Sean Duggan',        dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Miami_Dolphins_season',
      trees: ['SHANAHAN', 'MCDANIEL'], style: '',
    },
    MIN: {
      hc: "Kevin O'Connell",    hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Minnesota_Vikings_season',
      oc: 'Wes Phillips',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Minnesota_Vikings_season',
      dc: 'Brian Flores',       dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Minnesota_Vikings_season',
      trees: ['MCVAY', 'SHANAHAN'], style: '',
    },
    NE: {
      hc: 'Mike Vrabel',        hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_New_England_Patriots_season',
      oc: 'Josh McDaniels',     oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_New_England_Patriots_season',
      dc: 'Zak Kuhr',           dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_New_England_Patriots_season',
      trees: ['BELICHICK'], style: 'Belichick system',
    },
    NO: {
      hc: 'Kellen Moore',       hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_New_Orleans_Saints_season',
      oc: 'Doug Nussmeier',     oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_New_Orleans_Saints_season',
      dc: 'Brandon Staley',     dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_New_Orleans_Saints_season',
      // E-038b: Kellen Moore's career (Cowboys OC → LAC OC → Eagles OC → NO HC)
      // is an Air-Coryell / RPO-hybrid, not the Payton legacy the prior label
      // implied. Kept PAYTON tree since Sean Payton's system left roots in
      // NO's roster/scheme, but style renamed.
      trees: ['PAYTON', 'SIRIANNI'], trees_verified_on: '2026-09-18', trees_source: 'https://en.wikipedia.org/wiki/Kellen_Moore_(quarterback)',
      // E-038f: "Air-Coryell / RPO hybrid" was descriptor. Bio documents
      // Moore's OC path (Cowboys → LAC → Eagles → NO HC) — lineage only.
      style: 'Cowboys OC → LAC OC → Eagles OC lineage (Moore)', style_verified_on: '2026-09-18', style_source: 'https://en.wikipedia.org/wiki/Kellen_Moore_(quarterback)',
    },
    NYG: {
      hc: 'John Harbaugh',      hc_verified_on: '2026-09-18', hc_source: 'https://www.giants.com/team/coaches/',
      oc: 'Matt Nagy',          oc_verified_on: '2026-09-18', oc_source: 'https://www.giants.com/team/coaches/',
      dc: 'Dennard Wilson',     dc_verified_on: '2026-09-18', dc_source: 'https://www.giants.com/team/coaches/',
      // E-038b: John Harbaugh moved from BAL to NYG. HARBAUGH tree, obviously
      // — physical run game, special-teams emphasis, defense-forward identity
      // that carries from Baltimore. OC Matt Nagy adds REID-family passing
      // wrinkles.
      trees: ['HARBAUGH', 'REID'], trees_verified_on: '2026-09-18', trees_source: 'https://en.wikipedia.org/wiki/John_Harbaugh',
      // E-038f: "physical" is descriptor. Bio documents J. Harbaugh's Eagles
      // ST coach → Ravens HC → Giants HC path — lineage only.
      style: 'Eagles ST → Ravens HC → Giants HC lineage (Harbaugh)', style_verified_on: '2026-09-18', style_source: 'https://en.wikipedia.org/wiki/John_Harbaugh',
    },
    NYJ: {
      hc: 'Aaron Glenn',        hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_New_York_Jets_season',
      oc: 'Frank Reich',        oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_New_York_Jets_season',
      dc: 'Brian Duker',        dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_New_York_Jets_season',
      trees: ['CAMPBELL'], style: '',
    },
    PHI: {
      hc: 'Nick Sirianni',      hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Philadelphia_Eagles_season',
      oc: 'Sean Mannion',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Philadelphia_Eagles_season',
      dc: 'Vic Fangio',         dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Philadelphia_Eagles_season',
      trees: ['SIRIANNI', 'REID'], style: '',
    },
    PIT: {
      hc: 'Mike McCarthy',      hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Pittsburgh_Steelers_season',
      oc: 'Brian Angelichio',   oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Pittsburgh_Steelers_season',
      dc: 'Patrick Graham',     dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Pittsburgh_Steelers_season',
      // E-038b: Mike McCarthy replaces Tomlin. Packers HC 2006-2018, Cowboys
      // HC 2020-2023 — West Coast / Reid-adjacent lineage (his own branch,
      // McCarthy is a Marty Schottenheimer/Andy Reid tree hybrid). Style
      // shifts from Tomlin's zone-blitz identity to McCarthy West Coast timing.
      trees: ['REID'], trees_verified_on: '2026-09-18', trees_source: 'https://en.wikipedia.org/wiki/Mike_McCarthy_(American_football_coach)',
      // E-038f: "West Coast timing" is my characterization. The bio documents
      // McCarthy's Packers HC (2006-18) and Cowboys HC (2020-23) tenure —
      // lineage only.
      style: 'Packers HC → Cowboys HC lineage (McCarthy)', style_verified_on: '2026-09-18', style_source: 'https://en.wikipedia.org/wiki/Mike_McCarthy_(American_football_coach)',
    },
    SEA: {
      hc: 'Mike Macdonald',     hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Seattle_Seahawks_season',
      oc: 'Brian Fleury',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Seattle_Seahawks_season',
      dc: 'Aden Durde',         dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Seattle_Seahawks_season',
      trees: ['HARBAUGH'], style: '',
    },
    SF: {
      hc: 'Kyle Shanahan',      hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_San_Francisco_49ers_season',
      oc: 'Klay Kubiak',        oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_San_Francisco_49ers_season',
      dc: 'Raheem Morris',      dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_San_Francisco_49ers_season',
      trees: ['SHANAHAN'], style: 'Shanahan system',
    },
    TB: {
      hc: 'Todd Bowles',        hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Tampa_Bay_Buccaneers_season',
      oc: 'Zac Robinson',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Tampa_Bay_Buccaneers_season',
      dc: 'George Edwards',     dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Tampa_Bay_Buccaneers_season',
      // TB does not list a coach with the explicit "Defensive Coordinator"
      // title. George Edwards is listed as "Pass Game Coordinator" on the
      // defensive side and is the senior defensive title after HC Bowles
      // (who calls the defense himself). Recorded per peer's rule: use a
      // note field rather than guess.
      dc_note: 'Buccaneers do not list a formal Defensive Coordinator for 2026; George Edwards holds Pass Game Coordinator title and is the senior defensive assistant. HC Bowles calls the defense.',
      trees: ['BELICHICK'], style: '',
    },
    TEN: {
      hc: 'Robert Saleh',       hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Tennessee_Titans_season',
      oc: 'Brian Daboll',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Tennessee_Titans_season',
      dc: 'Gus Bradley',        dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Tennessee_Titans_season',
      // E-038b: Saleh worked under Kyle Shanahan (49ers DC 2017-2020) and
      // under Pete Carroll early (Seattle 2011-2013). His scheme is a
      // Carroll-lineage Cover-3 zone-heavy 4-3, closer to the CARROLL tree
      // than to the SHANAHAN tree — but no CARROLL tree exists in our
      // 10 defined ones. SHANAHAN is the closest-available proxy, not a
      // direct fit. QA 2026-09-18 09:05 CT flagged this; recorded per the
      // ambiguity rule via `tree_confidence`. Check #12 counts this row
      // as unverified for the trees field.
      trees: ['SHANAHAN'], trees_verified_on: '2026-09-18', trees_source: 'https://en.wikipedia.org/wiki/Robert_Saleh',
      tree_confidence: 'closest-available',
      // E-038f (QA 10:05): "Cover-3 zone-heavy 4-3" cut — the Wikipedia bio
      // does not state that phrase. Lineage retained; Carroll roots recorded
      // in `trees_note` above, not asserted as scheme.
      style: 'Seattle assistant → 49ers DC → Jets HC lineage (Saleh)', style_verified_on: '2026-09-18', style_source: 'https://en.wikipedia.org/wiki/Robert_Saleh',
    },
    WAS: {
      hc: 'Dan Quinn',          hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Washington_Commanders_season',
      oc: 'David Blough',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Washington_Commanders_season',
      dc: 'Daronte Jones',      dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Washington_Commanders_season',
      trees: ['SHANAHAN'], style: 'Quinn system',
    },
  },

  // E-038c (2026-09-18): per-team is_new booleans for the 2026 hiring cycle.
  // SINGLE SOURCE OF TRUTH — replaces the deleted COORDINATOR_MOVES_2026
  // hardcode in scripts/build-player-board.js, which had stale coach names
  // (Doyle at CHI, Morton at DET, Nagy at KC, Carroll at LV) and shipped
  // them into the board. QA 2026-09-18 08:35 CT caught this.
  //
  // A team's booleans are derived from the E-038-verified `teams` block
  // above (2026 staff) compared against the 2025 baseline. `true` means the
  // role changed for the 2026 season; `false` means it continued from 2025;
  // `null` means the 2025 identity of that role was not resolved (a team's
  // 2025 file was never snapshotted).
  //
  // For teams whose 2025 baseline is not disambiguated in this repo, the
  // booleans are LEFT OFF (undefined ⇒ null in consumers). Extend as
  // curation deepens; verify-player-board.mjs check #12 counts them the
  // same way as trees/style.
  //
  // Notes are short and human-readable. They land on PLAYER_BOARD_2026 rows
  // as `coordinator_change_note`.
  changes_2026: {
    // Nine confirmed new-HC teams (E-038, 2026-09-18): all-new staff except
    // ARI where Nick Rallis was retained as DC.
    ARI: { hc: true,  oc: true,  dc: false, note: 'Mike LaFleur (from LAR OC) replaces Gannon; Nathaniel Hackett OC; Nick Rallis DC retained.' },
    ATL: { hc: true,  oc: true,  dc: true,  note: 'Kevin Stefanski (from CLE HC) replaces Morris; Tommy Rees OC / Jeff Ulbrich DC.' },
    BAL: { hc: true,  oc: true,  dc: true,  note: 'Jesse Minter (from LAC DC) replaces John Harbaugh (to NYG); Declan Doyle OC / Anthony Weaver DC.' },
    CLE: { hc: true,  oc: true,  dc: true,  note: 'Todd Monken (from BAL OC) replaces Stefanski; Travis Switzer OC / Mike Rutenberg DC.' },
    LV:  { hc: true,  oc: true,  dc: true,  note: 'Klint Kubiak (from NO OC) replaces Pete Carroll; Andrew Janocko OC / Rob Leonard DC.' },
    NO:  { hc: true,  oc: true,  dc: true,  note: 'Kellen Moore (from PHI OC) replaces Rizzi; Doug Nussmeier OC / Brandon Staley DC.' },
    NYG: { hc: true,  oc: true,  dc: true,  note: 'John Harbaugh (from BAL) replaces Daboll; Matt Nagy OC (from KC) / Dennard Wilson DC (from TEN).' },
    PIT: { hc: true,  oc: true,  dc: true,  note: 'Mike McCarthy replaces Tomlin; Brian Angelichio OC / Patrick Graham DC.' },
    TEN: { hc: true,  oc: true,  dc: true,  note: 'Robert Saleh (from NYJ HC) replaces Callahan; Brian Daboll OC (from NYG HC) / Gus Bradley DC.' },
    // HC-stable teams with confirmed OC/DC changes.
    CHI: { hc: false, oc: true,  dc: false, note: 'Press Taylor OC replaces Declan Doyle for 2026; Dennis Allen DC retained.' },
    CIN: { hc: false, oc: false, dc: true,  note: 'Al Golden DC replaces Lou Anarumo (to IND); Zac Taylor / Dan Pitcher continuity.' },
    DAL: { hc: false, oc: false, dc: true,  note: 'Christian Parker DC replaces Al Harris; Schottenheimer / Klayton Adams continuity.' },
    DEN: { hc: false, oc: true,  dc: false, note: 'Davis Webb OC replaces Joe Lombardi; Payton HC / Vance Joseph DC retained.' },
    DET: { hc: false, oc: true,  dc: true,  note: 'Drew Petzing OC (from ARI) replaces John Morton; Kelvin Sheppard DC replaces Aaron Glenn (to NYJ HC).' },
    GB:  { hc: false, oc: false, dc: true,  note: 'Jonathan Gannon DC (from ARI HC) replaces Jeff Hafley (to MIA HC); LaFleur / Stenavich continuity.' },
    HOU: { hc: false, oc: true,  dc: false, note: 'Nick Caley OC replaces Bobby Slowik (to MIA OC); Ryans HC / Burke DC retained.' },
    IND: { hc: false, oc: false, dc: true,  note: 'Lou Anarumo DC (from CIN) replaces Gus Bradley (to TEN); Steichen / Cooter continuity.' },
    JAX: { hc: false, oc: true,  dc: true,  note: 'Grant Udinski OC (Coen no longer dual-hats) / Anthony Campanile DC replaces Ryan Nielsen; Coen HC retained.' },
    KC:  { hc: false, oc: true,  dc: false, note: 'Eric Bieniemy OC returns replacing Matt Nagy (to NYG); Reid HC / Spagnuolo DC retained.' },
    LAC: { hc: false, oc: true,  dc: true,  note: 'Mike McDaniel OC (from MIA HC) replaces Greg Roman; Chris O\'Leary DC replaces Jesse Minter (to BAL HC).' },
    LAR: { hc: false, oc: true,  dc: false, note: 'Nathan Scheelhaase OC replaces Mike LaFleur (to ARI HC); McVay HC / Shula DC retained.' },
    MIA: { hc: true,  oc: true,  dc: true,  note: 'Jeff Hafley (from GB DC) replaces Mike McDaniel (to LAC OC); Bobby Slowik OC (from HOU) / Sean Duggan DC.' },
    NE:  { hc: false, oc: false, dc: true,  note: 'Zak Kuhr DC replaces Terrell Williams; Vrabel / McDaniels continuity.' },
    NYJ: { hc: false, oc: true,  dc: true,  note: 'Frank Reich OC replaces Tanner Engstrand; Brian Duker DC replaces Steve Wilks; Glenn HC retained.' },
    PHI: { hc: false, oc: true,  dc: false, note: 'Sean Mannion OC replaces Kellen Moore (to NO HC); Sirianni / Fangio retained.' },
    SEA: { hc: false, oc: true,  dc: false, note: 'Brian Fleury OC replaces Ryan Grubb; Macdonald / Durde retained.' },
    SF:  { hc: false, oc: false, dc: true,  note: 'Raheem Morris DC (from ATL HC) replaces Nick Sorensen; Shanahan / Klay Kubiak continuity.' },
    TB:  { hc: false, oc: true,  dc: true,  note: 'Zac Robinson OC (from ATL) replaces Liam Coen (to JAX HC); George Edwards elevated on defense (see teams.TB.dc_note); Bowles HC retained.' },
    WAS: { hc: false, oc: true,  dc: true,  note: 'David Blough OC replaces Kliff Kingsbury; Daronte Jones DC replaces Joe Whitt; Quinn HC retained.' },
    // Confirmed all-continuity from 2025 (Joe Brady's 2025 hire not counted
    // as 2026-new).
    BUF: { hc: false, oc: false, dc: false, note: 'Joe Brady / Pete Carmichael / Jim Leonhard — full 2025 staff returned.' },
    CAR: { hc: false, oc: false, dc: false, note: 'Canales / Idzik / Evero — full 2025 staff returned.' },
    MIN: { hc: false, oc: false, dc: false, note: "Kevin O'Connell / Wes Phillips / Brian Flores — full 2025 staff returned." },
  },
};
