import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useDataset } from "../../data/useDataset";
import { useFilters } from "../../data/filterStore";
import { DAY_LABELS } from "../../data/constants";
import { readColorTokens } from "./_shared/colorTokens";
import { useResizeObserver } from "./_shared/useResizeObserver";
import { Tooltip } from "./_shared/Tooltip";
import { InsightCallout } from "./_shared/InsightCallout";
import { GradientLegend } from "./_shared/Legend";

const MARGIN = { top: 22, right: 8, bottom: 8, left: 38 };
const HEIGHT = 440;
const BAR_RATIO = 0.5;

function formatViews(n) {
  if (n == null) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

export function HeatmapChart() {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const { width } = useResizeObserver(wrapRef);
  const { data } = useDataset("heatmap");
  const { category } = useFilters();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, header: "", rows: [] });

  const rows = useMemo(
    () => (data ? data.filter((d) => d.category === category) : []),
    [data, category],
  );

  const insight = useMemo(() => {
    if (!rows.length) return null;
    const top = rows.reduce((a, b) => (a.avgViews > b.avgViews ? a : b));
    return { day: DAY_LABELS[top.dow], hour: top.hour, views: top.avgViews };
  }, [rows]);

  useEffect(() => {
    if (!rows.length || !width) return;
    const tokens = readColorTokens();

    const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
    const innerH = Math.max(0, HEIGHT - MARGIN.top - MARGIN.bottom);

    const x = d3.scaleBand().domain(DAY_LABELS).range([0, innerW]).padding(0.16);
    const y = d3.scaleBand().domain(d3.range(24).map(String)).range([0, innerH]).padding(0.32);

    const values = rows.map((d) => d.avgViews);
    const [lo, hi] = [d3.quantile(values, 0.05), d3.quantile(values, 0.95)];
    const color = d3
      .scaleSequential()
      .interpolator(d3.interpolateRgb(tokens.bgSoft, tokens.accent))
      .domain([lo ?? 0, hi ?? 1]);

    const svg = d3.select(svgRef.current).attr("viewBox", `0 0 ${width} ${HEIGHT}`);
    svg.selectAll("*").remove();
    const root = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    root
      .append("g")
      .attr("class", "viz-axis")
      .attr("transform", `translate(0,-8)`)
      .selectAll("text")
      .data(DAY_LABELS)
      .join("text")
      .attr("x", (d) => x(d) + x.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("fill", tokens.muted)
      .text((d) => d);

    root
      .append("g")
      .attr("class", "viz-axis")
      .attr("transform", `translate(-8,0)`)
      .selectAll("text")
      .data(d3.range(24))
      .join("text")
      .attr("y", (d) => y(String(d)) + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("fill", tokens.muted)
      .text((d) => (d % 3 === 0 ? `${String(d).padStart(2, "0")}h` : ""));

    const barH = y.bandwidth();
    const cells = root.append("g");
    cells
      .selectAll("rect.cell")
      .data(rows, (d) => `${d.dow}-${d.hour}`)
      .join("rect")
      .attr("class", "cell")
      .attr("x", (d) => x(DAY_LABELS[d.dow]))
      .attr("y", (d) => y(String(d.hour)) + (barH * (1 - BAR_RATIO)) / 2)
      .attr("width", x.bandwidth())
      .attr("height", barH * BAR_RATIO)
      .attr("fill", (d) => (d.n < 5 ? tokens.bgSoft : color(d.avgViews)))
      .attr("stroke", (d) => (d.n < 5 ? tokens.border : "none"))
      .attr("stroke-dasharray", (d) => (d.n < 5 ? "2 2" : null))
      .on("mouseenter", (event, d) => {
        const [px, py] = d3.pointer(event, wrapRef.current);
        setTooltip({
          visible: true,
          x: px + 12,
          y: py + 12,
          header: d.category,
          rows: [
            { label: "Slot", value: `${DAY_LABELS[d.dow]} · ${String(d.hour).padStart(2, "0")}:00 UTC` },
            { label: "Sample size", value: d.n.toLocaleString() },
            { label: "Avg views", value: d.avgViews.toLocaleString() },
            { label: "Avg likes", value: d.avgLikes.toLocaleString() },
            { label: "Avg comments", value: d.avgComments.toLocaleString() },
          ],
        });
      })
      .on("mousemove", (event) => {
        const [px, py] = d3.pointer(event, wrapRef.current);
        setTooltip((t) => ({ ...t, x: px + 12, y: py + 12 }));
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, visible: false })));
  }, [rows, width]);

  return (
    <>
      <div className="viz-frame-body">
        <div className="chart-wrap heatmap-wrap" ref={wrapRef}>
          <svg ref={svgRef} width="100%" height={HEIGHT} aria-label="Time-based performance heatmap" />
          <Tooltip {...tooltip} />
        </div>
        <div className="viz-frame-legend">
          <GradientLegend lowLabel="LOW VISIBILITY" highLabel="HIGH VISIBILITY" />
        </div>
      </div>
      {insight && (
        <div className="viz-frame-footer">
          <InsightCallout>
            {category === "All" ? "Overall" : category} peaks on{" "}
            <strong>
              {insight.day} {String(insight.hour).padStart(2, "0")}h UTC
            </strong>{" "}
            - avg <strong>{formatViews(insight.views)} views</strong> per video.
          </InsightCallout>
        </div>
      )}
    </>
  );
}
