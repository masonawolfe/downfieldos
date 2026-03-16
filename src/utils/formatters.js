import { T } from '../data/teams';

export const pct = v => (v * 100).toFixed(1) + "%";
export const tn = a => T.find(t => t.a === a)?.n || a;
