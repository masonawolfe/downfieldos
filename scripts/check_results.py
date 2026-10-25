#!/usr/bin/env python3
# MIRROR (2026-10-25): the canonical copy is 01_Schuhbox/DFOS/bin/check_results.py in
# Mason's operating-system folder (the DFOS-Editor's gate). This copy exists so the cloud
# Tuesday drafter, which only has this public repo, can run the same gate on its draft:
#   python3 scripts/check_results.py <issue>.md 2026 <week> --games games.csv
# Keep the two byte-identical below this header; refresh this one when bin/ changes.
"""check_results.py: gate every printed score in a Tendency Report issue against nflverse.

Usage
    python3 check_results.py ISSUE [SEASON WEEK] [--games games.csv] [--skim]
    python3 check_results.py --selftest

ISSUE is the issue's .md or .html file. SEASON and WEEK default to the numbers in a
filename like tendency-report-2026-w06.md. The script downloads nflverse games.csv
(https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv) unless
--games names a local copy. Standard library only.

What it does
    Finds every printed N-M (and N-M-T) in the copy, decides whether it is a final
    score, an in-game score, a record or an aggregate, and for every final score:

    1. matches it to that week's game, or to the earlier game the sentence names
       ("in Week 1", "last week", "last season", "in 2025"), and fails if the score
       is not that game's final score;
    2. fails if the sentence does not name the winning team (a pronoun counts only
       when the sentence before it names the winner first; a quarterback or coach
       alone does not count);
    3. fails if the loser is named before the winner (teams by name, and starting
       quarterbacks and head coaches from games.csv, count as mentions);
    4. fails if the result sits in a passive sentence ("was outgained by the
       Giants and won") or is attached with "and won" / "and lost" to a clause whose
       nearest team is the other side ("gained 186 yards to Indianapolis' 399 and
       won");
    5. fails if the result is told from the loser's side ("lost 34-31", "a 25-14
       home loss"): STYLE_GUIDE rule (a), the winner is the subject;
    6. fails if a verb says the wrong team won ("The Giants beat New Orleans 34-27")
       or names the wrong opponent.

    Present-tense records ("Pittsburgh is 4-2") are checked against nflverse too.
    Prints a table of every N-M found with its verdict, then one
    "path:line: FAIL ..." line per failure.

Exit codes
    0  every final score passes
    1  at least one FAIL
    2  could not run (file unreadable, games.csv unavailable, week not in the data)

Added 2026-10-20 after Week 6 printed "New Orleans was outgained 461 to 319 by the
Giants and won 34-27" and a reader took the Giants for the winner. See
00_System/Roles/DFOS-Editor/STYLE_GUIDE.md, rules dated 2026-10-20.
"""

import argparse
import csv
import html as htmllib
import io
import os
import re
import sys
import urllib.request

GAMES_URL = "https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv"

# ---------------------------------------------------------------- teams

TEAMS = {
    "ARI": ("Arizona", ["Arizona Cardinals", "Arizona", "Cardinals"]),
    "ATL": ("Atlanta", ["Atlanta Falcons", "Atlanta", "Falcons"]),
    "BAL": ("Baltimore", ["Baltimore Ravens", "Baltimore", "Ravens"]),
    "BUF": ("Buffalo", ["Buffalo Bills", "Buffalo", "Bills"]),
    "CAR": ("Carolina", ["Carolina Panthers", "Carolina", "Panthers"]),
    "CHI": ("Chicago", ["Chicago Bears", "Chicago", "Bears"]),
    "CIN": ("Cincinnati", ["Cincinnati Bengals", "Cincinnati", "Bengals"]),
    "CLE": ("Cleveland", ["Cleveland Browns", "Cleveland", "Browns"]),
    "DAL": ("Dallas", ["Dallas Cowboys", "Dallas", "Cowboys"]),
    "DEN": ("Denver", ["Denver Broncos", "Denver", "Broncos"]),
    "DET": ("Detroit", ["Detroit Lions", "Detroit", "Lions"]),
    "GB": ("Green Bay", ["Green Bay Packers", "Green Bay", "Packers"]),
    "HOU": ("Houston", ["Houston Texans", "Houston", "Texans"]),
    "IND": ("Indianapolis", ["Indianapolis Colts", "Indianapolis", "Colts"]),
    "JAX": ("Jacksonville", ["Jacksonville Jaguars", "Jacksonville", "Jaguars", "Jags"]),
    "KC": ("Kansas City", ["Kansas City Chiefs", "Kansas City", "Chiefs"]),
    "LA": ("the Rams", ["Los Angeles Rams", "L.A. Rams", "LA Rams", "Rams"]),
    "LAC": ("the Chargers", ["Los Angeles Chargers", "L.A. Chargers", "LA Chargers", "Chargers"]),
    "LV": ("Las Vegas", ["Las Vegas Raiders", "Las Vegas", "Raiders"]),
    "MIA": ("Miami", ["Miami Dolphins", "Miami", "Dolphins"]),
    "MIN": ("Minnesota", ["Minnesota Vikings", "Minnesota", "Vikings"]),
    "NE": ("New England", ["New England Patriots", "New England", "Patriots", "Pats"]),
    "NO": ("New Orleans", ["New Orleans Saints", "New Orleans", "Saints"]),
    "NYG": ("the Giants", ["New York Giants", "Giants"]),
    "NYJ": ("the Jets", ["New York Jets", "Jets"]),
    "PHI": ("Philadelphia", ["Philadelphia Eagles", "Philadelphia", "Eagles"]),
    "PIT": ("Pittsburgh", ["Pittsburgh Steelers", "Pittsburgh", "Steelers"]),
    "SEA": ("Seattle", ["Seattle Seahawks", "Seattle", "Seahawks"]),
    "SF": ("San Francisco", ["San Francisco 49ers", "San Francisco", "49ers", "Niners"]),
    "TB": ("Tampa Bay", ["Tampa Bay Buccaneers", "Tampa Bay", "Buccaneers", "Bucs"]),
    "TEN": ("Tennessee", ["Tennessee Titans", "Tennessee", "Titans"]),
    "WAS": ("Washington", ["Washington Commanders", "Washington", "Commanders"]),
}
AMBIGUOUS = {"Los Angeles": {"LA", "LAC"}, "L.A.": {"LA", "LAC"}, "New York": {"NYG", "NYJ"}}
LEGACY = {"OAK": "LV", "SD": "LAC", "STL": "LA", "LAR": "LA", "WSH": "WAS", "JAC": "JAX"}

ALIAS_TO_TEAMS = {}
for _abbr, (_short, _aliases) in TEAMS.items():
    for _a in _aliases:
        ALIAS_TO_TEAMS[_a] = {_abbr}
ALIAS_TO_TEAMS.update(AMBIGUOUS)
ALIAS_RE = re.compile(
    r"(?<![\w.])(" + "|".join(re.escape(a) for a in sorted(ALIAS_TO_TEAMS, key=len, reverse=True)) + r")(?!\w)"
)


def tname(abbr):
    return TEAMS[abbr][0] if abbr in TEAMS else abbr


# ---------------------------------------------------------------- vocabulary

SCORE_RE = re.compile(r"(?<![\w\-–.,$/:])(\d{1,3})[-–](\d{1,3})(?:[-–](\d{1,3}))?(?![\w\-–/%])")
WORD_RE = re.compile(r"[A-Za-z0-9’']+")

WIN_VERBS = {"won", "beat", "beats", "beating", "edged", "edges", "topped", "tops",
             "routed", "blanked", "downed", "outlasted", "survived", "stunned", "upset", "clinched"}
LOSS_VERBS = {"lost", "lose", "loses", "fell", "falls", "dropped", "drops"}
NEUTRAL_VERBS = {"finished", "ended", "tied"}
WIN_NOUNS = {"win", "victory", "rout", "shutout", "triumph"}
LOSS_NOUNS = {"loss", "defeat", "setback"}
NOUN_ADJ = {"home", "road", "overtime", "ot", "division", "divisional", "playoff", "comeback", "upset",
            "season-opening", "opening", "conference", "statement", "lopsided", "narrow"}
INGAME_WORDS = {"lead", "led", "leading", "leads", "trailed", "trailing", "trail", "trails", "down",
                "deficit", "halftime", "half", "quarter", "quarters", "left", "remaining", "intermission",
                "cut", "within"}
AGGREGATE_WORDS = {"outscored", "combined", "aggregate", "series", "all-time", "head-to-head", "outscoring"}
RECORD_BEFORE = {"is", "are", "was", "were", "at", "stood", "stands", "sits", "sat", "be", "been", "from",
                 "to", "went", "go", "goes", "finishing", "now", "improved", "improves", "record"}
RECORD_AFTER = {"team", "teams", "start", "starts", "record", "records", "mark", "squad", "run", "season"}
PRESENT_RECORD = {"is", "are", "sits", "stands", "now"}
QUALIFIERS = {"with", "without", "in", "since", "over", "against", "when", "under", "as", "on", "at", "after",
              "vs", "versus", "all-time"}
TRANSITIVE = {"beat", "beats", "beating", "edged", "edges", "topped", "tops", "routed", "blanked", "downed",
              "outlasted", "stunned", "upset"}
ADVERBS = {"still", "then", "also", "anyway", "eventually", "ultimately", "nonetheless", "only", "just",
           "finally", "somehow", "again", "easily", "comfortably"}
PRONOUN_RE = re.compile(r"\b(they|They|it|It)\b")
PASSIVE_RE = re.compile(
    r"\b(?:was|were|is|are|be|been|being|get|gets|got|getting)\s+(?:not\s+|also\s+|still\s+|badly\s+|soundly\s+)?"
    r"(?:[a-z]+ed|beaten|outdone|outrun|overrun|undone|shut out|held|beat)\b"
)
PASSIVE_NOT = {"tied", "scheduled", "expected", "supposed", "named", "listed", "based", "injured", "used",
               "allowed", "set", "located", "called", "considered", "favored"}

ORD = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9,
       "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15, "sixteen": 16,
       "seventeen": 17, "eighteen": 18}
DAYS = "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday"
MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December"

# ---------------------------------------------------------------- data


def load_games(path=None):
    if path:
        with open(path, newline="", encoding="utf-8") as fh:
            text = fh.read()
    else:
        req = urllib.request.Request(GAMES_URL, headers={"User-Agent": "dfos-check-results/1.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            text = resp.read().decode("utf-8")
    games = []
    for row in csv.DictReader(io.StringIO(text)):
        try:
            season, week = int(row["season"]), int(row["week"])
        except (ValueError, KeyError):
            continue
        g = {
            "season": season, "week": week, "type": row.get("game_type", ""), "day": row.get("gameday", ""),
            "away": LEGACY.get(row["away_team"], row["away_team"]),
            "home": LEGACY.get(row["home_team"], row["home_team"]),
            "as": int(row["away_score"]) if row.get("away_score", "") not in ("", "NA") else None,
            "hs": int(row["home_score"]) if row.get("home_score", "") not in ("", "NA") else None,
            "ot": row.get("overtime", "") == "1",
            "people": {},
        }
        for side, team in (("away", g["away"]), ("home", g["home"])):
            for col in (side + "_qb_name", side + "_coach"):
                name = (row.get(col) or "").strip()
                if " " in name and name != "NA":
                    g["people"][name] = team
        games.append(g)
    return games


class Data:
    def __init__(self, games, season, week):
        self.games, self.season, self.week = games, season, week
        self.people = {}
        for g in sorted((g for g in games if g["season"] in (season, season - 1)),
                        key=lambda g: (g["season"], g["week"])):
            if g["season"] == season and g["week"] > week:
                continue
            self.people.update(g["people"])
        self.person_re = None
        if self.people:
            self.person_re = re.compile(
                r"(?<![\w.])(" + "|".join(re.escape(p) for p in sorted(self.people, key=len, reverse=True)) + r")(?!\w)")

    def week_games(self, season, weeks):
        return [g for g in self.games if g["season"] == season and (weeks is None or g["week"] in weeks)]

    def record(self, team, season, through_week):
        w = l = t = 0
        for g in self.games:
            if g["season"] != season or g["type"] != "REG" or g["week"] > through_week or g["hs"] is None:
                continue
            if team not in (g["home"], g["away"]):
                continue
            mine, theirs = (g["hs"], g["as"]) if g["home"] == team else (g["as"], g["hs"])
            if mine > theirs:
                w += 1
            elif mine < theirs:
                l += 1
            else:
                t += 1
        return (w, l, t)

    def records_any_week(self, team, season, upto):
        out = {}
        for wk in range(1, upto + 1):
            rec = self.record(team, season, wk)
            out[rec] = wk
        return out


def winner_loser(g):
    if g["hs"] is None:
        return None, None
    if g["hs"] > g["as"]:
        return g["home"], g["away"]
    if g["as"] > g["hs"]:
        return g["away"], g["home"]
    return None, None


def game_label(g):
    w, l = winner_loser(g)
    ot = " (OT)" if g["ot"] else ""
    tag = "W%d" % g["week"] if g["type"] == "REG" else g["type"]
    if w is None:
        if g["hs"] is None:
            return "%d %s %s@%s not final" % (g["season"], tag, g["away"], g["home"])
        return "%d %s %s %d %s %d tie%s" % (g["season"], tag, g["away"], g["as"], g["home"], g["hs"], ot)
    ws, ls = (g["hs"], g["as"]) if w == g["home"] else (g["as"], g["hs"])
    return "%d %s %s %d %s %d%s" % (g["season"], tag, w, ws, l, ls, ot)


# ---------------------------------------------------------------- text


def strip_markdown(line):
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", line)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("**", "").replace("__", "")
    s = re.sub(r"(?<!\w)\*(?!\s)|(?<!\s)\*(?!\w)", "", s)
    s = re.sub(r"^\s*>\s?", "", s)
    s = re.sub(r"^\s*#+\s*", "", s)
    return s


def blocks_from_file(path):
    """Return [(line_number, paragraph_text)], one paragraph per source block."""
    with open(path, encoding="utf-8") as fh:
        raw = fh.read()
    lines = raw.split("\n")
    out = []
    if path.lower().endswith((".html", ".htm")):
        # blank out <head>, <style>, <script> while keeping line numbers
        def blank(m):
            return "\n" * m.group(0).count("\n")
        raw2 = re.sub(r"<(head|style|script)\b.*?</\1>", blank, raw, flags=re.S | re.I)
        lines = raw2.split("\n")
        buf, start = [], None
        for i, ln in enumerate(lines, 1):
            if not ln.strip():
                continue
            if start is None:
                start = i
            buf.append(ln)
            if re.search(r"</(p|div|h[1-6]|li|blockquote|td)>|<br\s*/?>", ln, re.I) or not re.search(r"<[a-z]", ln, re.I):
                text = htmllib.unescape(re.sub(r"<[^>]+>", " ", " ".join(buf)))
                text = re.sub(r"\s+", " ", text).strip()
                if text:
                    out.append((start, text))
                buf, start = [], None
        if buf:
            text = htmllib.unescape(re.sub(r"<[^>]+>", " ", " ".join(buf)))
            out.append((start, re.sub(r"\s+", " ", text).strip()))
    else:
        for i, ln in enumerate(lines, 1):
            if not ln.strip() or ln.strip() == "---":
                continue
            text = re.sub(r"\s+", " ", htmllib.unescape(strip_markdown(ln))).strip()
            if text:
                out.append((i, text))
    cleaned = []
    for ln, text in out:
        text = re.sub(r"^\d{1,2}\.\s+", "", text)  # Blitz numbering "1. "
        text = text.replace(" ", " ")
        cleaned.append((ln, text))
    return cleaned


ABBREV_END = re.compile(
    r"(?:(?:^|[\s.(])[A-Z]|\bJr|\bSr|\bSt|\bMr|\bMrs|\bMs|\bDr|\bNo|\bvs|\bJan|\bFeb|\bMar|\bApr|\bAug|\bSept?|\bOct|"
    r"\bNov|\bDec|\ba\.m|\bp\.m|\bU\.S|\betc|\bII|\bIII|\bIV)\.$")


def split_sentences(text):
    spans, start = [], 0
    for m in re.finditer(r"[.!?][\"”’)\]]*\s+", text):
        before = text[start:m.start() + 1]
        nxt = text[m.end():m.end() + 1]
        if ABBREV_END.search(before) or not nxt or not (nxt.isupper() or nxt.isdigit() or nxt in "\"“'(["):
            continue
        spans.append((start, m.end()))
        start = m.end()
    if start < len(text):
        spans.append((start, len(text)))
    return [text[a:b].strip() for a, b in spans if text[a:b].strip()]


def mentions(sentence, data):
    """Team mentions in order: dicts with pos, end, teams, kind ('team' or 'person'), text."""
    found = []
    taken = []
    for m in ALIAS_RE.finditer(sentence):
        found.append({"pos": m.start(), "end": m.end(), "teams": set(ALIAS_TO_TEAMS[m.group(1)]),
                      "kind": "team", "text": m.group(1)})
        taken.append((m.start(), m.end()))
    if data.person_re:
        for m in data.person_re.finditer(sentence):
            if any(a <= m.start() < b for a, b in taken):
                continue
            found.append({"pos": m.start(), "end": m.end(), "teams": {data.people[m.group(1)]},
                          "kind": "person", "text": m.group(1)})
    found.sort(key=lambda d: d["pos"])
    return found


def week_refs(sentence, season, week):
    """Explicit game references in a sentence: list of (season, set_of_weeks_or_None, label)."""
    refs = []
    for m in re.finditer(r"\bWeek (\d{1,2}|" + "|".join(ORD) + r")\b", sentence, re.I):
        k = m.group(1).lower()
        k = int(k) if k.isdigit() else ORD[k]
        if k != week:
            refs.append((season, {k}, "Week %d" % k))
    if re.search(r"\b(last|previous) (week|" + DAYS + r")\b|\ba week (earlier|after|before|ago)\b|"
                 r"\bthe week before\b|\bthe previous week\b|\bseven days earlier\b", sentence, re.I):
        refs.append((season, {week - 1}, "previous week"))
    if re.search(r"\btwo weeks (ago|earlier|before)\b", sentence, re.I):
        refs.append((season, {week - 2}, "two weeks earlier"))
    if re.search(r"\blast (season|year|" + MONTHS + r"|winter|fall|postseason|January)\b|\ba year ago\b|"
                 r"\bin the playoffs last\b", sentence, re.I):
        refs.append((season - 1, None, "last season"))
    for m in re.finditer(r"\b(?:in|during|of) (?:the )?(20\d\d)\b", sentence):
        yr = int(m.group(1))
        if yr < season:
            refs.append((yr, None, "season %d" % yr))
    return refs


def words(s):
    return [w.lower().replace("’", "'") for w in WORD_RE.findall(s)]


# ---------------------------------------------------------------- core


class Finding:
    __slots__ = ("path", "line", "token", "kind", "game", "verdict", "notes", "sentence", "clause")

    def __init__(self, path, line, token, sentence):
        self.path, self.line, self.token, self.sentence = path, line, token, sentence
        self.kind, self.game, self.verdict, self.notes, self.clause = "?", "", "PASS", [], ""

    def fail(self, msg):
        self.verdict = "FAIL"
        self.notes.append(msg)


def classify(sentence, tok, prev_end, next_start):
    """Return (kind, framing, verb_pos). kind in final/final?/ingame/record/aggregate/unknown."""
    pre = sentence[prev_end:tok.start()]
    post = sentence[tok.end():next_start]
    pw, qw = words(pre), words(post)
    if tok.group(3) is not None:
        return "record", None, None
    if any(w in AGGREGATE_WORDS for w in pw[-4:]):
        return "aggregate", None, None
    # result noun right after: "a 25-14 home loss", "for an 18-16 win"
    q = qw[:4]
    k = 0
    while k < len(q) and q[k] in NOUN_ADJ:
        k += 1
    if k < len(q) and k <= 2 and (q[k] in WIN_NOUNS or q[k] in LOSS_NOUNS):
        noun_m = re.search(r"\b" + re.escape(q[k]) + r"\b", post, re.I)
        return "final", ("win" if q[k] in WIN_NOUNS else "loss"), tok.end() + (noun_m.start() if noun_m else 0)
    # nearest result verb before the score, within six words and after any earlier score
    verb = None
    span_words = list(WORD_RE.finditer(pre))
    tail6 = span_words[-6:]
    for idx in range(len(tail6) - 1, -1, -1):
        wm = tail6[idx]
        w = wm.group(0).lower()
        dist = len(tail6) - idx  # 1 = word right before the score
        held = re.search(r"\bheld\s+on\s*$", pre[:wm.end()], re.I)
        if w == "on" and held:
            verb = ("final", "win", prev_end + held.start(), dist)
            break
        if w in WIN_VERBS:
            verb = ("final", "win", prev_end + wm.start(), dist)
            break
        if w in LOSS_VERBS:
            verb = ("final", "loss", prev_end + wm.start(), dist)
            break
        if w in NEUTRAL_VERBS:
            verb = ("final?", "neutral", prev_end + wm.start(), dist)
            break
    # in-game: "trailed 16-0", "led 16-6", "a 16-3 lead", "16-3 down", "22-10 with 6:35 left"
    if any(w in INGAME_WORDS for w in pw[-2:]) or any(w in INGAME_WORDS for w in qw[:2]):
        return "ingame", None, None
    if pw[-1:] and pw[-1] in RECORD_BEFORE:
        return "record", None, None
    if verb and verb[3] <= 4:
        return verb[:3]
    if any(w in INGAME_WORDS for w in qw[:4]) or re.match(r"\s*(with|at)\s+(\d{1,2}:\d\d|halftime|the half)", post):
        return "ingame", None, None
    if qw[:1] and qw[0] in RECORD_AFTER:
        return "record", None, None
    if re.match(r"\s*in (\d+|" + "|".join(ORD) + r") (starts|games)\b", post, re.I):
        return "record", None, None
    if verb:
        return verb[:3]
    return "unknown", None, None


def check_file(path, data, season, week):
    findings = []
    blocks = blocks_from_file(path)
    for line, para in blocks:
        sents = split_sentences(para)
        for si, sent in enumerate(sents):
            toks = list(SCORE_RE.finditer(sent))
            if not toks:
                continue
            ments = mentions(sent, data)
            for ti, tok in enumerate(toks):
                prev_end = toks[ti - 1].end() if ti else 0
                next_start = toks[ti + 1].start() if ti + 1 < len(toks) else len(sent)
                f = Finding(path, line, tok.group(0), sent)
                kind, framing, verb_pos = classify(sent, tok, prev_end, next_start)
                analyze(f, kind, framing, verb_pos, sent, tok, ments, sents, si, para, data, season, week, findings)
                findings.append(f)
    return findings


def para_teams(sents, data, upto=None):
    out = []
    for s in sents[:upto] if upto is not None else sents:
        for m in mentions(s, data):
            out.append(m)
    return out


def first_clause(sent):
    m = re.search(r",|;|:|\s(?:and|but|while|as|after|before|because)\s", sent)
    return sent[:m.start()].strip() if m else sent.strip()


def analyze(f, kind, framing, verb_pos, sent, tok, ments, sents, si, para, data, season, week, findings):
    n, m = int(tok.group(1)), int(tok.group(2))
    sent_team_set = set().union(*[x["teams"] for x in ments]) if ments else set()
    prev_sents = sents[max(0, si - 2):si]
    pteams = set()
    for x in para_teams(sents, data):
        pteams |= x["teams"]

    if kind in ("ingame", "aggregate"):
        f.kind, f.verdict = ("in-game" if kind == "ingame" else "aggregate"), "SKIP"
        f.notes.append("not a final score; games.csv carries finals only")
        return

    refs = week_refs(sent, season, week)
    prev_refs = []
    for ps in reversed(prev_sents):
        prev_refs = week_refs(ps, season, week)
        if prev_refs:
            break

    # ---------------- records
    def record_match(teams, seasons_weeks):
        for (s, upto) in seasons_weeks:
            for t in teams:
                recs = data.records_any_week(t, s, upto)
                for rec, wk in recs.items():
                    w_, l_, t_ = rec
                    if tok.group(3) is not None:
                        if (w_, l_, t_) == (n, m, int(tok.group(3))):
                            return t, s, wk
                    elif t_ == 0 and (w_, l_) == (n, m):
                        return t, s, wk
        return None

    def upto_for(s):
        return week if s == season else 22

    def try_record(strict):
        teams_sent = [t for x in ments for t in sorted(x["teams"])]
        teams_para = sorted(pteams)
        sw = [(season, week)] + [(r[0], 22) for r in refs if r[0] < season]
        hit = record_match(teams_sent, sw) or (record_match(teams_para, sw) if not teams_sent or not strict else None)
        pre_words = words(sent[:tok.start()])
        post_words = words(sent[tok.end():])
        present = bool(pre_words) and pre_words[-1] in PRESENT_RECORD
        qualified = bool(post_words) and post_words[0] in QUALIFIERS and post_words[0] not in ("after", "at", "on")
        f.kind = "record"
        if hit:
            t, s, wk = hit
            cur = data.record(t, season, week)
            if s == season and present and wk != week and (cur[0], cur[1]) != (n, m) and not qualified:
                f.game = "%s is %d-%d after W%d" % (t, cur[0], cur[1], week)
                f.fail("present-tense record is stale: %s is %d-%d after Week %d (it was %s after Week %d)"
                       % (tname(t), cur[0], cur[1], week, tok.group(0), wk))
                return True
            also = [u for u in (teams_sent or teams_para) if u != t and record_match([u], [(s, upto_for(s))])]
            f.game = "%s %s after %s" % ("/".join([t] + also), tok.group(0), ("W%d" % wk) if s == season else ("%d season" % s))
            f.verdict = "PASS"
            return True
        if present and teams_sent and not qualified:
            t = sorted(ments[-1]["teams"])[0] if ments else None
            near = [x for x in ments if x["pos"] < tok.start()]
            if near:
                t = sorted(near[-1]["teams"])[0]
            if t:
                cur = data.record(t, season, week)
                f.game = "%s is %d-%d after W%d" % (t, cur[0], cur[1], week)
                f.fail("record does not match nflverse: %s is %d-%d after Week %d"
                       % (tname(t), cur[0], cur[1], week))
                return True
        f.verdict = "SKIP"
        f.notes.append("record, not matched to a named team (hypothetical, career or qualified); verify by hand")
        return True

    if kind == "record":
        try_record(strict=False)
        return
    # a record chained to the record before it: "122-63-1 with him and 18-30 without him"
    if kind == "unknown" and findings and findings[-1].sentence == sent and findings[-1].kind == "record" \
            and re.search(r"\b(and|or)\s*$", sent[:tok.start()]):
        try_record(strict=False)
        return

    # ---------------- final scores: find the game
    hi, lo = max(n, m), min(n, m)

    def exact_in(s, weeks):
        return [g for g in data.week_games(s, weeks)
                if g["hs"] is not None and {g["hs"], g["as"]} == {hi, lo} and max(g["hs"], g["as"]) == hi
                and min(g["hs"], g["as"]) == lo]

    targets = [(s, wk, lab, True) for (s, wk, lab) in refs]
    targets.append((season, {week}, "Week %d" % week, False))
    chosen, how = None, ""
    for (s, wk, lab, explicit) in targets:
        ex = exact_in(s, wk)
        with_team = [g for g in ex if {g["home"], g["away"]} & sent_team_set]
        if with_team:
            chosen, how = with_team[0], lab
            break
        with_p = [g for g in ex if {g["home"], g["away"]} & pteams]
        if with_p:
            chosen, how = with_p[0], lab + ", teams named elsewhere in the paragraph"
            break
        if ex and not sent_team_set:
            if len(ex) == 1:
                chosen, how = ex[0], lab + ", only game with this score"
                break
    unstated = None
    if chosen is None:
        for (s, wk, lab) in prev_refs:
            ex = [g for g in exact_in(s, wk) if {g["home"], g["away"]} & (sent_team_set or pteams)]
            if ex:
                chosen, how = ex[0], lab + " (named in the previous sentence)"
                break
    if chosen is None:
        ex = [g for g in exact_in(season, set(range(1, week))) if {g["home"], g["away"]} & (sent_team_set or pteams)]
        if ex:
            chosen = ex[-1]
            unstated = chosen
    if chosen is None and kind == "final?":
        try_record(strict=True)
        return
    if chosen is None and kind == "unknown":
        rec_done = False
        for x in (sent_team_set or pteams):
            if record_match([x], [(season, week)]):
                rec_done = True
        if rec_done:
            try_record(strict=False)
            return
        f.kind = "?"
        f.fail("cannot match: not a final score of a game involving a team named here, not a record of one; "
               "verify by hand and reword")
        return

    f.kind = "final"
    if chosen is None:
        # final cue but no exact match: wrong score or wrong week
        named_order = [t for x in ments for t in sorted(x["teams"])]
        primary = targets[0]
        for t in named_order + sorted(pteams):
            gs = [g for g in data.week_games(primary[0], primary[1]) if t in (g["home"], g["away"])]
            if gs:
                g = gs[0]
                f.game = game_label(g)
                f.fail("wrong score: nflverse has %s" % game_label(g))
                return
        f.fail("no %s game in nflverse for any team named here" % primary[2])
        return

    g = chosen
    f.game = game_label(g)
    if refs and how.startswith("Week %d" % week) and g["week"] == week and g["season"] == season:
        f.notes.append("sentence also names %s; matched the Week %d game" % (", ".join(r[2] for r in refs), week))
    if unstated is not None:
        f.fail("matches the Week %d game, but the sentence does not say which week; a reader assumes Week %d"
               % (g["week"], week))
    win, lose = winner_loser(g)
    if g["hs"] is None:
        f.fail("game is not final in nflverse yet")
        return
    if win is None:
        return  # tie: nothing to order
    if n < m:
        f.fail("score printed low-high; print the winner's score first")

    # mention bookkeeping for this game
    def side(x):
        if win in x["teams"]:
            return "W"
        if lose in x["teams"]:
            return "L"
        return None

    gm = [(x, side(x)) for x in ments if side(x)]
    win_named = any(s_ == "W" and x["kind"] == "team" for x, s_ in gm)
    if not win_named:
        pre_text = sent[:tok.start()]
        prev = sents[si - 1] if si > 0 else ""
        pm = [(x, side(x)) for x in mentions(prev, data) if side(x)]
        prev_starts_pronoun = bool(re.match(r"\W*(they|it|he|she|then they)\b", prev, re.I))
        has_pronoun = bool(PRONOUN_RE.search(pre_text))
        if has_pronoun and pm and pm[0][1] == "W" and pm[0][0]["kind"] == "team" and not prev_starts_pronoun:
            f.notes.append("winner via pronoun: the sentence before names %s first" % tname(win))
        else:
            via = [x["text"] for x, s_ in gm if s_ == "W" and x["kind"] == "person"]
            if via:
                msg = "winner %s is named only through %s; name the team" % (tname(win), via[0])
            else:
                msg = "winner %s is not named in the sentence" % tname(win)
            if has_pronoun and pm:
                last = pm[-1]
                msg += "; the pronoun's nearest team is %s, the %s" % (
                    last[0]["text"], "winner" if last[1] == "W" else "loser")
            f.fail(msg)

    # verb framing
    if verb_pos is not None:
        if verb_pos < tok.start():
            phrase = sent[verb_pos:tok.end()]
        else:
            nm = re.match(r"[A-Za-z]+", sent[verb_pos:])
            phrase = sent[tok.start():verb_pos + (nm.end() if nm else 0)]
    else:
        phrase = tok.group(0)
    if framing == "loss":
        w_cap = tname(win)[0].upper() + tname(win)[1:]
        f.fail("result told from the loser's side ('%s'); rule (a) makes the winner the subject: '%s beat %s %d-%d'"
               % (phrase.strip(), w_cap, tname(lose), hi, lo))

    if verb_pos is not None and framing in ("win", "loss", "neutral") and verb_pos < tok.start():
        pre_verb = sent[:verb_pos]
        pv = words(pre_verb)
        while pv and pv[-1] in ADVERBS:
            pv.pop()
        coordinated = (not pv) or pv[-1] == "and" or pre_verb.rstrip().endswith(",")
        nearest = [(x, s_) for (x, s_) in gm if x["end"] <= verb_pos]
        near = nearest[-1] if nearest else None
        verb_word = (re.match(r"[A-Za-z]+", sent[verb_pos:]) or re.match("", "")).group(0).lower()
        after = [(x, s_) for (x, s_) in gm if verb_pos < x["pos"] < tok.start()]
        object_is_loser = verb_word in TRANSITIVE and after and after[0][1] == "L"
        object_is_winner = verb_word in ("lost", "fell") and after and after[0][1] == "W" \
            and re.match(r"(lost|fell)\s+to\b", sent[verb_pos:], re.I)
        if framing == "win" and near is not None and near[1] == "L":
            if not coordinated and pre_verb.rstrip().endswith(near[0]["text"]):
                f.fail("WRONG WINNER: the sentence says %s won; nflverse has %s" % (tname(lose), game_label(g)))
            elif coordinated and not object_is_loser:
                f.fail("'%s' follows %s, the loser; a skim reads %s as the winner"
                       % (phrase.strip(), near[0]["text"], near[0]["text"]))
        if framing == "loss" and near is not None and near[1] == "W":
            if not coordinated and pre_verb.rstrip().endswith(near[0]["text"]):
                f.fail("WRONG LOSER: the sentence says %s lost; nflverse has %s" % (tname(win), game_label(g)))
            elif coordinated and not object_is_winner:
                f.fail("'%s' follows %s, the winner; a skim reads %s as the loser"
                       % (phrase.strip(), near[0]["text"], near[0]["text"]))

    # order: first mention of the winner before the loser. A self-contained "W beat L N-M" or
    # "W won N-M" clause (winner directly before an active win verb) satisfies rule (a) on its own,
    # even inside a longer sentence ("..., a day after Carolina beat them 25-14").
    self_contained = False
    if verb_pos is not None and framing == "win" and verb_pos < tok.start():
        pv0 = sent[:verb_pos].rstrip()
        before_v = [(x, s_) for (x, s_) in gm if x["end"] <= verb_pos]
        if before_v and before_v[-1][1] == "W" and before_v[-1][0]["kind"] == "team" \
                and pv0.endswith(before_v[-1][0]["text"]):
            self_contained = True
    firsts = {}
    for x, s_ in gm:
        firsts.setdefault(s_, x)
    if not self_contained and "L" in firsts and ("W" not in firsts or firsts["L"]["pos"] < firsts["W"]["pos"]):
        lx = firsts["L"]
        f.fail("loser named before winner: '%s'%s comes before %s"
               % (lx["text"], (" (%s)" % tname(lose)) if lx["kind"] == "person" else "",
                  ("'%s'" % firsts["W"]["text"]) if "W" in firsts else "any mention of " + tname(win)))

    # opponent named with the result must be the other team in this game
    named_teams = [x for x in ments if x["kind"] == "team"]
    obj = None
    want = None
    if verb_pos is not None and verb_pos < tok.start():
        vw = (re.match(r"[A-Za-z]+", sent[verb_pos:]) or re.match("", "")).group(0).lower()
        if vw in TRANSITIVE or re.match(r"(lost|fell)\s+to\b", sent[verb_pos:], re.I):
            obj = next((x for x in named_teams if verb_pos < x["pos"] < tok.start()), None)
            want = lose if vw in TRANSITIVE else win
    elif verb_pos is not None and verb_pos > tok.end():
        tail = sent[verb_pos:]
        mm = re.match(r"[A-Za-z]+\s+(over|against|to|at|in|from)\s+", tail)
        if mm and mm.group(1) in ("over", "to"):
            obj = next((x for x in named_teams if x["pos"] == verb_pos + mm.end()
                        or (x["pos"] == verb_pos + mm.end() + 4 and tail[mm.end():mm.end() + 4] == "the ")), None)
            want = lose if framing == "win" else win
    if obj is not None and want not in obj["teams"] and not any(n_.startswith("WRONG") for n_ in f.notes):
        f.fail("wrong opponent: '%s' is named with the result; nflverse has %s" % (obj["text"], game_label(g)))

    # passive: an agent "by <team>" before the score, or a passive in a sentence with a result verb
    pre_score = sent[:tok.start()]
    for pmatch in PASSIVE_RE.finditer(pre_score):
        verb = pmatch.group(0).split()[-1]
        if verb in PASSIVE_NOT:
            continue
        tail = pre_score[pmatch.end():]
        agent = re.search(r"\bby (?:the )?([A-Z][\w.'’]+(?: [A-Z][\w.'’]+)*)", tail)
        agent_team = agent and (ALIAS_RE.match(agent.group(1)) or (data.person_re and data.person_re.match(agent.group(1))))
        if agent_team or framing in ("win", "loss"):
            f.fail("passive '%s' in the result sentence; make the winner the subject of an active verb"
                   % (pmatch.group(0) + (" ... by the " + agent.group(1) if agent_team else "")))
            break

    f.clause = first_clause(sent)


# ---------------------------------------------------------------- output


def render(findings, show_skim=False):
    rows = [("line", "score", "kind", "nflverse", "verdict", "why")]
    for f in findings:
        rows.append((str(f.line), f.token, f.kind, f.game or "-", f.verdict, "; ".join(f.notes) or "-"))
    widths = [max(len(r[i]) for r in rows) for i in range(5)]
    out = []
    for r in rows:
        out.append("  ".join(r[i].ljust(widths[i]) for i in range(5)) + "  " + r[5])
        if r is rows[0]:
            out.append("  ".join("-" * widths[i] for i in range(5)) + "  " + "-" * 3)
    if show_skim:
        out.append("")
        out.append("SKIM TEST (first clause of every result sentence; the winner must be clear from it alone)")
        for f in findings:
            if f.kind == "final":
                out.append("  L%-4s %-40s | %s" % (f.line, f.game, f.clause))
    return "\n".join(out)


def infer_season_week(path):
    m = re.search(r"(20\d\d)-w(\d{1,2})", os.path.basename(path))
    return (int(m.group(1)), int(m.group(2))) if m else (None, None)


def run(path, season, week, games, show_skim=False, stream=sys.stdout):
    data = Data(games, season, week)
    wk = [g for g in games if g["season"] == season and g["week"] == week]
    if not wk:
        print("check_results: %d Week %d is not in games.csv; cannot verify" % (season, week), file=sys.stderr)
        return 2
    unfinal = [g for g in wk if g["hs"] is None]
    findings = check_file(path, data, season, week)
    print("check_results: %s  (%d Week %d, nflverse %d of %d games final)"
          % (path, season, week, len(wk) - len(unfinal), len(wk)), file=stream)
    print(render(findings, show_skim), file=stream)
    fails = [f for f in findings if f.verdict == "FAIL"]
    print("", file=stream)
    for f in fails:
        print("%s:%d: FAIL %s: %s" % (f.path, f.line, f.token, "; ".join(f.notes)), file=stream)
    finals = sum(1 for f in findings if f.kind == "final")
    print("%d N-M found, %d final scores, %d FAIL, %d PASS, %d SKIP"
          % (len(findings), finals, len(fails), sum(1 for f in findings if f.verdict == "PASS"),
             sum(1 for f in findings if f.verdict == "SKIP")), file=stream)
    return 1 if fails else 0


# ---------------------------------------------------------------- self-test

SELFTEST = [
    # (sentence, expect_fail, must_contain)
    ("New Orleans beat the Giants 34-27 on Sunday.", False, ""),
    ("The Saints won 34-27 at the Giants.", False, ""),
    ("New Orleans was outgained 461 to 319 by the Giants and won 34-27.", True, "passive"),
    ("Tennessee gained 186 yards to Indianapolis' 399 and won its first game, 26-20.", True, "follows Indianapolis"),
    ("The Giants beat New Orleans 34-27.", True, "WRONG WINNER"),
    ("New Orleans beat the Giants 34-28.", True, "wrong score"),
    ("Jacksonville still lost to Houston, 34-31.", True, "loser named before winner"),
    ("Sunday's 22-6 loss in Kansas City hurt.", True, "loser's side"),
    ("Houston beat Jacksonville 34-31 in London.", False, ""),
    ("Tampa Bay took a 16-3 lead into the fourth quarter.", False, "in-game"),
    ("Pittsburgh is 4-2 and plays New Orleans on Sunday.", False, "record PASS"),
    ("Pittsburgh is 5-1 and plays New Orleans on Sunday.", True, "record"),
    ("Cleveland had 107 yards against Baltimore and won 13-10.", True, "follows Baltimore"),
    ("The 49ers beat Washington 23-17 to go 6-0.", False, ""),
    ("The Rams outgained Arizona by 100 yards and lost 18-16.", True, "follows Arizona"),
    ("The 49ers outgained Washington in the first half. They held on 23-17.", False, ""),
    ("New Orleans beat the Giants 27-34.", True, "low-high"),
    ("The Eagles learned on Monday that Hurts is out, a day after Carolina beat them 25-14.", False, ""),
    ("New Orleans beat Houston 34-27.", True, "wrong opponent"),
    ("Chicago won 31-23 in a 31-23 win over Detroit.", True, "wrong opponent"),
    ("Jacksonville beat Philadelphia 19-17.", True, "does not say which week"),
    ("In Week 5 Jacksonville beat Philadelphia 19-17.", False, ""),
    ("It finished 34-27.", True, "not named"),
    ("Houston beat Jacksonville 34-31 with no time left.", False, "final"),
    ("Cleveland won 13-10 with 0:00 left on the clock.", False, "final"),
    ("Cincinnati trailed 22-10 with 6:35 left.", False, "in-game"),
    ("Houston, now with back-to-back wins, is 2-4.", False, "record PASS"),
    ("Pittsburgh came back from 16-3 down in the fourth quarter to beat Tampa Bay in overtime.", False, "in-game"),
]


def selftest(games):
    import tempfile
    data_ok = any(g["season"] == 2026 and g["week"] == 6 for g in games)
    if not data_ok:
        print("selftest needs 2026 Week 6 in games.csv", file=sys.stderr)
        return 2
    bad = 0
    for sent, expect_fail, needle in SELFTEST:
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False) as tf:
            tf.write(sent + "\n")
            p = tf.name
        data = Data(games, 2026, 6)
        fs = check_file(p, data, 2026, 6)
        os.unlink(p)
        failed = any(f.verdict == "FAIL" for f in fs)
        text = " | ".join("%s %s %s %s" % (f.token, f.kind, f.verdict, "; ".join(f.notes)) for f in fs)
        ok = failed == expect_fail and (not needle or needle.lower() in text.lower())
        bad += 0 if ok else 1
        print("%s  expect %s  got %s  %s\n      %s" % ("ok  " if ok else "BAD ", "FAIL" if expect_fail else "PASS",
                                                   "FAIL" if failed else "PASS", sent, text))
    print("selftest: %d of %d cases behave as expected" % (len(SELFTEST) - bad, len(SELFTEST)))
    return 0 if bad == 0 else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Gate every printed score in an issue against nflverse games.csv.")
    ap.add_argument("issue", nargs="?", help="issue .md or .html")
    ap.add_argument("season", nargs="?", type=int)
    ap.add_argument("week", nargs="?", type=int)
    ap.add_argument("--games", help="local games.csv instead of downloading")
    ap.add_argument("--skim", action="store_true", help="also print the first clause of every result sentence")
    ap.add_argument("--selftest", action="store_true", help="run built-in cases against 2026 Week 6")
    a = ap.parse_args(argv)
    try:
        games = load_games(a.games)
    except Exception as e:  # network, file, parse
        print("check_results: cannot load games.csv (%s); NOT VERIFIED" % e, file=sys.stderr)
        return 2
    if a.selftest:
        return selftest(games)
    if not a.issue:
        ap.print_usage(sys.stderr)
        return 2
    season, week = a.season, a.week
    if season is None or week is None:
        s2, w2 = infer_season_week(a.issue)
        season, week = season or s2, week or w2
    if season is None or week is None:
        print("check_results: pass SEASON WEEK (could not infer from the filename)", file=sys.stderr)
        return 2
    if not os.path.isfile(a.issue):
        print("check_results: no such file %s" % a.issue, file=sys.stderr)
        return 2
    return run(a.issue, season, week, games, a.skim)


if __name__ == "__main__":
    sys.exit(main())
