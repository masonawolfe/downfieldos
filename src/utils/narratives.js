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

export function playerMatchupSummary(offRoster, defRoster, offTm, defTm) {
  const matchups = [];
  const unknown = { name: "TBD", grade: "TBD", rating: 65, trait: "Unknown", pos: "?" };
  const findOff = pos => offRoster.offense.find(p => p.pos === pos) || unknown;
  const findDef = pos => defRoster.defense.find(p => p.pos === pos) || unknown;

  const wr1 = findOff("WR1"), cb1 = findDef("CB1");
  const e1 = wr1.rating - cb1.rating;
  matchups.push({ off: wr1, def: cb1, label: "WR1 vs CB1", verdict: e1 > 10 ? `Big advantage ${offTm}. ${wr1.name} should feast.` : e1 < -10 ? `Advantage ${defTm}. ${cb1.name} can lock this down.` : `Coin-flip. Individual execution decides it.` });

  const wr2 = findOff("WR2"), cb2 = findDef("CB2");
  matchups.push({ off: wr2, def: cb2, label: "WR2 vs CB2", verdict: wr2.rating - cb2.rating > 8 ? `Exploitable matchup for the offense.` : `Relatively even.` });

  const wr3 = findOff("WR3"), scb = findDef("SCB");
  matchups.push({ off: wr3, def: scb, label: "Slot Battle", verdict: wr3.rating > scb.rating + 5 ? `Slot is where this offense creates separation.` : `Slot is locked down.` });

  const rb = findOff("RB1"), lb = findDef("LB1");
  matchups.push({ off: rb, def: lb, label: "RB vs LB", verdict: rb.rating > lb.rating + 5 ? `${rb.name} has the edge in the run game and checkdowns.` : `${lb.name} can match up. Run game won't come easy.` });

  const lt = findOff("LT"), edge1 = findDef("EDGE1");
  matchups.push({ off: lt, def: edge1, label: "LT vs EDGE1", verdict: lt.rating >= edge1.rating ? `QB should have time.` : `${edge1.name} is going to be a problem. Expect quick passes.` });

  const rt = findOff("RT"), edge2 = findDef("EDGE2");
  matchups.push({ off: rt, def: edge2, label: "RT vs EDGE2", verdict: rt.rating >= edge2.rating ? `Solid protection.` : `Another pressure point.` });

  const te = findOff("TE"), ss = findDef("SS");
  matchups.push({ off: te, def: ss, label: "TE vs Safety", verdict: te.trait === "Receiving TE" && te.rating > ss.rating ? `${te.name} is a weapon. Matchup to exploit.` : `Handled. TE is more blocker than threat.` });

  return matchups;
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
