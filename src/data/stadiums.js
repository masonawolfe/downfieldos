/**
 * Stadium Data — 2025-2026
 *
 * Each team's home stadium with environment factors:
 * - timezone: IANA timezone for travel/fatigue calculations
 * - surface: 'grass' or 'turf' — affects speed, cutting, injury risk
 * - altitude: feet above sea level (Denver = 5280)
 * - dome: true if indoor/retractable roof (weather-proof)
 * - capacity: approximate seating
 */

export const STADIUMS = {
  ARI: { name: 'State Farm Stadium', city: 'Glendale, AZ', tz: 'America/Phoenix', surface: 'grass', altitude: 1100, dome: true, capacity: 63400 },
  ATL: { name: 'Mercedes-Benz Stadium', city: 'Atlanta, GA', tz: 'America/New_York', surface: 'turf', altitude: 1050, dome: true, capacity: 71000 },
  BAL: { name: 'M&T Bank Stadium', city: 'Baltimore, MD', tz: 'America/New_York', surface: 'grass', altitude: 30, dome: false, capacity: 71008 },
  BUF: { name: 'Highmark Stadium', city: 'Orchard Park, NY', tz: 'America/New_York', surface: 'turf', altitude: 600, dome: false, capacity: 71608 },
  CAR: { name: 'Bank of America Stadium', city: 'Charlotte, NC', tz: 'America/New_York', surface: 'grass', altitude: 750, dome: false, capacity: 74867 },
  CHI: { name: 'Soldier Field', city: 'Chicago, IL', tz: 'America/Chicago', surface: 'grass', altitude: 600, dome: false, capacity: 61500 },
  CIN: { name: 'Paycor Stadium', city: 'Cincinnati, OH', tz: 'America/New_York', surface: 'turf', altitude: 490, dome: false, capacity: 65515 },
  CLE: { name: 'Cleveland Browns Stadium', city: 'Cleveland, OH', tz: 'America/New_York', surface: 'grass', altitude: 650, dome: false, capacity: 67431 },
  DAL: { name: 'AT&T Stadium', city: 'Arlington, TX', tz: 'America/Chicago', surface: 'turf', altitude: 600, dome: true, capacity: 80000 },
  DEN: { name: 'Empower Field at Mile High', city: 'Denver, CO', tz: 'America/Denver', surface: 'grass', altitude: 5280, dome: false, capacity: 76125 },
  DET: { name: 'Ford Field', city: 'Detroit, MI', tz: 'America/New_York', surface: 'turf', altitude: 600, dome: true, capacity: 65000 },
  GB: { name: 'Lambeau Field', city: 'Green Bay, WI', tz: 'America/Chicago', surface: 'grass', altitude: 640, dome: false, capacity: 81441 },
  HOU: { name: 'NRG Stadium', city: 'Houston, TX', tz: 'America/Chicago', surface: 'turf', altitude: 50, dome: true, capacity: 72220 },
  IND: { name: 'Lucas Oil Stadium', city: 'Indianapolis, IN', tz: 'America/New_York', surface: 'turf', altitude: 720, dome: true, capacity: 67000 },
  JAX: { name: 'EverBank Stadium', city: 'Jacksonville, FL', tz: 'America/New_York', surface: 'grass', altitude: 15, dome: false, capacity: 67814 },
  KC: { name: 'GEHA Field at Arrowhead', city: 'Kansas City, MO', tz: 'America/Chicago', surface: 'grass', altitude: 800, dome: false, capacity: 76416 },
  LAC: { name: 'SoFi Stadium', city: 'Inglewood, CA', tz: 'America/Los_Angeles', surface: 'turf', altitude: 100, dome: true, capacity: 70240 },
  LAR: { name: 'SoFi Stadium', city: 'Inglewood, CA', tz: 'America/Los_Angeles', surface: 'turf', altitude: 100, dome: true, capacity: 70240 },
  LV: { name: 'Allegiant Stadium', city: 'Las Vegas, NV', tz: 'America/Los_Angeles', surface: 'grass', altitude: 2000, dome: true, capacity: 65000 },
  MIA: { name: 'Hard Rock Stadium', city: 'Miami Gardens, FL', tz: 'America/New_York', surface: 'grass', altitude: 10, dome: false, capacity: 64767 },
  MIN: { name: 'U.S. Bank Stadium', city: 'Minneapolis, MN', tz: 'America/Chicago', surface: 'turf', altitude: 830, dome: true, capacity: 66655 },
  NE: { name: 'Gillette Stadium', city: 'Foxborough, MA', tz: 'America/New_York', surface: 'turf', altitude: 250, dome: false, capacity: 65878 },
  NO: { name: 'Caesars Superdome', city: 'New Orleans, LA', tz: 'America/Chicago', surface: 'turf', altitude: 3, dome: true, capacity: 73208 },
  NYG: { name: 'MetLife Stadium', city: 'East Rutherford, NJ', tz: 'America/New_York', surface: 'turf', altitude: 10, dome: false, capacity: 82500 },
  NYJ: { name: 'MetLife Stadium', city: 'East Rutherford, NJ', tz: 'America/New_York', surface: 'turf', altitude: 10, dome: false, capacity: 82500 },
  PHI: { name: 'Lincoln Financial Field', city: 'Philadelphia, PA', tz: 'America/New_York', surface: 'grass', altitude: 40, dome: false, capacity: 69176 },
  PIT: { name: 'Acrisure Stadium', city: 'Pittsburgh, PA', tz: 'America/New_York', surface: 'grass', altitude: 730, dome: false, capacity: 68400 },
  SEA: { name: 'Lumen Field', city: 'Seattle, WA', tz: 'America/Los_Angeles', surface: 'turf', altitude: 20, dome: false, capacity: 68740 },
  SF: { name: "Levi's Stadium", city: 'Santa Clara, CA', tz: 'America/Los_Angeles', surface: 'grass', altitude: 40, dome: false, capacity: 68500 },
  TB: { name: 'Raymond James Stadium', city: 'Tampa, FL', tz: 'America/New_York', surface: 'grass', altitude: 40, dome: false, capacity: 65618 },
  TEN: { name: 'Nissan Stadium', city: 'Nashville, TN', tz: 'America/Chicago', surface: 'turf', altitude: 430, dome: false, capacity: 69143 },
  WAS: { name: 'Northwest Stadium', city: 'Landover, MD', tz: 'America/New_York', surface: 'grass', altitude: 60, dome: false, capacity: 67617 },
};

// Timezone offset from UTC (standard time hours)
export const TZ_OFFSETS = {
  'America/New_York': -5,
  'America/Chicago': -6,
  'America/Denver': -7,
  'America/Phoenix': -7,
  'America/Los_Angeles': -8,
};
