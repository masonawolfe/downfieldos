/**
 * playingTime.js — model build part 6 (2026-11-22, Mason: "Yeah, build it").
 *
 * The 100-point number on depth chart rows (rosters2026.js, rating_source
 * snap_share_v1) is a playing-time tier: 68 to 85 by share of snaps, plus or
 * minus 2 for experience, 72 when no snap count is on record. It said
 * nothing about how well a man plays, yet the pages printed it as skill
 * ("one of the best at the position", "a liability. Opponents will target
 * this spot"). These words say what it measures.
 */
export function playingTimeTier(rating) {
  if (rating == null) return "not rated";
  if (rating >= 83) return "an every-down player";
  if (rating >= 78) return "a regular";
  if (rating >= 72) return "a part-time or rotational player";
  return "a reserve";
}

export function playingTimeNote(player) {
  if (!player) return "";
  if (player.grade === "TBD" || player.rating == null) return `${player.name} has no playing time rating yet.`;
  return `By playing time, ${player.name} is ${playingTimeTier(player.rating)} (${player.rating} of 100). The number measures how much he plays, not how well.`;
}
