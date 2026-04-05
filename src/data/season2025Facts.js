/**
 * season2025Facts.js — Ground Truth for the 2025 NFL Season
 *
 * This is the reconciliation source of truth. Every archetype, narrative,
 * fan sentiment, and War Room assessment must be coherent with these facts.
 * If data elsewhere contradicts this file, this file wins.
 */

export const SEASON_2025_FACTS = {
  superBowl: {
    winner: "SEA",
    loser: "NE",
    mvp: "Jaxon Smith-Njigba", // SB MVP
    score: "31-24",
    venue: "Levi's Stadium, Santa Clara",
    roman: "LX",
  },

  conferenceChampions: {
    nfc: "SEA", // 14-3, beat DET in NFC Championship
    afc: "NE",  // 14-3, Cinderella run under Drake Maye
  },

  mvp: "Josh Allen", // Regular season MVP

  majorInjuries: {
    KC: { player: "Patrick Mahomes", injury: "Torn ACL", week: 8, impact: "Season-ending. Chiefs collapsed from contender to 6-11." },
  },

  coachingChanges: {
    BUF: { old: "Sean McDermott", new: "Joe Brady", reason: "Fired after playoff exit" },
  },

  qbChanges2026: {
    // QBs no longer with 2025 team entering 2026
    SEA: { qb2025: "DK Metcalf-era QB (not Geno Smith)", note: "Geno traded/released before 2025. SEA won SB with new QB room." },
    NYJ: { qb2025: "Aaron Rodgers", note: "Retired after 3-14 season. Jets signed Geno Smith for 2026." },
    MIA: { qb2025: "Tua Tagovailoa", note: "Traded to ATL. MIA starting Malik Willis in 2026." },
    MIN: { qb2025: "Sam Darnold", note: "Replaced by Kyler Murray trade for 2026." },
    IND: { qb2025: "Anthony Richardson", note: "Out — Daniel Jones re-signed as starter for 2026." },
  },

  breakoutSeasons: {
    NE: { player: "Drake Maye", note: "Took Patriots from bottom-dweller to Super Bowl. 14-3 record." },
    CHI: { player: "Caleb Williams", note: "Year 2 breakout — 11-6, won a playoff game. Entering Year 3 in 2026." },
    DEN: { player: "Bo Nix", note: "Led Broncos to 14-3 record. Surprise contender." },
    JAX: { player: "Trevor Lawrence", note: "Bounced back to 13-4 despite 'disappoints' narrative being wrong." },
    SEA: { player: "Jaxon Smith-Njigba", note: "Super Bowl MVP. Emerged as elite WR." },
  },

  // Records for context (also in records2025.js)
  playoffTeams: {
    afc: ["NE", "BUF", "HOU", "DEN", "JAX", "LAC", "PIT"],
    nfc: ["SEA", "CHI", "PHI", "LAR", "SF", "DET", "GB"],
  },

  narrativeCorrections: {
    SEA: "Won Super Bowl LX. 'Geno Under Pressure' is completely wrong — Geno wasn't even on the team. Defending champions.",
    NE: "'Drake Maye Learning' is wrong — he took them to the Super Bowl at 14-3. This was a breakout/Cinderella story.",
    KC: "'Three-Peat Machine' is wrong — Mahomes tore his ACL in Week 8, team went 6-11. The dynasty narrative is over for now.",
    CHI: "'Caleb's Rough Rookie Year' is wrong — he's entering Year 3, went 11-6, won a playoff game. This is a rising team.",
    JAX: "'Lawrence Disappoints' is wrong — they went 13-4. Lawrence had a strong season.",
    DEN: "'Nix Surprise Contender' undersells it — they went 14-3, tied for best record in the league. Fans are happy.",
    NYJ: "'Rodgers Farewell Tour' — he's retired now. Jets went 3-14. Signed Geno Smith for 2026.",
  },
};
