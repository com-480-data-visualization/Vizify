import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useDataset } from "../../data/useDataset";
import { useFilters } from "../../data/filterStore";
import { readColorTokens } from "./_shared/colorTokens";
import { useResizeObserver } from "./_shared/useResizeObserver";
import { Tooltip } from "./_shared/Tooltip";
import { InsightCallout } from "./_shared/InsightCallout";
import * as mockData from "../../data/mockData";

const MARGIN = { top: 28, right: 80, bottom: 36, left: 110 };
const HEIGHT = 300;

function formatNum(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function bucketForLength(length, buckets) {
  for (const b of buckets) {
    if (length >= b.start && length <= b.end) return b.label;
  }
  return buckets[buckets.length - 1].label;
}

export function DescriptionChart() {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const { width } = useResizeObserver(wrapRef);
  const { data } = useDataset("descriptions");
  const { category } = useFilters();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, header: "", rows: [] });
  const [descLength, setDescLength] = useState(120);

  const buckets = mockData.descriptionBuckets;

  const rows = useMemo(
    () => (data ? data.filter((d) => d.category === category) : []),
    [data, category],
  );

  const activeBucket = useMemo(() => bucketForLength(descLength, buckets), [descLength, buckets]);
  const activeRow = useMemo(
    () => rows.find((r) => r.bucket === activeBucket),
    [rows, activeBucket],
  );

  const insight = useMemo(() => {
    if (!rows.length) return null;
    const top = rows.reduce((a, b) => (a.avgComments > b.avgComments ? a : b));
    return top;
  }, [rows]);

  useEffect(() => {
    if (!rows.length || !width) return;
    const tokens = readColorTokens();

    const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
    const innerH = Math.max(0, HEIGHT - MARGIN.top - MARGIN.bottom);

    const y = d3
      .scaleBand()
      .domain(buckets.map((b) => b.label))
      .range([0, innerH])
      .padding(0.28);

    const maxVal = d3.max(rows, (d) => d.avgComments) ?? 1;
    const x = d3.scaleLinear().domain([0, maxVal * 1.18]).range([0, innerW]);

    const svg = d3.select(svgRef.current).attr("viewBox", `0 0 ${width} ${HEIGHT}`);
    svg.selectAll("*").remove();
    const root = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    root
      .append("g")
      .attr("class", "viz-axis")
      .attr("transform", `translate(-10,0)`)
      .selectAll("text")
      .data(buckets)
      .join("text")
      .attr("y", (d) => y(d.label) + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("fill", tokens.muted)
      .text((d) => `${d.label} w`);

    root
      .append("g")
      .attr("class", "viz-axis")
      .attr("transform", `translate(0,${innerH + 10})`)
      .selectAll("text")
      .data(x.ticks(5))
      .join("text")
      .attr("x", (d) => x(d))
      .attr("text-anchor", "middle")
      .attr("fill", tokens.muted)
      .text((d) => formatNum(d));

    const bars = root
      .selectAll("g.row")
      .data(rows, (d) => d.bucket)
      .join("g")
      .attr("class", "row")
      .attr("transform", (d) => `translate(0,${y(d.bucket)})`);

    bars
      .append("rect")
      .attr("class", "desc-bar")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", y.bandwidth())
      .attr("width", 0)
      .attr("fill", (d) => (d.bucket === activeBucket ? tokens.accent : tokens.subtle))
      .attr("opacity", (d) => (d.bucket === activeBucket ? 1 : 0.55))
      .on("mouseenter", function (event, d) {
        const [px, py] = d3.pointer(event, wrapRef.current);
        setTooltip({
          visible: true,
          x: px + 12,
          y: py + 12,
          header: `${d.bucket} words`,
          rows: [
            { label: "Avg comments", value: d.avgComments.toLocaleString() },
            { label: "Avg views", value: formatNum(d.avgViews) },
            { label: "Sample", value: d.n.toLocaleString() },
          ],
        });
      })
      .on("mousemove", (event) => {
        const [px, py] = d3.pointer(event, wrapRef.current);
        setTooltip((t) => ({ ...t, x: px + 12, y: py + 12 }));
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, visible: false })));

    bars
      .select("rect")
      .transition()
      .duration(650)
      .ease(d3.easeCubicOut)
      .attr("width", (d) => x(d.avgComments));

    bars
      .append("text")
      .attr("class", "desc-value")
      .attr("x", (d) => x(d.avgComments) + 10)
      .attr("y", y.bandwidth() / 2)
      .attr("alignment-baseline", "middle")
      .attr("fill", tokens.text)
      .style("font-family", "'DM Mono', monospace")
      .style("font-size", "11px")
      .style("opacity", 0)
      .text((d) => d.avgComments.toLocaleString())
      .transition()
      .delay(450)
      .duration(250)
      .style("opacity", 1);
  }, [rows, width, activeBucket, buckets]);

  return (
    <>
      <div className="viz-frame-body">
        <div className="desc-slider">
          <label htmlFor="desc-len" className="desc-slider-label">
            <span>My description length</span>
            <strong>{descLength} words</strong>
          </label>
          <input
            id="desc-len"
            type="range"
            min={0}
            max={600}
            step={10}
            value={descLength}
            onChange={(e) => setDescLength(Number(e.target.value))}
          />
          <div className="desc-slider-ticks">
            {buckets.map((b) => (
              <span key={b.label} className={b.label === activeBucket ? "is-active" : ""}>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        <div className="chart-wrap desc-wrap" ref={wrapRef}>
          <svg ref={svgRef} width="100%" height={HEIGHT} aria-label="Comments by description length" />
          <Tooltip {...tooltip} />
        </div>

        <div className="desc-stats">
          <div>
            <span className="desc-stat-num">
              {activeRow ? activeRow.avgComments.toLocaleString() : "-"}
            </span>
            <p>Avg comments at your length</p>
          </div>
          <div>
            <span className="desc-stat-num">
              {insight ? insight.avgComments.toLocaleString() : "-"}
            </span>
            <p>Peak comments</p>
          </div>
          <div>
            <span className="desc-stat-num">
              {insight ? insight.bucket : "-"}
            </span>
            <p>Optimal bucket</p>
          </div>
        </div>
      </div>
      {insight && (
        <div className="viz-frame-footer">
          <InsightCallout>
            In {category === "All" ? "the dataset" : category}, descriptions in the{" "}
            <strong>{insight.bucket}-word</strong> range attract the most conversation -{" "}
            <strong>{insight.avgComments.toLocaleString()}</strong> avg comments per video.
          </InsightCallout>
        </div>
      )}
    </>
  );
}
