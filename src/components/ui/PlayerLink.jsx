import { useState } from "react";
import { PlayerCard } from "./PlayerCard";

/**
 * Wraps any player name to make it clickable.
 * Opens a PlayerCard modal with player details on click.
 *
 * Usage: <PlayerLink player={playerObj} team="CHI">{player.name}</PlayerLink>
 */
export function PlayerLink({ player, team, children }) {
  const [showCard, setShowCard] = useState(false);

  if (!player) return children || null;

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={() => setShowCard(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowCard(true); } }}
        aria-label={`View ${player.name} player card`}
        style={{ cursor: "pointer", borderBottom: "1px dashed #f9731640", transition: "border-color 0.15s" }}
        onMouseEnter={e => { e.target.style.borderBottomColor = '#f97316'; }}
        onMouseLeave={e => { e.target.style.borderBottomColor = '#f9731640'; }}
      >
        {children}
      </span>
      {showCard && <PlayerCard player={player} team={team} onClose={() => setShowCard(false)} />}
    </>
  );
}
