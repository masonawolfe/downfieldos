/**
 * AsOf: prints the date label of a static or last-season data file beside
 * the data it renders (freshness plan step 12, 2026-11-07).
 *
 * The label comes from the file's own meta (`label`, `verified_on`,
 * `source_season`), never from the component, so the file stays the one
 * place its date is written. A missing label renders nothing rather than a
 * guessed date.
 *
 * Usage: <AsOf meta={DNA_META} />            light card
 *        <AsOf meta={DNA_META} tone="dark" /> on a dark panel
 */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

function fmtVerified(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  if (!m) return null;
  return `${MONTHS[parseInt(m[2], 10) - 1]} ${parseInt(m[3], 10)}, ${m[1]}`;
}

export function AsOf({ meta, tone = "light", style }) {
  const label = meta?.label;
  if (!label) return null;
  const checked = fmtVerified(meta?.verified_on);
  const dark = tone === "dark";
  return (
    <span
      data-asof={label}
      title={checked ? `Last checked ${checked}` : undefined}
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.4,
        padding: "1px 8px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        color: dark ? "#cbd5e1" : "#64748b",
        background: dark ? "#1e293b" : "#f1f5f9",
        border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
        verticalAlign: "middle",
        ...style,
      }}
    >
      {label}
    </span>
  );
}
