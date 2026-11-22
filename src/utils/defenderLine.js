/**
 * defenderLine.js — model build part 6 (2026-11-22, Mason: "Yeah, build it").
 *
 * One plain sentence of a defender's own 2026 production, from
 * src/data/intelligence/defenders_2026.json (season to date, built from
 * nflverse weekly stats by scripts/fetch-weekly-actuals.js). It replaces the
 * old "who wins this rep" verdict, which compared two playing-time ratings
 * as if they were skill. No winner is named: nothing here is a tested
 * skill model, only what the defender has done.
 */
const fmt = (x) => (Math.round(x * 10) / 10).toString();
const plural = (n, one, many) => `${fmt(n)} ${n === 1 ? one : many}`;

export function defenderLine(def, defenders) {
  if (!def || !def.gsis_id || !defenders?.players) return null;
  const p = defenders.players[def.gsis_id];
  if (!p || !p.games) return `${def.name}: no 2026 game on record yet.`;
  const t = p.totals, g = p.games, per = p.per_game;
  const games = plural(g, "game", "games");
  const moved = Object.keys(p.by_team || {}).length > 1
    ? ` (with ${Object.entries(p.by_team).map(([team, b]) => `${team} weeks ${b.first_week} to ${b.last_week}`).join(", ")})`
    : "";
  let body;
  if (p.pos_group === "DB") {
    body = `${fmt(per.passes_defended)} passes defended a game, ${plural(t.interceptions, "interception", "interceptions")} and ${fmt(per.tackles)} tackles a game`;
  } else if (p.pos_group === "DL") {
    body = `${plural(t.sacks, "sack", "sacks")} and ${plural(t.qb_hits, "quarterback hit", "quarterback hits")}, ${fmt(per.tackles_for_loss)} tackles for loss a game`;
  } else {
    body = `${fmt(per.tackles)} tackles a game, ${fmt(t.tackles_for_loss)} for loss, ${plural(t.sacks, "sack", "sacks")} and ${plural(t.passes_defended, "pass defended", "passes defended")}`;
  }
  return `${def.name}: ${body} in ${games}${moved}.`;
}
