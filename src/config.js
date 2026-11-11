/**
 * config.js: season values for the play-by-play surfaces of the site.
 *
 * What this file governs: the seasons of play-by-play data the site serves
 * (`SEASONS`; `utils/playGenerator.js` loads `/data/plays-<year>.json`),
 * the last complete season among them (`LAST_COMPLETE_SEASON`), which
 * labels last-season records and is the play explorer's default, and a few
 * display constants.
 *
 * What it does not govern: the in-season year. That is `season` in
 * `data/season.json` (freshness plan step 4), which every season-following
 * script reads. `LAST_COMPLETE_SEASON` must equal `base_season` in that
 * file and be the last entry of `SEASONS` (freshness plan step 17; the
 * `season` mode of `scripts/check-freshness.mjs`, step 5, will assert it;
 * that check does not exist yet). The play explorer's label and its season
 * selector on /this-week are both built from `SEASONS`.
 *
 * `LAST_COMPLETE_SEASON` moves only when a full season of play data is
 * loaded, never at kickoff: setting it to the in-season year would print
 * that year over last season's records and point the explorer at plays
 * that do not exist yet.
 */

export const LAST_COMPLETE_SEASON = 2025;
export const SEASONS = [2023, 2024, 2025];
export const PLAY_COUNT_LABEL = "100,000+";
export const MODULE_COUNT = 8;
export const GAMES_PER_SEASON = 17;

// Label for cards built from the loaded play data (team identity, pass rate,
// efficiency, explosive rate, matchup grades), rendered by `AsOf`
// (freshness plan step 12, 2026-11-11, /2026-preview).
export const PLAY_DATA_META = {
  label: `Play data: ${SEASONS[0]} to ${SEASONS[SEASONS.length - 1]} seasons`,
  source_season: LAST_COMPLETE_SEASON,
};

// Label for the play explorer on /this-week, rendered by `AsOf`.
export const PLAY_EXPLORER_META = {
  label: `Play explorer: ${SEASONS[0]} to ${SEASONS[SEASONS.length - 1]} seasons`,
  source_season: LAST_COMPLETE_SEASON,
};
