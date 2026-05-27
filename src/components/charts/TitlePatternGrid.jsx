import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useDataset } from "../../data/useDataset";
import { useFilters } from "../../data/filterStore";
import { CATEGORIES } from "../../data/constants";
import { readColorTokens } from "./_shared/colorTokens";
import { useResizeObserver } from "./_shared/useResizeObserver";
import { Tooltip } from "./_shared/Tooltip";
import { InsightCallout } from "./_shared/InsightCallout";
import { GradientLegend } from "./_shared/Legend";

const MARGIN = { top: 70, right: 16, bottom: 12, left: 160 };
const ROW_HEIGHT = 36;
const PATTERNS = [
  "Numbers",
  "Uppercase",
  "Exclamation",
  "Question",
  "Short (<40)",
  "Long (>80)",
  "Emoji",
  "Clickbait",
];

function formatPct(v) {
  return `${v >= 0 ? "+" : ""}${(v * 100).toFixed(0)}%`;
}

function shortCategory(category) {
  const map = {
    "People & Blogs": "People",
    "Film & Animation": "Film",
    "News & Politics": "News",
    "Howto & Style": "Howto",
    "Science & Technology": "Tech",
    "Autos & Vehicles": "Autos",
    "Pets & Animals": "Pets",
    "Travel & Events": "Travel",
    "Nonprofits & Activism": "Nonprofit",
  };
  return map[category] ?? category;
}

export function TitlePatternGrid() {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const { width } = useResizeObserver(wrapRef);
  const { data } = useDataset("titlePatterns");
  const { category } = useFilters();
  const [viewMode, setViewMode] = useState("all");
  const [sortBy, setSortBy] = useState("uplift");
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, header: "", rows: [] });

  const columns = useMemo(() => {
    const baseCats = CATEGORIES.filter((c) => c !== "All");
    if (category === "All") return baseCats;
    const others = baseCats.filter((c) => c !== category);
    return [category, ...others];
  }, [category]);

  const displayedPatterns = useMemo(() => {
    if (!data) return PATTERNS;
    const scored = PATTERNS.map((pattern) => {
      const cells = data.filter((d) => columns.includes(d.category) && d.pattern === pattern);
      const maxUplift = d3.max(cells, (d) => d.uplift) ?? 0;
      const avgUplift = d3.mean(cells, (d) => d.uplift) ?? 0;
      const avgShare = d3.mean(cells, (d) => d.share) ?? 0;
      return { pattern, maxUplift, avgUplift, avgShare };
    });
    const sorted = scored.sort((a, b) =>
      sortBy === "adoption" ? b.avgShare - a.avgShare : b.maxUplift - a.maxUplift || b.avgShare - a.avgShare,
    );
    return (viewMode === "top" ? sorted.slice(0, 5) : sorted).map((d) => d.pattern);
  }, [data, columns, viewMode, sortBy]);

  const rows = useMemo(() => {
    if (!data) return [];
    return displayedPatterns.map((p) => ({
      pattern: p,
      cells: columns.map((cat) => data.find((d) => d.category === cat && d.pattern === p)),
    }));
  }, [data, columns, displayedPatterns]);

  const insight = useMemo(() => {
    if (!data) return null;
    const focus = category === "All" ? null : category;
    const candidates = data.filter((d) => (focus ? d.category === focus : d.category === "All"));
    if (!candidates.length) return null;
    const best = candidates.reduce((a, b) => (a.uplift > b.uplift ? a : b));
    return best;
  }, [data, category]);

  const height = MARGIN.top + MARGIN.bottom + displayedPatterns.length * ROW_HEIGHT;

  useEffect(() => {
    if (!rows.length || !width) return;
    const tokens = readColorTokens();

    const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
    const x = d3.scaleBand().domain(columns).range([0, innerW]).padding(0.12);
    const y = d3.scaleBand().domain(displayedPatterns).range([MARGIN.top, height - MARGIN.bottom]).padding(0.22);

    // Symmetric color scale around 0 (red-to-accent for positive, muted for negative).
    const upliftValues = rows.flatMap((r) => r.cells.filter(Boolean).map((c) => c.uplift));
    const maxAbs = Math.max(0.1, d3.max(upliftValues, (d) => Math.abs(d)) ?? 0.1);
    const color = d3
      .scaleLinear()
      .domain([-maxAbs, 0, maxAbs * 0.55, maxAbs])
      .range([tokens.subtle, tokens.neutral, tokens.accentSoft, tokens.accentStrong])
      .clamp(true);

    const svg = d3.select(svgRef.current).attr("viewBox", `0 0 ${width} ${height}`);
    svg.selectAll("*").remove();

    // Column headers (rotated)
    svg
      .append("g")
      .selectAll("text.col-label")
      .data(columns)
      .join("text")
      .attr("class", "col-label")
      .attr("transform", (c) => `translate(${MARGIN.left + x(c) + x.bandwidth() / 2},${MARGIN.top - 12}) rotate(-32)`)
      .attr("text-anchor", "start")
      .attr("fill", (c) => (c === category ? tokens.text : tokens.muted))
      .style("font-family", "'DM Mono', monospace")
      .style("font-size", "9.5px")
      .style("letter-spacing", "0")
      .style("font-weight", (c) => (c === category ? 600 : 400))
      .text((c) => shortCategory(c));

    // Row labels
    svg
      .append("g")
      .selectAll("text.row-label-pat")
      .data(displayedPatterns)
      .join("text")
      .attr("class", "row-label-pat")
      .attr("x", MARGIN.left - 14)
      .attr("y", (p) => y(p) + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("fill", tokens.text)
      .style("font-family", "'DM Mono', monospace")
      .style("font-size", "11px")
      .style("letter-spacing", "0.06em")
      .text((p) => p);

    // Cells
    const cellG = svg.append("g").attr("transform", `translate(${MARGIN.left},0)`);

    rows.forEach((row) => {
      const g = cellG
        .append("g")
        .attr("transform", `translate(0,${y(row.pattern)})`);

      row.cells.forEach((cell, i) => {
        if (!cell) return;
        const cat = columns[i];
        const cx = x(cat);
        const cw = x.bandwidth();
        const ch = y.bandwidth();

        // Background tile (uplift)
        g.append("rect")
          .attr("x", cx)
          .attr("y", 0)
          .attr("width", cw)
          .attr("height", ch)
          .attr("fill", color(cell.uplift))
          .attr("stroke", cat === category ? tokens.text : "none")
          .attr("stroke-width", cat === category ? 1.5 : 0)
          .attr("opacity", 0)
          .transition()
          .delay(i * 8 + displayedPatterns.indexOf(row.pattern) * 18)
          .duration(420)
          .attr("opacity", 1);

        // Share dot encoding (size = share %)
        const r = Math.sqrt(Math.max(0, cell.share)) * (Math.min(cw, ch) * 0.45);
        g.append("circle")
          .attr("cx", cx + cw / 2)
          .attr("cy", ch / 2)
          .attr("r", 0)
          .attr("fill", "none")
          .attr("stroke", cell.uplift > 0.1 ? "rgba(255,255,255,0.55)" : tokens.borderStrong)
          .attr("stroke-width", 1.2)
          .style("pointer-events", "none")
          .transition()
          .delay(i * 8 + displayedPatterns.indexOf(row.pattern) * 18 + 220)
          .duration(360)
          .attr("r", r);

        // Hover target
        g.append("rect")
          .attr("x", cx)
          .attr("y", 0)
          .attr("width", cw)
          .attr("height", ch)
          .attr("fill", "transparent")
          .style("cursor", "pointer")
          .on("mouseenter", (event) => {
            const [px, py] = d3.pointer(event, wrapRef.current);
            setTooltip({
              visible: true,
              x: px + 12,
              y: py + 12,
              header: `${cat} · ${row.pattern}`,
              rows: [
                { label: "Used by", value: `${(cell.share * 100).toFixed(0)}% of videos` },
                { label: "Avg uplift", value: formatPct(cell.uplift) },
              ],
            });
          })
          .on("mousemove", (event) => {
            const [px, py] = d3.pointer(event, wrapRef.current);
            setTooltip((t) => ({ ...t, x: px + 12, y: py + 12 }));
          })
          .on("mouseleave", () => setTooltip((t) => ({ ...t, visible: false })));
      });
    });
  }, [rows, columns, width, height, category, displayedPatterns]);

  return (
    <>
      <div className="viz-frame-body">
        <div className="viz-controls">
          <div className="viz-control-group">
            <span className="viz-control-label">View</span>
            <div className="segmented-control" aria-label="Title pattern view">
              <button
                type="button"
                className={`has-help ${viewMode === "all" ? "is-active" : ""}`}
                onClick={() => setViewMode("all")}
                data-tooltip="Show every title pattern in the matrix."
              >
                All patterns
              </button>
              <button
                type="button"
                className={`has-help ${viewMode === "top" ? "is-active" : ""}`}
                onClick={() => setViewMode("top")}
                data-tooltip="Show only the patterns with the strongest positive view uplift."
              >
                Top uplift only
              </button>
            </div>
          </div>
          <div className="viz-control-group">
            <span className="viz-control-label">Sort</span>
            <div className="segmented-control" aria-label="Title pattern sort">
              <button
                type="button"
                className={`has-help ${sortBy === "uplift" ? "is-active" : ""}`}
                onClick={() => setSortBy("uplift")}
                data-tooltip="Order rows by the strongest observed view uplift."
              >
                Uplift
              </button>
              <button
                type="button"
                className={`has-help ${sortBy === "adoption" ? "is-active" : ""}`}
                onClick={() => setSortBy("adoption")}
                data-tooltip="Order rows by how often creators use each pattern."
              >
                Adoption
              </button>
            </div>
          </div>
        </div>
        <div className="chart-wrap title-grid-wrap" ref={wrapRef}>
          <svg ref={svgRef} width="100%" height={height} aria-label="Title patterns by category" />
          <Tooltip {...tooltip} />
        </div>
        <div className="viz-frame-legend title-grid-legend">
          <GradientLegend lowLabel="NEGATIVE" highLabel="HIGH UPLIFT" note="COLOR = VIEW UPLIFT" />
          <div className="title-grid-legend-secondary">
            <span className="title-grid-circle small" />
            <span className="title-grid-circle med" />
            <span className="title-grid-circle big" />
            <span className="title-grid-circle-label">CIRCLE SIZE = PATTERN ADOPTION</span>
          </div>
        </div>
      </div>
      {insight && (
        <div className="viz-frame-footer">
          <InsightCallout>
            {category === "All" ? (
              <>
                Across the dataset, <strong>{insight.pattern.toLowerCase()}</strong> titles deliver{" "}
                <strong>{formatPct(insight.uplift)}</strong> uplift - used by{" "}
                <strong>{(insight.share * 100).toFixed(0)}%</strong> of trending videos.
              </>
            ) : (
              <>
                In {category}, <strong>{insight.pattern.toLowerCase()}</strong> titles lift views by{" "}
                <strong>{formatPct(insight.uplift)}</strong>, despite only{" "}
                <strong>{(insight.share * 100).toFixed(0)}%</strong> of creators using them.
              </>
            )}
          </InsightCallout>
        </div>
      )}
    </>
  );
}
