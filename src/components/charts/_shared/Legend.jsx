export function GradientLegend({
  from = "var(--neutral)",
  via = "var(--accent-soft)",
  to = "var(--accent-strong)",
  lowLabel = "Low",
  highLabel = "High",
  note,
}) {
  return (
    <div className="viz-legend">
      <span>{lowLabel}</span>
      <span
        className="viz-legend-gradient"
        style={{ backgroundImage: `linear-gradient(to right, ${from}, ${via}, ${to})` }}
      />
      <span>{highLabel}</span>
      {note && <span>{note}</span>}
    </div>
  );
}

export function SwatchLegend({ items }) {
  return (
    <div className="viz-legend">
      <div className="viz-legend-swatches">
        {items.map((item) => (
          <span key={item.label} className="viz-legend-swatch">
            <span className="viz-legend-swatch-color" style={{ background: item.color }} />
            <span>{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
