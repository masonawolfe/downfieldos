// P1-2 — survival probability model.
//
// The only question a drafter actually has at every pick is "who will still be
// here when I pick again?" Rankings don't answer it. This does. Rankings can be
// scraped; survival probability is computed from the live state of one specific
// room — different for every league, slot, and minute. Cannot be pre-published
// or copied.
//
// Three components as described in FANTASY_ENGINE_BUILD_PLAN.md P1-2:
//   1. Roster-needs tracking by draft SLOT (snake determinism → no manager IDs
//      needed).
//   2. Manager archetype classification per slot (autodrafter, reacher, homer,
//      needs-based).
//   3. Run detection — 3 of the last 5 picks in one position spikes the odds
//      of the next 2 being the same.
//
// Input:  { picks, userSlot, teamCount, roster (optional), universe (optional) }
// Output: for each undrafted candidate, a survival probability to the user's
// NEXT pick, plus the top predicted picker for each and their pick number.

// ─── Snake mechanics ────────────────────────────────────────────────────────

// Given a pick number (1-indexed) and team count, return the slot number
// (1-indexed) that owns that pick.
export function slotForPick(pickNumber, teamCount) {
  const round = Math.floor((pickNumber - 1) / teamCount) + 1;
  const idxInRound = ((pickNumber - 1) % teamCount) + 1;
  return round % 2 === 1 ? idxInRound : teamCount - idxInRound + 1;
}

// Given a slot and team count, return all the pick numbers that slot will
// own across `rounds` rounds.
export function picksForSlot(slot, teamCount, rounds = 20) {
  const out = [];
  for (let r = 1; r <= rounds; r++) {
    const pickInRound = r % 2 === 1 ? slot : teamCount - slot + 1;
    out.push((r - 1) * teamCount + pickInRound);
  }
  return out;
}

// ─── Roster templates ──────────────────────────────────────────────────────
// Standard snake redraft template. Consumer can override.
export const DEFAULT_ROSTER = {
  QB: { starters: 1, cap: 3 },
  RB: { starters: 2, cap: 6, flex: true },
  WR: { starters: 3, cap: 7, flex: true },
  TE: { starters: 1, cap: 3, flex: true },
  K:  { starters: 1, cap: 1 },
  DEF:{ starters: 1, cap: 2 },
};

// ─── Slot state — what each slot has drafted so far ────────────────────────

function buildSlotRosters(picks, teamCount) {
  // slot -> { picks: [pick], byPos: {POS: count}, teamsPicked: {team: count} }
  const rosters = {};
  for (let s = 1; s <= teamCount; s++) {
    rosters[s] = { slot: s, picks: [], byPos: {}, teamsPicked: {} };
  }
  for (const p of picks) {
    const slot = slotForPick(p.pickNumber, teamCount);
    const r = rosters[slot];
    r.picks.push(p);
    r.byPos[p.position] = (r.byPos[p.position] || 0) + 1;
    if (p.team) r.teamsPicked[p.team] = (r.teamsPicked[p.team] || 0) + 1;
  }
  return rosters;
}

// ─── Archetype classification ──────────────────────────────────────────────
//
// After a few picks per slot, classify their behavior. Higher confidence
// after round 3.

export function classifyArchetype(slotRoster, universeByAdp) {
  const picks = slotRoster.picks;
  if (picks.length < 2) return { archetype: 'unknown', confidence: 0.2 };

  let onAdpCount = 0;
  let reachCount = 0;
  let teamHomerCount = 0;
  let biggestTeam = { team: null, count: 0 };

  for (const [team, count] of Object.entries(slotRoster.teamsPicked)) {
    if (count > biggestTeam.count) biggestTeam = { team, count };
  }

  for (const p of picks) {
    // "On ADP" = picked within 5 of their expected ADP position (universe index).
    const idx = universeByAdp?.findIndex(u => u.name === p.name);
    if (idx != null && idx >= 0) {
      const diff = p.pickNumber - (idx + 1);
      if (Math.abs(diff) <= 5) onAdpCount++;
      else if (diff < -10) reachCount++;
    }
    if (biggestTeam.team && p.team === biggestTeam.team) teamHomerCount++;
  }

  const n = picks.length;
  const onAdpRate = onAdpCount / n;
  const reachRate = reachCount / n;
  const homerRate = biggestTeam.count / n;

  if (onAdpRate >= 0.75) return { archetype: 'autodrafter', confidence: 0.7 + (n / 30), meta: { onAdpRate } };
  if (homerRate >= 0.6 && biggestTeam.count >= 2) return { archetype: 'homer', confidence: 0.6, meta: { team: biggestTeam.team } };
  if (reachRate >= 0.3) return { archetype: 'reacher', confidence: 0.55, meta: { reachRate } };
  return { archetype: 'needs-based', confidence: 0.5, meta: { onAdpRate, reachRate } };
}

// ─── Roster need score ─────────────────────────────────────────────────────
//
// For a slot, how BADLY do they need position X? 1.0 = critical, 0.0 = full.

export function needScore(slotRoster, position, roster = DEFAULT_ROSTER) {
  const template = roster[position];
  if (!template) return 0;
  const have = slotRoster.byPos[position] || 0;
  if (have >= template.cap) return 0;
  const startersLeft = Math.max(0, template.starters - have);
  const capLeft = template.cap - have;
  // Heavier weight on starters remaining. A team needing 1 more starting RB
  // scores ~0.8; a team already starter-full but with a bench slot scores ~0.3.
  return 0.5 * (startersLeft / Math.max(1, template.starters)) + 0.5 * (capLeft / template.cap);
}

// ─── Run detection ─────────────────────────────────────────────────────────
//
// A "run" = 3+ of the last 5 picks in a single position. Boosts the odds the
// NEXT picker also takes that position (herd behavior).

export function detectRun(picks, windowSize = 5) {
  if (picks.length < 3) return null;
  const recent = picks.slice(-windowSize);
  const counts = {};
  for (const p of recent) counts[p.position] = (counts[p.position] || 0) + 1;
  let topPos = null, topCount = 0;
  for (const [pos, c] of Object.entries(counts)) {
    if (c > topCount) { topPos = pos; topCount = c; }
  }
  if (topCount >= 3) return { position: topPos, count: topCount, windowSize };
  return null;
}

// ─── The core survival model ───────────────────────────────────────────────

// candidates: array of undrafted players (each with name, position, team,
//             rating or adp — whichever is available).
// picksBeforeMe: array of pick NUMBERS between now and user's next pick.
// slotRosters: precomputed slot state.
// archetypes: precomputed archetype per slot.
// run: current run info (or null).
//
// Returns candidates with a `survival` field ∈ [0,1] and a `topTaker` object
// naming the slot most likely to grab them.

function candidateAppeal(candidate, slot, slotRoster, archetype, universeByAdp, run) {
  const need = needScore(slotRoster, candidate.position);
  // Base appeal: how highly rated is this candidate relative to the pool?
  const adpIdx = universeByAdp?.findIndex(u => u.name === candidate.name);
  const rank = adpIdx >= 0 ? adpIdx : 200;
  const baseAppeal = Math.max(0, 1 - rank / 100);        // top-100 concentrated

  let appeal = baseAppeal;
  switch (archetype.archetype) {
    case 'autodrafter':
      // Pure top-rated available; ignore need.
      appeal = baseAppeal * 1.3;
      break;
    case 'needs-based':
      // Multiplicative — position must fit the hole to be attractive.
      appeal = baseAppeal * (0.4 + need * 1.4);
      break;
    case 'reacher':
      // Cast a wider net; weaker connection to ADP.
      appeal = baseAppeal * 0.7 + 0.2 * Math.random();
      break;
    case 'homer':
      // Boost if candidate is on the picker's favorite team.
      appeal = baseAppeal * (candidate.team === archetype.meta?.team ? 1.6 : 0.9);
      break;
    default:
      appeal = baseAppeal * (0.6 + need * 0.6);
  }

  // Run boost — if 3-of-5 recent picks were this position, next picker
  // ~30% more likely to take it too.
  if (run && candidate.position === run.position) appeal *= 1.3;

  return Math.max(0, appeal);
}

export function survivalProbabilities({
  picks,
  userSlot,
  teamCount,
  currentPickNumber, // 1-indexed pick number that's ABOUT to be made
  universe,          // ordered array of all draftable players (index ≈ ADP rank)
  roster = DEFAULT_ROSTER,
  rounds = 20,
}) {
  // 1. Slot state
  const slotRosters = buildSlotRosters(picks, teamCount);
  const universeByAdp = universe || [];

  // 2. Archetype per slot
  const archetypes = {};
  for (let s = 1; s <= teamCount; s++) archetypes[s] = classifyArchetype(slotRosters[s], universeByAdp);

  // 3. Run
  const run = detectRun(picks);

  // 4. User's next pick number
  const userPicks = picksForSlot(userSlot, teamCount, rounds);
  const nextUserPick = userPicks.find(pn => pn >= currentPickNumber);
  if (nextUserPick == null) return { candidates: [], meta: { note: 'user has no more picks' } };

  // 5. Picks between now and next user pick (exclusive of user's pick)
  const interveningPicks = [];
  for (let pn = currentPickNumber; pn < nextUserPick; pn++) {
    interveningPicks.push({ pickNumber: pn, slot: slotForPick(pn, teamCount) });
  }

  // 6. Undrafted candidates
  const drafted = new Set(picks.map(p => p.name));
  const candidates = universe.filter(u => !drafted.has(u.name));

  // 7. For each intervening pick, allocate a soft probability across candidates.
  //    We compute per-slot appeals, softmax them into a probability distribution
  //    (with a small floor for the tail), then treat each pick as an independent
  //    sample from that distribution.
  const softmaxTemp = 6;
  const survivals = new Map(candidates.map(c => [c.name, 1]));
  const topTakerByCandidate = new Map();

  for (const ip of interveningPicks) {
    const slotRoster = slotRosters[ip.slot];
    const archetype = archetypes[ip.slot];
    // Score every remaining candidate for this slot.
    const scored = candidates
      .filter(c => survivals.get(c.name) > 0.01)
      .map(c => ({ c, appeal: candidateAppeal(c, ip.slot, slotRoster, archetype, universeByAdp, run) }));
    const maxAppeal = Math.max(...scored.map(s => s.appeal), 0.0001);
    let denom = 0;
    for (const s of scored) {
      s.weight = Math.exp(softmaxTemp * (s.appeal - maxAppeal));
      denom += s.weight;
    }
    for (const s of scored) {
      const pTaken = s.weight / denom;
      const surviving = survivals.get(s.c.name);
      survivals.set(s.c.name, surviving * (1 - pTaken));
      const cur = topTakerByCandidate.get(s.c.name);
      if (!cur || pTaken > cur.p) {
        topTakerByCandidate.set(s.c.name, { slot: ip.slot, pick: ip.pickNumber, p: pTaken });
      }
    }
  }

  // Preserve ADP order — that's how a drafter reads a board. Survival is a
  // COLUMN on the ADP list, not a sort key. The caller can re-sort if they
  // want a different lens (e.g., "who's most likely to fall to me").
  const output = candidates.map(c => ({
    ...c,
    survival: survivals.get(c.name),
    topTaker: topTakerByCandidate.get(c.name) || null,
  }));

  return {
    candidates: output,
    meta: {
      currentPickNumber,
      nextUserPick,
      interveningPickCount: interveningPicks.length,
      archetypes,
      run,
      teamCount,
      userSlot,
    },
  };
}
