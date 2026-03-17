export function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dark navy background */}
      <rect width="36" height="36" rx="10" fill="#0d1117" />

      {/* Route tree — chalk-style lines */}
      {/* Vertical stem from center */}
      <line x1="18" y1="28" x2="18" y2="16" stroke="#c9d1d9" strokeWidth="1.8" strokeLinecap="round" />

      {/* Left route — out route */}
      <polyline points="18,16 12,10 7,10" stroke="#c9d1d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Right route — go route (straight up) */}
      <line x1="18" y1="16" x2="22" y2="6" stroke="#c9d1d9" strokeWidth="1.8" strokeLinecap="round" />

      {/* Center route — slant */}
      <polyline points="18,16 15,11 17,7" stroke="#c9d1d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Orange arrow tip on the go route */}
      <circle cx="22" cy="6" r="2.5" fill="#f97316" />

      {/* Small X at the line of scrimmage */}
      <line x1="24" y1="26" x2="28" y2="30" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="26" x2="24" y2="30" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />

      {/* Small O marker */}
      <circle cx="10" cy="28" r="2.2" stroke="#475569" strokeWidth="1.2" fill="none" />
    </svg>
  );
}
