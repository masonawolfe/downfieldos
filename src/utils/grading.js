export function calcMatchupGrade(oStats, dStats, bl) {
  const edge = (oStats.sr - dStats.dsr) + (oStats.xr - dStats.dxr) * 3;
  if (edge > 0.08) return "A+";
  if (edge > 0.05) return "A";
  if (edge > 0.02) return "B+";
  if (edge > -0.02) return "B";
  if (edge > -0.05) return "C";
  if (edge > -0.08) return "D";
  return "F";
}
