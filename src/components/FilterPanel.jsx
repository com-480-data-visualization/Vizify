export function FilterPanel() {
  return (
    <div className="filter-panel card-surface">
      <div className="filter-panel-header">
        <p className="section-kicker">Controls</p>
        <h3>Filter panel</h3>
        <p>Basic skeleton UI for the dashboard filters.</p>
      </div>

      <form className="filter-form">
        <label>
          <span>Country</span>
          <select defaultValue="">
            <option value="" disabled>
              Select country
            </option>
            <option>United States</option>
            <option>France</option>
            <option>Japan</option>
            <option>Brazil</option>
          </select>
        </label>

        <label>
          <span>Category</span>
          <select defaultValue="">
            <option value="" disabled>
              Select category
            </option>
            <option>Music</option>
            <option>Gaming</option>
            <option>Comedy</option>
            <option>News & Politics</option>
          </select>
        </label>

        <label>
          <span>Publish hour</span>
          <input type="range" min="0" max="23" defaultValue="12" />
          <small>12:00</small>
        </label>

        <label>
          <span>Keyword search</span>
          <input type="text" placeholder="Search title or tag pattern" />
        </label>

        <button type="button" className="button button-primary button-block">
          Apply filters
        </button>
      </form>

      <p className="filter-note">
        {/*TODO LATER*/}
        TODO LATER : data loading and coordinated chart updates.
      </p>
    </div>
  );
}
