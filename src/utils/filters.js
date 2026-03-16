export const DEFAULT_FILTERS = {
  season: "all", weekMin: 1, weekMax: 18,
  down: "all", distBucket: "all",
  fpZone: "all", quarter: "all",
  homeAway: "all", env: "all",
  twoMin: false, redZone: false,
  scoreDiff: "all", pers: "all"
};

export function applyFilters(plays, f) {
  return plays.filter(p => {
    if (f.season !== "all" && p.season !== Number(f.season)) return false;
    if (p.week < f.weekMin || p.week > f.weekMax) return false;
    if (f.down !== "all" && p.down !== Number(f.down)) return false;
    if (f.distBucket !== "all") {
      if (f.distBucket === "short" && p.ytg > 3) return false;
      if (f.distBucket === "medium" && (p.ytg <= 3 || p.ytg > 7)) return false;
      if (f.distBucket === "long" && p.ytg <= 7) return false;
    }
    if (f.fpZone !== "all") {
      if (f.fpZone === "own" && p.fp > 50) return false;
      if (f.fpZone === "mid" && (p.fp <= 50 || p.fp > 80)) return false;
      if (f.fpZone === "rz" && p.fp < 80) return false;
    }
    if (f.quarter !== "all" && p.q !== Number(f.quarter)) return false;
    if (f.homeAway !== "all" && p.ha !== f.homeAway) return false;
    if (f.env !== "all" && p.env !== f.env) return false;
    if (f.twoMin && !p.twoMin) return false;
    if (f.redZone && !p.rz) return false;
    if (f.scoreDiff !== "all") {
      if (f.scoreDiff === "winning" && p.scoreDiff <= 0) return false;
      if (f.scoreDiff === "losing" && p.scoreDiff >= 0) return false;
      if (f.scoreDiff === "close" && Math.abs(p.scoreDiff) > 7) return false;
      if (f.scoreDiff === "blowout" && Math.abs(p.scoreDiff) <= 14) return false;
    }
    if (f.pers !== "all" && p.pers !== f.pers) return false;
    return true;
  });
}
