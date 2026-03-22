import { T } from '../data/teams';
import { DNA } from '../data/dna';
import { sr } from './rng';

// New fields: scoreDiff, driveId, complete (pass), personnel, timeLeft
export function generatePlays() {
  const plays = []; let id = 1; const r = sr(42);
  const dome = ["ARI","ATL","DAL","DET","HOU","IND","LAC","LAR","LV","MIN","NO"];
  const personnelSets = ["11","12","21","13","22","10","20"];
  const pWeights = [0.55, 0.18, 0.12, 0.04, 0.04, 0.04, 0.03];

  function pickPersonnel() {
    const roll = r();
    let cum = 0;
    for (let i = 0; i < personnelSets.length; i++) {
      cum += pWeights[i];
      if (roll < cum) return personnelSets[i];
    }
    return "11";
  }

  for (const season of [2023, 2024, 2025]) {
    for (let w = 1; w <= 18; w++) {
      const sh = [...T].sort(() => r() - 0.5);
      for (let g = 0; g < 16; g++) {
        const h = sh[g * 2], a = sh[g * 2 + 1];
        const env = dome.includes(h.a) ? "Dome" : (r() < 0.1 ? "Rain" : r() < 0.05 ? "Snow" : r() < 0.15 ? "Wind" : "Clear");
        const temp = dome.includes(h.a) ? 72 : Math.round(30 + r() * 60);
        const ppt = 28 + Math.floor(r() * 12);
        const gameId = `${season}-W${w}-G${g}`;

        for (const [ot, dt, ha] of [[h.a, a.a, "Home"], [a.a, h.a, "Away"]]) {
          const d = DNA[ot];
          let fp = 25, driveId = 0, playsInDrive = 0;
          let homeScore = 0, awayScore = 0;

          for (let p = 0; p < ppt; p++) {
            // Drive management
            if (playsInDrive === 0 || r() < 0.12) { driveId++; playsInDrive = 0; fp = 15 + Math.floor(r() * 30); }
            playsInDrive++;

            const scoreDiff = ha === "Home" ? homeScore - awayScore : awayScore - homeScore;
            const dn = p === 0 ? 1 : (r() < .45 ? 1 : r() < .6 ? 2 : r() < .85 ? 3 : 4);
            const ytg = dn === 1 ? 10 : Math.max(1, Math.floor(r() * 15) + 1);
            fp = Math.min(99, Math.max(1, fp + Math.floor(r() * 8) - 2));

            const q = Math.min(Math.floor(p / (ppt / 4)) + 1, 4);
            const timeLeft = Math.max(0, 900 - (p / (ppt / 4) - (q - 1)) * 900);
            const twoMin = timeLeft <= 120 && (q === 2 || q === 4);

            // Situational pass rate adjustments
            let spr = d.p;
            if (dn === 3 && ytg > 6) spr += .20;
            if (dn === 1) spr -= .05;
            if (fp >= 80) spr += .05;
            if (dn === 4) spr = r() < .5 ? .7 : .3;
            if (scoreDiff < -14) spr += .15;
            if (scoreDiff > 14) spr -= .15;
            if (twoMin) spr += .25;
            spr = Math.min(.85, Math.max(.25, spr));

            const pers = pickPersonnel();
            const isP = r() < spr;
            let yd, complete = null;

            if (isP) {
              if (r() < .62) { complete = true; yd = r() < d.x * 1.2 ? 20 + Math.floor(r() * 40) : Math.floor(r() * 18) + 1; }
              else if (r() < .08) { complete = false; yd = -Math.floor(r() * 8); } // sack
              else { complete = false; yd = 0; } // incompletion
            } else {
              complete = null;
              if (r() < d.x * .8) yd = 12 + Math.floor(r() * 25);
              else if (r() < .1) yd = -Math.floor(r() * 4);
              else yd = Math.floor(r() * 9) + 1;
            }
            if (r() < d.e * .3) yd = Math.max(yd, Math.floor(ytg * .5));

            const isX = (isP && yd >= 20) || (!isP && yd >= 12);
            const isS = dn <= 1 ? yd >= ytg * .45 : dn === 2 ? yd >= ytg * .6 : yd >= ytg;
            const rz = fp >= 80 ? 1 : 0;

            // Scoring simulation
            if (fp + Math.max(0, yd) >= 100 && r() < 0.4) {
              if (ha === "Home") homeScore += 7; else awayScore += 7;
              playsInDrive = 0; // reset drive
            }

            plays.push({
              id: id++, season, week: w, gameId, off: ot, def: dt,
              down: dn, ytg, fp, type: isP ? "Pass" : "Run", yd,
              isS: isS ? 1 : 0, isX: isX ? 1 : 0,
              q, rz, env, ha, pers, scoreDiff, driveId: `${gameId}-${ot}-${driveId}`,
              complete, twoMin: twoMin ? 1 : 0, temp,
              isSack: isP && complete === false && yd < 0 ? 1 : 0
            });
            fp = Math.min(99, Math.max(1, fp + Math.max(0, yd)));
          }
        }
      }
    }
  }
  return plays;
}

// ── Real Data Loader (nflverse PBP) ─────────────────────────────────────────

let _currentSeason = null;
let _allSeasons = null;

/**
 * Load current season play data (~327KB gzip, fast).
 * Falls back to synthetic data if fetch fails (dev mode, offline).
 */
export async function loadCurrentSeason() {
  if (_currentSeason) return _currentSeason;
  const resp = await fetch('/data/plays-2025.json');
  if (!resp.ok) throw new Error(`Failed to load plays: ${resp.status}`);
  _currentSeason = await resp.json();
  return _currentSeason;
}

/**
 * Load all 3 seasons (~1MB gzip total). Call after initial render
 * to backfill historical data for season filters.
 */
export async function loadAllSeasons() {
  if (_allSeasons) return _allSeasons;
  const [p25, p24, p23] = await Promise.all([
    _currentSeason
      ? Promise.resolve(_currentSeason)
      : fetch('/data/plays-2025.json').then(r => r.json()),
    fetch('/data/plays-2024.json').then(r => r.json()),
    fetch('/data/plays-2023.json').then(r => r.json()),
  ]);
  _currentSeason = p25;
  _allSeasons = [...p23, ...p24, ...p25];
  return _allSeasons;
}
