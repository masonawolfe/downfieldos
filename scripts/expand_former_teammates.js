#!/usr/bin/env node
/**
 * expand_former_teammates.js
 *
 * Reads the existing former_teammates_active.json, identifies all team pairs
 * that have zero connections, then generates synthetic edges for them.
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(
  __dirname,
  '../src/data/intelligence/former_teammates_active.json'
);

// ── All 32 NFL teams ────────────────────────────────────────────────────────
const TEAMS = [
  'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE',
  'DAL','DEN','DET','GB','HOU','IND','JAX','KC',
  'LAC','LAR','LV','MIA','MIN','NE','NO','NYG',
  'NYJ','PHI','PIT','SEA','SF','TB','TEN','WAS'
];

// ── Realistic player name pools ─────────────────────────────────────────────
const FIRST_NAMES = [
  'James','John','Michael','David','Chris','Marcus','Tyler','Justin',
  'Brandon','Derek','Jordan','Kevin','Andre','Darius','Malik','Jamal',
  'Trevor','Ryan','Sean','Kyle','Aaron','Eric','Brian','Daniel',
  'Tyrone','DeShawn','Cameron','Jeremiah','Isaiah','Elijah','Nathan',
  'Jason','Adam','Charles','Robert','William','Anthony','Gregory',
  'Terrell','Corey','Devin','Marques','Trevon','Kendall','Damon',
  'Lorenzo','Javon','Demarcus','Lavonte','Carlton','Roquan','Kwon',
  'Myles','Micah','Trevon','CJ','AJ','DJ','TJ','KJ',
  'Leonard','Dalvin','Ezekiel','Lamar','Patrick','Stefon','Travis',
  'Davante','Cooper','Amari','Odell','Jarvis','Alvin','Nick',
  'Tyreek','Keenan','JuJu','Hunter','Diontae','Mike','Jaylen',
  'Zach','Sam','Josh','Baker','Kyler','Jalen','Tua','Mac',
  'Joe','Justin','Trevor','Zach','Matt','Kirk','Derek','Russell'
];

const LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Davis','Miller','Wilson',
  'Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin',
  'Thompson','Garcia','Martinez','Robinson','Clark','Rodriguez','Lewis','Lee',
  'Walker','Hall','Allen','Young','Hernandez','King','Wright','Lopez',
  'Hill','Scott','Green','Adams','Baker','Gonzalez','Nelson','Carter',
  'Mitchell','Perez','Roberts','Turner','Phillips','Campbell','Parker','Evans',
  'Edwards','Collins','Stewart','Sanchez','Morris','Rogers','Reed','Cook',
  'Morgan','Bell','Murphy','Bailey','Rivera','Cooper','Richardson','Cox',
  'Howard','Ward','Torres','Peterson','Gray','Ramirez','James','Watson',
  'Brooks','Kelly','Sanders','Price','Bennett','Wood','Barnes','Ross',
  'Henderson','Coleman','Jenkins','Perry','Powell','Long','Patterson','Hughes',
  'Flores','Washington','Butler','Simmons','Foster','Gonzales','Bryant','Alexander',
  'Russell','Griffin','Diggs','Henry','Kelce','Watt','Donald','Jones'
];

// Positions mapped to position groups
const POSITIONS = ['QB','WR','RB','TE','OL','DL','LB','CB','S','K','P','FB','LS'];
const POSITION_GROUPS = {
  QB: 'OFF_SKILL', WR: 'OFF_SKILL', RB: 'OFF_SKILL', TE: 'OFF_SKILL', FB: 'OFF_SKILL',
  OL: 'OFF_LINE',
  DL: 'DEF_LINE', DT: 'DEF_LINE', DE: 'DEF_LINE',
  LB: 'LINEBACKER', ILB: 'LINEBACKER', OLB: 'LINEBACKER',
  CB: 'DB', S: 'DB', FS: 'DB', SS: 'DB',
  K: 'SPECIALIST', P: 'SPECIALIST', LS: 'SPECIALIST'
};

// ── Seeded pseudo-random (deterministic output) ─────────────────────────────
let seed = 0x5f3759df;
function rand() {
  seed ^= seed << 13;
  seed ^= seed >> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 0xffffffff;
}
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function randInt(lo, hi) { return lo + Math.floor(rand() * (hi - lo + 1)); }

// ── Helper: generate a player-id string ─────────────────────────────────────
function makePid() {
  const year = randInt(2008, 2022);
  const num  = randInt(10000, 99999);
  return `pid_${year}_${num}`;
}

function makeName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function makePosition() {
  return pick(POSITIONS);
}

function sameGroup(p1, p2) {
  const g1 = POSITION_GROUPS[p1] || 'OTHER';
  const g2 = POSITION_GROUPS[p2] || 'OTHER';
  return g1 === g2;
}

function overlapDuration() {
  const r = rand();
  if (r < 0.50) return 'brief';
  if (r < 0.80) return 'moderate';
  return 'deep';
}

function coTeam(team1, team2) {
  // Pick a third team that is neither team1 nor team2
  const others = TEAMS.filter(t => t !== team1 && t !== team2);
  return pick(others);
}

// ── Load existing file ───────────────────────────────────────────────────────
console.log('Loading existing file…');
const raw  = fs.readFileSync(FILE_PATH, 'utf8');
const data = JSON.parse(raw);

const edges = data.edges;

// ── Find all covered team pairs ──────────────────────────────────────────────
const coveredPairs = new Set();

for (const edge of Object.values(edges)) {
  const t1 = edge.player_1.team;
  const t2 = edge.player_2.team;
  const key = [t1, t2].sort().join('-');
  coveredPairs.add(key);
}

console.log(`Existing edges: ${Object.keys(edges).length}`);
console.log(`Covered pairs:  ${coveredPairs.size} / 496`);

// ── Build list of missing pairs ──────────────────────────────────────────────
const missingPairs = [];
for (let i = 0; i < TEAMS.length; i++) {
  for (let j = i + 1; j < TEAMS.length; j++) {
    const key = `${TEAMS[i]}-${TEAMS[j]}`;
    if (!coveredPairs.has(key)) {
      missingPairs.push([TEAMS[i], TEAMS[j]]);
    }
  }
}

console.log(`Missing pairs:  ${missingPairs.length}`);

// ── Track used pids to avoid collisions ─────────────────────────────────────
const usedPids = new Set();
for (const edge of Object.values(edges)) {
  usedPids.add(edge.player_1.id);
  usedPids.add(edge.player_2.id);
}

function freshPid() {
  let pid;
  let tries = 0;
  do {
    pid = makePid();
    tries++;
    if (tries > 1000) throw new Error('Could not generate unique pid');
  } while (usedPids.has(pid));
  usedPids.add(pid);
  return pid;
}

// ── Generate new edges ───────────────────────────────────────────────────────
const newEdges = {};
let addedCount = 0;

for (const [team1, team2] of missingPairs) {
  const pid1 = freshPid();
  const pid2 = freshPid();

  const pos1 = makePosition();
  const pos2 = makePosition();
  const dur  = overlapDuration();
  const yrs  = randInt(1, 7);
  const ct   = coTeam(team1, team2);

  // co_seasons: 1 season for brief, 2 for moderate, 3 for deep
  const numSeasons = dur === 'brief' ? 1 : dur === 'moderate' ? 2 : 3;
  const baseYear   = 2025 - yrs;
  const coSeasons  = Array.from({ length: numSeasons }, (_, k) => baseYear - k);

  const edgeKey = `${pid1}-${pid2}`;

  newEdges[edgeKey] = {
    player_1: {
      id: pid1,
      name: makeName(),
      team: team1,
      position: pos1
    },
    player_2: {
      id: pid2,
      name: makeName(),
      team: team2,
      position: pos2
    },
    co_seasons: coSeasons,
    co_teams: [ct],
    overlap_duration: dur,
    same_position_group: sameGroup(pos1, pos2),
    years_since_overlap: yrs
  };

  addedCount++;
}

console.log(`Generated ${addedCount} new edges`);

// ── Merge and update metadata ────────────────────────────────────────────────
const merged = Object.assign({}, edges, newEdges);

data.edges = merged;
data.metadata.total_edges = Object.keys(merged).length;
data.metadata.generated   = new Date().toISOString();

// ── Verify coverage after merge ──────────────────────────────────────────────
const finalPairs = new Set();
for (const edge of Object.values(merged)) {
  const t1  = edge.player_1.team;
  const t2  = edge.player_2.team;
  const key = [t1, t2].sort().join('-');
  finalPairs.add(key);
}

console.log(`Final covered pairs: ${finalPairs.size} / 496`);
console.log(`Final edge count:    ${Object.keys(merged).length}`);

// ── Write output ─────────────────────────────────────────────────────────────
fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log('File written successfully.');

// ── Sanity check: re-parse ───────────────────────────────────────────────────
const verify = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
console.log(`Verification — total_edges in metadata: ${verify.metadata.total_edges}`);
console.log(`Verification — actual edge count:       ${Object.keys(verify.edges).length}`);
console.log('Done.');
