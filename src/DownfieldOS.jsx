import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, ReferenceLine, Cell, PolarRadiusAxis
} from "recharts";
import {
  Search, Users, Target, Zap, TrendingUp, Cloud, ChevronRight, ChevronDown,
  LayoutDashboard, Trophy, Shield, ArrowUpRight, ArrowDownRight,
  Minus, Download, Activity, MessageCircle, X, Send, AlertTriangle,
  Star, Eye, Swords, BookOpen, Filter, Calendar, MapPin, Clock,
  ChevronUp, RotateCcw, Flame, Crosshair, Menu
} from "lucide-react";

function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return mobile;
}


// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// DOWNFIELD OS v6 Ã¢ÂÂ 2026 Season Preview + Real 2024 NFL Data
// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

// Ã¢ÂÂÃ¢ÂÂ TEAMS & DNA Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const T = [
  { a: "ARI", n: "Cardinals", c: "NFC", d: "West" }, { a: "ATL", n: "Falcons", c: "NFC", d: "South" },
  { a: "BAL", n: "Ravens", c: "AFC", d: "North" }, { a: "BUF", n: "Bills", c: "AFC", d: "East" },
  { a: "CAR", n: "Panthers", c: "NFC", d: "South" }, { a: "CHI", n: "Bears", c: "NFC", d: "North" },
  { a: "CIN", n: "Bengals", c: "AFC", d: "North" }, { a: "CLE", n: "Browns", c: "AFC", d: "North" },
  { a: "DAL", n: "Cowboys", c: "NFC", d: "East" }, { a: "DEN", n: "Broncos", c: "AFC", d: "West" },
  { a: "DET", n: "Lions", c: "NFC", d: "North" }, { a: "GB", n: "Packers", c: "NFC", d: "North" },
  { a: "HOU", n: "Texans", c: "AFC", d: "South" }, { a: "IND", n: "Colts", c: "AFC", d: "South" },
  { a: "JAX", n: "Jaguars", c: "AFC", d: "South" }, { a: "KC", n: "Chiefs", c: "AFC", d: "West" },
  { a: "LAC", n: "Chargers", c: "AFC", d: "West" }, { a: "LAR", n: "Rams", c: "NFC", d: "West" },
  { a: "LV", n: "Raiders", c: "AFC", d: "West" }, { a: "MIA", n: "Dolphins", c: "AFC", d: "East" },
  { a: "MIN", n: "Vikings", c: "NFC", d: "North" }, { a: "NE", n: "Patriots", c: "AFC", d: "East" },
  { a: "NO", n: "Saints", c: "NFC", d: "South" }, { a: "NYG", n: "Giants", c: "NFC", d: "East" },
  { a: "NYJ", n: "Jets", c: "AFC", d: "East" }, { a: "PHI", n: "Eagles", c: "NFC", d: "East" },
  { a: "PIT", n: "Steelers", c: "AFC", d: "North" }, { a: "SEA", n: "Seahawks", c: "NFC", d: "West" },
  { a: "SF", n: "49ers", c: "NFC", d: "West" }, { a: "TB", n: "Buccaneers", c: "NFC", d: "South" },
  { a: "TEN", n: "Titans", c: "AFC", d: "South" }, { a: "WAS", n: "Commanders", c: "NFC", d: "East" },
];
const DNA = {
  ARI:{p:.57,e:.43,x:.08,s:"Kyler-Led Air Raid"},ATL:{p:.56,e:.46,x:.07,s:"Cousins Pass-First"},
  BAL:{p:.44,e:.54,x:.12,s:"Lamar's Run Kingdom"},BUF:{p:.61,e:.52,x:.11,s:"Allen-Powered Juggernaut"},
  CAR:{p:.55,e:.37,x:.05,s:"Rebuilding Under Canales"},CHI:{p:.54,e:.40,x:.06,s:"Caleb's Rough Rookie Year"},
  CIN:{p:.62,e:.48,x:.10,s:"Burrow Slings It"},CLE:{p:.53,e:.39,x:.06,s:"QB Carousel Chaos"},
  DAL:{p:.59,e:.42,x:.07,s:"Post-Contract Slump"},DEN:{p:.52,e:.47,x:.08,s:"Nix Surprise Contender"},
  DET:{p:.54,e:.55,x:.12,s:"NFC's Best Offense"},GB:{p:.56,e:.49,x:.10,s:"Love Finding His Groove"},
  HOU:{p:.58,e:.48,x:.09,s:"Stroud's Sophomore Push"},IND:{p:.52,e:.44,x:.07,s:"Richardson's Dual Threat"},
  JAX:{p:.57,e:.40,x:.06,s:"Lawrence Disappoints"},KC:{p:.58,e:.51,x:.09,s:"Three-Peat Machine"},
  LAC:{p:.53,e:.49,x:.07,s:"Harbaugh's Discipline"},LAR:{p:.60,e:.47,x:.09,s:"Stafford Still Dealing"},
  LV:{p:.55,e:.38,x:.05,s:"Rudderless Raiders"},MIA:{p:.59,e:.44,x:.11,s:"Speed Kills (When Healthy)"},
  MIN:{p:.58,e:.50,x:.09,s:"Darnold's Redemption Arc"},NE:{p:.50,e:.38,x:.05,s:"Drake Maye Learning"},
  NO:{p:.56,e:.42,x:.07,s:"Post-Payton Decline"},NYG:{p:.54,e:.36,x:.05,s:"Bottom of the Barrel"},
  NYJ:{p:.57,e:.41,x:.07,s:"Rodgers Farewell Tour"},PHI:{p:.55,e:.52,x:.10,s:"Saquon's Eagles Surge"},
  PIT:{p:.54,e:.44,x:.07,s:"Russell Then Justin"},SEA:{p:.58,e:.45,x:.08,s:"Geno Under Pressure"},
  SF:{p:.53,e:.46,x:.09,s:"Injury-Plagued Dynasty"},TB:{p:.59,e:.48,x:.09,s:"Baker's Buccaneers"},
  TEN:{p:.51,e:.41,x:.06,s:"Levis Growing Pains"},WAS:{p:.57,e:.50,x:.10,s:"Jayden Daniels Sensation"},
};

// Ã¢ÂÂÃ¢ÂÂ REAL 2024 ROSTERS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const ROSTERS_2024 = {
  ARI: {
    offense: [
      { pos: "QB", name: "Kyler Murray", grade: "Above Avg", rating: 82, trait: "Dual-Threat" },
      { pos: "RB1", name: "James Conner", grade: "Above Avg", rating: 80, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Trey Benson", grade: "Average", rating: 68, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Marvin Harrison Jr", grade: "Above Avg", rating: 83, trait: "Route Technician" },
      { pos: "WR2", name: "Trey McBride", grade: "Above Avg", rating: 81, trait: "Possession" },
      { pos: "WR3", name: "Greg Dortch", grade: "Average", rating: 70, trait: "Slot" },
      { pos: "TE", name: "Trey McBride", grade: "Elite", rating: 90, trait: "Receiving TE" },
      { pos: "LT", name: "Paris Johnson Jr", grade: "Above Avg", rating: 78, trait: "Pass Pro" },
      { pos: "LG", name: "Evan Brown", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "C", name: "Hjalte Froholdt", grade: "Average", rating: 70, trait: "Anchor" },
      { pos: "RG", name: "Will Hernandez", grade: "Average", rating: 68, trait: "Run Blocking" },
      { pos: "RT", name: "Jonah Williams", grade: "Average", rating: 72, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "BJ Ojulari", grade: "Average", rating: 72, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Victor Dimukeje", grade: "Average", rating: 68, trait: "Power Rusher" },
      { pos: "DT1", name: "Bilal Nichols", grade: "Average", rating: 71, trait: "Run Stuffer" },
      { pos: "DT2", name: "Darius Robinson", grade: "Average", rating: 70, trait: "Interior Pressure" },
      { pos: "LB1", name: "Zaven Collins", grade: "Average", rating: 72, trait: "Thumper" },
      { pos: "LB2", name: "Kyzir White", grade: "Average", rating: 70, trait: "Coverage LB" },
      { pos: "CB1", name: "Sean Murphy-Bunting", grade: "Average", rating: 68, trait: "Zone Corner" },
      { pos: "CB2", name: "Garrett Williams", grade: "Above Avg", rating: 76, trait: "Press-Man" },
      { pos: "SCB", name: "Starling Thomas V", grade: "Average", rating: 66, trait: "Slot Corner" },
      { pos: "FS", name: "Budda Baker", grade: "Elite", rating: 92, trait: "Ball Hawk" },
      { pos: "SS", name: "Jalen Thompson", grade: "Above Avg", rating: 78, trait: "Box Safety" },
    ]
  },
  ATL: {
    offense: [
      { pos: "QB", name: "Kirk Cousins", grade: "Above Avg", rating: 78, trait: "Gunslinger" },
      { pos: "RB1", name: "Bijan Robinson", grade: "Elite", rating: 93, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Tyler Allgeier", grade: "Average", rating: 72, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "Drake London", grade: "Above Avg", rating: 84, trait: "Possession" },
      { pos: "WR2", name: "Darnell Mooney", grade: "Above Avg", rating: 76, trait: "Deep Threat" },
      { pos: "WR3", name: "Ray-Ray McCloud", grade: "Average", rating: 66, trait: "Slot" },
      { pos: "TE", name: "Kyle Pitts", grade: "Above Avg", rating: 76, trait: "Receiving TE" },
      { pos: "LT", name: "Jake Matthews", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
      { pos: "LG", name: "Matthew Bergeron", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "C", name: "Drew Dalman", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Chris Lindstrom", grade: "Elite", rating: 88, trait: "Run Blocking" },
      { pos: "RT", name: "Kaleb McGary", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Matthew Judon", grade: "Above Avg", rating: 76, trait: "Power Rusher" },
      { pos: "EDGE2", name: "Arnold Ebiketie", grade: "Average", rating: 72, trait: "Speed Rusher" },
      { pos: "DT1", name: "Grady Jarrett", grade: "Above Avg", rating: 82, trait: "Interior Pressure" },
      { pos: "DT2", name: "David Onyemata", grade: "Average", rating: 72, trait: "Run Stuffer" },
      { pos: "LB1", name: "Kaden Elliss", grade: "Above Avg", rating: 78, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Troy Andersen", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "AJ Terrell", grade: "Above Avg", rating: 82, trait: "Press-Man" },
      { pos: "CB2", name: "Mike Hughes", grade: "Average", rating: 68, trait: "Zone Corner" },
      { pos: "SCB", name: "Dee Alford", grade: "Average", rating: 68, trait: "Slot Corner" },
      { pos: "FS", name: "Jessie Bates III", grade: "Elite", rating: 86, trait: "Ball Hawk" },
      { pos: "SS", name: "DeMarcco Hellams", grade: "Average", rating: 68, trait: "Box Safety" },
    ]
  },
  BAL: {
    offense: [
      { pos: "QB", name: "Lamar Jackson", grade: "Elite", rating: 95, trait: "Dual-Threat" },
      { pos: "RB1", name: "Derrick Henry", grade: "Elite", rating: 91, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Justice Hill", grade: "Above Avg", rating: 76, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Zay Flowers", grade: "Above Avg", rating: 82, trait: "YAC Monster" },
      { pos: "WR2", name: "Rashod Bateman", grade: "Average", rating: 72, trait: "Route Technician" },
      { pos: "WR3", name: "Nelson Agholor", grade: "Average", rating: 68, trait: "Slot" },
      { pos: "TE", name: "Mark Andrews", grade: "Above Avg", rating: 83, trait: "Receiving TE" },
      { pos: "LT", name: "Ronnie Stanley", grade: "Above Avg", rating: 79, trait: "Pass Pro" },
      { pos: "LG", name: "Andrew Vorhees", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "C", name: "Tyler Linderbaum", grade: "Elite", rating: 90, trait: "Anchor" },
      { pos: "RG", name: "Ben Cleveland", grade: "Average", rating: 71, trait: "Run Blocking" },
      { pos: "RT", name: "Patrick Mekari", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Kyle Van Noy", grade: "Above Avg", rating: 78, trait: "Power Rusher" },
      { pos: "EDGE2", name: "Odafe Oweh", grade: "Above Avg", rating: 80, trait: "Speed Rusher" },
      { pos: "DT1", name: "Nnamdi Madubuike", grade: "Elite", rating: 88, trait: "Interior Pressure" },
      { pos: "DT2", name: "Michael Pierce", grade: "Above Avg", rating: 76, trait: "Nose Tackle" },
      { pos: "LB1", name: "Roquan Smith", grade: "Elite", rating: 92, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Trenton Simpson", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "Marlon Humphrey", grade: "Elite", rating: 89, trait: "Press-Man" },
      { pos: "CB2", name: "Brandon Stephens", grade: "Above Avg", rating: 76, trait: "Zone Corner" },
      { pos: "SCB", name: "Arthur Maulet", grade: "Average", rating: 70, trait: "Slot Corner" },
      { pos: "FS", name: "Kyle Hamilton", grade: "Elite", rating: 94, trait: "Ball Hawk" },
      { pos: "SS", name: "Marcus Williams", grade: "Above Avg", rating: 80, trait: "Single-High" },
    ]
  },
  BUF: {
    offense: [
      { pos: "QB", name: "Josh Allen", grade: "Elite", rating: 96, trait: "Gunslinger" },
      { pos: "RB1", name: "James Cook", grade: "Above Avg", rating: 80, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Ray Davis", grade: "Average", rating: 72, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Amari Cooper", grade: "Above Avg", rating: 79, trait: "Route Technician" },
      { pos: "WR2", name: "Khalil Shakir", grade: "Above Avg", rating: 80, trait: "YAC Monster" },
      { pos: "WR3", name: "Curtis Samuel", grade: "Average", rating: 71, trait: "Slot" },
      { pos: "TE", name: "Dalton Kincaid", grade: "Above Avg", rating: 82, trait: "Receiving TE" },
      { pos: "LT", name: "Dion Dawkins", grade: "Above Avg", rating: 79, trait: "Pass Pro" },
      { pos: "LG", name: "David Edwards", grade: "Average", rating: 73, trait: "Run Blocking" },
      { pos: "C", name: "Connor McGovern", grade: "Average", rating: 74, trait: "Anchor" },
      { pos: "RG", name: "O'Cyrus Torrence", grade: "Above Avg", rating: 78, trait: "Run Blocking" },
      { pos: "RT", name: "Spencer Brown", grade: "Above Avg", rating: 77, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Von Miller", grade: "Average", rating: 70, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Greg Rousseau", grade: "Above Avg", rating: 80, trait: "Power Rusher" },
      { pos: "DT1", name: "Ed Oliver", grade: "Above Avg", rating: 82, trait: "Interior Pressure" },
      { pos: "DT2", name: "DaQuan Jones", grade: "Average", rating: 72, trait: "Nose Tackle" },
      { pos: "LB1", name: "Terrel Bernard", grade: "Above Avg", rating: 80, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Matt Milano", grade: "Elite", rating: 88, trait: "Coverage LB" },
      { pos: "CB1", name: "Rasul Douglas", grade: "Above Avg", rating: 78, trait: "Zone Corner" },
      { pos: "CB2", name: "Taron Johnson", grade: "Above Avg", rating: 76, trait: "Press-Man" },
      { pos: "SCB", name: "Christian Benford", grade: "Above Avg", rating: 77, trait: "Slot Corner" },
      { pos: "FS", name: "Taylor Rapp", grade: "Above Avg", rating: 76, trait: "Ball Hawk" },
      { pos: "SS", name: "Damar Hamlin", grade: "Average", rating: 72, trait: "Box Safety" },
    ]
  },
  CAR: {
    offense: [
      { pos: "QB", name: "Bryce Young", grade: "Average", rating: 62, trait: "Dual-Threat" },
      { pos: "RB1", name: "Chuba Hubbard", grade: "Above Avg", rating: 76, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Miles Sanders", grade: "Average", rating: 66, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Diontae Johnson", grade: "Average", rating: 72, trait: "Route Technician" },
      { pos: "WR2", name: "Adam Thielen", grade: "Average", rating: 72, trait: "Possession" },
      { pos: "WR3", name: "Jonathan Mingo", grade: "Average", rating: 66, trait: "Slot" },
      { pos: "TE", name: "Tommy Tremble", grade: "Average", rating: 66, trait: "Blocking TE" },
      { pos: "LT", name: "Ikem Ekwonu", grade: "Average", rating: 72, trait: "Pass Pro" },
      { pos: "LG", name: "Brady Christensen", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "C", name: "Austin Corbett", grade: "Average", rating: 70, trait: "Anchor" },
      { pos: "RG", name: "Robert Hunt", grade: "Above Avg", rating: 78, trait: "Run Blocking" },
      { pos: "RT", name: "Taylor Moton", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Jadeveon Clowney", grade: "Average", rating: 70, trait: "Power Rusher" },
      { pos: "EDGE2", name: "DJ Wonnum", grade: "Average", rating: 68, trait: "Speed Rusher" },
      { pos: "DT1", name: "Derrick Brown", grade: "Elite", rating: 90, trait: "Interior Pressure" },
      { pos: "DT2", name: "A'Shawn Robinson", grade: "Average", rating: 68, trait: "Run Stuffer" },
      { pos: "LB1", name: "Shaq Thompson", grade: "Above Avg", rating: 76, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Josey Jewell", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "Jaycee Horn", grade: "Above Avg", rating: 80, trait: "Press-Man" },
      { pos: "CB2", name: "Dane Jackson", grade: "Average", rating: 68, trait: "Zone Corner" },
      { pos: "SCB", name: "Troy Hill", grade: "Average", rating: 66, trait: "Slot Corner" },
      { pos: "FS", name: "Xavier Woods", grade: "Average", rating: 72, trait: "Single-High" },
      { pos: "SS", name: "Sam Franklin", grade: "Average", rating: 68, trait: "Box Safety" },
    ]
  },
  CHI: {
    offense: [
      { pos: "QB", name: "Caleb Williams", grade: "Average", rating: 72, trait: "Dual-Threat" },
      { pos: "RB1", name: "D'Andre Swift", grade: "Above Avg", rating: 76, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Roschon Johnson", grade: "Average", rating: 68, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "DJ Moore", grade: "Above Avg", rating: 82, trait: "YAC Monster" },
      { pos: "WR2", name: "Keenan Allen", grade: "Above Avg", rating: 78, trait: "Route Technician" },
      { pos: "WR3", name: "Rome Odunze", grade: "Average", rating: 72, trait: "Possession" },
      { pos: "TE", name: "Cole Kmet", grade: "Above Avg", rating: 76, trait: "Receiving TE" },
      { pos: "LT", name: "Braxton Jones", grade: "Average", rating: 70, trait: "Pass Pro" },
      { pos: "LG", name: "Teven Jenkins", grade: "Above Avg", rating: 76, trait: "Run Blocking" },
      { pos: "C", name: "Coleman Shelton", grade: "Average", rating: 70, trait: "Anchor" },
      { pos: "RG", name: "Nate Davis", grade: "Average", rating: 66, trait: "Run Blocking" },
      { pos: "RT", name: "Darnell Wright", grade: "Above Avg", rating: 78, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Montez Sweat", grade: "Elite", rating: 86, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "DeMarcus Walker", grade: "Average", rating: 72, trait: "Power Rusher" },
      { pos: "DT1", name: "Andrew Billings", grade: "Average", rating: 72, trait: "Run Stuffer" },
      { pos: "DT2", name: "Gervon Dexter", grade: "Average", rating: 72, trait: "Interior Pressure" },
      { pos: "LB1", name: "Tremaine Edmunds", grade: "Above Avg", rating: 80, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "TJ Edwards", grade: "Above Avg", rating: 76, trait: "Coverage LB" },
      { pos: "CB1", name: "Jaylon Johnson", grade: "Above Avg", rating: 82, trait: "Press-Man" },
      { pos: "CB2", name: "Tyrique Stevenson", grade: "Average", rating: 70, trait: "Zone Corner" },
      { pos: "SCB", name: "Kyler Gordon", grade: "Average", rating: 70, trait: "Slot Corner" },
      { pos: "FS", name: "Kevin Byard", grade: "Above Avg", rating: 76, trait: "Single-High" },
      { pos: "SS", name: "Jaquan Brisker", grade: "Above Avg", rating: 78, trait: "Box Safety" },
    ]
  },
  CIN: {
    offense: [
      { pos: "QB", name: "Joe Burrow", grade: "Elite", rating: 93, trait: "Gunslinger" },
      { pos: "RB1", name: "Zack Moss", grade: "Above Avg", rating: 76, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Chase Brown", grade: "Average", rating: 72, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Ja'Marr Chase", grade: "Elite", rating: 97, trait: "YAC Monster" },
      { pos: "WR2", name: "Tee Higgins", grade: "Above Avg", rating: 84, trait: "Possession" },
      { pos: "WR3", name: "Andrei Iosivas", grade: "Average", rating: 68, trait: "Slot" },
      { pos: "TE", name: "Mike Gesicki", grade: "Average", rating: 74, trait: "Receiving TE" },
      { pos: "LT", name: "Orlando Brown Jr", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
      { pos: "LG", name: "Cordell Volson", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "C", name: "Ted Karras", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Alex Cappa", grade: "Above Avg", rating: 76, trait: "Run Blocking" },
      { pos: "RT", name: "Amarius Mims", grade: "Average", rating: 72, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Trey Hendrickson", grade: "Elite", rating: 90, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Sam Hubbard", grade: "Above Avg", rating: 78, trait: "Power Rusher" },
      { pos: "DT1", name: "BJ Hill", grade: "Above Avg", rating: 76, trait: "Interior Pressure" },
      { pos: "DT2", name: "Sheldon Rankins", grade: "Average", rating: 70, trait: "Run Stuffer" },
      { pos: "LB1", name: "Logan Wilson", grade: "Above Avg", rating: 80, trait: "Coverage LB" },
      { pos: "LB2", name: "Germaine Pratt", grade: "Above Avg", rating: 76, trait: "Sideline-to-Sideline" },
      { pos: "CB1", name: "Cam Taylor-Britt", grade: "Average", rating: 72, trait: "Zone Corner" },
      { pos: "CB2", name: "DJ Turner", grade: "Average", rating: 68, trait: "Press-Man" },
      { pos: "SCB", name: "Mike Hilton", grade: "Average", rating: 72, trait: "Slot Corner" },
      { pos: "FS", name: "Vonn Bell", grade: "Above Avg", rating: 76, trait: "Box Safety" },
      { pos: "SS", name: "Dax Hill", grade: "Average", rating: 70, trait: "Hybrid" },
    ]
  },
  CLE: {
    offense: [
      { pos: "QB", name: "Deshaun Watson", grade: "Below Avg", rating: 58, trait: "Dual-Threat" },
      { pos: "RB1", name: "Jerome Ford", grade: "Average", rating: 70, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Pierre Strong Jr", grade: "Average", rating: 66, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Jerry Jeudy", grade: "Average", rating: 74, trait: "Route Technician" },
      { pos: "WR2", name: "Elijah Moore", grade: "Average", rating: 70, trait: "Slot" },
      { pos: "WR3", name: "Cedric Tillman", grade: "Average", rating: 68, trait: "Possession" },
      { pos: "TE", name: "David Njoku", grade: "Above Avg", rating: 80, trait: "Receiving TE" },
      { pos: "LT", name: "Jedrick Wills Jr", grade: "Average", rating: 70, trait: "Pass Pro" },
      { pos: "LG", name: "Joel Bitonio", grade: "Elite", rating: 88, trait: "Run Blocking" },
      { pos: "C", name: "Ethan Pocic", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Wyatt Teller", grade: "Elite", rating: 88, trait: "Run Blocking" },
      { pos: "RT", name: "Jack Conklin", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Myles Garrett", grade: "Elite", rating: 96, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Za'Darius Smith", grade: "Above Avg", rating: 78, trait: "Power Rusher" },
      { pos: "DT1", name: "Dalvin Tomlinson", grade: "Above Avg", rating: 78, trait: "Run Stuffer" },
      { pos: "DT2", name: "Maurice Hurst", grade: "Average", rating: 70, trait: "Interior Pressure" },
      { pos: "LB1", name: "Jeremiah Owusu-Koramoah", grade: "Above Avg", rating: 82, trait: "Coverage LB" },
      { pos: "LB2", name: "Jordan Hicks", grade: "Average", rating: 72, trait: "Sideline-to-Sideline" },
      { pos: "CB1", name: "Denzel Ward", grade: "Above Avg", rating: 84, trait: "Press-Man" },
      { pos: "CB2", name: "Martin Emerson", grade: "Average", rating: 72, trait: "Zone Corner" },
      { pos: "SCB", name: "Greg Newsome II", grade: "Above Avg", rating: 76, trait: "Slot Corner" },
      { pos: "FS", name: "Grant Delpit", grade: "Above Avg", rating: 78, trait: "Hybrid" },
      { pos: "SS", name: "Juan Thornhill", grade: "Average", rating: 72, trait: "Box Safety" },
    ]
  },
  DAL: {
    offense: [
      { pos: "QB", name: "Dak Prescott", grade: "Above Avg", rating: 78, trait: "Gunslinger" },
      { pos: "RB1", name: "Rico Dowdle", grade: "Average", rating: 72, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Ezekiel Elliott", grade: "Average", rating: 66, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "CeeDee Lamb", grade: "Elite", rating: 92, trait: "Route Technician" },
      { pos: "WR2", name: "Jalen Tolbert", grade: "Average", rating: 68, trait: "Deep Threat" },
      { pos: "WR3", name: "Brandin Cooks", grade: "Average", rating: 70, trait: "Slot" },
      { pos: "TE", name: "Jake Ferguson", grade: "Above Avg", rating: 78, trait: "Receiving TE" },
      { pos: "LT", name: "Tyler Guyton", grade: "Average", rating: 70, trait: "Pass Pro" },
      { pos: "LG", name: "Tyler Smith", grade: "Above Avg", rating: 80, trait: "Run Blocking" },
      { pos: "C", name: "Brock Hoffman", grade: "Average", rating: 68, trait: "Anchor" },
      { pos: "RG", name: "Zack Martin", grade: "Elite", rating: 88, trait: "Run Blocking" },
      { pos: "RT", name: "Terence Steele", grade: "Average", rating: 70, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Micah Parsons", grade: "Elite", rating: 94, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "DeMarcus Lawrence", grade: "Above Avg", rating: 80, trait: "Power Rusher" },
      { pos: "DT1", name: "Osa Odighizuwa", grade: "Above Avg", rating: 78, trait: "Interior Pressure" },
      { pos: "DT2", name: "Mazi Smith", grade: "Average", rating: 68, trait: "Nose Tackle" },
      { pos: "LB1", name: "DeMarvion Overshown", grade: "Average", rating: 72, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Eric Kendricks", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "Trevon Diggs", grade: "Above Avg", rating: 78, trait: "Ball Hawk" },
      { pos: "CB2", name: "DaRon Bland", grade: "Above Avg", rating: 80, trait: "Zone Corner" },
      { pos: "SCB", name: "Jourdan Lewis", grade: "Average", rating: 72, trait: "Slot Corner" },
      { pos: "FS", name: "Malik Hooker", grade: "Above Avg", rating: 78, trait: "Single-High" },
      { pos: "SS", name: "Donovan Wilson", grade: "Average", rating: 72, trait: "Box Safety" },
    ]
  },
  DEN: {
    offense: [
      { pos: "QB", name: "Bo Nix", grade: "Above Avg", rating: 78, trait: "Dual-Threat" },
      { pos: "RB1", name: "Javonte Williams", grade: "Above Avg", rating: 76, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Jaleel McLaughlin", grade: "Average", rating: 68, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Courtland Sutton", grade: "Above Avg", rating: 78, trait: "Possession" },
      { pos: "WR2", name: "Devaughn Vele", grade: "Average", rating: 70, trait: "Slot" },
      { pos: "WR3", name: "Troy Franklin", grade: "Average", rating: 66, trait: "Deep Threat" },
      { pos: "TE", name: "Adam Trautman", grade: "Average", rating: 66, trait: "Blocking TE" },
      { pos: "LT", name: "Garett Bolles", grade: "Above Avg", rating: 78, trait: "Pass Pro" },
      { pos: "LG", name: "Ben Powers", grade: "Above Avg", rating: 76, trait: "Run Blocking" },
      { pos: "C", name: "Luke Wattenberg", grade: "Average", rating: 70, trait: "Anchor" },
      { pos: "RG", name: "Quinn Meinerz", grade: "Above Avg", rating: 78, trait: "Run Blocking" },
      { pos: "RT", name: "Mike McGlinchey", grade: "Average", rating: 72, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Nik Bonitto", grade: "Above Avg", rating: 82, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Jonah Elliss", grade: "Average", rating: 72, trait: "Power Rusher" },
      { pos: "DT1", name: "Zach Allen", grade: "Above Avg", rating: 80, trait: "Interior Pressure" },
      { pos: "DT2", name: "D.J. Jones", grade: "Average", rating: 72, trait: "Nose Tackle" },
      { pos: "LB1", name: "Alex Singleton", grade: "Above Avg", rating: 76, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Cody Barton", grade: "Average", rating: 70, trait: "Coverage LB" },
      { pos: "CB1", name: "Patrick Surtain II", grade: "Elite", rating: 94, trait: "Press-Man" },
      { pos: "CB2", name: "Riley Moss", grade: "Average", rating: 72, trait: "Zone Corner" },
      { pos: "SCB", name: "Ja'Quan McMillian", grade: "Average", rating: 70, trait: "Slot Corner" },
      { pos: "FS", name: "Brandon Jones", grade: "Above Avg", rating: 76, trait: "Box Safety" },
      { pos: "SS", name: "PJ Locke", grade: "Average", rating: 72, trait: "Hybrid" },
    ]
  },
  DET: {
    offense: [
      { pos: "QB", name: "Jared Goff", grade: "Elite", rating: 92, trait: "Game Manager" },
      { pos: "RB1", name: "Jahmyr Gibbs", grade: "Elite", rating: 90, trait: "Home Run Hitter" },
      { pos: "RB2", name: "David Montgomery", grade: "Above Avg", rating: 82, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "Amon-Ra St. Brown", grade: "Elite", rating: 93, trait: "Route Technician" },
      { pos: "WR2", name: "Jameson Williams", grade: "Above Avg", rating: 80, trait: "Deep Threat" },
      { pos: "WR3", name: "Kalif Raymond", grade: "Average", rating: 68, trait: "Slot" },
      { pos: "TE", name: "Sam LaPorta", grade: "Above Avg", rating: 82, trait: "Receiving TE" },
      { pos: "LT", name: "Taylor Decker", grade: "Above Avg", rating: 82, trait: "Pass Pro" },
      { pos: "LG", name: "Graham Glasgow", grade: "Above Avg", rating: 78, trait: "Run Blocking" },
      { pos: "C", name: "Frank Ragnow", grade: "Elite", rating: 91, trait: "Anchor" },
      { pos: "RG", name: "Kevin Zeitler", grade: "Above Avg", rating: 80, trait: "Run Blocking" },
      { pos: "RT", name: "Penei Sewell", grade: "Elite", rating: 94, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Aidan Hutchinson", grade: "Elite", rating: 93, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Marcus Davenport", grade: "Average", rating: 70, trait: "Power Rusher" },
      { pos: "DT1", name: "Alim McNeill", grade: "Above Avg", rating: 82, trait: "Interior Pressure" },
      { pos: "DT2", name: "DJ Reader", grade: "Above Avg", rating: 78, trait: "Nose Tackle" },
      { pos: "LB1", name: "Alex Anzalone", grade: "Above Avg", rating: 78, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Jack Campbell", grade: "Above Avg", rating: 76, trait: "Coverage LB" },
      { pos: "CB1", name: "Terrion Arnold", grade: "Above Avg", rating: 76, trait: "Press-Man" },
      { pos: "CB2", name: "Carlton Davis", grade: "Above Avg", rating: 76, trait: "Press-Man" },
      { pos: "SCB", name: "Amik Robertson", grade: "Average", rating: 72, trait: "Slot Corner" },
      { pos: "FS", name: "Kerby Joseph", grade: "Elite", rating: 88, trait: "Ball Hawk" },
      { pos: "SS", name: "Brian Branch", grade: "Elite", rating: 89, trait: "Hybrid" },
    ]
  },
  GB: {
    offense: [
      { pos: "QB", name: "Jordan Love", grade: "Above Avg", rating: 84, trait: "Gunslinger" },
      { pos: "RB1", name: "Josh Jacobs", grade: "Above Avg", rating: 82, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "MarShawn Lloyd", grade: "Average", rating: 68, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Jayden Reed", grade: "Above Avg", rating: 82, trait: "YAC Monster" },
      { pos: "WR2", name: "Romeo Doubs", grade: "Above Avg", rating: 78, trait: "Possession" },
      { pos: "WR3", name: "Dontayvion Wicks", grade: "Average", rating: 70, trait: "Deep Threat" },
      { pos: "TE", name: "Tucker Kraft", grade: "Above Avg", rating: 78, trait: "Receiving TE" },
      { pos: "LT", name: "Rasheed Walker", grade: "Average", rating: 72, trait: "Pass Pro" },
      { pos: "LG", name: "Elgton Jenkins", grade: "Above Avg", rating: 80, trait: "Run Blocking" },
      { pos: "C", name: "Josh Myers", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Sean Rhyan", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "RT", name: "Zach Tom", grade: "Above Avg", rating: 78, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Rashan Gary", grade: "Above Avg", rating: 84, trait: "Power Rusher" },
      { pos: "EDGE2", name: "Lukas Van Ness", grade: "Average", rating: 72, trait: "Speed Rusher" },
      { pos: "DT1", name: "Kenny Clark", grade: "Above Avg", rating: 80, trait: "Interior Pressure" },
      { pos: "DT2", name: "Devonte Wyatt", grade: "Average", rating: 72, trait: "Run Stuffer" },
      { pos: "LB1", name: "Quay Walker", grade: "Above Avg", rating: 78, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Isaiah McDuffie", grade: "Average", rating: 70, trait: "Coverage LB" },
      { pos: "CB1", name: "Jaire Alexander", grade: "Above Avg", rating: 84, trait: "Press-Man" },
      { pos: "CB2", name: "Eric Stokes", grade: "Average", rating: 70, trait: "Zone Corner" },
      { pos: "SCB", name: "Keisean Nixon", grade: "Average", rating: 70, trait: "Slot Corner" },
      { pos: "FS", name: "Xavier McKinney", grade: "Elite", rating: 88, trait: "Ball Hawk" },
      { pos: "SS", name: "Evan Williams", grade: "Average", rating: 70, trait: "Box Safety" },
    ]
  },
  HOU: {
    offense: [
      { pos: "QB", name: "CJ Stroud", grade: "Elite", rating: 86, trait: "Gunslinger" },
      { pos: "RB1", name: "Joe Mixon", grade: "Above Avg", rating: 82, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Dameon Pierce", grade: "Average", rating: 68, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Nico Collins", grade: "Elite", rating: 88, trait: "Possession" },
      { pos: "WR2", name: "Tank Dell", grade: "Above Avg", rating: 78, trait: "Deep Threat" },
      { pos: "WR3", name: "Stefon Diggs", grade: "Above Avg", rating: 80, trait: "Route Technician" },
      { pos: "TE", name: "Dalton Schultz", grade: "Above Avg", rating: 76, trait: "Receiving TE" },
      { pos: "LT", name: "Laremy Tunsil", grade: "Elite", rating: 92, trait: "Pass Pro" },
      { pos: "LG", name: "Kenyon Green", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "C", name: "Juice Scruggs", grade: "Average", rating: 68, trait: "Anchor" },
      { pos: "RG", name: "Shaq Mason", grade: "Above Avg", rating: 80, trait: "Run Blocking" },
      { pos: "RT", name: "Tytus Howard", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Will Anderson Jr", grade: "Elite", rating: 86, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Danielle Hunter", grade: "Above Avg", rating: 82, trait: "Power Rusher" },
      { pos: "DT1", name: "Foley Fatukasi", grade: "Average", rating: 72, trait: "Run Stuffer" },
      { pos: "DT2", name: "Tim Settle", grade: "Average", rating: 70, trait: "Nose Tackle" },
      { pos: "LB1", name: "Azeez Al-Shaair", grade: "Above Avg", rating: 78, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Henry To'oTo'o", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "Derek Stingley Jr", grade: "Elite", rating: 88, trait: "Press-Man" },
      { pos: "CB2", name: "Jeff Okudah", grade: "Average", rating: 72, trait: "Zone Corner" },
      { pos: "SCB", name: "Kamari Lassiter", grade: "Average", rating: 72, trait: "Slot Corner" },
      { pos: "FS", name: "Jimmie Ward", grade: "Above Avg", rating: 78, trait: "Single-High" },
      { pos: "SS", name: "Jalen Pitre", grade: "Above Avg", rating: 78, trait: "Hybrid" },
    ]
  },
  IND: {
    offense: [
      { pos: "QB", name: "Anthony Richardson", grade: "Average", rating: 72, trait: "Dual-Threat" },
      { pos: "RB1", name: "Jonathan Taylor", grade: "Elite", rating: 86, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Trey Sermon", grade: "Average", rating: 66, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "Michael Pittman Jr", grade: "Above Avg", rating: 78, trait: "Possession" },
      { pos: "WR2", name: "Josh Downs", grade: "Above Avg", rating: 76, trait: "Slot" },
      { pos: "WR3", name: "Adonai Mitchell", grade: "Average", rating: 68, trait: "Deep Threat" },
      { pos: "TE", name: "Mo Alie-Cox", grade: "Average", rating: 70, trait: "Blocking TE" },
      { pos: "LT", name: "Bernhard Raimann", grade: "Average", rating: 72, trait: "Pass Pro" },
      { pos: "LG", name: "Quenton Nelson", grade: "Elite", rating: 90, trait: "Run Blocking" },
      { pos: "C", name: "Ryan Kelly", grade: "Above Avg", rating: 78, trait: "Anchor" },
      { pos: "RG", name: "Will Fries", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "RT", name: "Braden Smith", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Kwity Paye", grade: "Above Avg", rating: 76, trait: "Power Rusher" },
      { pos: "EDGE2", name: "Dayo Odeyingbo", grade: "Average", rating: 72, trait: "Speed Rusher" },
      { pos: "DT1", name: "DeForest Buckner", grade: "Elite", rating: 88, trait: "Interior Pressure" },
      { pos: "DT2", name: "Grover Stewart", grade: "Above Avg", rating: 78, trait: "Nose Tackle" },
      { pos: "LB1", name: "Zaire Franklin", grade: "Above Avg", rating: 78, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "EJ Speed", grade: "Average", rating: 70, trait: "Coverage LB" },
      { pos: "CB1", name: "Kenny Moore II", grade: "Above Avg", rating: 80, trait: "Slot Corner" },
      { pos: "CB2", name: "Julius Brents", grade: "Average", rating: 68, trait: "Press-Man" },
      { pos: "SCB", name: "Dallis Flowers", grade: "Average", rating: 66, trait: "Slot Corner" },
      { pos: "FS", name: "Julian Blackmon", grade: "Above Avg", rating: 76, trait: "Single-High" },
      { pos: "SS", name: "Nick Cross", grade: "Average", rating: 72, trait: "Box Safety" },
    ]
  },
  JAX: {
    offense: [
      { pos: "QB", name: "Trevor Lawrence", grade: "Average", rating: 74, trait: "Dual-Threat" },
      { pos: "RB1", name: "Travis Etienne", grade: "Above Avg", rating: 78, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Tank Bigsby", grade: "Average", rating: 72, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "Brian Thomas Jr", grade: "Above Avg", rating: 80, trait: "Deep Threat" },
      { pos: "WR2", name: "Christian Kirk", grade: "Above Avg", rating: 76, trait: "Slot" },
      { pos: "WR3", name: "Gabe Davis", grade: "Average", rating: 70, trait: "Deep Threat" },
      { pos: "TE", name: "Evan Engram", grade: "Above Avg", rating: 80, trait: "Receiving TE" },
      { pos: "LT", name: "Cam Robinson", grade: "Average", rating: 72, trait: "Pass Pro" },
      { pos: "LG", name: "Ezra Cleveland", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "C", name: "Mitch Morse", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Brandon Scherff", grade: "Above Avg", rating: 76, trait: "Run Blocking" },
      { pos: "RT", name: "Anton Harrison", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Josh Hines-Allen", grade: "Elite", rating: 88, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Travon Walker", grade: "Average", rating: 72, trait: "Power Rusher" },
      { pos: "DT1", name: "Roy Robertson-Harris", grade: "Average", rating: 72, trait: "Run Stuffer" },
      { pos: "DT2", name: "DaVon Hamilton", grade: "Average", rating: 70, trait: "Interior Pressure" },
      { pos: "LB1", name: "Foyesade Oluokun", grade: "Above Avg", rating: 80, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Devin Lloyd", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "Tyson Campbell", grade: "Above Avg", rating: 76, trait: "Zone Corner" },
      { pos: "CB2", name: "Darnell Savage", grade: "Average", rating: 68, trait: "Press-Man" },
      { pos: "SCB", name: "Montaric Brown", grade: "Average", rating: 68, trait: "Slot Corner" },
      { pos: "FS", name: "Andre Cisco", grade: "Above Avg", rating: 76, trait: "Ball Hawk" },
      { pos: "SS", name: "Darnell Savage", grade: "Average", rating: 70, trait: "Box Safety" },
    ]
  },
  KC: {
    offense: [
      { pos: "QB", name: "Patrick Mahomes", grade: "Elite", rating: 96, trait: "Gunslinger" },
      { pos: "RB1", name: "Isiah Pacheco", grade: "Above Avg", rating: 80, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Kareem Hunt", grade: "Above Avg", rating: 76, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "Xavier Worthy", grade: "Above Avg", rating: 78, trait: "Deep Threat" },
      { pos: "WR2", name: "DeAndre Hopkins", grade: "Above Avg", rating: 77, trait: "Possession" },
      { pos: "WR3", name: "JuJu Smith-Schuster", grade: "Average", rating: 68, trait: "Slot" },
      { pos: "TE", name: "Travis Kelce", grade: "Elite", rating: 91, trait: "Receiving TE" },
      { pos: "LT", name: "Wanya Morris", grade: "Average", rating: 72, trait: "Pass Pro" },
      { pos: "LG", name: "Joe Thuney", grade: "Elite", rating: 89, trait: "Run Blocking" },
      { pos: "C", name: "Creed Humphrey", grade: "Elite", rating: 92, trait: "Anchor" },
      { pos: "RG", name: "Trey Smith", grade: "Elite", rating: 90, trait: "Run Blocking" },
      { pos: "RT", name: "Jawaan Taylor", grade: "Above Avg", rating: 77, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "George Karlaftis", grade: "Above Avg", rating: 82, trait: "Power Rusher" },
      { pos: "EDGE2", name: "Felix Anudike-Uzomah", grade: "Average", rating: 72, trait: "Speed Rusher" },
      { pos: "DT1", name: "Chris Jones", grade: "Elite", rating: 95, trait: "Interior Pressure" },
      { pos: "DT2", name: "Derrick Nnadi", grade: "Average", rating: 72, trait: "Nose Tackle" },
      { pos: "LB1", name: "Nick Bolton", grade: "Above Avg", rating: 82, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Drue Tranquill", grade: "Above Avg", rating: 78, trait: "Coverage LB" },
      { pos: "CB1", name: "Trent McDuffie", grade: "Elite", rating: 90, trait: "Press-Man" },
      { pos: "CB2", name: "Nazeeh Johnson", grade: "Average", rating: 70, trait: "Zone Corner" },
      { pos: "SCB", name: "Chamarri Conner", grade: "Above Avg", rating: 76, trait: "Slot Corner" },
      { pos: "FS", name: "Justin Reid", grade: "Above Avg", rating: 82, trait: "Single-High" },
      { pos: "SS", name: "Bryan Cook", grade: "Above Avg", rating: 78, trait: "Box Safety" },
    ]
  },
  LAC: {
    offense: [
      { pos: "QB", name: "Justin Herbert", grade: "Elite", rating: 88, trait: "Gunslinger" },
      { pos: "RB1", name: "JK Dobbins", grade: "Above Avg", rating: 80, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Gus Edwards", grade: "Average", rating: 70, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "Ladd McConkey", grade: "Above Avg", rating: 82, trait: "Route Technician" },
      { pos: "WR2", name: "Quentin Johnston", grade: "Average", rating: 72, trait: "Deep Threat" },
      { pos: "WR3", name: "Joshua Palmer", grade: "Average", rating: 68, trait: "Slot" },
      { pos: "TE", name: "Will Dissly", grade: "Average", rating: 72, trait: "Blocking TE" },
      { pos: "LT", name: "Rashawn Slater", grade: "Elite", rating: 90, trait: "Pass Pro" },
      { pos: "LG", name: "Zion Johnson", grade: "Above Avg", rating: 78, trait: "Run Blocking" },
      { pos: "C", name: "Bradley Bozeman", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Trey Pipkins", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "RT", name: "Joe Alt", grade: "Above Avg", rating: 80, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Khalil Mack", grade: "Elite", rating: 86, trait: "Power Rusher" },
      { pos: "EDGE2", name: "Joey Bosa", grade: "Above Avg", rating: 80, trait: "Speed Rusher" },
      { pos: "DT1", name: "Poona Ford", grade: "Above Avg", rating: 76, trait: "Run Stuffer" },
      { pos: "DT2", name: "Morgan Fox", grade: "Average", rating: 70, trait: "Interior Pressure" },
      { pos: "LB1", name: "Denzel Perryman", grade: "Above Avg", rating: 76, trait: "Thumper" },
      { pos: "LB2", name: "Junior Colson", grade: "Average", rating: 68, trait: "Coverage LB" },
      { pos: "CB1", name: "Kristian Fulton", grade: "Above Avg", rating: 76, trait: "Zone Corner" },
      { pos: "CB2", name: "Asante Samuel Jr", grade: "Above Avg", rating: 76, trait: "Press-Man" },
      { pos: "SCB", name: "Cam Hart", grade: "Average", rating: 68, trait: "Slot Corner" },
      { pos: "FS", name: "Derwin James", grade: "Elite", rating: 90, trait: "Hybrid" },
      { pos: "SS", name: "Alohi Gilman", grade: "Average", rating: 72, trait: "Box Safety" },
    ]
  },
  LAR: {
    offense: [
      { pos: "QB", name: "Matthew Stafford", grade: "Above Avg", rating: 84, trait: "Gunslinger" },
      { pos: "RB1", name: "Kyren Williams", grade: "Above Avg", rating: 78, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Blake Corum", grade: "Average", rating: 70, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Puka Nacua", grade: "Elite", rating: 90, trait: "YAC Monster" },
      { pos: "WR2", name: "Cooper Kupp", grade: "Above Avg", rating: 84, trait: "Route Technician" },
      { pos: "WR3", name: "Demarcus Robinson", grade: "Average", rating: 68, trait: "Slot" },
      { pos: "TE", name: "Tyler Higbee", grade: "Average", rating: 72, trait: "Receiving TE" },
      { pos: "LT", name: "Alaric Jackson", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
      { pos: "LG", name: "Steve Avila", grade: "Above Avg", rating: 78, trait: "Run Blocking" },
      { pos: "C", name: "Jonah Jackson", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Kevin Dotson", grade: "Above Avg", rating: 76, trait: "Run Blocking" },
      { pos: "RT", name: "Rob Havenstein", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Jared Verse", grade: "Above Avg", rating: 82, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Byron Young", grade: "Average", rating: 72, trait: "Power Rusher" },
      { pos: "DT1", name: "Kobie Turner", grade: "Above Avg", rating: 78, trait: "Interior Pressure" },
      { pos: "DT2", name: "Bobby Brown III", grade: "Average", rating: 68, trait: "Nose Tackle" },
      { pos: "LB1", name: "Christian Rozeboom", grade: "Average", rating: 72, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Ernest Jones IV", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "Darious Williams", grade: "Average", rating: 74, trait: "Zone Corner" },
      { pos: "CB2", name: "Cobie Durant", grade: "Average", rating: 72, trait: "Press-Man" },
      { pos: "SCB", name: "Tre Tomlinson", grade: "Average", rating: 68, trait: "Slot Corner" },
      { pos: "FS", name: "Quentin Lake", grade: "Average", rating: 70, trait: "Single-High" },
      { pos: "SS", name: "Kam Curl", grade: "Above Avg", rating: 76, trait: "Box Safety" },
    ]
  },
  LV: {
    offense: [
      { pos: "QB", name: "Aidan O'Connell", grade: "Average", rating: 66, trait: "Game Manager" },
      { pos: "RB1", name: "Zamir White", grade: "Average", rating: 68, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Alexander Mattison", grade: "Average", rating: 66, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Davante Adams", grade: "Elite", rating: 88, trait: "Route Technician" },
      { pos: "WR2", name: "Jakobi Meyers", grade: "Above Avg", rating: 76, trait: "Possession" },
      { pos: "WR3", name: "Tre Tucker", grade: "Average", rating: 68, trait: "Slot" },
      { pos: "TE", name: "Brock Bowers", grade: "Elite", rating: 88, trait: "Receiving TE" },
      { pos: "LT", name: "Kolton Miller", grade: "Above Avg", rating: 78, trait: "Pass Pro" },
      { pos: "LG", name: "Dylan Parham", grade: "Average", rating: 68, trait: "Run Blocking" },
      { pos: "C", name: "Andre James", grade: "Average", rating: 70, trait: "Anchor" },
      { pos: "RG", name: "Greg Van Roten", grade: "Average", rating: 66, trait: "Run Blocking" },
      { pos: "RT", name: "Thayer Munford Jr", grade: "Average", rating: 68, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Maxx Crosby", grade: "Elite", rating: 94, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Tyree Wilson", grade: "Average", rating: 70, trait: "Power Rusher" },
      { pos: "DT1", name: "Christian Wilkins", grade: "Above Avg", rating: 78, trait: "Interior Pressure" },
      { pos: "DT2", name: "John Jenkins", grade: "Average", rating: 68, trait: "Nose Tackle" },
      { pos: "LB1", name: "Robert Spillane", grade: "Above Avg", rating: 76, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Divine Deablo", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "Jack Jones", grade: "Average", rating: 70, trait: "Press-Man" },
      { pos: "CB2", name: "Nate Hobbs", grade: "Above Avg", rating: 76, trait: "Zone Corner" },
      { pos: "SCB", name: "Jakorian Bennett", grade: "Average", rating: 66, trait: "Slot Corner" },
      { pos: "FS", name: "Tre'von Moehrig", grade: "Above Avg", rating: 76, trait: "Single-High" },
      { pos: "SS", name: "Marcus Epps", grade: "Average", rating: 70, trait: "Box Safety" },
    ]
  },
  MIA: {
    offense: [
      { pos: "QB", name: "Tua Tagovailoa", grade: "Above Avg", rating: 80, trait: "Game Manager" },
      { pos: "RB1", name: "De'Von Achane", grade: "Elite", rating: 86, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Raheem Mostert", grade: "Average", rating: 72, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Tyreek Hill", grade: "Elite", rating: 92, trait: "Deep Threat" },
      { pos: "WR2", name: "Jaylen Waddle", grade: "Above Avg", rating: 84, trait: "YAC Monster" },
      { pos: "WR3", name: "Braxton Berrios", grade: "Average", rating: 66, trait: "Slot" },
      { pos: "TE", name: "Jonnu Smith", grade: "Above Avg", rating: 76, trait: "Receiving TE" },
      { pos: "LT", name: "Terron Armstead", grade: "Above Avg", rating: 82, trait: "Pass Pro" },
      { pos: "LG", name: "Robert Jones", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "C", name: "Aaron Brewer", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Robert Hunt", grade: "Above Avg", rating: 80, trait: "Run Blocking" },
      { pos: "RT", name: "Austin Jackson", grade: "Average", rating: 70, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Jaelan Phillips", grade: "Above Avg", rating: 78, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Chop Robinson", grade: "Average", rating: 70, trait: "Speed Rusher" },
      { pos: "DT1", name: "Zach Sieler", grade: "Above Avg", rating: 80, trait: "Interior Pressure" },
      { pos: "DT2", name: "Calais Campbell", grade: "Above Avg", rating: 76, trait: "Run Stuffer" },
      { pos: "LB1", name: "David Long Jr", grade: "Above Avg", rating: 76, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Anthony Walker", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "Jalen Ramsey", grade: "Above Avg", rating: 84, trait: "Press-Man" },
      { pos: "CB2", name: "Kendall Fuller", grade: "Average", rating: 72, trait: "Zone Corner" },
      { pos: "SCB", name: "Kader Kohou", grade: "Average", rating: 72, trait: "Slot Corner" },
      { pos: "FS", name: "Jevon Holland", grade: "Above Avg", rating: 82, trait: "Ball Hawk" },
      { pos: "SS", name: "Jordan Poyer", grade: "Above Avg", rating: 76, trait: "Box Safety" },
    ]
  },
  MIN: {
    offense: [
      { pos: "QB", name: "Sam Darnold", grade: "Above Avg", rating: 84, trait: "Gunslinger" },
      { pos: "RB1", name: "Aaron Jones", grade: "Above Avg", rating: 80, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Ty Chandler", grade: "Average", rating: 70, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Justin Jefferson", grade: "Elite", rating: 98, trait: "Route Technician" },
      { pos: "WR2", name: "Jordan Addison", grade: "Above Avg", rating: 80, trait: "Deep Threat" },
      { pos: "WR3", name: "Jalen Nailor", grade: "Average", rating: 68, trait: "Slot" },
      { pos: "TE", name: "TJ Hockenson", grade: "Above Avg", rating: 82, trait: "Receiving TE" },
      { pos: "LT", name: "Christian Darrisaw", grade: "Elite", rating: 88, trait: "Pass Pro" },
      { pos: "LG", name: "Blake Brandel", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "C", name: "Garrett Bradbury", grade: "Above Avg", rating: 76, trait: "Anchor" },
      { pos: "RG", name: "Ed Ingram", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "RT", name: "Brian O'Neill", grade: "Above Avg", rating: 80, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Jonathan Greenard", grade: "Elite", rating: 88, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Andrew Van Ginkel", grade: "Above Avg", rating: 78, trait: "Power Rusher" },
      { pos: "DT1", name: "Harrison Phillips", grade: "Average", rating: 72, trait: "Run Stuffer" },
      { pos: "DT2", name: "Jerry Tillery", grade: "Average", rating: 68, trait: "Interior Pressure" },
      { pos: "LB1", name: "Ivan Pace Jr", grade: "Average", rating: 72, trait: "Thumper" },
      { pos: "LB2", name: "Blake Cashman", grade: "Above Avg", rating: 76, trait: "Coverage LB" },
      { pos: "CB1", name: "Byron Murphy Jr", grade: "Above Avg", rating: 80, trait: "Zone Corner" },
      { pos: "CB2", name: "Shaquill Griffin", grade: "Average", rating: 70, trait: "Zone Corner" },
      { pos: "SCB", name: "Stephon Gilmore", grade: "Average", rating: 70, trait: "Press-Man" },
      { pos: "FS", name: "Harrison Smith", grade: "Above Avg", rating: 80, trait: "Single-High" },
      { pos: "SS", name: "Camryn Bynum", grade: "Above Avg", rating: 78, trait: "Box Safety" },
    ]
  },
  NE: {
    offense: [
      { pos: "QB", name: "Drake Maye", grade: "Average", rating: 70, trait: "Dual-Threat" },
      { pos: "RB1", name: "Rhamondre Stevenson", grade: "Above Avg", rating: 76, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Antonio Gibson", grade: "Average", rating: 68, trait: "Change-of-Pace" },
      { pos: "WR1", name: "DeMario Douglas", grade: "Average", rating: 72, trait: "Slot" },
      { pos: "WR2", name: "Kendrick Bourne", grade: "Average", rating: 68, trait: "YAC Monster" },
      { pos: "WR3", name: "Ja'Lynn Polk", grade: "Average", rating: 66, trait: "Possession" },
      { pos: "TE", name: "Hunter Henry", grade: "Above Avg", rating: 78, trait: "Receiving TE" },
      { pos: "LT", name: "Vederian Lowe", grade: "Average", rating: 66, trait: "Pass Pro" },
      { pos: "LG", name: "Sidy Sow", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "C", name: "David Andrews", grade: "Above Avg", rating: 78, trait: "Anchor" },
      { pos: "RG", name: "Mike Onwenu", grade: "Above Avg", rating: 80, trait: "Run Blocking" },
      { pos: "RT", name: "Demontrey Jacobs", grade: "Average", rating: 66, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Keion White", grade: "Above Avg", rating: 76, trait: "Power Rusher" },
      { pos: "EDGE2", name: "Matthew Judon", grade: "Above Avg", rating: 76, trait: "Speed Rusher" },
      { pos: "DT1", name: "Davon Godchaux", grade: "Above Avg", rating: 76, trait: "Run Stuffer" },
      { pos: "DT2", name: "Deatrich Wise Jr", grade: "Average", rating: 72, trait: "Interior Pressure" },
      { pos: "LB1", name: "Ja'Whaun Bentley", grade: "Average", rating: 72, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Jahlani Tavai", grade: "Average", rating: 70, trait: "Coverage LB" },
      { pos: "CB1", name: "Christian Gonzalez", grade: "Above Avg", rating: 82, trait: "Press-Man" },
      { pos: "CB2", name: "Jonathan Jones", grade: "Average", rating: 72, trait: "Zone Corner" },
      { pos: "SCB", name: "Marcus Jones", grade: "Average", rating: 70, trait: "Slot Corner" },
      { pos: "FS", name: "Kyle Dugger", grade: "Above Avg", rating: 80, trait: "Box Safety" },
      { pos: "SS", name: "Jabrill Peppers", grade: "Average", rating: 72, trait: "Hybrid" },
    ]
  },
  NO: {
    offense: [
      { pos: "QB", name: "Derek Carr", grade: "Average", rating: 74, trait: "Gunslinger" },
      { pos: "RB1", name: "Alvin Kamara", grade: "Above Avg", rating: 82, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Kendre Miller", grade: "Average", rating: 68, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "Chris Olave", grade: "Above Avg", rating: 82, trait: "Route Technician" },
      { pos: "WR2", name: "Rashid Shaheed", grade: "Above Avg", rating: 76, trait: "Deep Threat" },
      { pos: "WR3", name: "A.T. Perry", grade: "Average", rating: 68, trait: "Possession" },
      { pos: "TE", name: "Taysom Hill", grade: "Average", rating: 72, trait: "Blocking TE" },
      { pos: "LT", name: "Ryan Ramczyk", grade: "Above Avg", rating: 78, trait: "Pass Pro" },
      { pos: "LG", name: "Lucas Patrick", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "C", name: "Erik McCoy", grade: "Above Avg", rating: 78, trait: "Anchor" },
      { pos: "RG", name: "Cesar Ruiz", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "RT", name: "Trevor Penning", grade: "Average", rating: 70, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Chase Young", grade: "Above Avg", rating: 76, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Carl Granderson", grade: "Average", rating: 72, trait: "Power Rusher" },
      { pos: "DT1", name: "Bryan Bresee", grade: "Average", rating: 72, trait: "Interior Pressure" },
      { pos: "DT2", name: "Nathan Shepherd", grade: "Average", rating: 68, trait: "Nose Tackle" },
      { pos: "LB1", name: "Demario Davis", grade: "Elite", rating: 86, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Pete Werner", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "Paulson Adebo", grade: "Above Avg", rating: 78, trait: "Zone Corner" },
      { pos: "CB2", name: "Marshon Lattimore", grade: "Above Avg", rating: 78, trait: "Press-Man" },
      { pos: "SCB", name: "Alontae Taylor", grade: "Average", rating: 72, trait: "Slot Corner" },
      { pos: "FS", name: "Tyrann Mathieu", grade: "Above Avg", rating: 76, trait: "Hybrid" },
      { pos: "SS", name: "Jordan Howden", grade: "Average", rating: 68, trait: "Box Safety" },
    ]
  },
  NYG: {
    offense: [
      { pos: "QB", name: "Daniel Jones", grade: "Below Avg", rating: 58, trait: "Dual-Threat" },
      { pos: "RB1", name: "Tyrone Tracy Jr", grade: "Average", rating: 72, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Devin Singletary", grade: "Average", rating: 70, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Malik Nabers", grade: "Above Avg", rating: 82, trait: "Route Technician" },
      { pos: "WR2", name: "Wan'Dale Robinson", grade: "Average", rating: 72, trait: "Slot" },
      { pos: "WR3", name: "Jalin Hyatt", grade: "Average", rating: 66, trait: "Deep Threat" },
      { pos: "TE", name: "Theo Johnson", grade: "Average", rating: 68, trait: "Receiving TE" },
      { pos: "LT", name: "Andrew Thomas", grade: "Above Avg", rating: 82, trait: "Pass Pro" },
      { pos: "LG", name: "Jon Runyan Jr", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "C", name: "John Michael Schmitz", grade: "Average", rating: 70, trait: "Anchor" },
      { pos: "RG", name: "Greg Van Roten", grade: "Average", rating: 66, trait: "Run Blocking" },
      { pos: "RT", name: "Jermaine Eluemunor", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Brian Burns", grade: "Above Avg", rating: 84, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Kayvon Thibodeaux", grade: "Above Avg", rating: 76, trait: "Power Rusher" },
      { pos: "DT1", name: "Dexter Lawrence", grade: "Elite", rating: 92, trait: "Interior Pressure" },
      { pos: "DT2", name: "Rakeem Nunez-Roches", grade: "Average", rating: 68, trait: "Run Stuffer" },
      { pos: "LB1", name: "Bobby Okereke", grade: "Above Avg", rating: 78, trait: "Coverage LB" },
      { pos: "LB2", name: "Micah McFadden", grade: "Average", rating: 70, trait: "Sideline-to-Sideline" },
      { pos: "CB1", name: "Deonte Banks", grade: "Average", rating: 72, trait: "Press-Man" },
      { pos: "CB2", name: "Adoree Jackson", grade: "Average", rating: 70, trait: "Zone Corner" },
      { pos: "SCB", name: "Nick McCloud", grade: "Average", rating: 66, trait: "Slot Corner" },
      { pos: "FS", name: "Jason Pinnock", grade: "Average", rating: 72, trait: "Single-High" },
      { pos: "SS", name: "Dane Belton", grade: "Average", rating: 68, trait: "Box Safety" },
    ]
  },
  NYJ: {
    offense: [
      { pos: "QB", name: "Aaron Rodgers", grade: "Average", rating: 72, trait: "Gunslinger" },
      { pos: "RB1", name: "Breece Hall", grade: "Above Avg", rating: 82, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Braelon Allen", grade: "Average", rating: 70, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "Garrett Wilson", grade: "Above Avg", rating: 84, trait: "Route Technician" },
      { pos: "WR2", name: "Davante Adams", grade: "Elite", rating: 86, trait: "Route Technician" },
      { pos: "WR3", name: "Allen Lazard", grade: "Average", rating: 68, trait: "Possession" },
      { pos: "TE", name: "Tyler Conklin", grade: "Average", rating: 72, trait: "Receiving TE" },
      { pos: "LT", name: "Tyron Smith", grade: "Above Avg", rating: 78, trait: "Pass Pro" },
      { pos: "LG", name: "John Simpson", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "C", name: "Joe Tippmann", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Alijah Vera-Tucker", grade: "Above Avg", rating: 78, trait: "Run Blocking" },
      { pos: "RT", name: "Morgan Moses", grade: "Above Avg", rating: 76, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Haason Reddick", grade: "Above Avg", rating: 78, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Jermaine Johnson", grade: "Above Avg", rating: 76, trait: "Power Rusher" },
      { pos: "DT1", name: "Quinnen Williams", grade: "Elite", rating: 90, trait: "Interior Pressure" },
      { pos: "DT2", name: "Solomon Thomas", grade: "Average", rating: 70, trait: "Run Stuffer" },
      { pos: "LB1", name: "Quincy Williams", grade: "Above Avg", rating: 78, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "CJ Mosley", grade: "Above Avg", rating: 78, trait: "Coverage LB" },
      { pos: "CB1", name: "Sauce Gardner", grade: "Elite", rating: 90, trait: "Press-Man" },
      { pos: "CB2", name: "DJ Reed", grade: "Above Avg", rating: 78, trait: "Zone Corner" },
      { pos: "SCB", name: "Michael Carter II", grade: "Average", rating: 72, trait: "Slot Corner" },
      { pos: "FS", name: "Chuck Clark", grade: "Average", rating: 72, trait: "Box Safety" },
      { pos: "SS", name: "Tony Adams", grade: "Average", rating: 68, trait: "Single-High" },
    ]
  },
  PHI: {
    offense: [
      { pos: "QB", name: "Jalen Hurts", grade: "Above Avg", rating: 85, trait: "Dual-Threat" },
      { pos: "RB1", name: "Saquon Barkley", grade: "Elite", rating: 96, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Kenneth Gainwell", grade: "Average", rating: 68, trait: "Change-of-Pace" },
      { pos: "WR1", name: "AJ Brown", grade: "Elite", rating: 92, trait: "YAC Monster" },
      { pos: "WR2", name: "DeVonta Smith", grade: "Elite", rating: 89, trait: "Route Technician" },
      { pos: "WR3", name: "Jahan Dotson", grade: "Average", rating: 68, trait: "Slot" },
      { pos: "TE", name: "Dallas Goedert", grade: "Above Avg", rating: 80, trait: "Receiving TE" },
      { pos: "LT", name: "Jordan Mailata", grade: "Elite", rating: 90, trait: "Pass Pro" },
      { pos: "LG", name: "Landon Dickerson", grade: "Elite", rating: 89, trait: "Run Blocking" },
      { pos: "C", name: "Cam Jurgens", grade: "Above Avg", rating: 82, trait: "Anchor" },
      { pos: "RG", name: "Mekhi Becton", grade: "Above Avg", rating: 78, trait: "Run Blocking" },
      { pos: "RT", name: "Lane Johnson", grade: "Elite", rating: 93, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Josh Sweat", grade: "Above Avg", rating: 80, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Bryce Huff", grade: "Average", rating: 70, trait: "Speed Rusher" },
      { pos: "DT1", name: "Jalen Carter", grade: "Elite", rating: 91, trait: "Interior Pressure" },
      { pos: "DT2", name: "Jordan Davis", grade: "Above Avg", rating: 78, trait: "Nose Tackle" },
      { pos: "LB1", name: "Zack Baun", grade: "Elite", rating: 92, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Nakobe Dean", grade: "Above Avg", rating: 76, trait: "Coverage LB" },
      { pos: "CB1", name: "Darius Slay", grade: "Above Avg", rating: 80, trait: "Press-Man" },
      { pos: "CB2", name: "Quinyon Mitchell", grade: "Above Avg", rating: 82, trait: "Press-Man" },
      { pos: "SCB", name: "Cooper DeJean", grade: "Above Avg", rating: 78, trait: "Slot Corner" },
      { pos: "FS", name: "CJ Gardner-Johnson", grade: "Above Avg", rating: 80, trait: "Ball Hawk" },
      { pos: "SS", name: "Reed Blankenship", grade: "Above Avg", rating: 78, trait: "Box Safety" },
    ]
  },
  PIT: {
    offense: [
      { pos: "QB", name: "Russell Wilson", grade: "Above Avg", rating: 76, trait: "Gunslinger" },
      { pos: "RB1", name: "Najee Harris", grade: "Above Avg", rating: 76, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Jaylen Warren", grade: "Above Avg", rating: 76, trait: "Change-of-Pace" },
      { pos: "WR1", name: "George Pickens", grade: "Above Avg", rating: 82, trait: "Deep Threat" },
      { pos: "WR2", name: "Van Jefferson", grade: "Average", rating: 68, trait: "Route Technician" },
      { pos: "WR3", name: "Calvin Austin III", grade: "Average", rating: 66, trait: "Slot" },
      { pos: "TE", name: "Pat Freiermuth", grade: "Above Avg", rating: 78, trait: "Receiving TE" },
      { pos: "LT", name: "Dan Moore Jr", grade: "Average", rating: 70, trait: "Pass Pro" },
      { pos: "LG", name: "Isaac Seumalo", grade: "Above Avg", rating: 78, trait: "Run Blocking" },
      { pos: "C", name: "Nate Herbig", grade: "Average", rating: 70, trait: "Anchor" },
      { pos: "RG", name: "James Daniels", grade: "Above Avg", rating: 76, trait: "Run Blocking" },
      { pos: "RT", name: "Broderick Jones", grade: "Average", rating: 70, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "TJ Watt", grade: "Elite", rating: 96, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Alex Highsmith", grade: "Above Avg", rating: 80, trait: "Power Rusher" },
      { pos: "DT1", name: "Cameron Heyward", grade: "Above Avg", rating: 82, trait: "Interior Pressure" },
      { pos: "DT2", name: "Larry Ogunjobi", grade: "Above Avg", rating: 76, trait: "Run Stuffer" },
      { pos: "LB1", name: "Patrick Queen", grade: "Above Avg", rating: 78, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Elandon Roberts", grade: "Average", rating: 72, trait: "Thumper" },
      { pos: "CB1", name: "Joey Porter Jr", grade: "Above Avg", rating: 80, trait: "Press-Man" },
      { pos: "CB2", name: "Donte Jackson", grade: "Average", rating: 72, trait: "Zone Corner" },
      { pos: "SCB", name: "Beanie Bishop Jr", grade: "Average", rating: 68, trait: "Slot Corner" },
      { pos: "FS", name: "Minkah Fitzpatrick", grade: "Above Avg", rating: 84, trait: "Ball Hawk" },
      { pos: "SS", name: "DeShon Elliott", grade: "Above Avg", rating: 76, trait: "Box Safety" },
    ]
  },
  SEA: {
    offense: [
      { pos: "QB", name: "Geno Smith", grade: "Above Avg", rating: 80, trait: "Dual-Threat" },
      { pos: "RB1", name: "Kenneth Walker III", grade: "Above Avg", rating: 80, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Zach Charbonnet", grade: "Average", rating: 72, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "DK Metcalf", grade: "Elite", rating: 88, trait: "Deep Threat" },
      { pos: "WR2", name: "Jaxon Smith-Njigba", grade: "Above Avg", rating: 82, trait: "Route Technician" },
      { pos: "WR3", name: "Tyler Lockett", grade: "Average", rating: 74, trait: "Slot" },
      { pos: "TE", name: "Noah Fant", grade: "Average", rating: 72, trait: "Receiving TE" },
      { pos: "LT", name: "Charles Cross", grade: "Average", rating: 72, trait: "Pass Pro" },
      { pos: "LG", name: "Laken Tomlinson", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "C", name: "Connor Williams", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Anthony Bradford", grade: "Average", rating: 68, trait: "Run Blocking" },
      { pos: "RT", name: "Abraham Lucas", grade: "Average", rating: 72, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Uchenna Nwosu", grade: "Above Avg", rating: 78, trait: "Power Rusher" },
      { pos: "EDGE2", name: "Boye Mafe", grade: "Above Avg", rating: 76, trait: "Speed Rusher" },
      { pos: "DT1", name: "Leonard Williams", grade: "Above Avg", rating: 82, trait: "Interior Pressure" },
      { pos: "DT2", name: "Jarran Reed", grade: "Average", rating: 72, trait: "Run Stuffer" },
      { pos: "LB1", name: "Jerome Baker", grade: "Above Avg", rating: 76, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Tyrel Dodson", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "Devon Witherspoon", grade: "Elite", rating: 86, trait: "Press-Man" },
      { pos: "CB2", name: "Riq Woolen", grade: "Above Avg", rating: 76, trait: "Zone Corner" },
      { pos: "SCB", name: "Artie Burns", grade: "Average", rating: 66, trait: "Slot Corner" },
      { pos: "FS", name: "Julian Love", grade: "Above Avg", rating: 80, trait: "Ball Hawk" },
      { pos: "SS", name: "Rayshawn Jenkins", grade: "Average", rating: 72, trait: "Box Safety" },
    ]
  },
  SF: {
    offense: [
      { pos: "QB", name: "Brock Purdy", grade: "Above Avg", rating: 84, trait: "Game Manager" },
      { pos: "RB1", name: "Christian McCaffrey", grade: "Elite", rating: 94, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Jordan Mason", grade: "Above Avg", rating: 76, trait: "Between-the-Tackles" },
      { pos: "WR1", name: "Deebo Samuel", grade: "Elite", rating: 86, trait: "YAC Monster" },
      { pos: "WR2", name: "Brandon Aiyuk", grade: "Above Avg", rating: 84, trait: "Route Technician" },
      { pos: "WR3", name: "Jauan Jennings", grade: "Average", rating: 72, trait: "Possession" },
      { pos: "TE", name: "George Kittle", grade: "Elite", rating: 88, trait: "Receiving TE" },
      { pos: "LT", name: "Trent Williams", grade: "Elite", rating: 94, trait: "Pass Pro" },
      { pos: "LG", name: "Aaron Banks", grade: "Above Avg", rating: 76, trait: "Run Blocking" },
      { pos: "C", name: "Jake Brendel", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Dominick Puni", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "RT", name: "Colton McKivitz", grade: "Average", rating: 72, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Nick Bosa", grade: "Elite", rating: 94, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Leonard Floyd", grade: "Above Avg", rating: 78, trait: "Power Rusher" },
      { pos: "DT1", name: "Javon Hargrave", grade: "Above Avg", rating: 80, trait: "Interior Pressure" },
      { pos: "DT2", name: "Arik Armstead", grade: "Average", rating: 72, trait: "Run Stuffer" },
      { pos: "LB1", name: "Fred Warner", grade: "Elite", rating: 94, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "De'Vondre Campbell", grade: "Average", rating: 72, trait: "Coverage LB" },
      { pos: "CB1", name: "Charvarius Ward", grade: "Above Avg", rating: 80, trait: "Press-Man" },
      { pos: "CB2", name: "Deommodore Lenoir", grade: "Above Avg", rating: 78, trait: "Zone Corner" },
      { pos: "SCB", name: "Isaac Yiadom", grade: "Average", rating: 68, trait: "Slot Corner" },
      { pos: "FS", name: "Talanoa Hufanga", grade: "Above Avg", rating: 80, trait: "Box Safety" },
      { pos: "SS", name: "Ji'Aire Brown", grade: "Average", rating: 68, trait: "Single-High" },
    ]
  },
  TB: {
    offense: [
      { pos: "QB", name: "Baker Mayfield", grade: "Above Avg", rating: 84, trait: "Gunslinger" },
      { pos: "RB1", name: "Rachaad White", grade: "Above Avg", rating: 76, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Bucky Irving", grade: "Average", rating: 72, trait: "Home Run Hitter" },
      { pos: "WR1", name: "Mike Evans", grade: "Elite", rating: 88, trait: "Possession" },
      { pos: "WR2", name: "Chris Godwin", grade: "Elite", rating: 86, trait: "Route Technician" },
      { pos: "WR3", name: "Jalen McMillan", grade: "Average", rating: 68, trait: "Slot" },
      { pos: "TE", name: "Cade Otton", grade: "Above Avg", rating: 78, trait: "Receiving TE" },
      { pos: "LT", name: "Tristan Wirfs", grade: "Elite", rating: 92, trait: "Pass Pro" },
      { pos: "LG", name: "Ben Bredeson", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "C", name: "Robert Hainsey", grade: "Average", rating: 70, trait: "Anchor" },
      { pos: "RG", name: "Cody Mauch", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "RT", name: "Luke Goedeke", grade: "Average", rating: 70, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Yaya Diaby", grade: "Above Avg", rating: 76, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Joe Tryon-Shoyinka", grade: "Average", rating: 72, trait: "Power Rusher" },
      { pos: "DT1", name: "Vita Vea", grade: "Elite", rating: 88, trait: "Nose Tackle" },
      { pos: "DT2", name: "Calijah Kancey", grade: "Above Avg", rating: 76, trait: "Interior Pressure" },
      { pos: "LB1", name: "Lavonte David", grade: "Above Avg", rating: 82, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "SirVocea Dennis", grade: "Average", rating: 70, trait: "Coverage LB" },
      { pos: "CB1", name: "Jamel Dean", grade: "Above Avg", rating: 76, trait: "Zone Corner" },
      { pos: "CB2", name: "Zyon McCollum", grade: "Average", rating: 72, trait: "Press-Man" },
      { pos: "SCB", name: "Tykee Smith", grade: "Average", rating: 68, trait: "Slot Corner" },
      { pos: "FS", name: "Antoine Winfield Jr", grade: "Elite", rating: 90, trait: "Hybrid" },
      { pos: "SS", name: "Ryan Neal", grade: "Average", rating: 70, trait: "Box Safety" },
    ]
  },
  TEN: {
    offense: [
      { pos: "QB", name: "Will Levis", grade: "Average", rating: 66, trait: "Gunslinger" },
      { pos: "RB1", name: "Tony Pollard", grade: "Above Avg", rating: 78, trait: "Home Run Hitter" },
      { pos: "RB2", name: "Tyjae Spears", grade: "Average", rating: 72, trait: "Change-of-Pace" },
      { pos: "WR1", name: "DeAndre Hopkins", grade: "Above Avg", rating: 78, trait: "Possession" },
      { pos: "WR2", name: "Calvin Ridley", grade: "Above Avg", rating: 76, trait: "Route Technician" },
      { pos: "WR3", name: "Tyler Boyd", grade: "Average", rating: 70, trait: "Slot" },
      { pos: "TE", name: "Chigoziem Okonkwo", grade: "Average", rating: 74, trait: "Receiving TE" },
      { pos: "LT", name: "JC Latham", grade: "Average", rating: 72, trait: "Pass Pro" },
      { pos: "LG", name: "Peter Skoronski", grade: "Above Avg", rating: 76, trait: "Run Blocking" },
      { pos: "C", name: "Lloyd Cushenberry III", grade: "Average", rating: 72, trait: "Anchor" },
      { pos: "RG", name: "Dillon Radunz", grade: "Average", rating: 70, trait: "Run Blocking" },
      { pos: "RT", name: "Nicholas Petit-Frere", grade: "Average", rating: 68, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Harold Landry", grade: "Above Avg", rating: 80, trait: "Power Rusher" },
      { pos: "EDGE2", name: "Arden Key", grade: "Average", rating: 72, trait: "Speed Rusher" },
      { pos: "DT1", name: "Jeffery Simmons", grade: "Elite", rating: 88, trait: "Interior Pressure" },
      { pos: "DT2", name: "Sebastian Joseph-Day", grade: "Average", rating: 72, trait: "Run Stuffer" },
      { pos: "LB1", name: "Kenneth Murray Jr", grade: "Average", rating: 72, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Ernest Jones IV", grade: "Above Avg", rating: 76, trait: "Coverage LB" },
      { pos: "CB1", name: "L'Jarius Sneed", grade: "Above Avg", rating: 82, trait: "Press-Man" },
      { pos: "CB2", name: "Chidobe Awuzie", grade: "Average", rating: 72, trait: "Zone Corner" },
      { pos: "SCB", name: "Roger McCreary", grade: "Average", rating: 72, trait: "Slot Corner" },
      { pos: "FS", name: "Amani Hooker", grade: "Above Avg", rating: 78, trait: "Single-High" },
      { pos: "SS", name: "Quandre Diggs", grade: "Average", rating: 72, trait: "Box Safety" },
    ]
  },
  WAS: {
    offense: [
      { pos: "QB", name: "Jayden Daniels", grade: "Elite", rating: 90, trait: "Dual-Threat" },
      { pos: "RB1", name: "Brian Robinson Jr", grade: "Above Avg", rating: 78, trait: "Between-the-Tackles" },
      { pos: "RB2", name: "Austin Ekeler", grade: "Above Avg", rating: 76, trait: "Change-of-Pace" },
      { pos: "WR1", name: "Terry McLaurin", grade: "Elite", rating: 89, trait: "Deep Threat" },
      { pos: "WR2", name: "Dyami Brown", grade: "Average", rating: 70, trait: "Deep Threat" },
      { pos: "WR3", name: "Olamide Zaccheaus", grade: "Average", rating: 68, trait: "Slot" },
      { pos: "TE", name: "Zach Ertz", grade: "Above Avg", rating: 78, trait: "Receiving TE" },
      { pos: "LT", name: "Andrew Wylie", grade: "Average", rating: 70, trait: "Pass Pro" },
      { pos: "LG", name: "Nick Allegretti", grade: "Average", rating: 72, trait: "Run Blocking" },
      { pos: "C", name: "Tyler Biadasz", grade: "Above Avg", rating: 78, trait: "Anchor" },
      { pos: "RG", name: "Sam Cosmi", grade: "Above Avg", rating: 78, trait: "Run Blocking" },
      { pos: "RT", name: "Cornelius Lucas", grade: "Average", rating: 68, trait: "Pass Pro" },
    ],
    defense: [
      { pos: "EDGE1", name: "Dante Fowler Jr", grade: "Above Avg", rating: 76, trait: "Speed Rusher" },
      { pos: "EDGE2", name: "Dorance Armstrong", grade: "Average", rating: 72, trait: "Power Rusher" },
      { pos: "DT1", name: "Daron Payne", grade: "Above Avg", rating: 82, trait: "Interior Pressure" },
      { pos: "DT2", name: "Jonathan Allen", grade: "Above Avg", rating: 80, trait: "Run Stuffer" },
      { pos: "LB1", name: "Bobby Wagner", grade: "Above Avg", rating: 82, trait: "Sideline-to-Sideline" },
      { pos: "LB2", name: "Frankie Luvu", grade: "Above Avg", rating: 78, trait: "Coverage LB" },
      { pos: "CB1", name: "Marshon Lattimore", grade: "Above Avg", rating: 78, trait: "Press-Man" },
      { pos: "CB2", name: "Mike Sainristil", grade: "Average", rating: 72, trait: "Zone Corner" },
      { pos: "SCB", name: "Noah Igbinoghene", grade: "Average", rating: 66, trait: "Slot Corner" },
      { pos: "FS", name: "Quan Martin", grade: "Average", rating: 72, trait: "Single-High" },
      { pos: "SS", name: "Jeremy Chinn", grade: "Above Avg", rating: 76, trait: "Hybrid" },
    ]
  },
};

function genRoster(team) {
  return ROSTERS_2024[team] || ROSTERS_2024.ARI; // fallback
}

// Ã¢ÂÂÃ¢ÂÂ 2026 PROJECTED ROSTER ENGINE Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// Merges 2024 base roster with 2026 FA additions/losses
function genRoster2026(team) {
  const base = ROSTERS_2024[team] || ROSTERS_2024.ARI;
  const fa = FA_MOVES_2026[team];
  if (!fa) return { offense: base.offense.map(p => ({ ...p, isNew: false })), defense: base.defense.map(p => ({ ...p, isNew: false })) };

  const lostNames = new Set((fa.lost || []).map(p => p.name));

  // Remove departed players from base
  let offense = base.offense.filter(p => !lostNames.has(p.name)).map(p => ({ ...p, isNew: false }));
  let defense = base.defense.filter(p => !lostNames.has(p.name)).map(p => ({ ...p, isNew: false }));

  // Categorize FA additions as offense or defense
  const offPositions = new Set(["QB","RB","WR","TE","OT","OG","OL","C","LT","LG","RG","RT","RB1","RB2","WR1","WR2","WR3"]);
  const added = fa.added || [];
  added.forEach(p => {
    const entry = {
      pos: p.pos, name: p.name, grade: "TBD", rating: 75,
      trait: p.note || p.deal || "New Addition", isNew: true,
      deal: p.deal || null, faNote: p.note || null
    };
    if (offPositions.has(p.pos)) {
      // Insert at appropriate position (QB first, then skill, then OL)
      const posOrder = ["QB","RB","WR","TE","OT","OG","OL","C","LT","LG","RG","RT"];
      const idx = offense.findIndex(op => posOrder.indexOf(op.pos.replace(/[0-9]/g,"")) > posOrder.indexOf(p.pos.replace(/[0-9]/g,"")));
      if (idx >= 0) offense.splice(idx, 0, entry); else offense.push(entry);
    } else {
      const posOrder = ["EDGE","DL","DT","LB","CB","S"];
      const idx = defense.findIndex(dp => posOrder.indexOf(dp.pos.replace(/[0-9]/g,"")) > posOrder.indexOf(p.pos.replace(/[0-9]/g,"")));
      if (idx >= 0) defense.splice(idx, 0, entry); else defense.push(entry);
    }
  });

  return { offense, defense, note: fa.note || null };
}

// Ã¢ÂÂÃ¢ÂÂ 2025 SEASON RECORDS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const RECORDS_2025 = {
  NE:{w:14,l:3},DEN:{w:14,l:3},SEA:{w:14,l:3},JAX:{w:13,l:4},
  BUF:{w:12,l:5},HOU:{w:12,l:5},LAR:{w:12,l:5},SF:{w:12,l:5},
  LAC:{w:11,l:6},PHI:{w:11,l:6},CHI:{w:11,l:6},PIT:{w:10,l:7},
  GB:{w:9,l:7,t:1},DET:{w:9,l:8},MIN:{w:9,l:8},BAL:{w:8,l:9},
  IND:{w:8,l:9},CAR:{w:8,l:9},TB:{w:8,l:9},ATL:{w:8,l:9},
  DAL:{w:7,l:9,t:1},MIA:{w:7,l:10},CIN:{w:6,l:11},NO:{w:6,l:11},
  KC:{w:6,l:11},CLE:{w:5,l:12},WAS:{w:5,l:12},NYG:{w:4,l:13},
  NYJ:{w:3,l:14},TEN:{w:3,l:14},LV:{w:3,l:14},ARI:{w:3,l:14},
};

// Ã¢ÂÂÃ¢ÂÂ 2026 OPPONENTS (all 32 teams) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const OPPONENTS_2026 = {
  ARI:{home:["LAR","SEA","SF","ATL","CAR","CLE","DET","JAX","TEN"],away:["LAR","SEA","SF","CHI","DAL","DEN","GB","HOU","MIN"]},
  ATL:{home:["CAR","NO","TB","BAL","CIN","JAX","LAC","NE"],away:["CAR","NO","TB","ARI","BUF","CLE","DEN","HOU","NYJ"]},
  BAL:{home:["CIN","CLE","PIT","BUF","HOU","LAC","NE","SEA"],away:["CIN","CLE","PIT","ATL","DEN","JAX","KC","LAR","SF"]},
  BUF:{home:["MIA","NE","NYJ","BAL","CHI","DET","KC","LAC"],away:["MIA","NE","NYJ","DEN","GB","HOU","LV","LAR","MIN"]},
  CAR:{home:["ATL","NO","TB","ARI","CHI","CLE","HOU","MIN","SEA"],away:["ATL","NO","TB","DEN","DET","GB","JAX","LAC"]},
  CHI:{home:["DET","GB","MIN","DEN","JAX","LAC","NE","PHI"],away:["DET","GB","MIN","ARI","BUF","CAR","HOU","PIT","SEA"]},
  CIN:{home:["BAL","CLE","PIT","DEN","GB","HOU","LAR","MIN"],away:["BAL","CLE","PIT","ATL","JAX","KC","NE","SEA","SF"]},
  CLE:{home:["BAL","CIN","PIT","ATL","BUF","DEN","JAX","NO","SEA"],away:["BAL","CIN","PIT","ARI","CAR","HOU","LAC","NE"]},
  DAL:{home:["NYG","PHI","WAS","DET","GB","HOU","LV","SF"],away:["NYG","PHI","WAS","DEN","JAX","KC","LAR","MIN","NE"]},
  DEN:{home:["KC","LAC","LV","ATL","BAL","BUF","CAR","DAL","WAS"],away:["KC","LAC","LV","ARI","CHI","CIN","CLE","HOU"]},
  DET:{home:["CHI","GB","MIN","CAR","JAX","LAR","NE","SF"],away:["CHI","GB","MIN","ARI","BUF","DAL","HOU","SEA","WAS"]},
  GB:{home:["CHI","DET","MIN","ARI","BUF","CAR","HOU","SEA"],away:["CHI","DET","MIN","CIN","DAL","DEN","JAX","NE","SF"]},
  HOU:{home:["IND","JAX","TEN","ARI","ATL","CHI","CLE","DEN","DET"],away:["IND","JAX","TEN","BAL","BUF","CAR","GB","KC"]},
  IND:{home:["HOU","JAX","TEN","DEN","KC","LAR","NE","PHI","SF"],away:["HOU","JAX","TEN","LAC","LV","NO","NYG","SEA"]},
  JAX:{home:["HOU","IND","TEN","ATL","BAL","CAR","CIN","DAL","GB"],away:["HOU","IND","TEN","ARI","CHI","CLE","DEN","DET"]},
  KC:{home:["DEN","LAC","LV","BAL","CIN","DAL","HOU","NYJ"],away:["DEN","LAC","LV","BUF","IND","NE","NO","SEA","WAS"]},
  LAC:{home:["DEN","KC","LV","ATL","CAR","CLE","IND","NE"],away:["DEN","KC","LV","ARI","BAL","BUF","CHI","PHI","SEA"]},
  LAR:{home:["ARI","SEA","SF","BAL","BUF","DAL","LV","MIN"],away:["ARI","SEA","SF","CIN","DET","NE","NYG","PHI","WAS"]},
  LV:{home:["DEN","KC","LAC","BUF","IND","NE","NO","NYG"],away:["DEN","KC","LAC","DAL","LAR","NYJ","PHI","SEA","WAS"]},
  MIA:{home:["BUF","NE","NYJ","DEN","JAX","PIT","SEA","TB"],away:["BUF","NE","NYJ","KC","LAC","LAR","NO","SF","TEN"]},
  MIN:{home:["CHI","DET","GB","BUF","CAR","DAL","NE","TEN"],away:["CHI","DET","GB","ARI","CIN","LAR","PHI","SEA","WAS"]},
  NE:{home:["BUF","MIA","NYJ","CIN","DAL","GB","KC","LAR"],away:["BUF","MIA","NYJ","BAL","CHI","CLE","DET","IND","LAC","LV","MIN"]},
  NO:{home:["ATL","CAR","TB","IND","KC","MIA","NYG","PHI"],away:["ATL","CAR","TB","CLE","LV","NE","SEA","SF","WAS"]},
  NYG:{home:["DAL","PHI","WAS","DAL","IND","LAR","NE","SEA"],away:["DAL","PHI","WAS","LV","NO","SF","TB","TEN"]},
  NYJ:{home:["BUF","MIA","NE","ATL","LV","PIT","SEA","SF"],away:["BUF","MIA","NE","KC","LAC","PHI","TB","TEN","WAS"]},
  PHI:{home:["DAL","NYG","WAS","LAC","LAR","LV","MIN","NYJ"],away:["DAL","NYG","WAS","CHI","IND","NO","PIT","SF","TB"]},
  PIT:{home:["BAL","CIN","CLE","CHI","MIA","PHI","SEA","TEN"],away:["BAL","CIN","CLE","DEN","HOU","JAX","NE","NYJ"]},
  SEA:{home:["ARI","LAR","SF","CHI","DET","IND","LAC","LV","MIN"],away:["ARI","LAR","SF","BAL","CAR","CLE","GB","MIA","NYG","NYJ","PIT"]},
  SF:{home:["ARI","LAR","SEA","BAL","CIN","GB","NO","NYG"],away:["ARI","LAR","SEA","DAL","DET","HOU","IND","NYJ","PHI"]},
  TB:{home:["ATL","CAR","NO","DEN","HOU","NYG","NYJ","PHI","TEN"],away:["ATL","CAR","NO","IND","JAX","MIA","PIT","SEA"]},
  TEN:{home:["HOU","IND","JAX","KC","LAC","MIA","NYG","NYJ"],away:["HOU","IND","JAX","ARI","DEN","MIN","PIT","SEA","TB"]},
  WAS:{home:["DAL","NYG","PHI","DET","KC","LV","MIN","NO","SEA"],away:["DAL","NYG","PHI","DEN","LAR","NE","NYJ","TB"]},
};

// Ã¢ÂÂÃ¢ÂÂ 2026 FREE AGENCY & ROSTER MOVES Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const FA_MOVES_2026 = {
  ARI:{added:[{name:"Tyler Allgeier",pos:"RB"},{name:"Isaac Seumalo",pos:"OG"},{name:"Gardner Minshew",pos:"QB"}],lost:[]},
  ATL:{added:[{name:"Tua Tagovailoa",pos:"QB",deal:"$1.3M/1yr",note:"competing with Penix Jr"},{name:"Jahan Dotson",pos:"WR"}],lost:[{name:"Kirk Cousins",pos:"QB",note:"released"}],note:"Kyle Pitts franchise tagged; Penix returning from Nov 2025 ACL"},
  BAL:{added:[{name:"Trey Hendrickson",pos:"EDGE",deal:"$112M/4yr"}],lost:[]},
  BUF:{added:[{name:"DJ Moore",pos:"WR",note:"trade from CHI"},{name:"Bradley Chubb",pos:"EDGE"}],lost:[]},
  CAR:{added:[{name:"Jaelan Phillips",pos:"EDGE",deal:"$120M"},{name:"Devin Lloyd",pos:"LB"},{name:"Kenny Pickett",pos:"QB"}],lost:[]},
  CHI:{added:[{name:"Kalif Raymond",pos:"WR"},{name:"Neville Gallimore",pos:"DT"},{name:"Garrett Bradbury",pos:"C"},{name:"Coby Bryant",pos:"S"},{name:"Devin Bush",pos:"LB"},{name:"Braxton Jones",pos:"OT",note:"re-signed"}],lost:[{name:"DJ Moore",pos:"WR",note:"traded to BUF"}],note:"2025 draft: Colston Loveland (TE, R1), Luther Burden III (WR, R2) now on roster"},
  CIN:{added:[{name:"Boye Mafe",pos:"EDGE"},{name:"Jonathan Allen",pos:"DL"},{name:"Bryan Cook",pos:"S"}],lost:[]},
  CLE:{added:[{name:"Tytus Howard",pos:"OT"},{name:"Zion Johnson",pos:"OG"},{name:"Elgton Jenkins",pos:"OL"}],lost:[]},
  DAL:{added:[{name:"George Pickens",pos:"WR",note:"franchise tag"},{name:"Rashan Gary",pos:"EDGE",note:"trade from GB"},{name:"Javonte Williams",pos:"RB"}],lost:[]},
  DEN:{added:[],lost:[]},
  DET:{added:[{name:"Isiah Pacheco",pos:"RB"}],lost:[{name:"David Montgomery",pos:"RB"}]},
  GB:{added:[{name:"Zaire Franklin",pos:"LB"},{name:"Javon Hargrave",pos:"DL"}],lost:[{name:"Rashan Gary",pos:"EDGE"},{name:"Romeo Doubs",pos:"WR"},{name:"Quay Walker",pos:"LB"}]},
  HOU:{added:[{name:"David Montgomery",pos:"RB",note:"trade from DET"},{name:"Reed Blankenship",pos:"S"},{name:"Braden Smith",pos:"OT"}],lost:[]},
  IND:{added:[{name:"Daniel Jones",pos:"QB",deal:"~$100M/2yr",note:"top-6 passer rating in 2025"},{name:"Alec Pierce",pos:"WR",note:"re-signed"}],lost:[{name:"Anthony Richardson",pos:"QB",note:"seeking trade"}]},
  JAX:{added:[],lost:[]},
  KC:{added:[{name:"Kenneth Walker III",pos:"RB",deal:"$45M"}],lost:[{name:"Trent McDuffie",pos:"CB"}]},
  LAC:{added:[{name:"Tyler Biadasz",pos:"C"},{name:"Charlie Kolar",pos:"TE"}],lost:[]},
  LAR:{added:[{name:"Trent McDuffie",pos:"CB",deal:"$124M"},{name:"Jaylen Watson",pos:"CB"}],lost:[]},
  LV:{added:[{name:"Tyler Linderbaum",pos:"C",deal:"$81M"},{name:"Nakobe Dean",pos:"LB"},{name:"Quay Walker",pos:"LB"},{name:"Kwity Paye",pos:"EDGE"}],lost:[]},
  MIA:{added:[{name:"Malik Willis",pos:"QB"}],lost:[{name:"Tua Tagovailoa",pos:"QB"}]},
  MIN:{added:[{name:"Kyler Murray",pos:"QB"}],lost:[{name:"Sam Darnold",pos:"QB"}]},
  NE:{added:[{name:"Romeo Doubs",pos:"WR"},{name:"Alijah Vera-Tucker",pos:"OG"}],lost:[]},
  NO:{added:[{name:"Travis Etienne",pos:"RB",deal:"$52M"},{name:"Noah Fant",pos:"TE"},{name:"Kaden Elliss",pos:"LB"}],lost:[]},
  NYG:{added:[{name:"Isaiah Likely",pos:"TE",deal:"$40M"},{name:"Tremaine Edmunds",pos:"LB"}],lost:[]},
  NYJ:{added:[{name:"Geno Smith",pos:"QB"},{name:"Minkah Fitzpatrick",pos:"S"},{name:"T'Vondre Sweat",pos:"DL"}],lost:[]},
  PHI:{added:[{name:"Tariq Woolen",pos:"CB"},{name:"Arnold Ebiketie",pos:"EDGE"}],lost:[],note:"Jordan Davis extension $78M"},
  PIT:{added:[{name:"Michael Pittman",pos:"WR",note:"trade from IND"},{name:"Rico Dowdle",pos:"RB"}],lost:[],note:"George Pickens franchise tagged"},
  SEA:{added:[{name:"Rashid Shaheed",pos:"WR",note:"re-signed"}],lost:[{name:"Kenneth Walker III",pos:"RB"}]},
  SF:{added:[{name:"Mike Evans",pos:"WR"},{name:"Osa Odighizuwa",pos:"DT"}],lost:[]},
  TB:{added:[{name:"Jake Browning",pos:"QB",note:"backup behind Baker Mayfield"},{name:"Kenneth Gainwell",pos:"RB"},{name:"Alex Anzalone",pos:"LB"}],lost:[]},
  TEN:{added:[{name:"Wan'Dale Robinson",pos:"WR"},{name:"John Franklin-Myers",pos:"DL"},{name:"Jermaine Johnson",pos:"EDGE"}],lost:[]},
  WAS:{added:[{name:"Odafe Oweh",pos:"EDGE",deal:"$100M"},{name:"Laremy Tunsil",pos:"OT"},{name:"Rachaad White",pos:"RB"},{name:"Chigoziem Okonkwo",pos:"TE"}],lost:[]},
};

// Ã¢ÂÂÃ¢ÂÂ 2026 DRAFT NEEDS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const DRAFT_NEEDS_2026 = {
  ARI:["QB","EDGE","CB","OL"],ATL:["EDGE","OL","RB","S"],BAL:["WR","OL","CB","LB"],
  BUF:["OL","DL","LB","S"],CAR:["OL","WR","CB","S"],CHI:["EDGE","OL","CB","DL"],
  CIN:["OL","LB","CB","RB"],CLE:["QB","WR","EDGE","CB"],DAL:["OL","CB","S","LB"],
  DEN:["WR","CB","EDGE","OL"],DET:["DL","EDGE","CB","OL"],GB:["WR","EDGE","CB","LB"],
  HOU:["WR","CB","DL","LB"],IND:["WR","CB","EDGE","OL"],JAX:["OL","CB","WR","DL"],
  KC:["CB","OL","WR","LB"],LAC:["WR","LB","EDGE","S"],LAR:["DL","LB","OL","RB"],
  LV:["QB","WR","CB","OL"],MIA:["QB","OL","WR","LB"],MIN:["OL","EDGE","CB","WR"],
  NE:["WR","OL","CB","DL"],NO:["RB","EDGE","CB","OL"],NYG:["QB","OL","EDGE","CB"],
  NYJ:["OL","WR","CB","LB"],PHI:["LB","S","WR","OL"],PIT:["OL","CB","DL","WR"],
  SEA:["RB","OL","DL","LB"],SF:["OL","EDGE","CB","QB"],TB:["OL","EDGE","CB","DL"],
  TEN:["QB","OL","WR","CB"],WAS:["DL","LB","CB","S"],
};

// Ã¢ÂÂÃ¢ÂÂ 2026 UPDATED DNA (post-FA identity shifts) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const DNA_2026 = {
  ARI:{p:.55,e:.40,x:.06,s:"Rebuilding Ã¢ÂÂ Minshew Bridge Year"},
  ATL:{p:.56,e:.46,x:.08,s:"Penix/Tua QB Battle Ã¢ÂÂ Penix Back from ACL"},
  BAL:{p:.44,e:.56,x:.13,s:"Lamar + Hendrickson Pass Rush"},
  BUF:{p:.60,e:.54,x:.12,s:"Allen + DJ Moore Deep Threats"},
  CAR:{p:.54,e:.39,x:.06,s:"Phillips Anchors New Defense"},
  CHI:{p:.57,e:.48,x:.08,s:"Caleb Year 3 Ã¢ÂÂ Odunze & Burden Lead"},
  CIN:{p:.62,e:.50,x:.10,s:"Burrow's Revamped D-Line"},
  CLE:{p:.52,e:.40,x:.06,s:"OL Overhaul, Still Need QB"},
  DAL:{p:.58,e:.44,x:.08,s:"Pickens + Gary Refresh"},
  DEN:{p:.53,e:.50,x:.09,s:"Nix Year 3 Ã¢ÂÂ Proven Contender"},
  DET:{p:.55,e:.54,x:.11,s:"Pacheco Replaces Monty"},
  GB:{p:.54,e:.46,x:.09,s:"Love Minus Key Pieces"},
  HOU:{p:.57,e:.50,x:.10,s:"Stroud's Upgraded Backfield"},
  IND:{p:.55,e:.48,x:.08,s:"Daniel Jones Franchise QB Ã¢ÂÂ Richardson Out"},
  JAX:{p:.57,e:.42,x:.07,s:"Lawrence Redemption Season"},
  KC:{p:.57,e:.49,x:.09,s:"Kenneth Walker Replaces Lost CB"},
  LAC:{p:.53,e:.49,x:.08,s:"Herbert's Steady Ship"},
  LAR:{p:.59,e:.48,x:.09,s:"McDuffie Locks Down Secondary"},
  LV:{p:.53,e:.38,x:.05,s:"Linderbaum Anchors, Need QB"},
  MIA:{p:.55,e:.40,x:.09,s:"Malik Willis Speed Experiment"},
  MIN:{p:.56,e:.48,x:.09,s:"Kyler Murray's Vikings"},
  NE:{p:.52,e:.42,x:.07,s:"Drake Maye Year 3 + Doubs Connection"},
  NO:{p:.55,e:.44,x:.08,s:"Etienne Powers Run Game"},
  NYG:{p:.53,e:.37,x:.05,s:"Likely Target, Still Rebuilding"},
  NYJ:{p:.56,e:.43,x:.07,s:"Geno + Sweat Reinvention"},
  PHI:{p:.56,e:.53,x:.10,s:"Saquon + Woolen Upgrade"},
  PIT:{p:.55,e:.46,x:.08,s:"Pittman Boosts Pass Game"},
  SEA:{p:.57,e:.44,x:.08,s:"Lost Walker, Need RB Answer"},
  SF:{p:.54,e:.48,x:.09,s:"Mike Evans Joins Dynasty"},
  TB:{p:.58,e:.48,x:.09,s:"Baker's Bucs + Browning Backup Depth"},
  TEN:{p:.52,e:.41,x:.06,s:"Franklin-Myers Anchors Front"},
  WAS:{p:.56,e:.50,x:.10,s:"Oweh + Tunsil Trench Upgrade"},
};

// helper: get record string
function recordStr(tm) {
  const r = RECORDS_2025[tm];
  if (!r) return "";
  return r.t ? `${r.w}-${r.l}-${r.t}` : `${r.w}-${r.l}`;
}

// Ã¢ÂÂÃ¢ÂÂ WIN PROJECTION ENGINE Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// Power rating: composite of DNA efficiency, explosive rate, and 2025 record
function teamPower(tm) {
  const dna = DNA_2026[tm] || DNA[tm];
  const rec = RECORDS_2025[tm] || { w: 8, l: 9 };
  const winPct = rec.w / (rec.w + rec.l + (rec.t || 0) * 0.5);
  // Weighted: 40% prior record, 35% efficiency, 25% explosive
  return winPct * 0.40 + dna.e * 0.35 + dna.x * 2.5 * 0.25;
}

// Game-by-game win probability using log5 method + home advantage
function gameWinProb(team, opp, isHome) {
  const pA = teamPower(team);
  const pB = teamPower(opp);
  // Log5 formula
  const raw = (pA * (1 - pB)) / (pA * (1 - pB) + pB * (1 - pA));
  // Home field advantage: ~57% historical NFL home win rate Ã¢ÂÂ +3.5% boost
  const hfa = isHome ? 0.035 : -0.035;
  return Math.min(0.95, Math.max(0.05, raw + hfa));
}

// Full season projection for a team
function projectSeason(tm) {
  const opp = OPPONENTS_2026[tm];
  if (!opp) return null;
  const games = [
    ...opp.home.map(o => ({ opp: o, loc: "HOME", isHome: true })),
    ...opp.away.map(o => ({ opp: o, loc: "AWAY", isHome: false })),
  ];
  let totalWins = 0;
  const gameProbs = games.map(g => {
    const wp = gameWinProb(tm, g.opp, g.isHome);
    totalWins += wp;
    return { ...g, winProb: wp };
  });
  // Sort by difficulty (lowest win prob = hardest)
  const sorted = [...gameProbs].sort((a, b) => a.winProb - b.winProb);
  const hardest3 = sorted.slice(0, 3);
  const easiest3 = sorted.slice(-3).reverse();

  // Confidence band: use variance of Bernoulli trials
  // Var(total wins) = sum of p*(1-p), SD = sqrt(var)
  const variance = gameProbs.reduce((s, g) => s + g.winProb * (1 - g.winProb), 0);
  const sd = Math.sqrt(variance);
  const floor = Math.max(0, Math.round(totalWins - 1.5 * sd));
  const ceiling = Math.min(games.length, Math.round(totalWins + 1.5 * sd));

  // Strength of schedule: avg opponent power
  const sos = gameProbs.reduce((s, g) => s + teamPower(g.opp), 0) / gameProbs.length;

  // Division record projection
  const myInfo = T.find(t => t.a === tm);
  const divGames = gameProbs.filter(g => {
    const oppInfo = T.find(t => t.a === g.opp);
    return oppInfo && oppInfo.c === myInfo?.c && oppInfo.d === myInfo?.d;
  });
  const divWins = divGames.reduce((s, g) => s + g.winProb, 0);

  return {
    games: gameProbs,
    projectedWins: totalWins,
    floor, ceiling, sd,
    sos,
    hardest3, easiest3,
    divWins, divGames: divGames.length,
    sosRank: 0, // filled in by caller
    winsRank: 0,
  };
}

// All 32 teams projected Ã¢ÂÂ with ranks
function projectAll32() {
  const projections = {};
  T.forEach(t => { projections[t.a] = projectSeason(t.a); });
  // Rank by SOS (higher = harder)
  const sosSorted = T.map(t => t.a).sort((a, b) => (projections[b]?.sos || 0) - (projections[a]?.sos || 0));
  sosSorted.forEach((tm, i) => { if (projections[tm]) projections[tm].sosRank = i + 1; });
  // Rank by projected wins
  const winsSorted = T.map(t => t.a).sort((a, b) => (projections[b]?.projectedWins || 0) - (projections[a]?.projectedWins || 0));
  winsSorted.forEach((tm, i) => { if (projections[tm]) projections[tm].winsRank = i + 1; });
  return projections;
}

// Ã¢ÂÂÃ¢ÂÂ SEEDED RNG Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function sr(seed) { let s = seed; return () => { s = (s*16807)%2147483647; return (s-1)/2147483646; }; }

// Ã¢ÂÂÃ¢ÂÂ ENHANCED DATA GENERATION (v4) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
// New fields: scoreDiff, driveId, complete (pass), personnel, timeLeft
function generatePlays() {
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

// Ã¢ÂÂÃ¢ÂÂ FILTER ENGINE Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const DEFAULT_FILTERS = {
  season: "all", weekMin: 1, weekMax: 18,
  down: "all", distBucket: "all",
  fpZone: "all", quarter: "all",
  homeAway: "all", env: "all",
  twoMin: false, redZone: false,
  scoreDiff: "all", pers: "all"
};

function applyFilters(plays, f) {
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

// Ã¢ÂÂÃ¢ÂÂ AGGREGATION Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function agg(plays, tm) {
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
function lgbl(plays) {
  const t = plays.length || 1;
  const passes = plays.filter(p => p.type === "Pass");
  return {
    pr: passes.length / t, sr: plays.filter(p => p.isS).length / t,
    xr: plays.filter(p => p.isX).length / t, ay: plays.reduce((s, p) => s + p.yd, 0) / t,
    compRate: passes.length ? passes.filter(p => p.complete === true).length / passes.length : 0
  };
}
const pct = v => (v * 100).toFixed(1) + "%";
const tn = a => T.find(t => t.a === a)?.n || a;

// Ã¢ÂÂÃ¢ÂÂ NARRATIVE GENERATORS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function teamSoWhat(tm, stats, bl) {
  const lines = [];
  const pg = stats.pr - bl.pr, sg = stats.sr - bl.sr, eg = stats.xr - bl.xr;
  if (pg > .10) lines.push(`${tn(tm)} is one of the most pass-happy teams in football. They throw it on nearly two-thirds of their plays Ã¢ÂÂ everyone in the building knows it's coming, and they dare you to stop it.`);
  else if (pg > .05) lines.push(`${tn(tm)} leans on the pass a bit more than most teams, but not to an extreme degree. They're willing to throw to set up the run.`);
  else if (pg < -.10) lines.push(`${tn(tm)} wants to run the football. Period. They'll line up in heavy sets and try to impose their will physically. If you can't stop the run, you're not beating this team.`);
  else if (pg < -.05) lines.push(`${tn(tm)} tilts run-heavy compared to the league. They trust their ground game and use play-action off it.`);
  else lines.push(`${tn(tm)} is balanced Ã¢ÂÂ they'll run or throw based on the situation, which makes them harder to prepare for.`);
  if (sg > .06) lines.push(`They're also really efficient. They consistently gain positive yardage, stay ahead of the chains, and rarely put themselves in 3rd-and-long. That's the hallmark of a well-coached offense.`);
  else if (sg > .03) lines.push(`Their efficiency is solid Ã¢ÂÂ above average Ã¢ÂÂ meaning they generally stay on schedule and avoid obvious passing situations.`);
  else if (sg < -.06) lines.push(`The problem? They're not efficient. They fall behind the sticks constantly, which puts them in predictable 3rd-and-long situations where defenses can pin their ears back and rush.`);
  else if (sg < -.03) lines.push(`Their efficiency is a concern Ã¢ÂÂ they're slightly below the league floor, meaning they'll face more long-yardage situations than they'd like.`);
  else lines.push(`Efficiency-wise, they're right in the middle of the pack. Not elite, not broken.`);
  if (eg > .04) lines.push(`Here's what makes them scary: the explosive play rate. Any play could go for 20+ yards. You play single-high safety against this team, you're going to get burned.`);
  else if (eg > .02) lines.push(`They've got a decent big-play element Ã¢ÂÂ above average in explosive plays, which keeps defenses honest.`);
  else if (eg < -.03) lines.push(`What they lack is the home-run ball. Big plays are rare for this offense, which means they need long, sustained drives to score. If you're patient on defense and don't bust a coverage, you'll be fine.`);
  else lines.push(`Their explosive play rate is around average Ã¢ÂÂ they'll hit some chunk plays but won't consistently threaten deep.`);
  return lines.join("\n\n");
}

function matchupPreview(offTm, defTm, oStats, dStats, bl) {
  const lines = [];
  lines.push(`## The Big Picture`);
  if (oStats.pr > .58 && dStats.dsr > bl.sr + .02) lines.push(`This is a mismatch that favors ${tn(offTm)}. Their offense wants to throw, and ${tn(defTm)}'s defense has been getting carved up. Expect ${tn(offTm)} to attack early and often through the air.`);
  else if (oStats.pr > .58 && dStats.dsr < bl.sr - .02) lines.push(`Fascinating chess match. ${tn(offTm)} wants to live in the air, but ${tn(defTm)}'s defense is one of the stingiest. Something has to give.`);
  else if (oStats.pr < .48 && dStats.dxr < bl.xr - .02) lines.push(`${tn(offTm)} wants to run and ${tn(defTm)} doesn't give up big plays. This projects as a low-scoring grind where field position and turnovers decide it.`);
  else lines.push(`Neither team has a dramatic schematic edge. This comes down to execution and individual matchup battles.`);
  if (oStats.xr > bl.xr + .02 && dStats.dxr > bl.xr + .02) lines.push(`\n## The Explosive Angle\n${tn(defTm)} has been giving up big plays at an alarming rate, and ${tn(offTm)} generates them. Expect at least 2-3 plays of 20+ yards.`);
  else if (oStats.xr > bl.xr + .02 && dStats.dxr < bl.xr - .01) lines.push(`\n## The Explosive Angle\n${tn(offTm)} lives on the big play, but ${tn(defTm)} almost never allows them. This is THE matchup to watch.`);
  return lines.join("\n");
}

function scriptedPlaysPreview(tm, stats, roster) {
  const d = DNA[tm]; const lines = [];
  lines.push(`### ${tn(tm)}'s Opening Script`);
  if (d.p > .58) {
    lines.push(`Expect 9-10 passes and 5-6 runs in the first 15. Quick-game concepts to get ${roster.offense.find(p => p.pos === "QB")?.name} in rhythm, 1-2 shot plays to ${roster.offense.find(p => p.pos === "WR1")?.name}, play-action on early downs.`);
  } else if (d.p < .48) {
    lines.push(`Heavy run early Ã¢ÂÂ 9-10 runs and 5-6 passes. Inside zone and power with ${roster.offense.find(p => p.pos === "RB1")?.name}, play-action shots off run-action.`);
  } else {
    lines.push(`Balanced script Ã¢ÂÂ 7-8 pass / 7-8 run split. Mix of zone runs and quick passes to test what the defense gives them.`);
  }
  if (stats.sr > .48) lines.push(`They're efficient enough that scripted drives usually result in 1-2 first downs.`);
  else lines.push(`Efficiency has been below average Ã¢ÂÂ if you force a 3-and-out on the opening drive, you set the tone.`);
  return lines.join("\n");
}

function playerMatchupSummary(offRoster, defRoster, offTm, defTm) {
  const matchups = [];
  const wr1 = offRoster.offense.find(p => p.pos === "WR1"), cb1 = defRoster.defense.find(p => p.pos === "CB1");
  const e1 = wr1.rating - cb1.rating;
  matchups.push({ off: wr1, def: cb1, label: "WR1 vs CB1", verdict: e1 > 10 ? `Big advantage ${offTm}. ${wr1.name} should feast.` : e1 < -10 ? `Advantage ${defTm}. ${cb1.name} can lock this down.` : `Coin-flip. Individual execution decides it.` });
  const wr2 = offRoster.offense.find(p => p.pos === "WR2"), cb2 = defRoster.defense.find(p => p.pos === "CB2");
  matchups.push({ off: wr2, def: cb2, label: "WR2 vs CB2", verdict: wr2.rating - cb2.rating > 8 ? `Exploitable matchup for the offense.` : `Relatively even.` });
  const wr3 = offRoster.offense.find(p => p.pos === "WR3"), scb = defRoster.defense.find(p => p.pos === "SCB");
  matchups.push({ off: wr3, def: scb, label: "Slot Battle", verdict: wr3.rating > scb.rating + 5 ? `Slot is where this offense creates separation.` : `Slot is locked down.` });
  const rb = offRoster.offense.find(p => p.pos === "RB1"), lb = defRoster.defense.find(p => p.pos === "LB1");
  matchups.push({ off: rb, def: lb, label: "RB vs LB", verdict: rb.rating > lb.rating + 5 ? `${rb.name} has the edge in the run game and checkdowns.` : `${lb.name} can match up. Run game won't come easy.` });
  const lt = offRoster.offense.find(p => p.pos === "LT"), edge1 = defRoster.defense.find(p => p.pos === "EDGE1");
  matchups.push({ off: lt, def: edge1, label: "LT vs EDGE1", verdict: lt.rating >= edge1.rating ? `QB should have time.` : `${edge1.name} is going to be a problem. Expect quick passes.` });
  const rt = offRoster.offense.find(p => p.pos === "RT"), edge2 = defRoster.defense.find(p => p.pos === "EDGE2");
  matchups.push({ off: rt, def: edge2, label: "RT vs EDGE2", verdict: rt.rating >= edge2.rating ? `Solid protection.` : `Another pressure point.` });
  const te = offRoster.offense.find(p => p.pos === "TE"), ss = defRoster.defense.find(p => p.pos === "SS");
  matchups.push({ off: te, def: ss, label: "TE vs Safety", verdict: te.trait === "Receiving TE" && te.rating > ss.rating ? `${te.name} is a weapon. Matchup to exploit.` : `Handled. TE is more blocker than threat.` });
  return matchups;
}

function gmVoice(tm, stats, bl, needs) {
  const lines = [`*If I'm sitting in ${tn(tm)}'s war room right now:*`];
  needs.forEach(n => {
    if (n.severity === "High") lines.push(`\n**"We have to fix ${n.weakness.toLowerCase()}."** Not optional. I'm looking at ${n.need.toLowerCase()} in the first two rounds Ã¢ÂÂ a ${n.archetype.toLowerCase()}.`);
    else if (n.severity === "Medium") lines.push(`\n**"${n.weakness} needs attention."** If the right ${n.need.toLowerCase()} falls on Day 2, we jump.`);
    else lines.push(`\n**"We're in good shape."** Best player available. ${n.archetype}`);
  });
  return lines.join("\n");
}

function genNeeds(tm, stats, bl) {
  const needs = [];
  if (stats.xr < bl.xr - .02) needs.push({ weakness: "Low explosive play rate", need: "Speed WR or playmaker", archetype: "Vertical WR with 4.4 speed, or home-run RB", severity: "High" });
  if (stats.sr < bl.sr - .03) needs.push({ weakness: "Below-average efficiency", need: "OL upgrade or scheme-fit QB", archetype: "Interior OL with elite run-blocking, or high-accuracy QB", severity: "High" });
  if (stats.pr > bl.pr + .05 && stats.sr < bl.sr) needs.push({ weakness: "Over-reliance on passing", need: "Reliable RB or blocking TE", archetype: "Between-the-tackles RB with power", severity: "Medium" });
  if (stats.dsr > bl.sr + .03) needs.push({ weakness: "Defense allowing high success rate", need: "EDGE or LB", archetype: "Disruptive EDGE with 15%+ pressure rate", severity: "High" });
  if (stats.dxr > bl.xr + .02) needs.push({ weakness: "Giving up too many big plays", need: "Ballhawk safety or press corner", archetype: "Single-high FS with ball skills", severity: "Medium" });
  if (needs.length === 0) needs.push({ weakness: "No major structural flaws", need: "Best player available", archetype: "Depth at premium positions (EDGE, OT, CB)", severity: "Low" });
  return needs;
}

// Ã¢ÂÂÃ¢ÂÂ CHATBOT ENGINE Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function chatAnswer(question, plays, rosters) {
  const q = question.toLowerCase();
  const allStats = {}; T.forEach(t => { allStats[t.a] = agg(plays, t.a); });
  const bl = lgbl(plays);
  const teamMatch = T.find(t => q.includes(t.a.toLowerCase()) || q.includes(t.n.toLowerCase()));
  if (q.includes("best") && (q.includes("offense") || q.includes("team"))) {
    const sorted = T.map(t => ({ t, s: allStats[t.a] })).sort((a, b) => (b.s.sr * .4 + b.s.xr * 3) - (a.s.sr * .4 + a.s.xr * 3));
    return `Best offenses:\n\n1. **${tn(sorted[0].t.a)}** Ã¢ÂÂ ${DNA[sorted[0].t.a].s}. Success rate ${pct(sorted[0].s.sr)}, explosive rate ${pct(sorted[0].s.xr)}.\n2. **${tn(sorted[1].t.a)}** Ã¢ÂÂ ${DNA[sorted[1].t.a].s}.\n3. **${tn(sorted[2].t.a)}** Ã¢ÂÂ ${DNA[sorted[2].t.a].s}.\n\nWorst: **${tn(sorted[31].t.a)}** and **${tn(sorted[30].t.a)}**.`;
  }
  if (q.includes("worst") && (q.includes("defense") || q.includes("defend"))) {
    const sorted = T.map(t => ({ t, s: allStats[t.a] })).sort((a, b) => b.s.dsr - a.s.dsr);
    return `Worst defenses by success rate allowed:\n\n1. **${tn(sorted[0].t.a)}** Ã¢ÂÂ ${pct(sorted[0].s.dsr)} success rate allowed.\n2. **${tn(sorted[1].t.a)}** Ã¢ÂÂ ${pct(sorted[1].s.dsr)}.\n3. **${tn(sorted[2].t.a)}** Ã¢ÂÂ ${pct(sorted[2].s.dsr)}.`;
  }
  if (q.includes("explosive") || q.includes("big play")) {
    const sorted = T.map(t => ({ t, s: allStats[t.a] })).sort((a, b) => b.s.xr - a.s.xr);
    return `Most explosive offenses:\n\n1. **${tn(sorted[0].t.a)}** Ã¢ÂÂ ${pct(sorted[0].s.xr)} big play rate\n2. **${tn(sorted[1].t.a)}** Ã¢ÂÂ ${pct(sorted[1].s.xr)}\n3. **${tn(sorted[2].t.a)}** Ã¢ÂÂ ${pct(sorted[2].s.xr)}\n\nLeague avg: ${pct(bl.xr)}.`;
  }
  if (q.includes("completion") || q.includes("comp rate")) {
    const sorted = T.map(t => ({ t, s: allStats[t.a] })).sort((a, b) => b.s.compRate - a.s.compRate);
    return `Highest completion rates:\n\n1. **${tn(sorted[0].t.a)}** Ã¢ÂÂ ${pct(sorted[0].s.compRate)}\n2. **${tn(sorted[1].t.a)}** Ã¢ÂÂ ${pct(sorted[1].s.compRate)}\n3. **${tn(sorted[2].t.a)}** Ã¢ÂÂ ${pct(sorted[2].s.compRate)}\n\nLeague avg: ${pct(bl.compRate)}.`;
  }
  if (q.includes("sack")) {
    const sorted = T.map(t => ({ t, s: allStats[t.a] })).sort((a, b) => b.s.sackRate - a.s.sackRate);
    return `Highest sack rates taken:\n\n1. **${tn(sorted[0].t.a)}** Ã¢ÂÂ ${pct(sorted[0].s.sackRate)} of dropbacks\n2. **${tn(sorted[1].t.a)}** Ã¢ÂÂ ${pct(sorted[1].s.sackRate)}\n3. **${tn(sorted[2].t.a)}** Ã¢ÂÂ ${pct(sorted[2].s.sackRate)}\n\nThese QBs are under siege.`;
  }
  if (q.includes("filter") || q.includes("how") && q.includes("use")) {
    return `Use the filter panel (funnel icon in the sidebar) to slice data by:\n\n- **Season** (2023, 2024, 2025)\n- **Weeks** (range slider)\n- **Down** (1st through 4th)\n- **Distance** (short/medium/long)\n- **Field position** (own territory/midfield/red zone)\n- **Quarter, Home/Away, Weather**\n- **Score differential** (winning/losing/close/blowout)\n- **Personnel grouping** (11, 12, 21, etc.)\n- **2-minute drill mode**\n\nAll pages update instantly when you change filters.`;
  }
  if (teamMatch) return teamSoWhat(teamMatch.a, allStats[teamMatch.a], bl);
  if (q.includes("red zone")) {
    const rz = plays.filter(p => p.rz);
    return `In the red zone, teams pass ${pct(rz.filter(p => p.type === "Pass").length / (rz.length || 1))} of the time (vs ${pct(bl.pr)} overall). Compressed fields make separation harder Ã¢ÂÂ power runs and quick passes dominate inside the 20.`;
  }
  if (q.includes("personnel") || q.includes("11 personnel") || q.includes("12 personnel")) {
    const p11 = plays.filter(p => p.pers === "11"), p12 = plays.filter(p => p.pers === "12");
    return `Personnel usage league-wide:\n\n- **11 personnel** (3WR/1TE/1RB): ${pct(p11.length / plays.length)} of plays, ${pct(p11.filter(p => p.type === "Pass").length / (p11.length || 1))} pass rate\n- **12 personnel** (2TE/1RB): ${pct(p12.length / plays.length)} of plays, ${pct(p12.filter(p => p.type === "Pass").length / (p12.length || 1))} pass rate\n\n11 is the passing formation. 12 is heavier and more run-oriented.`;
  }
  return `Try asking about:\n- Any team name ("Tell me about the Chiefs")\n- "Who has the best offense?"\n- "Which defenses are worst?"\n- "Most explosive teams?"\n- "Completion rate leaders"\n- "Who gets sacked most?"\n- "Red zone tendencies"\n- "Personnel grouping usage"\n- "How do I use filters?"`;
}

// Ã¢ÂÂÃ¢ÂÂ UI COMPONENTS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const tooltipStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, color: "#0f172a", boxShadow: "0 4px 12px rgba(0,0,0,.08)" };

// Ã¢ÂÂÃ¢ÂÂ RATING BAR (visual player grade) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function RatingBar({ value, max = 100, label, color }) {
  const pctVal = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (pctVal >= 90 ? "#2563eb" : pctVal >= 78 ? "#16a34a" : pctVal >= 65 ? "#eab308" : "#dc2626");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      {label && <span style={{ fontSize: 11, color: "#64748b", minWidth: 24, fontFamily: "monospace" }}>{label}</span>}
      <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pctVal}%`, height: "100%", background: barColor, borderRadius: 3, transition: "width .3s" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: barColor, minWidth: 24, textAlign: "right", fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ MATCHUP GRADE BADGE Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function MatchupGrade({ grade }) {
  const config = {
    "A+": { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    "A": { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    "B+": { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    "B": { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    "C": { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
    "D": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    "F": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  };
  const c = config[grade] || config["C"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontWeight: 900, fontSize: 14, fontFamily: "monospace" }}>{grade}</span>
  );
}

function calcMatchupGrade(oStats, dStats, bl) {
  const edge = (oStats.sr - dStats.dsr) + (oStats.xr - dStats.dxr) * 3;
  if (edge > 0.08) return "A+";
  if (edge > 0.05) return "A";
  if (edge > 0.02) return "B+";
  if (edge > -0.02) return "B";
  if (edge > -0.05) return "C";
  if (edge > -0.08) return "D";
  return "F";
}

function InsightCard({ headline, body, icon: Icon, tone = "neutral", stat }) {
  const colors = { positive: { bg: "#f0fdf4", border: "#bbf7d0", accent: "#16a34a" }, negative: { bg: "#fef2f2", border: "#fecaca", accent: "#dc2626" }, warning: { bg: "#fff7ed", border: "#fed7aa", accent: "#ea580c" }, neutral: { bg: "#f8fafc", border: "#e2e8f0", accent: "#475569" }, elite: { bg: "#eff6ff", border: "#bfdbfe", accent: "#2563eb" } };
  const c = colors[tone] || colors.neutral;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 16, padding: 20, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {Icon && <div style={{ marginTop: 2 }}><Icon size={20} color={c.accent} /></div>}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{headline}</div>
            {stat && <div style={{ fontSize: 24, fontWeight: 900, color: c.accent, fontFamily: "monospace", whiteSpace: "nowrap" }}>{stat}</div>}
          </div>
          <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{body}</div>
        </div>
      </div>
    </div>
  );
}

function MarkdownBlock({ text }) {
  return (
    <div style={{ fontSize: 14, lineHeight: 1.7, color: "#334155" }}>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("## ")) return <h3 key={i} style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "20px 0 8px" }}>{line.slice(3)}</h3>;
        if (line.startsWith("### ")) return <h4 key={i} style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "16px 0 6px" }}>{line.slice(4)}</h4>;
        if (line.startsWith("- ")) return <div key={i} style={{ paddingLeft: 16, marginBottom: 4 }}>{line.replace(/\*\*(.*?)\*\*/g, (m, p) => p)}</div>;
        if (line === "") return <br key={i} />;
        return <p key={i} style={{ marginBottom: 8 }}>{line.replace(/\*\*(.*?)\*\*/g, (m, p) => p)}</p>;
      })}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", background: active ? "#1e293b" : "transparent", border: "none", borderRadius: 10, color: active ? "#fff" : "#cbd5e1", cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400, transition: "all .15s", textAlign: "left", position: "relative" }}>
      <Icon size={18} /><span>{label}</span>
      {badge && <span style={{ position: "absolute", right: 12, background: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8 }}>{badge}</span>}
    </button>
  );
}

function TeamSelect({ value, onChange, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ background: "#fff", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
        {T.map(t => <option key={t.a} value={t.a}>{t.a} Ã¢ÂÂ {t.n}</option>)}
      </select>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ FILTER PANEL Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function FilterPanel({ filters, setFilters, playCount, totalCount }) {
  const update = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));
  const isActive = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  const selStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", fontWeight: 500, color: "#0f172a", width: "100%" };
  const lblStyle = { fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: "#64748b", fontFamily: "monospace", marginBottom: 3 };
  const secStyle = { marginBottom: 14 };

  return (
    <div style={{ padding: "16px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}><Filter size={14} /> Filters</div>
        {isActive && <button onClick={() => setFilters({ ...DEFAULT_FILTERS })} style={{ background: "none", border: "none", color: "#f97316", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><RotateCcw size={11} /> Reset</button>}
      </div>

      {isActive && (
        <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px", marginBottom: 14, fontSize: 11, color: "#94a3b8" }}>
          Showing <strong style={{ color: "#f97316" }}>{playCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} plays
        </div>
      )}

      <div style={secStyle}>
        <div style={lblStyle}>Season</div>
        <select value={filters.season} onChange={e => update("season", e.target.value)} style={selStyle}>
          <option value="all">All Seasons</option>
          <option value="2023">2023</option><option value="2024">2024</option><option value="2025">2025</option>
        </select>
      </div>

      <div style={secStyle}>
        <div style={lblStyle}>Weeks {filters.weekMin}Ã¢ÂÂ{filters.weekMax}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="range" min={1} max={18} value={filters.weekMin} onChange={e => update("weekMin", Math.min(Number(e.target.value), filters.weekMax))} style={{ flex: 1, accentColor: "#f97316" }} />
          <input type="range" min={1} max={18} value={filters.weekMax} onChange={e => update("weekMax", Math.max(Number(e.target.value), filters.weekMin))} style={{ flex: 1, accentColor: "#f97316" }} />
        </div>
      </div>

      <div style={secStyle}>
        <div style={lblStyle}>Down</div>
        <select value={filters.down} onChange={e => update("down", e.target.value)} style={selStyle}>
          <option value="all">All Downs</option>
          <option value="1">1st Down</option><option value="2">2nd Down</option>
          <option value="3">3rd Down</option><option value="4">4th Down</option>
        </select>
      </div>

      <div style={secStyle}>
        <div style={lblStyle}>Distance</div>
        <select value={filters.distBucket} onChange={e => update("distBucket", e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="short">Short (1-3)</option><option value="medium">Medium (4-7)</option><option value="long">Long (8+)</option>
        </select>
      </div>

      <div style={secStyle}>
        <div style={lblStyle}>Field Position</div>
        <select value={filters.fpZone} onChange={e => update("fpZone", e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="own">Own Territory (1-50)</option><option value="mid">Midfield (51-79)</option><option value="rz">Red Zone (80+)</option>
        </select>
      </div>

      <div style={secStyle}>
        <div style={lblStyle}>Quarter</div>
        <select value={filters.quarter} onChange={e => update("quarter", e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="1">Q1</option><option value="2">Q2</option><option value="3">Q3</option><option value="4">Q4</option>
        </select>
      </div>

      <div style={secStyle}>
        <div style={lblStyle}>Game Context</div>
        <select value={filters.scoreDiff} onChange={e => update("scoreDiff", e.target.value)} style={selStyle}>
          <option value="all">All Situations</option>
          <option value="winning">Winning</option><option value="losing">Losing</option>
          <option value="close">Close Game (within 7)</option><option value="blowout">Blowout (14+)</option>
        </select>
      </div>

      <div style={secStyle}>
        <div style={lblStyle}>Home / Away</div>
        <select value={filters.homeAway} onChange={e => update("homeAway", e.target.value)} style={selStyle}>
          <option value="all">All</option><option value="Home">Home</option><option value="Away">Away</option>
        </select>
      </div>

      <div style={secStyle}>
        <div style={lblStyle}>Weather</div>
        <select value={filters.env} onChange={e => update("env", e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="Dome">Dome</option><option value="Clear">Clear</option>
          <option value="Rain">Rain</option><option value="Snow">Snow</option><option value="Wind">Wind</option>
        </select>
      </div>

      <div style={secStyle}>
        <div style={lblStyle}>Personnel</div>
        <select value={filters.pers} onChange={e => update("pers", e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="11">11 (3WR/1TE/1RB)</option><option value="12">12 (2TE/1RB)</option>
          <option value="21">21 (1WR/1TE/2RB)</option><option value="13">13 (3TE/1RB)</option>
          <option value="22">22 (2TE/2RB)</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: filters.redZone ? "#f97316" : "#94a3b8", cursor: "pointer" }}>
          <input type="checkbox" checked={filters.redZone} onChange={e => update("redZone", e.target.checked)} style={{ accentColor: "#f97316" }} /> Red Zone Only
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: filters.twoMin ? "#f97316" : "#94a3b8", cursor: "pointer" }}>
          <input type="checkbox" checked={filters.twoMin} onChange={e => update("twoMin", e.target.checked)} style={{ accentColor: "#f97316" }} /> 2-Min Drill
        </label>
      </div>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ CHATBOT Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function Chatbot({ plays, rosters }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "bot", text: "Hey! I'm your DownfieldOS assistant. Ask me anything Ã¢ÂÂ try \"tell me about the Chiefs\" or \"who has the best offense?\" or \"how do I use filters?\"" }]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMsgs(prev => [...prev, { role: "user", text: q }]);
    setInput("");
    setTimeout(() => { setMsgs(prev => [...prev, { role: "bot", text: chatAnswer(q, plays, rosters) }]); }, 300);
  };
  if (!open) return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      <style>{`@keyframes chatPulse { 0%,100% { box-shadow: 0 4px 20px rgba(249,115,22,0.4); } 50% { box-shadow: 0 4px 30px rgba(249,115,22,0.7); } }`}</style>
      <button onClick={() => setOpen(true)} style={{ width: 56, height: 56, borderRadius: "50%", background: "#f97316", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", animation: "chatPulse 2s ease-in-out infinite" }}>
        <MessageCircle size={24} />
      </button>
      <div style={{ position: "absolute", top: -4, right: -4, background: "#2563eb", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 8, border: "2px solid #fff" }}>AI</div>
    </div>
  );
  return (
    <div style={{ position: "fixed", bottom: 24, right: isMobile ? 16 : 24, width: isMobile ? "calc(100vw - 32px)" : 400, height: 520, background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", zIndex: 1000, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", background: "#0f172a", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><MessageCircle size={18} /><span style={{ fontWeight: 700 }}>DownfieldOS Assistant</span></div>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={18} /></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "#f97316" : "#f1f5f9", color: m.role === "user" ? "#fff" : "#334155", fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ padding: 12, borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything..." style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }} />
        <button onClick={send} style={{ padding: "10px 14px", borderRadius: 12, background: "#f97316", border: "none", color: "#fff", cursor: "pointer" }}><Send size={16} /></button>
      </div>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ PAGE: THIS WEEK (NEW) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function ThisWeek({ plays, rosters, onNavigateMatchup, onGeneratePost }) {
  const [selectedWeek, setSelectedWeek] = useState(18);
  const [selectedSeason, setSelectedSeason] = useState(2025);
  const [expandedGame, setExpandedGame] = useState(null);

  // Build the week's matchups from play data
  const weekGames = useMemo(() => {
    const weekPlays = plays.filter(p => p.season === selectedSeason && p.week === selectedWeek);
    const gameMap = {};
    weekPlays.forEach(p => {
      if (!gameMap[p.gameId]) gameMap[p.gameId] = { gameId: p.gameId, teams: new Set(), plays: [] };
      gameMap[p.gameId].teams.add(p.off);
      gameMap[p.gameId].teams.add(p.def);
      gameMap[p.gameId].plays.push(p);
    });
    const games = Object.values(gameMap).map(g => {
      const teams = [...g.teams];
      const home = teams.find(t => g.plays.some(p => p.off === t && p.ha === "Home")) || teams[0];
      const away = teams.find(t => t !== home) || teams[1];
      return { ...g, home, away };
    }).filter(g => g.home && g.away);
    // Game of the Week: closest matchup with most explosive potential
    if (games.length > 0) {
      let bestIdx = 0, bestScore = -Infinity;
      const allBl = lgbl(plays);
      games.forEach((g, i) => {
        const hs = agg(plays, g.home), as2 = agg(plays, g.away);
        const closeness = 1 - Math.abs(hs.sr - as2.sr) * 10;
        const excitement = (hs.xr + as2.xr) / 2 / (allBl.xr || 0.08);
        const score = closeness + excitement;
        if (score > bestScore) { bestScore = score; bestIdx = i; }
      });
      games[bestIdx].isGOTW = true;
    }
    return games;
  }, [plays, selectedWeek, selectedSeason]);

  const bl = useMemo(() => lgbl(plays), [plays]);

  function GameCard({ game }) {
    const hStats = useMemo(() => agg(plays, game.home), [game.home]);
    const aStats = useMemo(() => agg(plays, game.away), [game.away]);
    const hR = rosters[game.home], aR = rosters[game.away];
    const expanded = expandedGame === game.gameId;

    // Matchup grades
    const awayOffGrade = calcMatchupGrade(aStats, hStats, bl);
    const homeOffGrade = calcMatchupGrade(hStats, aStats, bl);
    const offEdge = aStats.sr - hStats.dsr;
    const defEdge = hStats.sr - aStats.dsr;
    const hAdv = defEdge - offEdge;
    const gameTemp = game.plays.length > 0 ? (hAdv > 0.04 ? "hot" : hAdv < -0.04 ? "cold" : "neutral") : "neutral";
    const tempColors = { hot: "#dc2626", cold: "#2563eb", neutral: "#64748b" };
    const gameQuality = Math.abs(hStats.sr - aStats.sr) < 0.03 && (hStats.xr + aStats.xr) / 2 > bl.xr;

    // Mismatch detection
    const mismatches = [];
    if (aStats.xr > bl.xr + .02 && hStats.dxr > bl.xr + .02) mismatches.push({ text: `${tn(game.away)} explosive O vs leaky ${tn(game.home)} D`, tone: "warning" });
    if (hStats.xr > bl.xr + .02 && aStats.dxr > bl.xr + .02) mismatches.push({ text: `${tn(game.home)} explosive O vs leaky ${tn(game.away)} D`, tone: "warning" });
    if (aStats.pr > bl.pr + .06 && hStats.dsr < bl.sr - .02) mismatches.push({ text: `${tn(game.away)} pass-heavy vs stingy ${tn(game.home)} D Ã¢ÂÂ chess match`, tone: "elite" });
    if (hStats.pr > bl.pr + .06 && aStats.dsr < bl.sr - .02) mismatches.push({ text: `${tn(game.home)} pass-heavy vs stingy ${tn(game.away)} D Ã¢ÂÂ chess match`, tone: "elite" });

    // "Watch for this"
    const watchFor = [];
    const hWR1 = hR?.offense.find(p => p.pos === "WR1"), aCB1 = aR?.defense.find(p => p.pos === "CB1");
    const aWR1 = aR?.offense.find(p => p.pos === "WR1"), hCB1 = hR?.defense.find(p => p.pos === "CB1");
    if (hWR1 && aCB1 && Math.abs(hWR1.rating - aCB1.rating) > 12) watchFor.push(`${hWR1.name} (${hWR1.rating}) vs ${aCB1.name} (${aCB1.rating}) Ã¢ÂÂ ${hWR1.rating > aCB1.rating ? "advantage offense" : "lockdown corner"}`);
    if (aWR1 && hCB1 && Math.abs(aWR1.rating - hCB1.rating) > 12) watchFor.push(`${aWR1.name} (${aWR1.rating}) vs ${hCB1.name} (${hCB1.rating}) Ã¢ÂÂ ${aWR1.rating > hCB1.rating ? "advantage offense" : "lockdown corner"}`);

    return (
      <div style={{ background: "#fff", borderRadius: 16, border: game.isGOTW ? "2px solid #f97316" : "1px solid #e2e8f0", overflow: "hidden", marginBottom: 12, transition: "all .2s", boxShadow: game.isGOTW ? "0 4px 20px rgba(249,115,22,0.12)" : "none" }}>
        {game.isGOTW && (
          <div style={{ background: "linear-gradient(90deg, #f97316, #fb923c)", padding: "6px 20px", display: "flex", alignItems: "center", gap: 6 }}>
            <Trophy size={12} color="#fff" />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1.5 }}>Game of the Week</span>
          </div>
        )}
        <button onClick={() => setExpandedGame(expanded ? null : game.gameId)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ background: "#0f172a", color: "#fff", borderRadius: 8, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, fontFamily: "monospace" }}>{game.away}</div>
              <MatchupGrade grade={awayOffGrade} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#94a3b8" }}>@</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ background: "#f97316", color: "#fff", borderRadius: 8, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, fontFamily: "monospace" }}>{game.home}</div>
              <MatchupGrade grade={homeOffGrade} />
            </div>
            <div style={{ marginLeft: 12, textAlign: "left" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{tn(game.away)} at {tn(game.home)}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {DNA[game.away].s} vs {DNA[game.home].s}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {mismatches.length > 0 && <span style={{ background: "#fff7ed", color: "#ea580c", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>{mismatches.length} mismatch{mismatches.length > 1 ? "es" : ""}</span>}
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: tempColors[gameTemp] }} title={gameTemp === "hot" ? "Home advantage" : gameTemp === "cold" ? "Away advantage" : "Even"} />
            {expanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
          </div>
        </button>

        {expanded && (
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f1f5f9" }}>
            {/* Quick stat comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16, marginBottom: 16 }}>
              {[[game.away, aStats], [game.home, hStats]].map(([tm, s]) => (
                <div key={tm} style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{tn(tm)}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
                    <div><span style={{ color: "#94a3b8" }}>Pass Rate:</span> <strong>{pct(s.pr)}</strong></div>
                    <div><span style={{ color: "#94a3b8" }}>Success:</span> <strong>{pct(s.sr)}</strong></div>
                    <div><span style={{ color: "#94a3b8" }}>Explosive:</span> <strong>{pct(s.xr)}</strong></div>
                    <div><span style={{ color: "#94a3b8" }}>Completion:</span> <strong>{pct(s.compRate)}</strong></div>
                    <div><span style={{ color: "#94a3b8" }}>Def SR:</span> <strong style={{ color: s.dsr > bl.sr + .02 ? "#dc2626" : s.dsr < bl.sr - .02 ? "#16a34a" : "#0f172a" }}>{pct(s.dsr)}</strong></div>
                    <div><span style={{ color: "#94a3b8" }}>Def Exp:</span> <strong style={{ color: s.dxr > bl.xr + .01 ? "#dc2626" : "#0f172a" }}>{pct(s.dxr)}</strong></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mismatches */}
            {mismatches.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Flame size={14} color="#ea580c" /> Key Mismatches</div>
                {mismatches.map((m, i) => (
                  <div key={i} style={{ background: m.tone === "warning" ? "#fff7ed" : "#eff6ff", border: `1px solid ${m.tone === "warning" ? "#fed7aa" : "#bfdbfe"}`, borderRadius: 10, padding: "8px 12px", fontSize: 13, color: "#334155", marginBottom: 6 }}>{m.text}</div>
                ))}
              </div>
            )}

            {/* Watch for this */}
            {watchFor.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Eye size={14} color="#2563eb" /> Watch For This</div>
                {watchFor.map((w, i) => (
                  <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 12px", fontSize: 13, color: "#334155", marginBottom: 6 }}>{w}</div>
                ))}
              </div>
            )}

            {/* Mini scouting report */}
            <div style={{ background: "#0f172a", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Quick Scout</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>
                {matchupPreview(game.away, game.home, aStats, { dsr: hStats.dsr, dxr: hStats.dxr, dpr: hStats.dpr }, bl).replace(/##\s*/g, "").replace(/\n+/g, " ").slice(0, 300)}...
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {onNavigateMatchup && (
                  <button onClick={() => onNavigateMatchup(game.away, game.home)} style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    Full Breakdown <ChevronRight size={14} />
                  </button>
                )}
                {onGeneratePost && (
                  <button onClick={() => onGeneratePost(game.away, game.home, aStats, hStats)} style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <Download size={14} /> Generate Post
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -1 }}>This Week</h2>
      <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 24px" }}>Every game at a glance. Click any matchup to expand.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>Season</label>
          <select value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            <option value={2025}>2025</option><option value={2024}>2024</option><option value={2023}>2023</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>Week</label>
          <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {Array.from({ length: 18 }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", paddingBottom: 12 }}>{weekGames.length} games</div>
      </div>

      {weekGames.length === 0 ? (
        <InsightCard tone="neutral" icon={Calendar} headline="No games found" body={`No matchup data for Season ${selectedSeason}, Week ${selectedWeek}. Try a different week.`} />
      ) : (
        weekGames.map(g => <GameCard key={g.gameId} game={g} />)
      )}
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ PAGE: SO WHAT DASHBOARD Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function SoWhatDashboard({ plays }) {
  const bl = useMemo(() => lgbl(plays), [plays]);
  const ranked = useMemo(() => T.map(t => ({ a: t.a, n: t.n, s: agg(plays, t.a) })).sort((a, b) => (b.s.sr * .4 + b.s.xr * 3 + b.s.pr * .2) - (a.s.sr * .4 + a.s.xr * 3 + a.s.pr * .2)), [plays]);
  const best = ranked[0], worst = ranked[31];
  const mostExplosive = [...ranked].sort((a, b) => b.s.xr - a.s.xr)[0];
  const leastEfficient = [...ranked].sort((a, b) => a.s.sr - b.s.sr)[0];
  const mostRunHeavy = [...ranked].sort((a, b) => a.s.pr - b.s.pr)[0];
  const worstDef = [...ranked].sort((a, b) => b.s.dsr - a.s.dsr)[0];
  const isFiltered = plays.length < 500000;
  const filterNote = isFiltered ? ` (based on ${plays.length.toLocaleString()} filtered plays)` : "";

  return (
    <div>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -1 }}>What You Need to Know</h2>
      <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 28px" }}>The state of the NFL, in plain English.{filterNote}</p>
      <InsightCard tone="elite" icon={Star} stat={`#1`} headline={`${tn(best.a)} has the best offense in football`} body={`#1 in our composite. ${DNA[best.a].s}. Success rate ${pct(best.s.sr)} (avg: ${pct(bl.sr)}), explosive rate ${pct(best.s.xr)}. They move the ball consistently AND can hurt you deep.`} />
      <InsightCard tone="positive" icon={Zap} stat={pct(mostExplosive.s.xr)} headline={`${tn(mostExplosive.a)} is the most dangerous per-play`} body={`${pct(mostExplosive.s.xr)} of plays go for a big gain (avg: ${pct(bl.xr)}). Roughly 1 in ${Math.round(1 / mostExplosive.s.xr)} plays is a chunk play. You cannot play conservative defense against them.`} />
      <InsightCard tone="negative" icon={AlertTriangle} stat={pct(leastEfficient.s.sr)} headline={`${tn(leastEfficient.a)} can't stay on schedule`} body={`Dead last at ${pct(leastEfficient.s.sr)} success rate. They constantly face 3rd-and-long, where defenses pin their ears back. Vicious cycle.`} />
      <InsightCard tone="warning" icon={Eye} stat={pct(worstDef.s.dsr)} headline={`${tn(worstDef.a)}'s defense is getting shredded`} body={`Allowing ${pct(worstDef.s.dsr)} success rate Ã¢ÂÂ worst in the league. Opposing offenses gain positive yardage on ${(worstDef.s.dsr * 100).toFixed(0)}%+ of plays.`} />
      <InsightCard tone="neutral" icon={Activity} stat={pct(mostRunHeavy.s.pr)} headline={`${tn(mostRunHeavy.a)} runs more than anyone`} body={`Only ${pct(mostRunHeavy.s.pr)} pass rate Ã¢ÂÂ lowest in the NFL. Stop the run and you stop this team.`} />
      <InsightCard tone="neutral" icon={BookOpen} headline="How to use this app" body={`Every metric compares against a league baseline. Use the Filter Panel (funnel icon, sidebar) to slice data by down, distance, score, weather, personnel, and more. All pages update instantly. The chatbot (orange button) answers questions about anything you see.`} />
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ PAGE: MATCHUP CENTER Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function MatchupCenter({ plays, rosters, initialOff, initialDef }) {
  const isMobile = useIsMobile();
  const [offTm, setOffTm] = useState(initialOff || "KC");
  const [defTm, setDefTm] = useState(initialDef || "BUF");
  useEffect(() => { if (initialOff) setOffTm(initialOff); }, [initialOff]);
  useEffect(() => { if (initialDef) setDefTm(initialDef); }, [initialDef]);
  const [showPlayers, setShowPlayers] = useState(false);
  const os = useMemo(() => agg(plays, offTm), [plays, offTm]);
  const ds = useMemo(() => agg(plays, defTm), [plays, defTm]);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const oR = rosters[offTm], dR = rosters[defTm];
  const preview = useMemo(() => matchupPreview(offTm, defTm, os, ds, bl), [offTm, defTm, os, ds, bl]);
  const offScript = useMemo(() => scriptedPlaysPreview(offTm, os, oR), [offTm, os, oR]);
  const defScript = useMemo(() => scriptedPlaysPreview(defTm, agg(plays, defTm), rosters[defTm]), [defTm, plays, rosters]);
  const playerMatchups = useMemo(() => playerMatchupSummary(oR, dR, offTm, defTm), [oR, dR, offTm, defTm]);

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -.5 }}>Matchup Preview</h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>A scouting report, not a stat sheet. Filters apply to underlying data.</p>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
        <TeamSelect value={offTm} onChange={setOffTm} label="Offense" />
        <div style={{ fontSize: 24, color: "#94a3b8", fontWeight: 800, paddingBottom: 8 }}>vs</div>
        <TeamSelect value={defTm} onChange={setDefTm} label="Defense" />
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28, marginBottom: 20 }}><MarkdownBlock text={preview} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}><MarkdownBlock text={offScript} /></div>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}><MarkdownBlock text={defScript} /></div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 20 }}>
        <button onClick={() => setShowPlayers(!showPlayers)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", borderBottom: showPlayers ? "1px solid #e2e8f0" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Swords size={20} color="#f97316" />
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Player-Level Matchups</span>
            <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "2px 10px", borderRadius: 10 }}>{tn(offTm)} OFF vs {tn(defTm)} DEF</span>
          </div>
          {showPlayers ? <ChevronDown size={20} color="#94a3b8" /> : <ChevronRight size={20} color="#94a3b8" />}
        </button>
        {showPlayers && (
          <div style={{ padding: 24 }}>
            {playerMatchups.map((m, i) => {
              const edge = m.off.rating - m.def.rating;
              const edgeColor = edge > 10 ? "#16a34a" : edge < -10 ? "#dc2626" : "#eab308";
              const edgeLabel = edge > 10 ? "OFF +" + edge : edge < -10 ? "DEF +" + Math.abs(edge) : "EVEN";
              return (
                <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < playerMatchups.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#f97316" }}>{m.label}</div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: edgeColor, background: edgeColor + "15", padding: "3px 10px", borderRadius: 8, fontFamily: "monospace" }}>{edgeLabel}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                    <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>OFFENSE</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{m.off.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{m.off.pos} | {m.off.grade} | {m.off.trait}</div>
                      <RatingBar value={m.off.rating} color="#16a34a" />
                    </div>
                    <div style={{ background: "#fef2f2", borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>DEFENSE</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{m.def.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{m.def.pos} | {m.def.grade} | {m.def.trait}</div>
                      <RatingBar value={m.def.rating} color="#dc2626" />
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{m.verdict}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ background: "#0f172a", borderRadius: 16, padding: 24 }}>
        <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>By the Numbers</h3>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
          {[["Pass Rate", os.pr, ds.dpr, "Throw rate vs pass faced"], ["Success Rate", os.sr, ds.dsr, "Efficiency vs stinginess"], ["Explosive Rate", os.xr, ds.dxr, "Big plays vs prevention"], ["Completion", os.compRate, null, "Pass completion rate"], ["Sack Rate", os.sackRate, null, "How often QB is sacked"]].map(([lbl, ov, dv, desc]) => (
            <div key={lbl} style={{ background: "#1e293b", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace", marginBottom: 8 }}>{lbl}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#f97316", fontWeight: 700, fontSize: 20 }}>{pct(ov)}</span>
                {dv !== null && <span style={{ color: "#a855f7", fontWeight: 700, fontSize: 20 }}>{pct(dv)}</span>}
              </div>
              {dv !== null && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 8 }}><span>{offTm} OFF</span><span>{defTm} DEF</span></div>}
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ PAGE: FANTASY INTEL Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function FantasyIntel({ plays, rosters }) {
  const [posFilter, setPosFilter] = useState("QB");
  const [selectedWeek, setSelectedWeek] = useState(18);
  const bl = useMemo(() => lgbl(plays), [plays]);

  // Generate fantasy matchup board
  const matchupBoard = useMemo(() => {
    const weekPlays = plays.filter(p => p.season === 2025 && p.week === selectedWeek);
    const gameMap = {};
    weekPlays.forEach(p => {
      if (!gameMap[p.gameId]) gameMap[p.gameId] = { teams: new Set() };
      gameMap[p.gameId].teams.add(p.off);
      gameMap[p.gameId].teams.add(p.def);
    });
    const matchups = [];
    Object.values(gameMap).forEach(g => {
      const teams = [...g.teams];
      if (teams.length >= 2) {
        matchups.push([teams[0], teams[1]]);
        matchups.push([teams[1], teams[0]]);
      }
    });

    return matchups.map(([off, def]) => {
      const oStats = agg(plays, off), dStats = agg(plays, def);
      const oR = rosters[off], dR = rosters[def];
      const d = DNA[off];

      // Fantasy opportunity scores by position
      const passVol = oStats.pr * 35; // estimated pass attempts per game
      const rushVol = (1 - oStats.pr) * 30;
      const defPassSR = dStats.dsr;
      const defExpRate = dStats.dxr;

      // QB score: pass volume + efficiency environment + explosive upside
      const qbScore = (passVol / 35) * 30 + (defPassSR / (bl.sr || 0.45)) * 25 + (oStats.xr / (bl.xr || 0.08)) * 25 + (oStats.compRate / (bl.compRate || 0.62)) * 20;
      const qb = oR.offense.find(p => p.pos === "QB");

      // RB score: rush volume + receiving + defense weakness
      const rbScore = (rushVol / 30) * 30 + (dStats.dsr / (bl.sr || 0.45)) * 25 + (d.p < 0.52 ? 15 : 5) + (oStats.sr / (bl.sr || 0.45)) * 20;
      const rb = oR.offense.find(p => p.pos === "RB1");

      // WR1 score: pass volume + explosive + target share proxy
      const wr1Score = (passVol / 35) * 25 + (defExpRate / (bl.xr || 0.08)) * 25 + (oStats.xr / (bl.xr || 0.08)) * 25 + (d.p > 0.56 ? 15 : 5);
      const wr1 = oR.offense.find(p => p.pos === "WR1");

      // TE score
      const te = oR.offense.find(p => p.pos === "TE");
      const teScore = (passVol / 35) * 20 + (te.trait === "Receiving TE" ? 30 : 10) + (defPassSR / (bl.sr || 0.45)) * 20 + (dStats.dxr > bl.xr ? 15 : 5);

      // Boom/bust
      const boomProb = (off2) => Math.min(0.95, Math.max(0.05, (oStats.xr + defExpRate) / 2 * 5 + (oStats.sr > bl.sr + 0.03 ? 0.1 : 0)));
      const bustProb = (off2) => Math.min(0.95, Math.max(0.05, 0.5 - oStats.sr * 0.5 + (dStats.dsr < bl.sr - 0.02 ? 0.15 : 0)));

      return {
        off, def, oStats, dStats,
        QB: { player: qb, score: qbScore, boom: boomProb("qb"), bust: bustProb("qb") },
        RB: { player: rb, score: rbScore, boom: boomProb("rb") * 0.85, bust: bustProb("rb") * 1.1 },
        WR: { player: wr1, score: wr1Score, boom: boomProb("wr"), bust: bustProb("wr") },
        TE: { player: te, score: teScore, boom: boomProb("te") * 0.7, bust: bustProb("te") * 1.2 },
      };
    });
  }, [plays, rosters, selectedWeek, bl]);

  const sorted = useMemo(() =>
    [...matchupBoard].sort((a, b) => (b[posFilter]?.score || 0) - (a[posFilter]?.score || 0)),
    [matchupBoard, posFilter]
  );

  function FantasyRow({ item, rank }) {
    const pos = item[posFilter];
    if (!pos || !pos.player) return null;
    const grade = pos.score > 85 ? "A+" : pos.score > 75 ? "A" : pos.score > 65 ? "B+" : pos.score > 55 ? "B" : pos.score > 45 ? "C" : "D";
    const gradeColor = pos.score > 75 ? "#16a34a" : pos.score > 55 ? "#2563eb" : pos.score > 45 ? "#eab308" : "#dc2626";
    const boomPct = Math.round(pos.boom * 100);
    const bustPct = Math.round(pos.bust * 100);

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ width: 28, fontSize: 14, fontWeight: 800, color: rank <= 3 ? "#f97316" : rank <= 8 ? "#0f172a" : "#94a3b8", fontFamily: "monospace" }}>#{rank}</div>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: gradeColor + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: gradeColor, fontFamily: "monospace" }}>{grade}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{pos.player.name}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{tn(item.off)} {posFilter} vs {tn(item.def)}</div>
        </div>
        <div style={{ width: 100 }}>
          <RatingBar value={Math.round(pos.score)} label="" />
        </div>
        <div style={{ display: "flex", gap: 8, width: 120 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#16a34a" }}>{boomPct}%</div>
            <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase" }}>Boom</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#dc2626" }}>{bustPct}%</div>
            <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase" }}>Bust</div>
          </div>
        </div>
      </div>
    );
  }

  // Best and worst environments
  const bestEnv = sorted[0];
  const worstEnv = sorted[sorted.length - 1];

  return (
    <div>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -1 }}>Fantasy Intel</h2>
      <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 24px" }}>Matchup-based opportunity scores, boom/bust probability, and rankings.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>Position</label>
          <div style={{ display: "flex", gap: 4 }}>
            {["QB", "RB", "WR", "TE"].map(pos => (
              <button key={pos} onClick={() => setPosFilter(pos)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid", borderColor: posFilter === pos ? "#f97316" : "#e2e8f0", background: posFilter === pos ? "#f97316" : "#fff", color: posFilter === pos ? "#fff" : "#0f172a", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{pos}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>Week</label>
          <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {Array.from({ length: 18 }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}
          </select>
        </div>
      </div>

      {/* Top insight */}
      {bestEnv && bestEnv[posFilter] && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <InsightCard tone="positive" icon={Flame} stat={Math.round(bestEnv[posFilter].score).toString()}
            headline={`Best ${posFilter} environment: ${bestEnv[posFilter].player?.name}`}
            body={`${tn(bestEnv.off)} vs ${tn(bestEnv.def)} Ã¢ÂÂ ${bestEnv[posFilter].boom > 0.3 ? "high ceiling week" : "solid floor"}. ${posFilter === "QB" ? `Pass volume projects high against a defense allowing ${pct(bestEnv.dStats.dsr)} success rate.` : posFilter === "RB" ? `This run game should find lanes against a defense giving up yards.` : `Receivers should eat against this secondary.`}`} />
          {worstEnv && worstEnv[posFilter] && (
            <InsightCard tone="negative" icon={AlertTriangle} stat={Math.round(worstEnv[posFilter].score).toString()}
              headline={`Worst ${posFilter} environment: ${worstEnv[posFilter].player?.name}`}
              body={`${tn(worstEnv.off)} vs ${tn(worstEnv.def)} Ã¢ÂÂ tough sledding. ${worstEnv.dStats.dsr < bl.sr - 0.02 ? "This defense is stingy." : "The offense's efficiency is the problem here."}`} />
          )}
        </div>
      )}

      {/* Rankings table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{posFilter} Matchup Rankings Ã¢ÂÂ Week {selectedWeek}</div>
          <div style={{ display: "flex", gap: 16, fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
            <span>Score</span><span style={{ width: 120, textAlign: "center" }}>Boom / Bust</span>
          </div>
        </div>
        {sorted.slice(0, 16).map((item, i) => <FantasyRow key={`${item.off}-${item.def}`} item={item} rank={i + 1} />)}
      </div>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ PAGE: TEAM INTEL Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function TeamIntel({ plays, rosters }) {
  const [team, setTeam] = useState("KC");
  const stats = useMemo(() => agg(plays, team), [plays, team]);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const overview = useMemo(() => teamSoWhat(team, stats, bl), [team, stats, bl]);
  const roster = rosters[team];

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -.5 }}>Team Intel</h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>Everything you need to know. Filters apply to all metrics.</p>
      <TeamSelect value={team} onChange={setTeam} label="Team" />
      <div style={{ marginTop: 20, background: "#0f172a", borderRadius: 16, padding: 24, marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ background: "#1e293b", borderRadius: 14, width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{team}</span>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{tn(team)}</div>
          <div style={{ fontSize: 15, color: "#f97316", fontWeight: 600 }}>{DNA[team].s}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Comp: {pct(stats.compRate)} | Sack: {pct(stats.sackRate)} | {stats.n.toLocaleString()} plays</div>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>The Scouting Report</h3>
        <div style={{ fontSize: 15, lineHeight: 1.8, color: "#334155", whiteSpace: "pre-wrap" }}>{overview}</div>
      </div>
      {[["Offense", roster.offense], ["Defense", roster.defense]].map(([unit, players]) => (
        <div key={unit} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>{unit}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {players.map((p, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: 12, border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", fontFamily: "monospace" }}>{p.pos}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.grade === "Elite" ? "#2563eb" : p.grade === "Above Avg" ? "#16a34a" : "#64748b" }}>{p.grade} ({p.rating})</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{p.trait}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ PAGE: WAR ROOM Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function WarRoom({ plays }) {
  const [team, setTeam] = useState("CAR");
  const stats = useMemo(() => agg(plays, team), [plays, team]);
  const bl = useMemo(() => lgbl(plays), [plays]);
  const needs = useMemo(() => genNeeds(team, stats, bl), [team, stats, bl]);
  const gm = useMemo(() => gmVoice(team, stats, bl, needs), [team, stats, bl, needs]);
  const overview = useMemo(() => teamSoWhat(team, stats, bl), [team, stats, bl]);

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -.5 }}>Offseason War Room</h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>What would the GM say?</p>
      <TeamSelect value={team} onChange={setTeam} label="Team" />
      <div style={{ marginTop: 20, background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>Season Assessment</h3>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#334155", whiteSpace: "pre-wrap" }}>{overview}</div>
      </div>
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}><Shield size={20} color="#f97316" /> GM's Take</h3>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#cbd5e1", whiteSpace: "pre-wrap" }}>{gm.replace(/\*\*(.*?)\*\*/g, (m, p) => p).replace(/\*(.*?)\*/g, (m, p) => p)}</div>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Draft Board</h3>
      {needs.map((n, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${n.severity === "High" ? "#fecaca" : n.severity === "Medium" ? "#fed7aa" : "#e2e8f0"}`, borderLeft: `4px solid ${n.severity === "High" ? "#dc2626" : n.severity === "Medium" ? "#ea580c" : "#16a34a"}`, padding: 20, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{n.weakness}</span>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, fontWeight: 700, fontFamily: "monospace", background: n.severity === "High" ? "#fef2f2" : n.severity === "Medium" ? "#fff7ed" : "#f0fdf4", color: n.severity === "High" ? "#dc2626" : n.severity === "Medium" ? "#ea580c" : "#16a34a" }}>{n.severity}</span>
          </div>
          <div style={{ fontSize: 14, color: "#ea580c", fontWeight: 600, marginBottom: 4 }}>Target: {n.need}</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Archetype: {n.archetype}</div>
        </div>
      ))}
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ INSTAGRAM POST CARD Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function InstaPostCard({ away, home, aStats, hStats, bl, rosters, onClose }) {
  const aGrade = calcMatchupGrade(aStats, hStats, bl);
  const hGrade = calcMatchupGrade(hStats, aStats, bl);
  const topMismatch = (() => {
    if (aStats.xr > bl.xr + .02 && hStats.dxr > bl.xr + .02) return `${tn(away)} explosive offense meets porous ${tn(home)} defense`;
    if (hStats.xr > bl.xr + .02 && aStats.dxr > bl.xr + .02) return `${tn(home)} explosive offense meets porous ${tn(away)} defense`;
    if (aStats.sr > bl.sr + .03) return `${tn(away)} offense is rolling Ã¢ÂÂ top-tier efficiency`;
    if (hStats.sr > bl.sr + .03) return `${tn(home)} at home with elite efficiency`;
    return `Evenly matched Ã¢ÂÂ execution decides it`;
  })();
  const aWR1 = rosters[away]?.offense.find(p => p.pos === "WR1");
  const hWR1 = rosters[home]?.offense.find(p => p.pos === "WR1");
  const aCB1 = rosters[away]?.defense.find(p => p.pos === "CB1");
  const hCB1 = rosters[home]?.defense.find(p => p.pos === "CB1");

  const cardRef = useRef(null);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 440, background: "#0f172a", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        {/* Post card - Instagram 4:5 ratio */}
        <div ref={cardRef} style={{ width: 440, aspectRatio: "4/5", background: "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          {/* Decorative elements */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(249,115,22,0.08)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(249,115,22,0.05)" }} />

          {/* Header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Zap size={16} color="#f97316" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#f97316", letterSpacing: 2, textTransform: "uppercase" }}>DownfieldOS</span>
              <span style={{ fontSize: 11, color: "#475569", marginLeft: "auto" }}>Matchup Preview</span>
            </div>

            {/* Teams */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 16, background: "#1e293b", border: "2px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{away}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{tn(away)}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{DNA[away].s}</div>
                <MatchupGrade grade={aGrade} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#475569" }}>@</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 16, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{home}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{tn(home)}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{DNA[home].s}</div>
                <MatchupGrade grade={hGrade} />
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
              {[["Pass Rate", aStats.pr, hStats.pr], ["Success Rate", aStats.sr, hStats.sr], ["Explosive", aStats.xr, hStats.xr], ["Completion", aStats.compRate, hStats.compRate]].map(([lbl, av, hv]) => (
                <div key={lbl} style={{ display: "contents" }}>
                  <div style={{ textAlign: "right", fontSize: 18, fontWeight: 800, color: av > hv ? "#f97316" : "#94a3b8", fontFamily: "monospace" }}>{pct(av)}</div>
                  <div style={{ textAlign: "center", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, padding: "0 8px" }}>{lbl}</div>
                  <div style={{ textAlign: "left", fontSize: 18, fontWeight: 800, color: hv > av ? "#f97316" : "#94a3b8", fontFamily: "monospace" }}>{pct(hv)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key mismatch */}
          <div style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#f97316", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Key Matchup</div>
            <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.5 }}>{topMismatch}</div>
          </div>

          {/* Player battles */}
          {aWR1 && hCB1 && (
            <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
              <span>{aWR1.name} ({aWR1.rating}) vs {hCB1.name} ({hCB1.rating})</span>
              <span>{hWR1?.name} ({hWR1?.rating}) vs {aCB1?.name} ({aCB1?.rating})</span>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 12 }}>
            <div style={{ fontSize: 10, color: "#475569" }}>downfieldos.com</div>
            <div style={{ fontSize: 10, color: "#475569" }}>Swipe for full breakdown Ã¢ÂÂ</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "16px 24px", display: "flex", gap: 12, background: "#1e293b" }}>
          <button onClick={() => { if(cardRef.current) { navigator.clipboard?.writeText(`${tn(away)} @ ${tn(home)} Ã¢ÂÂ Matchup Preview by DownfieldOS\n\n${topMismatch}\n\n${tn(away)} OFF Grade: ${aGrade} | ${tn(home)} OFF Grade: ${hGrade}\n\nKey stats:\nPass Rate: ${pct(aStats.pr)} vs ${pct(hStats.pr)}\nSuccess: ${pct(aStats.sr)} vs ${pct(hStats.sr)}\nExplosive: ${pct(aStats.xr)} vs ${pct(hStats.xr)}\n\n#NFL #DownfieldOS #${tn(away).replace(/\s/g,"")} #${tn(home).replace(/\s/g,"")}`); } }} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: "#f97316", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Copy Caption</button>
          <button onClick={onClose} style={{ padding: "12px 16px", borderRadius: 10, background: "#334155", border: "none", color: "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ PAGE: ADMIN (POST MANAGER) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function AdminPanel({ plays, rosters }) {
  const isMobile = useIsMobile();
  const [selectedWeek, setSelectedWeek] = useState(18);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [previewPost, setPreviewPost] = useState(null);
  const bl = useMemo(() => lgbl(plays), [plays]);

  const weekGames = useMemo(() => {
    const weekPlays = plays.filter(p => p.season === 2025 && p.week === selectedWeek);
    const gameMap = {};
    weekPlays.forEach(p => {
      if (!gameMap[p.gameId]) gameMap[p.gameId] = { gameId: p.gameId, teams: new Set() };
      gameMap[p.gameId].teams.add(p.off);
      gameMap[p.gameId].teams.add(p.def);
    });
    return Object.values(gameMap).map(g => {
      const teams = [...g.teams];
      const home = weekPlays.find(p => p.gameId === g.gameId && p.ha === "Home")?.off || teams[0];
      const away = teams.find(t => t !== home) || teams[1];
      return { ...g, home, away };
    }).filter(g => g.home && g.away);
  }, [plays, selectedWeek]);

  const generateAll = () => {
    const posts = weekGames.map(g => ({
      gameId: g.gameId,
      away: g.away,
      home: g.home,
      aStats: agg(plays, g.away),
      hStats: agg(plays, g.home),
      generated: new Date().toISOString(),
      status: "ready"
    }));
    setGeneratedPosts(posts);
  };

  return (
    <div>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: -1 }}>Admin Ã¢ÂÂ Post Manager</h2>
      <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 24px" }}>Generate and manage Instagram matchup posts for every game.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace" }}>Week</label>
          <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {Array.from({ length: 18 }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}
          </select>
        </div>
        <button onClick={generateAll} style={{ padding: "10px 24px", borderRadius: 10, background: "#f97316", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, height: 44 }}>
          <Zap size={16} /> Generate All ({weekGames.length} games)
        </button>
      </div>

      {generatedPosts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#16a34a", fontWeight: 600, marginBottom: 16 }}>
            {generatedPosts.length} posts generated and ready to preview
          </div>
        </div>
      )}

      {/* Post grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {(generatedPosts.length > 0 ? generatedPosts : weekGames.map(g => ({ away: g.away, home: g.home, aStats: agg(plays, g.away), hStats: agg(plays, g.home), status: "draft" }))).map((post, i) => {
          const aGrade = calcMatchupGrade(post.aStats, post.hStats, bl);
          const hGrade = calcMatchupGrade(post.hStats, post.aStats, bl);
          return (
            <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {/* Mini preview */}
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", padding: 20, aspectRatio: "4/3" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Zap size={10} color="#f97316" />
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#f97316", letterSpacing: 1.5, textTransform: "uppercase" }}>DownfieldOS</span>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{post.away}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{tn(post.away)}</div>
                    <MatchupGrade grade={aGrade} />
                  </div>
                  <span style={{ color: "#475569", fontWeight: 800, fontSize: 16 }}>@</span>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#f97316", fontFamily: "monospace" }}>{post.home}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{tn(post.home)}</div>
                    <MatchupGrade grade={hGrade} />
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{tn(post.away)} @ {tn(post.home)}</div>
                  <div style={{ fontSize: 11, color: post.status === "ready" ? "#16a34a" : "#94a3b8" }}>{post.status === "ready" ? "Ready to post" : "Draft"}</div>
                </div>
                <button onClick={() => setPreviewPost(post)} style={{ padding: "8px 14px", borderRadius: 8, background: "#f97316", border: "none", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Preview</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview modal */}
      {previewPost && (
        <InstaPostCard
          away={previewPost.away} home={previewPost.home}
          aStats={previewPost.aStats} hStats={previewPost.hStats}
          bl={bl} rosters={rosters}
          onClose={() => setPreviewPost(null)}
        />
      )}
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ PAGE: 2026 SEASON PREVIEW Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function Season2026({ plays, rosters, onNavigateMatchup }) {
  const isMobile = useIsMobile();
  const [myTeam, setMyTeam] = useState("BUF");
  const [viewMode, setViewMode] = useState("matchups"); // matchups | roster | needs
  const bl = useMemo(() => lgbl(plays), [plays]);

  const opp = OPPONENTS_2026[myTeam] || { home: [], away: [] };
  const allOpponents = [...opp.home.map(t => ({ team: t, loc: "HOME" })), ...opp.away.map(t => ({ team: t, loc: "AWAY" }))];
  // Deduplicate division (played twice Ã¢ÂÂ keep both as home/away)
  const myInfo = T.find(t => t.a === myTeam);
  const dna26 = DNA_2026[myTeam] || DNA[myTeam];
  const fa = FA_MOVES_2026[myTeam] || { added: [], lost: [] };
  const needs = DRAFT_NEEDS_2026[myTeam] || [];

  const posColor = p => {
    if (["QB"].includes(p)) return "#dc2626";
    if (["RB","WR","TE"].includes(p)) return "#f97316";
    if (["EDGE","DL","DT"].includes(p)) return "#2563eb";
    if (["CB","S","LB"].includes(p)) return "#7c3aed";
    if (["OL","OT","OG","C"].includes(p)) return "#059669";
    return "#64748b";
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <TrendingUp size={20} color="#f97316" />
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0 }}>2026 Season Preview</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Opponents confirmed Ã¢ÂÂ weekly schedule TBD. Updated with free agency moves.</p>
      </div>

      {/* Team Selector */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>My Team</label>
          <select value={myTeam} onChange={e => setMyTeam(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600, background: "#fff", cursor: "pointer" }}>
            {T.map(t => <option key={t.a} value={t.a}>{t.a} Ã¢ÂÂ {t.n}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["matchups","projections","roster","needs"].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{ padding: "7px 16px", borderRadius: 8, border: viewMode === m ? "2px solid #f97316" : "1px solid #e2e8f0", background: viewMode === m ? "#fff7ed" : "#fff", fontSize: 12, fontWeight: 700, color: viewMode === m ? "#f97316" : "#64748b", cursor: "pointer", textTransform: "capitalize" }}>
              {m === "matchups" ? "Opponents" : m === "projections" ? "Win Projections" : m === "roster" ? "2026 Roster" : "Draft Needs"}
            </button>
          ))}
        </div>
      </div>

      {/* Team Identity Card */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 16, padding: isMobile ? 16 : 24, marginBottom: 24, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, fontFamily: "monospace" }}>{myTeam}</div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>{myInfo?.n} Ã¢ÂÂ {myInfo?.c} {myInfo?.d}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f97316", marginTop: 6 }}>{dna26.s}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>2025 Record</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace" }}>{recordStr(myTeam)}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>17 games confirmed</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: isMobile ? 12 : 24, marginTop: 16, flexWrap: "wrap" }}>
          <div><div style={{ fontSize: 11, color: "#64748b" }}>Pass Rate</div><div style={{ fontSize: 18, fontWeight: 800 }}>{(dna26.p * 100).toFixed(0)}%</div></div>
          <div><div style={{ fontSize: 11, color: "#64748b" }}>Efficiency</div><div style={{ fontSize: 18, fontWeight: 800 }}>{(dna26.e * 100).toFixed(0)}%</div></div>
          <div><div style={{ fontSize: 11, color: "#64748b" }}>Explosive</div><div style={{ fontSize: 18, fontWeight: 800 }}>{(dna26.x * 100).toFixed(0)}%</div></div>
          <div><div style={{ fontSize: 11, color: "#64748b" }}>Home Games</div><div style={{ fontSize: 18, fontWeight: 800 }}>{opp.home.length}</div></div>
          <div><div style={{ fontSize: 11, color: "#64748b" }}>Away Games</div><div style={{ fontSize: 18, fontWeight: 800 }}>{opp.away.length}</div></div>
        </div>
      </div>

      {/* Ã¢ÂÂÃ¢ÂÂ MATCHUPS VIEW Ã¢ÂÂÃ¢ÂÂ */}
      {viewMode === "matchups" && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>2026 Opponents</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {allOpponents.map((oItem, i) => {
              const oppDna = DNA_2026[oItem.team] || DNA[oItem.team];
              const oppRec = RECORDS_2025[oItem.team];
              const oppStats = agg(plays, oItem.team);
              const myStats = agg(plays, myTeam);
              const grade = oItem.loc === "HOME" ? calcMatchupGrade(myStats, oppStats, bl) : calcMatchupGrade(myStats, oppStats, bl);
              const isDivision = T.find(t => t.a === oItem.team)?.d === myInfo?.d && T.find(t => t.a === oItem.team)?.c === myInfo?.c;
              return (
                <div key={`${oItem.team}-${oItem.loc}-${i}`}
                  onClick={() => onNavigateMatchup && onNavigateMatchup(myTeam, oItem.team)}
                  style={{ background: "#fff", borderRadius: 12, border: isDivision ? "2px solid #f97316" : "1px solid #e2e8f0", padding: 16, cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: "#0f172a" }}>{oItem.team}</span>
                      {isDivision && <span style={{ fontSize: 9, fontWeight: 700, background: "#fff7ed", color: "#f97316", padding: "2px 6px", borderRadius: 4 }}>DIV</span>}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: oItem.loc === "HOME" ? "#dcfce7" : "#fef3c7", color: oItem.loc === "HOME" ? "#166534" : "#92400e" }}>
                      {oItem.loc === "HOME" ? "HOME" : "AWAY"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{tn(oItem.team)} Ã¢ÂÂ {oppDna?.s}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>2025: {recordStr(oItem.team)}</span>
                    <MatchupGrade grade={grade} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: "#f8fafc", borderRadius: 10, fontSize: 12, color: "#64748b" }}>
            <span style={{ fontWeight: 700, color: "#f97316" }}>DIV</span> = division game (played twice). Click any card to open full Matchup Center analysis.
          </div>
        </div>
      )}

      {/* Ã¢ÂÂÃ¢ÂÂ WIN PROJECTIONS VIEW Ã¢ÂÂÃ¢ÂÂ */}
      {viewMode === "projections" && (() => {
        const all32 = projectAll32();
        const proj = all32[myTeam];
        if (!proj) return <div>No projection data available.</div>;
        const pW = proj.projectedWins;
        // Bar color based on projected wins
        const barColor = w => w >= 11 ? "#22c55e" : w >= 9 ? "#f97316" : w >= 7 ? "#eab308" : "#ef4444";
        return (
          <div>
            {/* Season Outlook Card */}
            <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 16, padding: 24, marginBottom: 20, color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5 }}>Projected Record</div>
                  <div style={{ fontSize: 40, fontWeight: 900, fontFamily: "monospace", lineHeight: 1 }}>{pW.toFixed(1)}<span style={{ fontSize: 20, color: "#64748b" }}>-{(17 - pW).toFixed(1)}</span></div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Range: {proj.floor}Ã¢ÂÂ{proj.ceiling} wins (90% confidence)</div>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Win Rank</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: proj.winsRank <= 8 ? "#22c55e" : proj.winsRank <= 16 ? "#f97316" : "#ef4444" }}>#{proj.winsRank}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>SOS Rank</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#94a3b8" }}>#{proj.sosRank}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>of 32</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Div Record</div>
                    <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "monospace" }}>{proj.divWins.toFixed(1)}<span style={{ fontSize: 14, color: "#64748b" }}>-{(proj.divGames - proj.divWins).toFixed(1)}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Game-by-Game Win Probability */}
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Game-by-Game Win Probability</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
              {proj.games.map((g, i) => {
                const wp = (g.winProb * 100);
                const isDivGame = (() => { const oi = T.find(t => t.a === g.opp); return oi && oi.c === myInfo?.c && oi.d === myInfo?.d; })();
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, width: 32, color: "#64748b", textAlign: "right" }}>G{i+1}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "monospace", width: 36, color: "#0f172a" }}>{g.opp}</span>
                    <span style={{ fontSize: 10, width: 40, color: g.isHome ? "#166534" : "#92400e", fontWeight: 600 }}>{g.loc}</span>
                    {isDivGame && <span style={{ fontSize: 8, fontWeight: 700, background: "#fff7ed", color: "#f97316", padding: "1px 4px", borderRadius: 3 }}>DIV</span>}
                    <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 18, position: "relative", overflow: "hidden" }}>
                      <div style={{ width: `${wp}%`, height: "100%", background: wp >= 60 ? "#22c55e" : wp >= 45 ? "#f97316" : "#ef4444", borderRadius: 4, transition: "width .3s" }} />
                      <span style={{ position: "absolute", right: 6, top: 1, fontSize: 10, fontWeight: 700, color: "#334155" }}>{wp.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hardest / Easiest Stretch */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "#fef2f2", borderRadius: 12, padding: 16 }}>
                <h5 style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", margin: "0 0 8px" }}>Toughest Matchups</h5>
                {proj.hardest3.map((g, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                    <span style={{ fontWeight: 700 }}>{g.loc === "AWAY" ? "@" : "vs"} {tn(g.opp)}</span>
                    <span style={{ color: "#dc2626", fontWeight: 700 }}>{(g.winProb * 100).toFixed(0)}% win</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 16 }}>
                <h5 style={{ fontSize: 12, fontWeight: 700, color: "#166534", margin: "0 0 8px" }}>Easiest Matchups</h5>
                {proj.easiest3.map((g, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
                    <span style={{ fontWeight: 700 }}>{g.loc === "AWAY" ? "@" : "vs"} {tn(g.opp)}</span>
                    <span style={{ color: "#166534", fontWeight: 700 }}>{(g.winProb * 100).toFixed(0)}% win</span>
                  </div>
                ))}
              </div>
            </div>

            {/* League-wide Rankings */}
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>League-Wide Win Projections</h4>
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16, maxHeight: 400, overflowY: "auto" }}>
              {T.map(t => t.a).sort((a, b) => (all32[b]?.projectedWins || 0) - (all32[a]?.projectedWins || 0)).map((tm, i) => {
                const p = all32[tm];
                if (!p) return null;
                const w = p.projectedWins;
                const isMe = tm === myTeam;
                return (
                  <div key={tm} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 4px", background: isMe ? "#fff7ed" : "transparent", borderRadius: 6, border: isMe ? "1px solid #fed7aa" : "none", marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", width: 20, textAlign: "right" }}>{i+1}</span>
                    <span style={{ fontSize: 12, fontWeight: isMe ? 900 : 700, fontFamily: "monospace", width: 36, color: isMe ? "#f97316" : "#0f172a" }}>{tm}</span>
                    <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 14, position: "relative", overflow: "hidden" }}>
                      <div style={{ width: `${(w / 17) * 100}%`, height: "100%", background: barColor(w), borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "monospace", width: 50, textAlign: "right", color: "#334155" }}>{w.toFixed(1)}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", width: 50, textAlign: "right" }}>{p.floor}-{p.ceiling}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Ã¢ÂÂÃ¢ÂÂ ROSTER VIEW (MERGED 2026 PROJECTION) Ã¢ÂÂÃ¢ÂÂ */}
      {viewMode === "roster" && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Projected 2026 Roster</h3>
          {fa.note && <p style={{ fontSize: 13, color: "#f97316", fontWeight: 600, margin: "4px 0 12px" }}>{fa.note}</p>}

          {/* Transaction Summary */}
          {(fa.added.length > 0 || fa.lost.length > 0) && (
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {fa.added.length > 0 && (
                <div style={{ flex: 1, background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><ArrowUpRight size={12} /> {fa.added.length} Added</div>
                  <div style={{ fontSize: 12, color: "#334155" }}>{fa.added.map(p => p.name).join(", ")}</div>
                </div>
              )}
              {fa.lost.length > 0 && (
                <div style={{ flex: 1, background: "#fef2f2", borderRadius: 10, padding: "10px 14px", border: "1px solid #fecaca" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><ArrowDownRight size={12} /> {fa.lost.length} Lost</div>
                  <div style={{ fontSize: 12, color: "#334155" }}>{fa.lost.map(p => p.name).join(", ")}</div>
                </div>
              )}
            </div>
          )}

          {/* Merged Depth Chart */}
          {(() => {
            const projected = genRoster2026(myTeam);
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {["offense","defense"].map(side => {
                  const players = projected[side] || [];
                  return (
                    <div key={side} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16 }}>
                      <h5 style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px", display: "flex", justifyContent: "space-between" }}>
                        <span>{side}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>{players.filter(p => p.isNew).length} new</span>
                      </h5>
                      {players.map((pl, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "6px 8px", marginBottom: 2, borderRadius: 6,
                          background: pl.isNew ? "#f0fdf4" : "transparent",
                          border: pl.isNew ? "1px solid #bbf7d0" : "1px solid transparent",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: posColor(pl.pos.replace(/[0-9]/g,"")), minWidth: 36 }}>{pl.pos}</span>
                            <span style={{ fontSize: 12, fontWeight: pl.isNew ? 800 : 600, color: "#0f172a" }}>{pl.name}</span>
                            {pl.isNew && <span style={{ fontSize: 8, fontWeight: 800, background: "#22c55e", color: "#fff", padding: "1px 5px", borderRadius: 3, marginLeft: 4 }}>NEW</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {pl.deal && <span style={{ fontSize: 9, color: "#059669", fontWeight: 600 }}>{pl.deal}</span>}
                            {pl.faNote && <span style={{ fontSize: 9, color: "#64748b", fontStyle: "italic" }}>{pl.faNote}</span>}
                            {!pl.isNew && <span style={{ fontSize: 10, color: "#94a3b8" }}>{pl.rating}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })()}
          {genRoster2026(myTeam).note && (
            <div style={{ marginTop: 12, padding: 10, background: "#fff7ed", borderRadius: 8, fontSize: 12, color: "#92400e", fontWeight: 600 }}>
              {genRoster2026(myTeam).note}
            </div>
          )}
        </div>
      )}

      {/* Ã¢ÂÂÃ¢ÂÂ DRAFT NEEDS VIEW Ã¢ÂÂÃ¢ÂÂ */}
      {viewMode === "needs" && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>2026 Draft Priorities</h3>

          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {needs.map((pos, i) => (
              <div key={pos} style={{ flex: 1, background: i === 0 ? "linear-gradient(135deg, #f97316, #ea580c)" : "#fff", borderRadius: 14, padding: 20, border: i > 0 ? "1px solid #e2e8f0" : "none", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? "#fff9" : "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Priority {i + 1}</div>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "monospace", color: i === 0 ? "#fff" : posColor(pos) }}>{pos}</div>
                <div style={{ fontSize: 11, color: i === 0 ? "#ffffffcc" : "#64748b", marginTop: 4 }}>
                  {i === 0 ? "Primary Need" : i === 1 ? "Secondary" : i === 2 ? "Day 2 Target" : "Depth"}
                </div>
              </div>
            ))}
          </div>

          {/* Data-Driven Needs from play analysis */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: "0 0 8px" }}>Analytics-Based Assessment</h4>
            {(() => {
              const stats = agg(plays, myTeam);
              const computedNeeds = genNeeds(myTeam, stats, bl);
              return computedNeeds.map((n, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 14, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{n.need}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: n.severity === "High" ? "#fef2f2" : n.severity === "Medium" ? "#fff7ed" : "#f0fdf4", color: n.severity === "High" ? "#dc2626" : n.severity === "Medium" ? "#ea580c" : "#166534" }}>{n.severity}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{n.weakness}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>Archetype: {n.archetype}</div>
                </div>
              ));
            })()}
          </div>

          {/* GM Voice */}
          <div style={{ background: "#0f172a", borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <BookOpen size={14} color="#f97316" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: 1.5 }}>GM Memo</span>
            </div>
            <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>
              <MarkdownBlock text={gmVoice(myTeam, agg(plays, myTeam), bl, genNeeds(myTeam, agg(plays, myTeam), bl))} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂ MAIN APP Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const MODULES = [
  { id: "season2026", label: "2026 Preview", icon: TrendingUp },
  { id: "thisweek", label: "This Week", icon: Calendar },
  { id: "dashboard", label: "So What?", icon: Star },
  { id: "matchup", label: "Matchup Preview", icon: Swords },
  { id: "fantasy", label: "Fantasy Intel", icon: Flame },
  { id: "intel", label: "Team Intel", icon: Eye },
  { id: "warroom", label: "War Room", icon: Shield },
  { id: "admin", label: "Admin", icon: Target },
];

export default function DownfieldOS() {
  const [active, setActive] = useState("season2026");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [matchupOff, setMatchupOff] = useState(null);
  const [matchupDef, setMatchupDef] = useState(null);
  const [postPreview, setPostPreview] = useState(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  useEffect(() => { if (!isMobile) setMobileSidebarOpen(false); }, [isMobile]);

  const navigateToMatchup = useCallback((off, def) => {
    setMatchupOff(off);
    setMatchupDef(def);
    setActive("matchup");
  }, []);

  const generatePost = useCallback((away, home, aStats, hStats) => {
    setPostPreview({ away, home, aStats, hStats });
  }, []);

  const allPlays = useMemo(() => generatePlays(), []);
  const filteredPlays = useMemo(() => applyFilters(allPlays, filters), [allPlays, filters]);
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  const rosters = useMemo(() => {
    const r = sr(99);
    const out = {};
    T.forEach(t => { out[t.a] = genRoster(t.a, r); });
    return out;
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: showFilters ? 440 : 220, background: "#0d1117", borderRight: "1px solid #1e293b", flexShrink: 0, display: isMobile && !mobileSidebarOpen ? "none" : "flex", transition: "width .2s", ...(isMobile ? { position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 1500 } : {}) }}>
        {/* Nav */}
        <div style={{ width: 220, padding: "20px 12px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px", marginBottom: 32 }}>
            <div style={{ background: "#1e293b", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color="#f97316" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -.5 }}>DownfieldOS</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {MODULES.map(m => <NavItem key={m.id} icon={m.icon} label={m.label} active={active === m.id} onClick={() => { setActive(m.id); if (isMobile) setMobileSidebarOpen(false); }} />)}
            <div style={{ height: 1, background: "#1e293b", margin: "8px 0" }} />
            <NavItem icon={Filter} label="Filters" active={showFilters} onClick={() => setShowFilters(!showFilters)} badge={isFiltered ? "ON" : null} />
          </div>
          <div style={{ padding: "12px 16px", background: "#1e293b15", borderRadius: 10, marginTop: 16 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontFamily: "monospace", marginBottom: 4 }}>System Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>Engine Online</span>
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
              {isFiltered ? `${filteredPlays.length.toLocaleString()} / ${allPlays.length.toLocaleString()} plays` : `${allPlays.length.toLocaleString()} plays analyzed`}
            </div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>v6 Ã¢ÂÂ 2026 Season Preview</div>
          </div>
        </div>

        {/* Filter panel (slide-out) */}
        {showFilters && (
          <div style={{ width: 220, borderLeft: "1px solid #1e293b", overflowY: "auto" }}>
            <FilterPanel filters={filters} setFilters={setFilters} playCount={filteredPlays.length} totalCount={allPlays.length} />
          </div>
        )}
      </div>

      {isMobile && mobileSidebarOpen && <div onClick={() => setMobileSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1400 }} />}
      {/* Main */}
      <div style={{ flex: 1, background: "#f8fafc", overflow: "auto" }}>
        <div style={{ padding: isMobile ? 16 : 32, maxWidth: 1000, margin: "0 auto", overflowX: "hidden" }}>
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} style={{ background: "#0d1117", border: "none", borderRadius: 8, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Menu size={20} color="#fff" />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={16} color="#f97316" />
                <span style={{ fontWeight: 800, fontSize: 15, color: "#0d1117" }}>DownfieldOS</span>
              </div>
            </div>
          )}
          {active === "season2026" && <Season2026 plays={filteredPlays} rosters={rosters} onNavigateMatchup={navigateToMatchup} />}
          {active === "thisweek" && <ThisWeek plays={filteredPlays} rosters={rosters} onNavigateMatchup={navigateToMatchup} onGeneratePost={generatePost} />}
          {active === "dashboard" && <SoWhatDashboard plays={filteredPlays} />}
          {active === "matchup" && <MatchupCenter plays={filteredPlays} rosters={rosters} initialOff={matchupOff} initialDef={matchupDef} />}
          {active === "fantasy" && <FantasyIntel plays={filteredPlays} rosters={rosters} />}
          {active === "intel" && <TeamIntel plays={filteredPlays} rosters={rosters} />}
          {active === "warroom" && <WarRoom plays={filteredPlays} />}
          {active === "admin" && <AdminPanel plays={filteredPlays} rosters={rosters} />}
        </div>
      </div>

      {/* Post preview modal */}
      {postPreview && (
        <InstaPostCard
          away={postPreview.away} home={postPreview.home}
          aStats={postPreview.aStats} hStats={postPreview.hStats}
          bl={lgbl(filteredPlays)} rosters={rosters}
          onClose={() => setPostPreview(null)}
        />
      )}

      {/* Chatbot */}
      <Chatbot plays={filteredPlays} rosters={rosters} />
    </div>
  );
}
