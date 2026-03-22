import { T } from '../data/teams';

export const pct = v => (v * 100).toFixed(1) + "%";
export const tn = a => T.find(t => t.a === a)?.n || a;
// Possessive form: "Bears'" not "Bears's", "49ers'" not "49ers's"
export const tnp = a => { const n = tn(a); return n.endsWith('s') ? `${n}'` : `${n}'s`; };
