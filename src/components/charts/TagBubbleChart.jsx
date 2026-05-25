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
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, header: "", rows: [] });

  const rows = useMemo(() => {
    if (!data) return [];
    return data
      .filter((d) => d.category === category)
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 30)
      .map((d) => ({ ...d }));
  }, [data, category]);

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

    const upliftDomain = [0, Math.max(0.05, d3.quantile(rows.map((d) => d.uplift), 0.95) ?? 1)];
    const color = d3
      .scaleSequential()
      .interpolator(d3.interpolateRgb(tokens.bgSoft, tokens.accent))
      .domain(upliftDomain);

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
        const t = (d.uplift - upliftDomain[0]) / (upliftDomain[1] - upliftDomain[0]);
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
        const t = (d.uplift - upliftDomain[0]) / (upliftDomain[1] - upliftDomain[0]);
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
            { label: "Frequency", value: formatFreq(d.freq) },
            { label: "Avg uplift", value: formatPct(d.uplift) },
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
        groups.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

    return () => sim.stop();
  }, [rows, width]);

  return (
    <>
      <div className="viz-frame-body">
        <div className="chart-wrap bubble-wrap" ref={wrapRef}>
          <svg ref={svgRef} width="100%" height={HEIGHT} aria-label="Tag performance bubble chart" />
          <Tooltip {...tooltip} />
        </div>
        <div className="viz-frame-legend">
          <SwatchLegend
            items={[
              { color: "var(--bg-soft)", label: "Low uplift (<10%)" },
              { color: "color-mix(in srgb, var(--accent) 50%, var(--bg-soft))", label: "Mid (10–50%)" },
              { color: "var(--accent)", label: "High uplift (>50%)" },
            ]}
          />
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
