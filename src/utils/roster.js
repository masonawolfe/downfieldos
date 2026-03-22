import { ROSTERS_2025 } from '../data/rosters2025';
import { FA_MOVES_2026 } from '../data/faMoves2026';

export function genRoster(team) {
  return ROSTERS_2025[team] || ROSTERS_2025.ARI; // fallback
}

// ── Position renumbering ────────────────────────────────────
// After merging additions/removals, re-assign numbered positions
// so downstream code can do .find(p => p.pos === "WR1") reliably.
function renumberPositions(players) {
  const numberable = new Set(["WR", "RB", "EDGE", "DT", "LB", "CB"]);

  // Collect all players in each numberable position group
  const groups = {};
  const result = [];
  players.forEach(p => {
    const basePos = p.pos.replace(/[0-9]/g, "");
    if (numberable.has(basePos)) {
      if (!groups[basePos]) groups[basePos] = [];
      groups[basePos].push(p);
    } else {
      result.push({ ...p });
    }
  });

  // Sort each group by rating (highest = WR1, next = WR2, etc.)
  // Then assign numbered positions purely from sorted order
  Object.entries(groups).forEach(([basePos, g]) => {
    g.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    g.forEach((p, i) => {
      result.push({ ...p, pos: `${basePos}${i + 1}` });
    });
  });

  return result;
}

// Special positions that don't get numbered
const SPECIAL_POS = new Set(["QB", "TE", "LT", "LG", "C", "RG", "RT", "FS", "SS", "SCB"]);

// ── 2026 PROJECTED ROSTER ENGINE ────────────────────────────
// Merges 2024 base roster with 2026 FA additions/losses
export function genRoster2026(team) {
  const base = ROSTERS_2025[team] || ROSTERS_2025.ARI;
  const fa = FA_MOVES_2026[team];
  if (!fa) return { offense: base.offense.map(p => ({ ...p, isNew: false })), defense: base.defense.map(p => ({ ...p, isNew: false })) };

  const lostNames = new Set((fa.lost || []).map(p => p.name));

  // Remove departed players from base
  let offense = base.offense.filter(p => !lostNames.has(p.name)).map(p => ({ ...p, isNew: false }));
  let defense = base.defense.filter(p => !lostNames.has(p.name)).map(p => ({ ...p, isNew: false }));

  // Categorize FA additions as offense or defense
  const offPositions = new Set(["QB","RB","WR","TE","OT","OG","OL","C","LT","LG","RG","RT","RB1","RB2","WR1","WR2","WR3"]);
  const added = fa.added || [];
  added.forEach(p => {
    const entry = {
      pos: p.pos, name: p.name, grade: p.grade || "TBD", rating: p.rating || 75,
      trait: p.trait || p.note || p.deal || "New Addition", isNew: true,
      deal: p.deal || null, faNote: p.note || null
    };
    if (offPositions.has(p.pos) || offPositions.has(p.pos.replace(/[0-9]/g, ""))) {
      // Insert at appropriate position (QB first, then skill, then OL)
      const posOrder = ["QB","RB","WR","TE","OT","OG","OL","C","LT","LG","RG","RT"];
      const idx = offense.findIndex(op => posOrder.indexOf(op.pos.replace(/[0-9]/g,"")) > posOrder.indexOf(p.pos.replace(/[0-9]/g,"")));
      if (idx >= 0) offense.splice(idx, 0, entry); else offense.push(entry);
    } else {
      const posOrder = ["EDGE","DL","DT","LB","CB","S","SCB","FS","SS"];
      const idx = defense.findIndex(dp => posOrder.indexOf(dp.pos.replace(/[0-9]/g,"")) > posOrder.indexOf(p.pos.replace(/[0-9]/g,"")));
      if (idx >= 0) defense.splice(idx, 0, entry); else defense.push(entry);
    }
  });

  // Renumber positions so WR1/WR2/WR3, RB1/RB2 etc. are correct
  offense = renumberPositions(offense);
  defense = renumberPositions(defense);

  return { offense, defense, note: fa.note || null };
}
