import { useFilters } from "../data/filterStore";
import { CATEGORIES, COUNTRIES } from "../data/constants";

export function FilterPanel() {
  const { category, country, search, setCategory, setCountry, setSearch, reset } = useFilters();

  return (
    <div className="filter-panel card-surface">
      <div className="filter-panel-header">
        <p className="section-kicker">Controls</p>
        <h3>Filters</h3>
        <p>Global filters shared across every chart below.</p>
      </div>

      <form className="filter-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          <span>Country</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Keyword search</span>
          <input
            type="text"
            placeholder="Search title or tag"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <button type="button" className="button button-secondary button-block" onClick={reset}>
          Reset
        </button>
      </form>

      <p className="filter-note">
        Filters update charts live using the CSV-derived aggregates in{" "}
        <code>public/data</code>.
      </p>
    </div>
  );
}
