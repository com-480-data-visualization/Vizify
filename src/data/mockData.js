// ============================================================================
// MOCK DATA
// ============================================================================
// All values here are placeholders generated to make the visualizations
// renderable end-to-end. To swap in real values:
//
//   Option A - flip the flag in src/data/useDataset.js
//     Set USE_MOCK = false. The hook will then fetch
//     /data/<name>.json from public/data/ instead of importing from here.
//
//   Option B - paste the real arrays over the mock exports below
//     Keep the same shapes (documented next to each export). Useful if you
//     want to keep everything synchronous and bundled.
//
// Shapes are documented as JSDoc above each export so a future contributor
// can mirror them in scripts/build-data.mjs.
// ============================================================================

import { CATEGORIES, COUNTRIES } from "./constants";

// ---- meta ------------------------------------------------------------------
/**
 * @typedef {Object} Meta
 * @property {string[]} categories
 * @property {string[]} countries
 * @property {Record<string, number>} videoCounts  // by category, includes "All"
 * @property {number} totalVideos
 */

const VIDEO_COUNTS = {
  All: 178399,
  Gaming: 76210,
  Music: 44753,
  Entertainment: 29044,
  "People & Blogs": 11608,
  "Film & Animation": 9344,
  Sports: 1893,
  "News & Politics": 1402,
  Comedy: 894,
  "Howto & Style": 862,
  "Science & Technology": 790,
  "Autos & Vehicles": 759,
  Education: 439,
  "Pets & Animals": 382,
  "Travel & Events": 181,
  "Nonprofits & Activism": 23,
};

export const meta = {
  categories: CATEGORIES,
  countries: COUNTRIES,
  videoCounts: VIDEO_COUNTS,
  totalVideos: VIDEO_COUNTS.All,
};

// ---- heatmap ---------------------------------------------------------------
/**
 * @typedef {Object} HeatmapCell
 * @property {string} category
 * @property {number} dow                  // 0 = Mon, 6 = Sun
 * @property {number} hour                 // 0..23 UTC
 * @property {number} avgViews
 * @property {number} avgLikes
 * @property {number} avgComments
 * @property {number} n                    // sample size
 */

// Per-category archetype: when is the audience most active.
// Used by the generator below to give each category a plausible peak.
const HEATMAP_PROFILES = {
  Music: { base: 380000, peakDay: 5, peakHour: 21, daySpread: 1.6, hourSpread: 4 },
  Gaming: { base: 145000, peakDay: 5, peakHour: 16, daySpread: 1.4, hourSpread: 5 },
  Entertainment: { base: 220000, peakDay: 5, peakHour: 19, daySpread: 1.7, hourSpread: 4 },
  Comedy: { base: 195000, peakDay: 5, peakHour: 22, daySpread: 1.5, hourSpread: 3 },
  Sports: { base: 175000, peakDay: 6, peakHour: 18, daySpread: 1.2, hourSpread: 4 },
  "News & Politics": { base: 95000, peakDay: 2, peakHour: 8, daySpread: 2.4, hourSpread: 5 },
  "People & Blogs": { base: 130000, peakDay: 4, peakHour: 18, daySpread: 2.0, hourSpread: 5 },
  "Film & Animation": { base: 240000, peakDay: 4, peakHour: 17, daySpread: 1.8, hourSpread: 5 },
  "Howto & Style": { base: 110000, peakDay: 3, peakHour: 14, daySpread: 2.5, hourSpread: 6 },
  "Science & Technology": { base: 125000, peakDay: 2, peakHour: 14, daySpread: 2.2, hourSpread: 5 },
  "Autos & Vehicles": { base: 105000, peakDay: 5, peakHour: 15, daySpread: 1.8, hourSpread: 5 },
  Education: { base: 90000, peakDay: 2, peakHour: 12, daySpread: 2.6, hourSpread: 5 },
  "Pets & Animals": { base: 215000, peakDay: 6, peakHour: 16, daySpread: 1.6, hourSpread: 5 },
  "Travel & Events": { base: 145000, peakDay: 4, peakHour: 11, daySpread: 2.0, hourSpread: 6 },
  "Nonprofits & Activism": { base: 80000, peakDay: 2, peakHour: 10, daySpread: 2.8, hourSpread: 6 },
};

// Light deterministic PRNG so mock numbers are stable across reloads.
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildHeatmap() {
  const out = [];
  const cats = CATEGORIES.filter((c) => c !== "All");
  const allTotals = new Map(); // (dow,hour) -> [sumViews, sumLikes, sumComments, totalN]

  for (const cat of cats) {
    const p = HEATMAP_PROFILES[cat];
    if (!p) continue;
    const rng = seeded(hashStr(cat));
    const n = VIDEO_COUNTS[cat] || 500;

    for (let dow = 0; dow < 7; dow++) {
      for (let hour = 0; hour < 24; hour++) {
        const dayDist = Math.min(Math.abs(dow - p.peakDay), 7 - Math.abs(dow - p.peakDay));
        const hourDist = Math.min(Math.abs(hour - p.peakHour), 24 - Math.abs(hour - p.peakHour));
        const dayW = Math.exp(-(dayDist * dayDist) / (2 * p.daySpread * p.daySpread));
        const hourW = Math.exp(-(hourDist * hourDist) / (2 * p.hourSpread * p.hourSpread));
        const mult = 0.25 + 0.75 * dayW * hourW;
        const noise = 0.85 + 0.3 * rng();
        const avgViews = Math.round(p.base * mult * noise);
        const avgLikes = Math.round(avgViews * (0.025 + 0.01 * rng()));
        const avgComments = Math.round(avgViews * (0.0008 + 0.0005 * rng()));
        const cellN = Math.max(3, Math.round((n / (7 * 24)) * (0.6 + 0.8 * rng())));
        out.push({ category: cat, dow, hour, avgViews, avgLikes, avgComments, n: cellN });

        // accumulate for "All"
        const key = dow * 24 + hour;
        const prev = allTotals.get(key) || [0, 0, 0, 0];
        prev[0] += avgViews * cellN;
        prev[1] += avgLikes * cellN;
        prev[2] += avgComments * cellN;
        prev[3] += cellN;
        allTotals.set(key, prev);
      }
    }
  }
  // Aggregate "All" rollup
  for (const [key, [sv, sl, sc, ttn]] of allTotals) {
    const dow = Math.floor(key / 24);
    const hour = key % 24;
    out.push({
      category: "All",
      dow,
      hour,
      avgViews: Math.round(sv / ttn),
      avgLikes: Math.round(sl / ttn),
      avgComments: Math.round(sc / ttn),
      n: ttn,
    });
  }
  return out;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

export const heatmap = buildHeatmap();

// ---- emoji -----------------------------------------------------------------
/**
 * @typedef {Object} EmojiRow
 * @property {string} category
 * @property {boolean} hasEmoji
 * @property {number} medianViews
 * @property {number} n
 */

// Per-category lift factor for "with emoji" vs "without"
// (some categories love emojis, some don't move at all).
const EMOJI_LIFT = {
  All: 1.41,
  Music: 1.73,
  Gaming: 1.11,
  Entertainment: 1.55,
  Comedy: 1.62,
  "People & Blogs": 1.48,
  "Film & Animation": 1.34,
  Sports: 1.05,
  "News & Politics": 0.92,
  "Howto & Style": 1.18,
  "Science & Technology": 0.98,
  "Autos & Vehicles": 1.07,
  Education: 0.94,
  "Pets & Animals": 1.51,
  "Travel & Events": 1.22,
  "Nonprofits & Activism": 1.0,
};

const EMOJI_BASE_VIEWS = {
  All: 203000,
  Music: 203000,
  Gaming: 130000,
  Entertainment: 175000,
  Comedy: 167000,
  "People & Blogs": 115000,
  "Film & Animation": 210000,
  Sports: 160000,
  "News & Politics": 95000,
  "Howto & Style": 98000,
  "Science & Technology": 112000,
  "Autos & Vehicles": 99000,
  Education: 88000,
  "Pets & Animals": 190000,
  "Travel & Events": 130000,
  "Nonprofits & Activism": 80000,
};

function buildEmoji() {
  const out = [];
  for (const cat of CATEGORIES) {
    const base = EMOJI_BASE_VIEWS[cat] ?? 150000;
    const lift = EMOJI_LIFT[cat] ?? 1.2;
    const n = VIDEO_COUNTS[cat] ?? 500;
    out.push({ category: cat, hasEmoji: false, medianViews: base, n: Math.round(n * 0.55) });
    out.push({ category: cat, hasEmoji: true, medianViews: Math.round(base * lift), n: Math.round(n * 0.45) });
  }
  return out;
}

export const emoji = buildEmoji();

// Top-3 most-effective emojis per category (joined to footer of viz 2).
export const emojiTop = {
  All: ["🔥", "😂", "❤️"],
  Music: ["🎵", "🎤", "🔥"],
  Gaming: ["🎮", "🔥", "💯"],
  Entertainment: ["🎬", "🔥", "✨"],
  Comedy: ["😂", "🤣", "💀"],
  "People & Blogs": ["✨", "❤️", "🥹"],
  "Film & Animation": ["🎬", "🍿", "✨"],
  Sports: ["⚽", "🏆", "🔥"],
  "News & Politics": ["📰", "⚡", "🌍"],
  "Howto & Style": ["✨", "💡", "🛠️"],
  "Science & Technology": ["🚀", "🤖", "💡"],
  "Autos & Vehicles": ["🏎️", "🔥", "🛞"],
  Education: ["📚", "🎓", "💡"],
  "Pets & Animals": ["🐶", "🐱", "❤️"],
  "Travel & Events": ["✈️", "🌍", "🏝️"],
  "Nonprofits & Activism": ["🌍", "❤️", "✊"],
};

// ---- tags ------------------------------------------------------------------
/**
 * @typedef {Object} TagRow
 * @property {string} category
 * @property {string} tag
 * @property {number} freq        // count of trending videos using this tag
 * @property {number} uplift      // (avg_views_with_tag / avg_views_in_category) - 1
 */

const TAG_POOLS = {
  All: [
    ["#viral", 18000, 0.42], ["#fyp", 16500, 0.21], ["#trending", 15200, 0.34],
    ["#2026", 12800, 0.08], ["#shorts", 11400, 0.61], ["#breaking", 6200, 0.52],
    ["#review", 5800, 0.12], ["#tutorial", 5100, 0.05], ["#highlights", 4900, 0.38],
    ["#funny", 4300, 0.44], ["#new", 3900, -0.05], ["#official", 3200, 0.71],
  ],
  Music: [
    ["#mv", 12000, 0.84], ["#officialvideo", 9400, 0.92], ["#lyrics", 7800, 0.36],
    ["#newmusic", 6200, 0.48], ["#audio", 5500, 0.21], ["#live", 4900, 0.18],
    ["#cover", 3800, -0.08], ["#remix", 3200, 0.55], ["#kpop", 2800, 1.12],
    ["#hiphop", 2400, 0.61], ["#pop", 2100, 0.42], ["#viral", 1900, 0.38],
  ],
  Gaming: [
    ["#gameplay", 14000, 0.18], ["#walkthrough", 8400, 0.22], ["#fps", 4200, 0.81],
    ["#speedrun", 3100, 0.92], ["#stream", 6500, 0.07], ["#highlights", 5400, 0.42],
    ["#breakdown", 2900, 0.31], ["#review", 4800, 0.12], ["#tutorial", 3600, -0.04],
    ["#tips", 2400, 0.08], ["#guide", 2100, 0.02], ["#fyp", 5200, 0.18],
    ["#2026", 3800, 0.04], ["#shorts", 4100, 0.55],
  ],
  Entertainment: [
    ["#interview", 4200, 0.31], ["#exclusive", 3100, 0.62], ["#reaction", 5800, 0.44],
    ["#celebrity", 2700, 0.51], ["#viral", 4400, 0.38], ["#trending", 3900, 0.28],
    ["#shorts", 4800, 0.41], ["#funny", 3600, 0.22], ["#talk", 2200, -0.04],
  ],
  Comedy: [
    ["#funny", 4200, 0.41], ["#sketch", 2100, 0.34], ["#standup", 1400, 0.22],
    ["#meme", 3100, 0.71], ["#parody", 1200, 0.18], ["#shorts", 3800, 0.55],
    ["#viral", 2800, 0.42], ["#tiktok", 1900, 0.31],
  ],
  Sports: [
    ["#highlights", 1800, 0.51], ["#football", 1100, 0.42], ["#basketball", 800, 0.34],
    ["#goal", 600, 0.71], ["#match", 500, 0.18], ["#training", 350, -0.08],
    ["#worldcup", 280, 1.21],
  ],
  "News & Politics": [
    ["#breaking", 800, 0.51], ["#politics", 600, 0.22], ["#election", 420, 0.62],
    ["#interview", 380, 0.18], ["#analysis", 290, 0.05], ["#live", 510, 0.34],
  ],
  "People & Blogs": [
    ["#vlog", 4200, 0.18], ["#daily", 2100, 0.04], ["#storytime", 1800, 0.42],
    ["#mylife", 1400, -0.02], ["#blog", 1100, -0.08], ["#routine", 800, 0.21],
  ],
  "Film & Animation": [
    ["#trailer", 3200, 0.71], ["#animation", 2100, 0.34], ["#shortfilm", 1400, 0.22],
    ["#movie", 1800, 0.42], ["#scene", 1100, 0.31], ["#vfx", 600, 0.51],
  ],
  "Howto & Style": [
    ["#tutorial", 320, -0.04], ["#diy", 280, 0.18], ["#hacks", 220, 0.42],
    ["#makeup", 180, 0.34], ["#fashion", 140, 0.21], ["#beauty", 110, 0.12],
  ],
  "Science & Technology": [
    ["#tech", 290, 0.22], ["#science", 220, 0.18], ["#review", 180, 0.04],
    ["#ai", 160, 0.81], ["#explained", 110, 0.42], ["#space", 90, 0.71],
  ],
  "Autos & Vehicles": [
    ["#cars", 280, 0.18], ["#review", 220, 0.05], ["#supercar", 140, 0.62],
    ["#electric", 110, 0.42], ["#racing", 90, 0.51], ["#dyno", 60, -0.05],
  ],
  Education: [
    ["#explained", 160, 0.31], ["#tutorial", 140, 0.08], ["#course", 100, -0.04],
    ["#lecture", 80, -0.12], ["#learn", 60, 0.02],
  ],
  "Pets & Animals": [
    ["#cute", 140, 0.81], ["#dogs", 110, 0.42], ["#cats", 100, 0.51],
    ["#pets", 80, 0.34], ["#funny", 70, 0.62], ["#rescue", 40, 0.71],
  ],
  "Travel & Events": [
    ["#travel", 70, 0.31], ["#vlog", 50, 0.05], ["#adventure", 40, 0.42],
    ["#tour", 30, 0.18], ["#nature", 25, 0.21],
  ],
  "Nonprofits & Activism": [
    ["#cause", 8, 0.18], ["#charity", 6, 0.05], ["#awareness", 5, 0.34],
  ],
};

function buildTags() {
  const out = [];
  for (const [category, rows] of Object.entries(TAG_POOLS)) {
    for (const [tag, freq, uplift] of rows) {
      out.push({ category, tag, freq, uplift });
    }
  }
  return out;
}

export const tags = buildTags();

// ---- descriptions ----------------------------------------------------------
/**
 * @typedef {Object} DescriptionBucket
 * @property {string} category
 * @property {string} bucket            // e.g. "0–50", "51–100" (words)
 * @property {number} bucketStart       // inclusive lower bound
 * @property {number} bucketEnd         // inclusive upper bound
 * @property {number} avgComments       // per video
 * @property {number} avgViews          // per video
 * @property {number} n                 // sample size
 */

// Per-category sweet-spot for description length.
// peakBucket = which bucket of "DESC_BUCKETS" performs best for this niche.
const DESC_PROFILES = {
  All: { base: 460, peakBucket: 3, spread: 1.6, viewBase: 195000 },
  Music: { base: 320, peakBucket: 2, spread: 1.4, viewBase: 380000 },
  Gaming: { base: 410, peakBucket: 4, spread: 1.5, viewBase: 145000 },
  Entertainment: { base: 520, peakBucket: 3, spread: 1.6, viewBase: 220000 },
  Comedy: { base: 360, peakBucket: 2, spread: 1.3, viewBase: 195000 },
  "People & Blogs": { base: 740, peakBucket: 4, spread: 1.8, viewBase: 130000 },
  "Film & Animation": { base: 480, peakBucket: 3, spread: 1.6, viewBase: 240000 },
  Sports: { base: 220, peakBucket: 1, spread: 1.4, viewBase: 175000 },
  "News & Politics": { base: 380, peakBucket: 3, spread: 1.7, viewBase: 95000 },
  "Howto & Style": { base: 880, peakBucket: 5, spread: 1.6, viewBase: 110000 },
  "Science & Technology": { base: 920, peakBucket: 5, spread: 1.5, viewBase: 125000 },
  "Autos & Vehicles": { base: 540, peakBucket: 4, spread: 1.6, viewBase: 105000 },
  Education: { base: 1050, peakBucket: 5, spread: 1.4, viewBase: 90000 },
  "Pets & Animals": { base: 280, peakBucket: 1, spread: 1.5, viewBase: 215000 },
  "Travel & Events": { base: 620, peakBucket: 4, spread: 1.7, viewBase: 145000 },
  "Nonprofits & Activism": { base: 480, peakBucket: 3, spread: 1.8, viewBase: 80000 },
};

// Word-count buckets (inclusive ranges).
const DESC_BUCKETS = [
  { label: "0–30", start: 0, end: 30 },
  { label: "31–80", start: 31, end: 80 },
  { label: "81–150", start: 81, end: 150 },
  { label: "151–250", start: 151, end: 250 },
  { label: "251–400", start: 251, end: 400 },
  { label: "400+", start: 401, end: 800 },
];

function buildDescriptions() {
  const out = [];
  for (const cat of CATEGORIES) {
    const p = DESC_PROFILES[cat] ?? DESC_PROFILES.All;
    const rng = seeded(hashStr(`desc:${cat}`));
    const n = VIDEO_COUNTS[cat] ?? 500;
    DESC_BUCKETS.forEach((b, i) => {
      const dist = Math.abs(i - p.peakBucket);
      const w = Math.exp(-(dist * dist) / (2 * p.spread * p.spread));
      const mult = 0.45 + 0.55 * w;
      const noise = 0.92 + 0.16 * rng();
      const avgComments = Math.round(p.base * mult * noise);
      const avgViews = Math.round(p.viewBase * (0.7 + 0.55 * w) * (0.94 + 0.12 * rng()));
      const cellN = Math.max(8, Math.round((n / DESC_BUCKETS.length) * (0.7 + 0.5 * rng())));
      out.push({
        category: cat,
        bucket: b.label,
        bucketStart: b.start,
        bucketEnd: b.end,
        avgComments,
        avgViews,
        n: cellN,
      });
    });
  }
  return out;
}

export const descriptions = buildDescriptions();
export const descriptionBuckets = DESC_BUCKETS;

// ---- title patterns --------------------------------------------------------
/**
 * @typedef {Object} TitlePatternCell
 * @property {string} category
 * @property {string} pattern     // e.g. "Uppercase", "Question mark"
 * @property {number} share       // 0..1 - fraction of category videos using this pattern
 * @property {number} uplift      // (avg_views_with / avg_views_without) - 1
 */

export const TITLE_PATTERNS = [
  "Numbers",
  "Uppercase",
  "Exclamation",
  "Question",
  "Short (<40)",
  "Long (>80)",
  "Emoji",
  "Clickbait",
];

// Per (category, pattern) signal map. Each row in CAT_TITLE_SIGNATURES is
// indexed in TITLE_PATTERNS order: [share, uplift].
// share = % of trending videos in the category that use the pattern.
// uplift = relative lift in avg views vs videos in the category that don't.
const CAT_TITLE_SIGNATURES = {
  All:              [[0.31, 0.18], [0.22, 0.21], [0.18, 0.12], [0.14, 0.09], [0.41, 0.04], [0.19, 0.06], [0.27, 0.34], [0.16, 0.42]],
  Music:            [[0.18, 0.05], [0.32, 0.41], [0.14, 0.18], [0.04, -0.02], [0.61, 0.22], [0.06, 0.04], [0.42, 0.62], [0.04, 0.08]],
  Gaming:           [[0.46, 0.31], [0.18, 0.12], [0.22, 0.18], [0.21, 0.34], [0.34, -0.04], [0.28, 0.18], [0.21, 0.22], [0.34, 0.51]],
  Entertainment:    [[0.34, 0.28], [0.31, 0.34], [0.28, 0.22], [0.18, 0.12], [0.41, 0.18], [0.18, 0.08], [0.36, 0.42], [0.24, 0.52]],
  Comedy:           [[0.21, 0.18], [0.22, 0.22], [0.31, 0.34], [0.18, 0.18], [0.54, 0.31], [0.08, -0.04], [0.34, 0.51], [0.21, 0.62]],
  "People & Blogs": [[0.18, 0.05], [0.18, 0.08], [0.21, 0.18], [0.34, 0.31], [0.32, 0.05], [0.31, 0.22], [0.42, 0.34], [0.18, 0.31]],
  "Film & Animation": [[0.18, 0.18], [0.21, 0.18], [0.21, 0.12], [0.08, 0.05], [0.34, 0.18], [0.21, 0.22], [0.24, 0.34], [0.12, 0.38]],
  Sports:           [[0.42, 0.42], [0.28, 0.18], [0.31, 0.31], [0.04, 0.02], [0.51, 0.34], [0.05, -0.08], [0.21, 0.22], [0.12, 0.41]],
  "News & Politics":[[0.31, 0.05], [0.41, 0.42], [0.21, 0.18], [0.18, 0.12], [0.32, 0.04], [0.41, 0.21], [0.05, -0.04], [0.21, 0.32]],
  "Howto & Style":  [[0.41, 0.28], [0.12, 0.04], [0.18, 0.08], [0.32, 0.42], [0.21, -0.05], [0.41, 0.34], [0.18, 0.21], [0.22, 0.34]],
  "Science & Technology": [[0.34, 0.18], [0.14, 0.08], [0.18, 0.12], [0.28, 0.42], [0.18, -0.04], [0.51, 0.42], [0.08, 0.02], [0.18, 0.31]],
  "Autos & Vehicles": [[0.41, 0.31], [0.18, 0.12], [0.21, 0.18], [0.18, 0.21], [0.32, 0.08], [0.34, 0.22], [0.12, 0.18], [0.21, 0.34]],
  Education:        [[0.41, 0.22], [0.08, 0.04], [0.12, 0.05], [0.32, 0.34], [0.18, -0.08], [0.61, 0.41], [0.04, 0.02], [0.18, 0.21]],
  "Pets & Animals": [[0.18, 0.08], [0.21, 0.22], [0.28, 0.34], [0.18, 0.18], [0.62, 0.41], [0.05, -0.02], [0.41, 0.62], [0.21, 0.52]],
  "Travel & Events":[[0.31, 0.18], [0.21, 0.12], [0.18, 0.18], [0.18, 0.21], [0.34, 0.12], [0.41, 0.34], [0.18, 0.22], [0.12, 0.18]],
  "Nonprofits & Activism": [[0.21, 0.12], [0.32, 0.31], [0.18, 0.21], [0.12, 0.08], [0.31, 0.18], [0.34, 0.22], [0.04, -0.02], [0.18, 0.34]],
};

function buildTitlePatterns() {
  const out = [];
  for (const [category, rows] of Object.entries(CAT_TITLE_SIGNATURES)) {
    TITLE_PATTERNS.forEach((pattern, i) => {
      const [share, uplift] = rows[i];
      out.push({ category, pattern, share, uplift });
    });
  }
  return out;
}

export const titlePatterns = buildTitlePatterns();
