/**
 * Fixture for scripts/test-load-export.mjs: an object export followed by a
 * second export, the shape that would break a slice from the first open
 * brace to the last close brace.
 * Synthetic data only.
 */
export const SCHEDULE_2026 = {
  "KC": { "bye": 10, "games": [ { "week": 1, "opponent": "BUF", "isHome": true } ] }
};

export const SCHEDULE_2026_META = {
  "label": "From the fixture",
  "sources": [ "fixture-source: games.csv" ]
};
