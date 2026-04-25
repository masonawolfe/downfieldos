import { DNA } from '../data/dna';
import { DNA_2026 } from '../data/dna2026';
import { RECORDS_2025 } from '../data/records2025';
import { tn, tnp } from './formatters';

export function teamSoWhat(tm, stats, bl) {
  const lines = [];
  const pg = stats.pr - bl.pr, sg = stats.sr - bl.sr, eg = stats.xr - bl.xr;
  if (pg > .10) lines.push(`${tn(tm)} are one of the most pass-happy teams in football. They throw it on nearly two-thirds of their plays — everyone in the building knows it's coming, and they dare you to stop it.`);
  else if (pg > .05) lines.push(`${tn(tm)} lean on the pass a bit more than most teams, but not to an extreme degree. They're willing to throw to set up the run.`);
  else if (pg < -.10) lines.push(`${tn(tm)} want to run the football. Period. They'll line up in heavy sets and try to impose their will physically. If you can't stop the run, you're not beating this team.`);
  else if (pg < -.05) lines.push(`${tn(tm)} tilt run-heavy compared to the league. They trust their ground game and use play-action off it.`);
  else lines.push(`${tn(tm)} are balanced — they'll run or throw based on the situation, which makes them harder to prepare for.`);
  if (sg > .06) lines.push(`They're also really efficient. They consistently gain positive yardage, stay ahead of the chains, and rarely put themselves in 3rd-and-long. That's the hallmark of a well-coached offense.`);
  else if (sg > .03) lines.push(`Their efficiency is solid — above average — meaning they generally stay on schedule and avoid obvious passing situations.`);
  else if (sg < -.06) lines.push(`The problem? They're not efficient. They fall behind the sticks constantly, which puts them in predictable 3rd-and-long situations where defenses can pin their ears back and rush.`);
  else if (sg < -.03) lines.push(`Their efficiency is a concern — they're slightly below the league floor, meaning they'll face more long-yardage situations than they'd like.`);
  else lines.push(`Efficiency-wise, they're right in the middle of the pack. Not elite, not broken.`);
  if (eg > .04) lines.push(`Here's what makes them scary: the explosive play rate. Any play could go for 20+ yards. You play single-high safety against this team, you're going to get burned.`);
  else if (eg > .02) lines.push(`They've got a decent big-play element — above average in explosive plays, which keeps defenses honest.`);
  else if (eg < -.03) lines.push(`What they lack is the home-run ball. Big plays are rare for this offense, which means they need long, sustained drives to score. If you're patient on defense and don't bust a coverage, you'll be fine.`);
  else lines.push(`Their explosive play rate is around average — they'll hit some chunk plays but won't consistently threaten deep.`);
  return lines.join("\n\n");
}

export function matchupPreview(offTm, defTm, oStats, dStats, bl) {
  const lines = [];
  lines.push(`## The Big Picture`);
  if (oStats.pr > .58 && dStats.dsr > bl.sr + .02) lines.push(`This is a mismatch that favors ${tn(offTm)}. Their offense wants to throw, and ${tnp(defTm)} defense has been getting carved up. Expect ${tn(offTm)} to attack early and often through the air.`);
  else if (oStats.pr > .58 && dStats.dsr < bl.sr - .02) lines.push(`Fascinating chess match. ${tn(offTm)} want to live in the air, but ${tnp(defTm)} defense is one of the stingiest. Something has to give.`);
  else if (oStats.pr < .48 && dStats.dxr < bl.xr - .02) lines.push(`${tn(offTm)} want to run and ${tn(defTm)} don't give up big plays. This projects as a low-scoring grind where field position and turnovers decide it.`);
  else lines.push(`Neither team has a dramatic schematic edge. This comes down to execution and individual matchup battles.`);
  if (oStats.xr > bl.xr + .02 && dStats.dxr > bl.xr + .02) lines.push(`\n## The Explosive Angle\n${tn(defTm)} has been giving up big plays at an alarming rate, and ${tn(offTm)} generates them. Expect at least 2-3 plays of 20+ yards.`);
  else if (oStats.xr > bl.xr + .02 && dStats.dxr < bl.xr - .01) lines.push(`\n## The Explosive Angle\n${tn(offTm)} lives on the big play, but ${tn(defTm)} almost never allows them. This is THE matchup to watch.`);
  return lines.join("\n");
}

export function scriptedPlaysPreview(tm, stats, roster) {
  const d = DNA[tm]; const lines = [];
  lines.push(`### ${tnp(tm)} Opening Script`);
  if (d.p > .58) {
    lines.push(`Expect 9-10 passes and 5-6 runs in the first 15. Quick-game concepts to get ${roster.offense.find(p => p.pos === "QB")?.name} in rhythm, 1-2 shot plays to ${roster.offense.find(p => p.pos === "WR1")?.name}, play-action on early downs.`);
  } else if (d.p < .48) {
    lines.push(`Heavy run early — 9-10 runs and 5-6 passes. Inside zone and power with ${roster.offense.find(p => p.pos === "RB1")?.name}, play-action shots off run-action.`);
  } else {
    lines.push(`Balanced script — 7-8 pass / 7-8 run split. Mix of zone runs and quick passes to test what the defense gives them.`);
  }
  if (stats.sr > .48) lines.push(`They're efficient enough that scripted drives usually result in 1-2 first downs.`);
  else lines.push(`Efficiency has been below average — if you force a 3-and-out on the opening drive, you set the tone.`);
  return lines.join("\n");
}

// Build verdict text given offensive player, defender, scenario, and team codes.
// Tighter thresholds: > 6 = clear advantage, 3-6 = edge, -3 to 3 = even.
function verdictFor(off, def, scenario, offTm, defTm) {
  const edge = off.rating - def.rating;
  if (edge > 8) return `${scenario}: big advantage ${offTm}. ${off.name} should win this rep most of the time.`;
  if (edge > 3) return `${scenario}: ${off.name} has the edge. Expect targets/touches when this matchup is on the field.`;
  if (edge < -8) return `${scenario}: clear advantage ${defTm}. ${def.name} can erase ${off.name} on islands.`;
  if (edge < -3) return `${scenario}: ${def.name} has the edge. Forces ${offTm} to scheme ${off.name} open.`;
  return `${scenario}: even matchup. Comes down to leverage, technique, and play call.`;
}

export function playerMatchupSummary(offRoster, defRoster, offTm, defTm) {
  const unknown = { name: "TBD", grade: "TBD", rating: 65, trait: "Unknown", pos: "?" };
  const findOff = pos => offRoster.offense.find(p => p.pos === pos) || unknown;
  const findDef = pos => defRoster.defense.find(p => p.pos === pos) || unknown;
  const isReal = p => p && p !== unknown && p.name !== "TBD";

  // Resolve all defenders we might need
  const cb1 = findDef("CB1"), cb2 = findDef("CB2"), cb3 = findDef("CB3");
  const scb = findDef("SCB");
  const ss = findDef("SS"), fs = findDef("FS");
  const lb1 = findDef("LB1"), lb2 = findDef("LB2"), lb3 = findDef("LB3");
  const edge1 = findDef("EDGE1"), edge2 = findDef("EDGE2"), edge3 = findDef("EDGE3");
  const dt1 = findDef("DT1"), dt2 = findDef("DT2");

  // Helper: build alternates list, filtering to real players
  const alts = (arr) => arr.filter(a => isReal(a.def));

  const matchups = [];

  // --- WR1: outside, but can shift inside / draw safety help ---
  const wr1 = findOff("WR1");
  if (isReal(wr1)) matchups.push({
    key: "wr1",
    label: `WR1`,
    off: wr1,
    alternates: alts([
      { def: cb1, scenario: `vs CB1 (outside) — base man coverage` },
      { def: cb2, scenario: `vs CB2 (outside) — when sides flip` },
      { def: scb, scenario: `vs Slot CB — when motioned inside` },
      { def: fs, scenario: `vs FS — over-the-top help on go routes` },
      { def: ss, scenario: `vs SS — bracket coverage / red zone` },
    ]),
  });

  // --- WR2 ---
  const wr2 = findOff("WR2");
  if (isReal(wr2)) matchups.push({
    key: "wr2",
    label: `WR2`,
    off: wr2,
    alternates: alts([
      { def: cb2, scenario: `vs CB2 — base outside matchup` },
      { def: cb1, scenario: `vs CB1 — when defense shadows WR1 elsewhere` },
      { def: scb, scenario: `vs Slot CB — on motion or stack releases` },
      { def: fs, scenario: `vs FS — deep zone responsibility` },
    ]),
  });

  // --- WR3 / Slot ---
  const wr3 = findOff("WR3");
  if (isReal(wr3)) matchups.push({
    key: "wr3",
    label: `Slot WR (WR3)`,
    off: wr3,
    alternates: alts([
      { def: scb, scenario: `vs Slot CB — primary slot matchup` },
      { def: cb2, scenario: `vs CB2 — bumped outside on 3WR sets` },
      { def: lb2, scenario: `vs LB — option route in zone` },
      { def: ss, scenario: `vs SS — seam routes / Big nickel` },
    ]),
  });

  // --- TE ---
  const te = findOff("TE");
  if (isReal(te)) matchups.push({
    key: "te",
    label: `TE`,
    off: te,
    alternates: alts([
      { def: ss, scenario: `vs SS — base TE coverage` },
      { def: lb1, scenario: `vs MIKE LB — short/intermediate seams` },
      { def: lb2, scenario: `vs WILL LB — checkdowns and flat routes` },
      { def: fs, scenario: `vs FS — deep crossers and posts` },
      { def: scb, scenario: `vs Slot CB — when split out wide` },
    ]),
  });

  // --- RB1: faces LBs in run game, slot CBs/safeties in space ---
  const rb = findOff("RB1");
  if (isReal(rb)) matchups.push({
    key: "rb",
    label: `RB1`,
    off: rb,
    alternates: alts([
      { def: lb1, scenario: `vs MIKE LB — run-game fits and checkdowns` },
      { def: lb2, scenario: `vs WILL LB — outside zone pursuit` },
      { def: ss, scenario: `vs SS — wheel routes and screens` },
      { def: scb, scenario: `vs Slot CB — angle routes from the backfield` },
      { def: edge1, scenario: `vs EDGE — pass protection assignment` },
    ]),
  });

  // --- LT ---
  const lt = findOff("LT");
  if (isReal(lt)) matchups.push({
    key: "lt",
    label: `LT`,
    off: lt,
    alternates: alts([
      { def: edge1, scenario: `vs EDGE1 — primary blindside protection` },
      { def: edge2, scenario: `vs EDGE2 — when EDGE1 lines up away` },
      { def: dt1, scenario: `vs DT — interior stunts and games` },
    ]),
  });

  // --- RT ---
  const rt = findOff("RT");
  if (isReal(rt)) matchups.push({
    key: "rt",
    label: `RT`,
    off: rt,
    alternates: alts([
      { def: edge2, scenario: `vs EDGE2 — base right-side protection` },
      { def: edge1, scenario: `vs EDGE1 — when defense flips alignment` },
      { def: dt2, scenario: `vs DT — interior stunts` },
    ]),
  });

  // Backfill verdicts for the default (first alternate) so legacy callers keep working
  return matchups.map(m => {
    const first = m.alternates[0];
    return {
      ...m,
      // legacy shape expected by prepSheet.js etc.
      def: first ? first.def : unknown,
      verdict: first ? verdictFor(m.off, first.def, first.scenario, offTm, defTm) : "",
    };
  });
}

// Compute the verdict for a specific selected alternate. Used by the UI on pivot.
export function verdictForMatchup(off, def, scenario, offTm, defTm) {
  return verdictFor(off, def, scenario, offTm, defTm);
}

export function frontOfficeAssessment(tm, stats, bl) {
  const rec = RECORDS_2025[tm] || { w: 0, l: 0 };
  const dna = DNA_2026[tm] || {};
  const wins = rec.w, losses = rec.l;
  const lines = [];

  // Record context
  if (wins >= 12) lines.push(`This front office is working from a position of strength. ${tn(tm)} finished ${wins}-${losses} — a legitimate contender. The offseason question isn't "how do we get better?" — it's "how do we stay on top without overpaying?"`);
  else if (wins >= 9) lines.push(`${tn(tm)} were competitive at ${wins}-${losses}, but not dominant. This is the trickiest spot in football — good enough to see the path, not good enough to assume it's there. Every move has to be targeted.`);
  else if (wins >= 6) lines.push(`At ${wins}-${losses}, ${tn(tm)} are in no-man's land. Not bad enough for a top draft pick, not good enough to feel good about the direction. This offseason is about finding an identity.`);
  else lines.push(`A ${wins}-${losses} season demands honest self-assessment. ${tn(tm)} are in rebuild territory whether they admit it or not. The priority is accumulating young talent and draft capital, not chasing free agents.`);

  // Archetype / identity direction
  if (dna.s) lines.push(`\nThe 2026 identity: "${dna.s}." That's the front office's bet — everything they did in free agency and the draft points this direction.`);

  // Roster efficiency lens
  const sg = stats.sr - bl.sr;
  if (sg > .04) lines.push(`\nThe roster IS producing. Offensive efficiency is well above league average, which means the scheme and personnel are aligned. Don't blow this up — surgical additions only.`);
  else if (sg < -.04) lines.push(`\nThe hard truth: this roster underperformed schematically. Offensive efficiency was below the floor. Either the talent doesn't fit the scheme, or the scheme doesn't fit the talent. Something structural has to change.`);

  // Cap/draft positioning
  if (wins <= 5) lines.push(`\nWith a top-10 pick, the draft board matters more than free agency. This is a year to build the foundation, not paper over cracks.`);
  else if (wins >= 12) lines.push(`\nPicking late means the draft is about depth and development, not difference-makers. Free agency and trades are how you upgrade from here.`);

  return lines.join("\n");
}

export function gmVoice(tm, stats, bl, needs) {
  const lines = [`*If I'm sitting in ${tnp(tm)} war room right now:*`];
  needs.forEach(n => {
    if (n.severity === "High") lines.push(`\n**"We have to fix ${n.weakness.toLowerCase()}."** Not optional. I'm looking at ${n.need.toLowerCase()} in the first two rounds — a ${n.archetype.toLowerCase()}.`);
    else if (n.severity === "Medium") lines.push(`\n**"${n.weakness} needs attention."** If the right ${n.need.toLowerCase()} falls on Day 2, we jump.`);
    else lines.push(`\n**"We're in good shape."** Best player available. ${n.archetype}`);
  });
  return lines.join("\n");
}

export function genNeeds(tm, stats, bl) {
  const needs = [];
  if (stats.xr < bl.xr - .02) needs.push({ weakness: "Low explosive play rate", need: "Speed WR or playmaker", archetype: "Vertical WR with 4.4 speed, or home-run RB", severity: "High" });
  if (stats.sr < bl.sr - .03) needs.push({ weakness: "Below-average efficiency", need: "OL upgrade or scheme-fit QB", archetype: "Interior OL with elite run-blocking, or high-accuracy QB", severity: "High" });
  if (stats.pr > bl.pr + .05 && stats.sr < bl.sr) needs.push({ weakness: "Over-reliance on passing", need: "Reliable RB or blocking TE", archetype: "Between-the-tackles RB with power", severity: "Medium" });
  if (stats.dsr > bl.sr + .03) needs.push({ weakness: "Defense allowing high success rate", need: "EDGE or LB", archetype: "Disruptive EDGE with 15%+ pressure rate", severity: "High" });
  if (stats.dxr > bl.xr + .02) needs.push({ weakness: "Giving up too many big plays", need: "Ballhawk safety or press corner", archetype: "Single-high FS with ball skills", severity: "Medium" });
  if (needs.length === 0) needs.push({ weakness: "No major structural flaws", need: "Best player available", archetype: "Depth at premium positions (EDGE, OT, CB)", severity: "Low" });
  return needs;
}
