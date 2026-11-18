/**
 * Fixture for scripts/test-load-export.mjs: the shape build-player-stats.js
 * writes since 2026-11-11, a data array followed by a META block that holds
 * an array of its own. Synthetic rows only.
 */
export const PLAYER_STATS_2025 = [
  { "gsis_id": "00-0000001", "name": "Fixture One", "team": "KC", "pos": "WR" },
  { "gsis_id": "00-0000002", "name": "Fixture Two", "team": "BUF", "pos": "RB" }
];

export const PLAYER_STATS_2025_META = {
  "label": "2025 season",
  "sources": [
    "fixture-source: stats_player_reg_2025.csv"
  ],
  "source_season": 2025
};
