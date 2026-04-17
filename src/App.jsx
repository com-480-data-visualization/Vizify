import { FilterPanel } from "./components/FilterPanel";
import { SectionShell } from "./components/SectionShell";
import { VisualizationCard } from "./components/VisualizationCard";

const keyQuestions = [
  "What kind of title patterns appear most often in trending videos?",
  "Do some categories exploit metadata better than others?",
  "Does publish time matter?",
  "Are there outliers that get unusual engagement?",
];

const visualizations = [
  {
    title: "Sketch 1",
    description: "Placeholder for a future visualization to be defined by the team.",
  },
  {
    title: "Sketch 2",
    description: "Placeholder for a future visualization to be defined by the team.",
  },
  {
    title: "Sketch 3",
    description: "Placeholder for a future visualization to be defined by the team.",
  },
  {
    title: "Sketch 4",
    description: "Placeholder for a future visualization to be defined by the team.",
  },
];

const informationCards = [
  {
    title: "MVP",
    body: "A working dashboard where you can see overall performance, compare videos, and use filters.",
  },
  {
    title: "Interactions",
    body: "You'll be able to hover, click, and filter to go down from the global picture into specific data points.",
  },
  {
    title: "Extensions",
    body: "Later on, we might add things like title analysis, clickbait detection, and smooth animations between charts.",
  },
];

const stack = ["D3.js", "React", "HTML/CSS", "JavaScript", "Vite", "Vercel"];

const analysis = [
  "TBD: Analysis method/library placeholder",
  "TBD: Analysis method/library placeholder",
  "TBD: Analysis method/library placeholder",
  "TBD: Analysis method/library placeholder",
];

const teamMembers = [
  { name: "Imane Lahrichi", sciper: "360854" },
  { name: "Imane Raihane", sciper: "362230" },
  { name: "Victor Zablocki", sciper: "361602" },
];

function ItemGrid({ label, items }) {
  return (
    <div className="method-column">
      <p className="method-right-label">{label}</p>
      <div className="stack-grid">
        {items.map((item) => (
          <div className="stack-item card-surface" key={item}>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-block">
          <p className="eyebrow">COM-480 Milestone 2 Prototype</p>
          <h1>YouTube Trending Metadata Explorer</h1>
          <p className="site-subtitle">
            A visual study of how creators optimize metadata to improve visibility on
            YouTube&apos;s trending page.
          </p>
        </div>
        <nav className="top-nav" aria-label="Primary">
          <a href="#overview">Overview</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#method">Method</a>
        </nav>
      </header>

      <main>
        <SectionShell id="overview" className="hero-section">
          <div className="hero-copy">
            <p className="section-kicker">Overview</p>
            <h2>How do YouTubers optimize metadata to reach the trending page?</h2>
            <p className="hero-text">
              This prototype frames the project as an analysis of creator behavior:
              titles, tags, categories, publish timing, and engagement patterns that may
              influence visibility across countries and content niches.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#dashboard">
                Explore prototype
              </a>
              <a className="button button-secondary" href="#method">
                Read methodology
              </a>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-badge">Research framing</div>
            <p>
              We start with a global overview, then let you dig into specific comparisons, 
              metadata signals, and timing trends.
            </p>
            <div className="hero-metrics">
              <div>
                <span>178,399</span>
                <p>videos in dataset</p>
              </div>
              <div>
                <span>231K</span>
                <p>avg. views per trending video</p>
              </div>
              <div>
                <span>11</span>
                <p>countries tracked</p>
              </div>
            </div>
          </div>
        </SectionShell>

        <SectionShell title="Key Questions">
          <div className="question-grid">
            {keyQuestions.map((question) => (
              <article className="question-card" key={question}>
                <span className="question-index">Question</span>
                <p>{question}</p>
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell id="dashboard" title="Dashboard Skeleton">
          <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
              <FilterPanel />
            </aside>

            <div className="dashboard-main">
              <div className="visualization-grid">
                {visualizations.map((item) => (
                  <VisualizationCard
                    key={item.title}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>

              <div className="info-grid">
                {informationCards.map((card) => (
                  <article className="info-card card-surface" key={card.title}>
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </SectionShell>

        <SectionShell id="method" title="Method and Structure">
          <div className="method-layout">
            <div className="method-copy card-surface">
              <p>
                The site follows a progressive analytical logic: overview first to establish
                the main patterns, zoom and filter to isolate countries, categories, and
                keyword signals, then details on demand for interpreting specific outliers
                or metadata strategies.
              </p>
              <p>
                Once we build the actual logic (loading data, wiring up D3, and making filters work), 
                it'll just drop right into this layout.
              </p>
            </div>

            <div className="method-bottom">
              <ItemGrid label="Tech stack" items={stack} />
              <ItemGrid label="Analysis" items={analysis} />
            </div>
          </div>
        </SectionShell>

        <SectionShell title="About Us">
          <div className="info-grid">
            {teamMembers.map((member) => (
              <article key={member.sciper} className="info-card card-surface">
                <h3>{member.name}</h3>
                <p>SCIPER: {member.sciper}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      </main>
    </div>
  );
}

export default App;
