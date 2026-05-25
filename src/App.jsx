import { FilterPanel } from "./components/FilterPanel";
import { SectionShell } from "./components/SectionShell";
import { VizSection } from "./components/VizSection";
import { HeatmapChart } from "./components/charts/HeatmapChart";
import { EmojiBarChart } from "./components/charts/EmojiBarChart";
import { TagBubbleChart } from "./components/charts/TagBubbleChart";
import { DescriptionChart } from "./components/charts/DescriptionChart";
import { TitlePatternGrid } from "./components/charts/TitlePatternGrid";

const keyQuestions = [
  "What kind of title patterns appear most often in trending videos?",
  "Do some categories exploit metadata better than others?",
  "Does publish time matter?",
  "Are there outliers that get unusual engagement?",
];

const informationCards = [
  {
    title: "MVP",
    body: "A working dashboard where you can see overall performance, compare videos, and use filters.",
  },
  {
    title: "Interactions",
    body: "Hover, click, and filter to move from the global picture into specific data points.",
  },
  {
    title: "Extensions",
    body: "Optional add-ons include description-length analysis, title-pattern growth curves, and subgenre clustering.",
  },
];

const stack = ["D3.js", "React", "HTML/CSS", "JavaScript", "Vite", "Vercel"];

const analysis = [
  "Per-category aggregation",
  "Emoji regex extraction",
  "Tag-frequency uplift",
  "Title pattern classification",
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
          <p className="eyebrow">COM-480 Final Milestone</p>
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
            <svg className="hero-yt-logo" viewBox="0 0 24 24" aria-label="YouTube" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <p className="section-kicker">Overview</p>
            <h2>How do YouTubers optimize metadata to reach the trending page?</h2>
            <p className="hero-text">
              This project frames the analysis around creator behavior:
              titles, tags, categories, publish timing, and engagement patterns that may
              influence visibility across countries and content niches.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#dashboard">
                Explore the data
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

        <SectionShell id="dashboard" title="Explore the data">
          <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
              <FilterPanel />
            </aside>

            <div className="dashboard-main">
              <VizSection
                id="viz-time"
                eyebrow="VIZ 1"
                title="Best time to go viral"
                intro="Understand when your audience is most active and how timing influences performance on YouTube."
              >
                <HeatmapChart />
              </VizSection>

              <VizSection
                id="viz-emoji"
                eyebrow="VIZ 2"
                title="Boost your views with emojis"
                intro="Do emojis in titles correlate with stronger visibility - and which styles fit each category?"
              >
                <EmojiBarChart />
              </VizSection>

              <VizSection
                id="viz-titles"
                eyebrow="VIZ 3"
                title="Patterns that lift titles"
                intro="Each tile shows how often a pattern is used (ring size) and how much it lifts views (fill)."
              >
                <TitlePatternGrid />
              </VizSection>

              <VizSection
                id="viz-tags"
                eyebrow="VIZ 4"
                title="Use tags to increase reach"
                intro="Which tags actually drive views. Bubble size encodes frequency, color encodes average uplift."
              >
                <TagBubbleChart />
              </VizSection>

              <VizSection
                id="viz-desc"
                eyebrow="VIZ 5"
                title="A better description for more comments"
                intro="Drag the slider to your description length to see which bucket you fall into and how it compares."
              >
                <DescriptionChart />
              </VizSection>
            </div>
          </div>
        </SectionShell>

        <SectionShell id="method" title="Method and Structure">
          <div className="method-layout">
            <div className="method-copy card-surface">
              <p>
                The site follows a progressive analytical logic: overview first to establish
                the main patterns, then per-viz filters to isolate categories and content
                niches, then details on demand for interpreting specific outliers or
                metadata strategies.
              </p>
              <p>
                Charts read from <code>src/data/mockData.js</code> today. The hook in{" "}
                <code>src/data/useDataset.js</code> swaps to fetching{" "}
                <code>public/data/*.json</code> once the preprocessing script ships.
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

        <SectionShell title="Project Direction">
          <div className="info-grid">
            {informationCards.map((card) => (
              <article className="info-card card-surface" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      </main>
    </div>
  );
}

export default App;
