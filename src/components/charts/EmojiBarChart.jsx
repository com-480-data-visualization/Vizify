import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { useDataset } from "../../data/useDataset";
import { useFilters } from "../../data/filterStore";
import { readColorTokens } from "./_shared/colorTokens";
import { useResizeObserver } from "./_shared/useResizeObserver";
import { InsightCallout } from "./_shared/InsightCallout";
import * as mockData from "../../data/mockData";

const MARGIN = { top: 24, right: 60, bottom: 8, left: 150 };
const HEIGHT = 180;
const BAR_HEIGHT = 28;

function formatViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

export function EmojiBarChart() {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const { width } = useResizeObserver(wrapRef);
  const { data } = useDataset("emoji");
  const { category } = useFilters();

  const rows = useMemo(() => {
    if (!data) return [];
    const filtered = data.filter((d) => d.category === category);
    return [false, true].map((flag) => filtered.find((d) => d.hasEmoji === flag)).filter(Boolean);
  }, [data, category]);

  const topEmojis = mockData.emojiTop[category] ?? mockData.emojiTop.All;

  const lift = useMemo(() => {
    if (rows.length < 2) return null;
    const base = rows[0].medianViews;
    const tip = rows[1].medianViews;
    return ((tip - base) / base) * 100;
  }, [rows]);

  useEffect(() => {
    if (!rows.length || !width) return;
    const tokens = readColorTokens();

    const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
    const max = d3.max(rows, (d) => d.medianViews) ?? 1;
    const x = d3.scaleLinear().domain([0, max * 1.12]).range([0, innerW]);
    const labels = ["TITLE WITHOUT EMOJI", "TITLE WITH EMOJI"];
    const y = d3.scaleBand().domain(labels).range([0, BAR_HEIGHT * 2 + 32]).padding(0.25);

    const svg = d3.select(svgRef.current).attr("viewBox", `0 0 ${width} ${HEIGHT}`);
    svg.selectAll("*").remove();
    const root = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    root
      .selectAll("text.row-label")
      .data(labels)
      .join("text")
      .attr("class", "row-label")
      .attr("x", -14)
      .attr("y", (d) => y(d) + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("fill", tokens.muted)
      .text((d) => d);

    const bars = root
      .selectAll("rect.bar")
      .data(rows, (d) => d.hasEmoji)
      .join("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => y(d.hasEmoji ? "TITLE WITH EMOJI" : "TITLE WITHOUT EMOJI") + (y.bandwidth() - BAR_HEIGHT) / 2)
      .attr("height", BAR_HEIGHT)
      .attr("fill", (d) => (d.hasEmoji ? tokens.accent : tokens.subtle))
      .attr("width", 0);

    bars.transition().duration(600).ease(d3.easeCubicOut).attr("width", (d) => x(d.medianViews));

    const valueLabels = root
      .selectAll("text.value")
      .data(rows, (d) => d.hasEmoji)
      .join("text")
      .attr("class", "value")
      .attr("y", (d) => y(d.hasEmoji ? "TITLE WITH EMOJI" : "TITLE WITHOUT EMOJI") + y.bandwidth() / 2)
      .attr("alignment-baseline", "middle")
      .attr("fill", tokens.text)
      .attr("x", 0)
      .text("0");

    valueLabels
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr("x", (d) => x(d.medianViews) + 8)
      .tween("text", function (d) {
        const i = d3.interpolateNumber(0, d.medianViews);
        return (t) => {
          this.textContent = formatViews(Math.round(i(t)));
        };
      });
  }, [rows, width]);

  return (
    <>
      <div className="viz-frame-body">
        <div className="chart-wrap emoji-wrap" ref={wrapRef}>
          <svg ref={svgRef} width="100%" height={HEIGHT} aria-label="Median views by emoji usage" />
        </div>
      </div>
      <div className="viz-frame-footer">
        <InsightCallout>
          {lift != null && lift > 0 && (
            <>
              In {category === "All" ? "the dataset" : category}, titles with emojis earn{" "}
              <strong>+{lift.toFixed(0)}% more views</strong> than emoji-free titles.{" "}
            </>
          )}
          {lift != null && lift <= 0 && (
            <>
              Emojis show <strong>no measurable lift</strong> in {category}. Skip them and lean on copy.{" "}
            </>
          )}
          <span className="emoji-rec">
            Top performers: <strong>{topEmojis.join("  ")}</strong>
          </span>
        </InsightCallout>
      </div>
    </>
  );
}
