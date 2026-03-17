/**
 * CSV export utility — client-side CSV generation and download.
 */

function escapeCSV(val) {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toCSV(headers, rows) {
  const lines = [headers.map(escapeCSV).join(",")];
  rows.forEach(row => {
    lines.push(headers.map((_, i) => escapeCSV(row[i])).join(","));
  });
  return lines.join("\n");
}

export function downloadCSV(filename, headers, rows) {
  const csv = toCSV(headers, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : filename + ".csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
