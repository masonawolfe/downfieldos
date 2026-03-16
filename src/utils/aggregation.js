export function agg(plays, tm) {
  const o = plays.filter(p => p.off === tm), d = plays.filter(p => p.def === tm), t = o.length || 1;
  const passes = o.filter(p => p.type === "Pass");
  const completions = passes.filter(p => p.complete === true);
  return {
    n: o.length, pr: passes.length / t, sr: o.filter(p => p.isS).length / t,
    xr: o.filter(p => p.isX).length / t, ay: o.reduce((s, p) => s + p.yd, 0) / t,
    dsr: d.length ? d.filter(p => p.isS).length / d.length : 0,
    dxr: d.length ? d.filter(p => p.isX).length / d.length : 0,
    dpr: d.length ? d.filter(p => p.type === "Pass").length / d.length : 0,
    compRate: passes.length ? completions.length / passes.length : 0,
    sackRate: passes.length ? passes.filter(p => p.isSack).length / passes.length : 0,
    dn: d.length
  };
}

export function lgbl(plays) {
  const t = plays.length || 1;
  const passes = plays.filter(p => p.type === "Pass");
  return {
    pr: passes.length / t, sr: plays.filter(p => p.isS).length / t,
    xr: plays.filter(p => p.isX).length / t, ay: plays.reduce((s, p) => s + p.yd, 0) / t,
    compRate: passes.length ? passes.filter(p => p.complete === true).length / passes.length : 0
  };
}
