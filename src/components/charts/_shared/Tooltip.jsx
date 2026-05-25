import { forwardRef } from "react";

export const Tooltip = forwardRef(function Tooltip({ visible, x, y, header, rows }, ref) {
  return (
    <div
      ref={ref}
      className={`viz-tooltip${visible ? " is-visible" : ""}`}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      role="tooltip"
    >
      {header && <div className="viz-tooltip-header">{header}</div>}
      {rows?.map((row) => (
        <div key={row.label} className="viz-tooltip-row">
          <span>{row.label}</span>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
});
