export function sr(seed) { let s = seed; return () => { s = (s*16807)%2147483647; return (s-1)/2147483646; }; }
