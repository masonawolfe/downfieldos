export function MarkdownBlock({ text }) {
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
