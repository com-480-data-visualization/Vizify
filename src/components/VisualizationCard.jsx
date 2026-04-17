export function VisualizationCard({ title, description }) {
  return (
    <article className="viz-card card-surface">
      <div className="viz-card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className="placeholder-badge">Placeholder</span>
      </div>

      <div className="viz-placeholder">
        <div className="placeholder-frame">
          <span>Visualization container</span>
        </div>
      </div>

      <p className="implementation-note">
        {/*TODO LATER*/}
        Placeholder for future dynamic charts and other visualizations.
      </p>
    </article>
  );
}
