export function GradientLegend({ from = "var(--bg-soft)", to = "var(--accent)", lowLabel = "Low", highLabel = "High" }) {
  return (
    <div className="viz-legend">
      <span>{lowLabel}</span>
      <span
        className="viz-legend-gradient"
        style={{ backgroundImage: `linear-gradient(to right, ${from}, ${to})` }}
      />
      <span>{highLabel}</span>
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
