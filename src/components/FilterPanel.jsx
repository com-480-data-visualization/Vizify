import { useFilters } from "../data/filterStore";
import { COUNTRIES } from "../data/constants";

export function FilterPanel() {
  const { country, setCountry, reset } = useFilters();

  return (
    <div className="filter-panel card-surface" aria-label="Dashboard filters">
      <form className="filter-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          <span>Country scope</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="button button-secondary" onClick={reset}>
          Reset
        </button>
      </form>
    </div>
  );
}
