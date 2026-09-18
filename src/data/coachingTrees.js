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
      trees: ['SIRIANNI'], style: 'Spread passing',
    },
    ATL: {
      hc: 'Kevin Stefanski',    hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Atlanta_Falcons_season',
      oc: 'Tommy Rees',         oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Atlanta_Falcons_season',
      dc: 'Jeff Ulbrich',       dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Atlanta_Falcons_season',
      trees: ['MCVAY'], style: 'Motion-heavy offense',
    },
    BAL: {
      hc: 'Jesse Minter',       hc_verified_on: '2026-09-18', hc_source: 'https://www.baltimoreravens.com/team/coaches/',
      oc: 'Declan Doyle',       oc_verified_on: '2026-09-18', oc_source: 'https://www.baltimoreravens.com/team/coaches/',
      dc: 'Anthony Weaver',     dc_verified_on: '2026-09-18', dc_source: 'https://www.baltimoreravens.com/team/coaches/',
      trees: ['HARBAUGH'], style: 'Run-first RPO',
    },
    BUF: {
      hc: 'Joe Brady',          hc_verified_on: '2026-09-18', hc_source: 'https://www.buffalobills.com/team/coaches/',
      oc: 'Pete Carmichael',    oc_verified_on: '2026-09-18', oc_source: 'https://www.buffalobills.com/team/coaches/',
      dc: 'Jim Leonhard',       dc_verified_on: '2026-09-18', dc_source: 'https://www.buffalobills.com/team/coaches/',
      trees: ['BELICHICK', 'REID'], style: 'Josh Allen system',
    },
    CAR: {
      hc: 'Dave Canales',       hc_verified_on: '2026-09-18', hc_source: 'https://www.panthers.com/team/coaches/',
      oc: 'Brad Idzik',         oc_verified_on: '2026-09-18', oc_source: 'https://www.panthers.com/team/coaches/',
      dc: 'Ejiro Evero',        dc_verified_on: '2026-09-18', dc_source: 'https://www.panthers.com/team/coaches/',
      trees: ['MCVAY', 'PAYTON'], style: 'Developing QB',
    },
    CHI: {
      hc: 'Ben Johnson',        hc_verified_on: '2026-09-18', hc_source: 'https://www.chicagobears.com/team/coaches/',
      oc: 'Press Taylor',       oc_verified_on: '2026-09-18', oc_source: 'https://www.chicagobears.com/team/coaches/',
      dc: 'Dennis Allen',       dc_verified_on: '2026-09-18', dc_source: 'https://www.chicagobears.com/team/coaches/',
      trees: ['CAMPBELL', 'PAYTON'], style: 'Run-game creativity',
    },
    CIN: {
      hc: 'Zac Taylor',         hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Cincinnati_Bengals_season',
      oc: 'Dan Pitcher',        oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Cincinnati_Bengals_season',
      dc: 'Al Golden',          dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Cincinnati_Bengals_season',
      trees: ['MCVAY'], style: 'Downfield passing',
    },
    CLE: {
      hc: 'Todd Monken',        hc_verified_on: '2026-09-18', hc_source: 'https://www.clevelandbrowns.com/team/coaches/',
      oc: 'Travis Switzer',     oc_verified_on: '2026-09-18', oc_source: 'https://www.clevelandbrowns.com/team/coaches/',
      dc: 'Mike Rutenberg',     dc_verified_on: '2026-09-18', dc_source: 'https://www.clevelandbrowns.com/team/coaches/',
      trees: ['SHANAHAN'], style: 'Play-action heavy',
    },
    DAL: {
      hc: 'Brian Schottenheimer', hc_verified_on: '2026-09-18', hc_source: 'https://www.dallascowboys.com/team/coaches/',
      oc: 'Klayton Adams',        oc_verified_on: '2026-09-18', oc_source: 'https://www.dallascowboys.com/team/coaches/',
      dc: 'Christian Parker',     dc_verified_on: '2026-09-18', dc_source: 'https://www.dallascowboys.com/team/coaches/',
      trees: ['BELICHICK'], style: 'Power offense',
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
      trees: ['CAMPBELL', 'PAYTON'], style: 'Physical + creative',
    },
    GB: {
      hc: 'Matt LaFleur',       hc_verified_on: '2026-09-18', hc_source: 'https://www.packers.com/team/coaches/',
      oc: 'Adam Stenavich',     oc_verified_on: '2026-09-18', oc_source: 'https://www.packers.com/team/coaches/',
      dc: 'Jonathan Gannon',    dc_verified_on: '2026-09-18', dc_source: 'https://www.packers.com/team/coaches/',
      trees: ['SHANAHAN', 'MCVAY'], style: 'Shanahan-McVay hybrid',
    },
    HOU: {
      hc: 'DeMeco Ryans',       hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Houston_Texans_season',
      oc: 'Nick Caley',         oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Houston_Texans_season',
      dc: 'Matt Burke',         dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Houston_Texans_season',
      trees: ['SHANAHAN'], style: 'Shanahan offense',
    },
    IND: {
      hc: 'Shane Steichen',     hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Indianapolis_Colts_season',
      oc: 'Jim Bob Cooter',     oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Indianapolis_Colts_season',
      dc: 'Lou Anarumo',        dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Indianapolis_Colts_season',
      trees: ['SIRIANNI', 'REID'], style: 'RPO-spread',
    },
    JAX: {
      hc: 'Liam Coen',          hc_verified_on: '2026-09-18', hc_source: 'https://www.jaguars.com/team/coaches/',
      oc: 'Grant Udinski',      oc_verified_on: '2026-09-18', oc_source: 'https://www.jaguars.com/team/coaches/',
      dc: 'Anthony Campanile',  dc_verified_on: '2026-09-18', dc_source: 'https://www.jaguars.com/team/coaches/',
      trees: ['MCVAY'], style: 'McVay passing',
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
      trees: ['HARBAUGH'], style: 'Power run',
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
      trees: ['BELICHICK'], style: 'Run-first defense',
    },
    MIA: {
      hc: 'Jeff Hafley',        hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Miami_Dolphins_season',
      oc: 'Bobby Slowik',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Miami_Dolphins_season',
      dc: 'Sean Duggan',        dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Miami_Dolphins_season',
      trees: ['SHANAHAN', 'MCDANIEL'], style: 'Speed zone concepts',
    },
    MIN: {
      hc: "Kevin O'Connell",    hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Minnesota_Vikings_season',
      oc: 'Wes Phillips',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Minnesota_Vikings_season',
      dc: 'Brian Flores',       dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Minnesota_Vikings_season',
      trees: ['MCVAY', 'SHANAHAN'], style: 'McVay passing',
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
      trees: ['PAYTON', 'SHANAHAN'], style: 'Payton remnants',
    },
    NYG: {
      hc: 'John Harbaugh',      hc_verified_on: '2026-09-18', hc_source: 'https://www.giants.com/team/coaches/',
      oc: 'Matt Nagy',          oc_verified_on: '2026-09-18', oc_source: 'https://www.giants.com/team/coaches/',
      dc: 'Dennard Wilson',     dc_verified_on: '2026-09-18', dc_source: 'https://www.giants.com/team/coaches/',
      trees: ['BELICHICK', 'REID'], style: 'Daboll system',
    },
    NYJ: {
      hc: 'Aaron Glenn',        hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_New_York_Jets_season',
      oc: 'Frank Reich',        oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_New_York_Jets_season',
      dc: 'Brian Duker',        dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_New_York_Jets_season',
      trees: ['CAMPBELL'], style: 'Defensive identity',
    },
    PHI: {
      hc: 'Nick Sirianni',      hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Philadelphia_Eagles_season',
      oc: 'Sean Mannion',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Philadelphia_Eagles_season',
      dc: 'Vic Fangio',         dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Philadelphia_Eagles_season',
      trees: ['SIRIANNI', 'REID'], style: 'RPO + Fangio defense',
    },
    PIT: {
      hc: 'Mike McCarthy',      hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Pittsburgh_Steelers_season',
      oc: 'Brian Angelichio',   oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Pittsburgh_Steelers_season',
      dc: 'Patrick Graham',     dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Pittsburgh_Steelers_season',
      trees: ['TOMLIN', 'SHANAHAN'], style: 'Physical football',
    },
    SEA: {
      hc: 'Mike Macdonald',     hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Seattle_Seahawks_season',
      oc: 'Brian Fleury',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Seattle_Seahawks_season',
      dc: 'Aden Durde',         dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Seattle_Seahawks_season',
      trees: ['HARBAUGH'], style: 'Defensive innovation',
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
      trees: ['BELICHICK'], style: 'Aggressive defense',
    },
    TEN: {
      hc: 'Robert Saleh',       hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Tennessee_Titans_season',
      oc: 'Brian Daboll',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Tennessee_Titans_season',
      dc: 'Gus Bradley',        dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Tennessee_Titans_season',
      trees: ['MCVAY'], style: 'McVay derivative',
    },
    WAS: {
      hc: 'Dan Quinn',          hc_verified_on: '2026-09-18', hc_source: 'https://en.wikipedia.org/wiki/2026_Washington_Commanders_season',
      oc: 'David Blough',       oc_verified_on: '2026-09-18', oc_source: 'https://en.wikipedia.org/wiki/2026_Washington_Commanders_season',
      dc: 'Daronte Jones',      dc_verified_on: '2026-09-18', dc_source: 'https://en.wikipedia.org/wiki/2026_Washington_Commanders_season',
      trees: ['SHANAHAN'], style: 'Quinn system',
    },
  },
};
