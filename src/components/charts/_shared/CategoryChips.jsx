import { CATEGORIES } from "../../../data/constants";
import { useFilters } from "../../../data/filterStore";
import { useDataset } from "../../../data/useDataset";

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function CategoryChips() {
  const { category, country, setCategory } = useFilters();
  const { data: meta } = useDataset("meta");
  const counts = meta?.videoCountsByCountry?.[country] ?? meta?.videoCounts ?? {};

  return (
    <div className="category-chips" role="tablist" aria-label="Category filter">
      {CATEGORIES.map((c) => {
        const active = c === category;
        const count = counts[c];
        return (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={active}
            className={`category-chip${active ? " is-active" : ""}`}
            onClick={() => setCategory(c)}
          >
            <span>{c}</span>
            {count != null && <span className="category-chip-count">{formatCount(count)}</span>}
          </button>
        );
      })}
    </div>
  );
}
