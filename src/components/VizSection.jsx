import { CategoryChips } from "./charts/_shared/CategoryChips";
import { useDataset } from "../data/useDataset";

function formatCount(n) {
  if (n == null) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Outer chrome shared by every visualization section.
 * Renders: eyebrow (VIZ N), Cormorant heading, intro paragraph, right-aligned
 * "videos analyzed" meta block, and a cream-surface frame with chips on top
 * + the chart body below.
 */
export function VizSection({ id, eyebrow, title, intro, withChips = true, children }) {
  const { data: meta } = useDataset("meta");
  const totalVideos = meta?.totalVideos;
  const countryCount = (meta?.countries?.length ?? 1) - 1; // minus "All"

  return (
    <section className="viz-section" id={id}>
      <div className="viz-section-head">
        <div>
          <p className="section-kicker">{eyebrow}</p>
          <h2>{title}</h2>
          {intro && <p>{intro}</p>}
        </div>
        <div className="viz-meta">
          <span className="viz-meta-number">{formatCount(totalVideos)}</span>
          <span className="viz-meta-caption">
            videos analyzed
            {countryCount > 0 ? ` · across ${countryCount} countries` : ""}
          </span>
        </div>
      </div>
      <div className="viz-frame card-surface">
        {withChips && (
          <div className="viz-frame-header">
            <CategoryChips />
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
