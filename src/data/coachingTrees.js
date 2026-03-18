/**
 * NFL Coaching Trees — 2025-2026
 *
 * Maps each team's HC, OC, DC to coaching lineage (tree).
 * Coaches from the same tree run derivative playbooks —
 * scheme overlap is real even when they add their own wrinkles.
 *
 * Trees are named after the foundational figure.
 * A coach can belong to multiple trees (e.g., McVay worked under Gruden and Shanahan).
 */

export const COACHING_TREES = {
  // Tree definitions: name, description, core principles
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

  // Team coaching staff and tree affiliations for 2025-2026
  teams: {
    ARI: { hc: 'Jonathan Gannon', oc: 'Drew Petzing', dc: 'Nick Rallis', trees: ['SIRIANNI'], style: 'Spread passing' },
    ATL: { hc: 'Raheem Morris', oc: 'Zac Robinson', dc: 'Jimmy Lake', trees: ['MCVAY'], style: 'Motion-heavy offense' },
    BAL: { hc: 'John Harbaugh', oc: 'Todd Monken', dc: 'Zach Orr', trees: ['HARBAUGH'], style: 'Run-first RPO' },
    BUF: { hc: 'Sean McDermott', oc: 'Joe Brady', dc: 'Bobby Babich', trees: ['BELICHICK', 'REID'], style: 'Josh Allen system' },
    CAR: { hc: 'Dave Canales', oc: 'Brad Idzik', dc: 'Ejiro Evero', trees: ['MCVAY', 'PAYTON'], style: 'Developing QB' },
    CHI: { hc: 'Ben Johnson', oc: 'Declan Doyle', dc: 'Dennis Allen', trees: ['CAMPBELL', 'PAYTON'], style: 'Run-game creativity' },
    CIN: { hc: 'Zac Taylor', oc: 'Dan Pitcher', dc: 'Lou Anarumo', trees: ['MCVAY'], style: 'Downfield passing' },
    CLE: { hc: 'Kevin Stefanski', oc: 'Ken Dorsey', dc: 'Jim Schwartz', trees: ['SHANAHAN'], style: 'Play-action heavy' },
    DAL: { hc: 'Brian Schottenheimer', oc: 'Klayton Adams', dc: 'Al Harris', trees: ['BELICHICK'], style: 'Power offense' },
    DEN: { hc: 'Sean Payton', oc: 'Joe Lombardi', dc: 'Vance Joseph', trees: ['PAYTON'], style: 'Payton offense' },
    DET: { hc: 'Dan Campbell', oc: 'John Morton', dc: 'Aaron Glenn', trees: ['CAMPBELL', 'PAYTON'], style: 'Physical + creative' },
    GB: { hc: 'Matt LaFleur', oc: 'Adam Stenavich', dc: 'Jeff Hafley', trees: ['SHANAHAN', 'MCVAY'], style: 'Shanahan-McVay hybrid' },
    HOU: { hc: 'DeMeco Ryans', oc: 'Bobby Slowik', dc: 'Matt Burke', trees: ['SHANAHAN'], style: 'Shanahan offense' },
    IND: { hc: 'Shane Steichen', oc: 'Jim Bob Cooter', dc: 'Gus Bradley', trees: ['SIRIANNI', 'REID'], style: 'RPO-spread' },
    JAX: { hc: 'Liam Coen', oc: 'Liam Coen', dc: 'Ryan Nielsen', trees: ['MCVAY'], style: 'McVay passing' },
    KC: { hc: 'Andy Reid', oc: 'Matt Nagy', dc: 'Steve Spagnuolo', trees: ['REID'], style: 'Reid system' },
    LAC: { hc: 'Jim Harbaugh', oc: 'Greg Roman', dc: 'Jesse Minter', trees: ['HARBAUGH'], style: 'Power run' },
    LAR: { hc: 'Sean McVay', oc: 'Mike LaFleur', dc: 'Chris Shula', trees: ['MCVAY', 'SHANAHAN'], style: 'McVay system' },
    LV: { hc: 'Pete Carroll', oc: 'Scott Turner', dc: 'Patrick Graham', trees: ['BELICHICK'], style: 'Run-first defense' },
    MIA: { hc: 'Mike McDaniel', oc: 'Frank Smith', dc: 'Anthony Weaver', trees: ['SHANAHAN', 'MCDANIEL'], style: 'Speed zone concepts' },
    MIN: { hc: 'Kevin O\'Connell', oc: 'Wes Phillips', dc: 'Brian Flores', trees: ['MCVAY', 'SHANAHAN'], style: 'McVay passing' },
    NE: { hc: 'Mike Vrabel', oc: 'Josh McDaniels', dc: 'Terrell Williams', trees: ['BELICHICK'], style: 'Belichick system' },
    NO: { hc: 'Darren Rizzi', oc: 'Klint Kubiak', dc: 'Joe Woods', trees: ['PAYTON', 'SHANAHAN'], style: 'Payton remnants' },
    NYG: { hc: 'Brian Daboll', oc: 'Mike Kafka', dc: 'Shane Bowen', trees: ['BELICHICK', 'REID'], style: 'Daboll system' },
    NYJ: { hc: 'Aaron Glenn', oc: 'Tanner Engstrand', dc: 'Steve Wilks', trees: ['CAMPBELL'], style: 'Defensive identity' },
    PHI: { hc: 'Nick Sirianni', oc: 'Kellen Moore', dc: 'Vic Fangio', trees: ['SIRIANNI', 'REID'], style: 'RPO + Fangio defense' },
    PIT: { hc: 'Mike Tomlin', oc: 'Arthur Smith', dc: 'Teryl Austin', trees: ['TOMLIN', 'SHANAHAN'], style: 'Physical football' },
    SEA: { hc: 'Mike Macdonald', oc: 'Ryan Grubb', dc: 'Aden Durde', trees: ['HARBAUGH'], style: 'Defensive innovation' },
    SF: { hc: 'Kyle Shanahan', oc: 'Klay Kubiak', dc: 'Nick Sorensen', trees: ['SHANAHAN'], style: 'Shanahan system' },
    TB: { hc: 'Todd Bowles', oc: 'Liam Coen', dc: 'Kacy Rodgers', trees: ['BELICHICK'], style: 'Aggressive defense' },
    TEN: { hc: 'Brian Callahan', oc: 'Nick Holz', dc: 'Dennard Wilson', trees: ['MCVAY'], style: 'McVay derivative' },
    WAS: { hc: 'Dan Quinn', oc: 'Kliff Kingsbury', dc: 'Joe Whitt', trees: ['SHANAHAN'], style: 'Quinn system' },
  },
};
