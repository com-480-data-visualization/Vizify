// Mirrors the .status-card pattern in styles.css - hairline card with a
// 3px --border-strong left edge. Bold tokens carry the emphasis, never color.
export function InsightCallout({ children }) {
  return <div className="insight-callout">{children}</div>;
}
