import { ROSTERS_2024 } from '../data/rosters2024';
import { FA_MOVES_2026 } from '../data/faMoves2026';

export function genRoster(team) {
  return ROSTERS_2024[team] || ROSTERS_2024.ARI; // fallback
}

// ── 2026 PROJECTED ROSTER ENGINE ────────────────────────────
// Merges 2024 base roster with 2026 FA additions/losses
export function genRoster2026(team) {
  const base = ROSTERS_2024[team] || ROSTERS_2024.ARI;
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
      pos: p.pos, name: p.name, grade: "TBD", rating: 75,
      trait: p.note || p.deal || "New Addition", isNew: true,
      deal: p.deal || null, faNote: p.note || null
    };
    if (offPositions.has(p.pos)) {
      // Insert at appropriate position (QB first, then skill, then OL)
      const posOrder = ["QB","RB","WR","TE","OT","OG","OL","C","LT","LG","RG","RT"];
      const idx = offense.findIndex(op => posOrder.indexOf(op.pos.replace(/[0-9]/g,"")) > posOrder.indexOf(p.pos.replace(/[0-9]/g,"")));
      if (idx >= 0) offense.splice(idx, 0, entry); else offense.push(entry);
    } else {
      const posOrder = ["EDGE","DL","DT","LB","CB","S"];
      const idx = defense.findIndex(dp => posOrder.indexOf(dp.pos.replace(/[0-9]/g,"")) > posOrder.indexOf(p.pos.replace(/[0-9]/g,"")));
      if (idx >= 0) defense.splice(idx, 0, entry); else defense.push(entry);
    }
  });

  return { offense, defense, note: fa.note || null };
}
