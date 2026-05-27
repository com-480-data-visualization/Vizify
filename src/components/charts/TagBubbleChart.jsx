import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useDataset } from "../../data/useDataset";
import { useFilters } from "../../data/filterStore";
import { readColorTokens } from "./_shared/colorTokens";
import { useResizeObserver } from "./_shared/useResizeObserver";
import { Tooltip } from "./_shared/Tooltip";
import { InsightCallout } from "./_shared/InsightCallout";
import { SwatchLegend } from "./_shared/Legend";

const HEIGHT = 420;
const BUBBLE_PADDING = 8;

function formatPct(v) {
  return `${v >= 0 ? "+" : ""}${(v * 100).toFixed(0)}%`;
}
function formatFreq(n) {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function TagBubbleChart() {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const { width } = useResizeObserver(wrapRef);
  const { data } = useDataset("tags");
  const { category } = useFilters();
  const [mode, setMode] = useState("frequency");
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, header: "", rows: [] });

  const rows = useMemo(() => {
    if (!data) return [];
    return data
      .filter((d) => d.category === category)
      .sort((a, b) => (mode === "uplift" ? b.uplift - a.uplift || b.freq - a.freq : b.freq - a.freq))
      .slice(0, mode === "uplift" ? 24 : 30)
      .map((d) => ({ ...d }));
  }, [data, category, mode]);

  const insight = useMemo(() => {
    if (!rows.length) return null;
    const scored = rows.filter((d) => d.uplift > 0.4).sort((a, b) => b.uplift - a.uplift);
    if (!scored.length) return null;
    return scored.slice(0, 2);
  }, [rows]);

  useEffect(() => {
    if (!rows.length || !width) return;
    const tokens = readColorTokens();

    const r = d3
      .scaleSqrt()
      .domain([0, d3.max(rows, (d) => d.freq) ?? 1])
      .range([14, 54]);

    const maxPositive = Math.max(0.05, d3.quantile(rows.filter((d) => d.uplift > 0).map((d) => d.uplift), 0.95) ?? 1);
    const color = d3
      .scaleLinear()
      .domain([0, maxPositive * 0.45, maxPositive])
      .range([tokens.neutral, tokens.accentSoft, tokens.accentStrong])
      .clamp(true);

    const svg = d3.select(svgRef.current).attr("viewBox", `0 0 ${width} ${HEIGHT}`);
    svg.selectAll("*").remove();

    const groups = svg
      .selectAll("g.bubble")
      .data(rows, (d) => d.tag)
      .enter()
      .append("g")
      .attr("class", "bubble")
      .style("cursor", "pointer");

    groups
      .append("circle")
      .attr("r", (d) => r(d.freq))
      .attr("fill", (d) => (d.uplift < 0 ? tokens.subtle : color(d.uplift)))
      .attr("stroke", tokens.border)
      .attr("stroke-width", 1);

    groups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("dy", "-0.2em")
      .attr("fill", (d) => {
        if (d.uplift < 0) return tokens.text;
        const t = d.uplift / maxPositive;
        return t > 0.5 ? "#ffffff" : tokens.text;
      })
      .style("font-family", "'IBM Plex Sans', sans-serif")
      .style("font-size", "0.72rem")
      .style("font-weight", 500)
      .style("pointer-events", "none")
      .text((d) => (r(d.freq) >= 22 ? d.tag : ""));

    groups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("dy", "1em")
      .attr("fill", (d) => {
        if (d.uplift < 0) return tokens.muted;
        const t = d.uplift / maxPositive;
        return t > 0.5 ? "rgba(255,255,255,0.7)" : tokens.muted;
      })
      .style("font-family", "'DM Mono', monospace")
      .style("font-size", "0.6rem")
      .style("pointer-events", "none")
      .text((d) => (r(d.freq) >= 28 ? formatPct(d.uplift) : ""));

    groups
      .on("mouseenter", function (event, d) {
        d3.select(this).select("circle").attr("stroke", tokens.text).attr("stroke-width", 2);
        groups
          .filter((other) => other.tag !== d.tag)
          .select("circle")
          .attr("opacity", 0.25);
        const [px, py] = d3.pointer(event, wrapRef.current);
        setTooltip({
          visible: true,
          x: px + 12,
          y: py + 12,
          header: d.tag,
          rows: [
            { label: "Category", value: d.category },
            { label: "Videos", value: formatFreq(d.freq) },
            { label: "Avg uplift", value: formatPct(d.uplift) },
            { label: "Country/lang", value: "All countries" },
          ],
        });
      })
      .on("mousemove", (event) => {
        const [px, py] = d3.pointer(event, wrapRef.current);
        setTooltip((t) => ({ ...t, x: px + 12, y: py + 12 }));
      })
      .on("mouseleave", function () {
        d3.select(this).select("circle").attr("stroke", tokens.border).attr("stroke-width", 1);
        groups.select("circle").attr("opacity", 1);
        setTooltip((t) => ({ ...t, visible: false }));
      });

    const sim = d3
      .forceSimulation(rows)
      .force("charge", d3.forceManyBody().strength(2))
      .force("center", d3.forceCenter(width / 2, HEIGHT / 2))
      .force("collide", d3.forceCollide((d) => r(d.freq) + 2))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(HEIGHT / 2).strength(0.07))
      .alpha(0.9)
      .on("tick", () => {
        rows.forEach((d) => {
          const radius = r(d.freq) + BUBBLE_PADDING;
          d.x = Math.max(radius, Math.min(width - radius, d.x));
          d.y = Math.max(radius, Math.min(HEIGHT - radius, d.y));
        });
        groups.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

    return () => sim.stop();
  }, [rows, width]);

  return (
    <>
      <div className="viz-frame-body">
        <div className="viz-controls">
          <div className="viz-control-group">
            <span className="viz-control-label">Mode</span>
            <div className="segmented-control" aria-label="Tag ranking mode">
              <button
                type="button"
                className={`has-help ${mode === "frequency" ? "is-active" : ""}`}
                onClick={() => setMode("frequency")}
                data-tooltip="Prioritize tags that appear in the largest number of trending videos."
              >
                Top by frequency
              </button>
              <button
                type="button"
                className={`has-help ${mode === "uplift" ? "is-active" : ""}`}
                onClick={() => setMode("uplift")}
                data-tooltip="Prioritize tags associated with the strongest average view uplift."
              >
                Top by uplift
              </button>
            </div>
          </div>
        </div>
        <div className="chart-wrap bubble-wrap" ref={wrapRef}>
          <svg ref={svgRef} width="100%" height={HEIGHT} aria-label="Tag performance bubble chart" />
          <Tooltip {...tooltip} />
        </div>
        <div className="viz-frame-legend title-grid-legend">
          <SwatchLegend
            items={[
              { color: "var(--subtle)", label: "Negative uplift" },
              { color: "var(--accent-soft)", label: "Positive uplift" },
              { color: "var(--accent-strong)", label: "Strong uplift" },
            ]}
          />
          <div className="bubble-size-legend" aria-label="Bubble size legend">
            <span className="bubble-size-dot small" />
            <span>Rare</span>
            <span className="bubble-size-dot med" />
            <span>Frequent</span>
            <span className="bubble-size-dot large" />
            <span>Very frequent</span>
          </div>
        </div>
      </div>
      <div className="viz-frame-footer">
        <InsightCallout>
          {insight && insight.length > 0 ? (
            <>
              <strong>{insight.map((t) => t.tag).join(" + ")}</strong> deliver{" "}
              <strong>{insight.map((t) => formatPct(t.uplift)).join(" / ")}</strong> uplift in{" "}
              {category === "All" ? "the dataset" : category}, despite lower frequency.
            </>
          ) : (
            <>No tags break out in {category === "All" ? "the dataset" : category}. Performance is even across labels.</>
          )}
        </InsightCallout>
      </div>
    </>
  );
}
