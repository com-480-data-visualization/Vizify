import { csvParse } from "d3-dsv";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES, COUNTRIES } from "../src/data/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const csvDirs = [path.join(root, "dataset"), path.join(root, "tmp"), path.join(root, "dist", "assets")];
const outDir = path.join(root, "public", "data");

const CATEGORY_BY_ID = {
  1: "Film & Animation",
  2: "Autos & Vehicles",
  10: "Music",
  15: "Pets & Animals",
  17: "Sports",
  19: "Travel & Events",
  20: "Gaming",
  22: "People & Blogs",
  23: "Comedy",
  24: "Entertainment",
  25: "News & Politics",
  26: "Howto & Style",
  27: "Education",
  28: "Science & Technology",
  29: "Nonprofits & Activism",
};

const COUNTRY_BY_CODE = {
  BR: "Brazil",
  CA: "Canada",
  DE: "Germany",
  FR: "France",
  GB: "United Kingdom",
  IN: "India",
  JP: "Japan",
  KR: "South Korea",
  MX: "Mexico",
  RU: "Russia",
  US: "United States",
};

const DESCRIPTION_BUCKETS = [
  { label: "0-30", start: 0, end: 30 },
  { label: "31-80", start: 31, end: 80 },
  { label: "81-150", start: 81, end: 150 },
  { label: "151-250", start: 151, end: 250 },
  { label: "251-400", start: 251, end: 400 },
  { label: "400+", start: 401, end: 100000 },
];

const TITLE_PATTERNS = [
  "Numbers",
  "Uppercase",
  "Exclamation",
  "Question",
  "Short (<40)",
  "Long (>80)",
  "Emoji",
  "Clickbait",
];

const CLICKBAIT_RE = /\b(shocking|secret|truth|insane|crazy|you won't believe|must watch|biggest|best|worst|hidden|exposed|finally|official|trailer|live)\b/i;
const EMOJI_RE = /\p{Extended_Pictographic}/u;
const EMOJI_GLOBAL_RE = /\p{Extended_Pictographic}/gu;

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function splitTags(value) {
  if (!value || value === "[none]") return [];
  const seen = new Set();
  return value
    .split("|")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag) => {
      if (seen.has(tag)) return false;
      seen.add(tag);
      return true;
    });
}

function words(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function avg(sum, count) {
  return count ? Math.round(sum / count) : 0;
}

function addMetric(map, key, record) {
  const item = map.get(key) ?? { views: 0, likes: 0, comments: 0, n: 0 };
  item.views += record.views;
  item.likes += record.likes;
  item.comments += record.comments;
  item.n += 1;
  map.set(key, item);
}

function addView(map, key, views) {
  const item = map.get(key) ?? { views: 0, n: 0 };
  item.views += views;
  item.n += 1;
  map.set(key, item);
}

function bucketForCount(count) {
  return DESCRIPTION_BUCKETS.find((bucket) => count >= bucket.start && count <= bucket.end) ?? DESCRIPTION_BUCKETS.at(-1);
}

function hasEmoji(value) {
  return EMOJI_RE.test(value || "");
}

function extractEmojis(value) {
  return Array.from(String(value || "").matchAll(EMOJI_GLOBAL_RE), (match) => match[0]);
}

function titlePatternChecks(title) {
  const text = String(title || "");
  const letters = text.match(/[A-Za-z]/g) ?? [];
  const uppercaseLetters = text.match(/[A-Z]/g) ?? [];
  const uppercaseRatio = letters.length ? uppercaseLetters.length / letters.length : 0;
  const uppercaseWords = text.match(/\b[A-Z0-9]{3,}\b/g) ?? [];

  return {
    Numbers: /\d/.test(text),
    Uppercase: uppercaseWords.length >= 2 || uppercaseRatio > 0.45,
    Exclamation: text.includes("!"),
    Question: text.includes("?"),
    "Short (<40)": text.length < 40,
    "Long (>80)": text.length > 80,
    Emoji: hasEmoji(text),
    Clickbait: CLICKBAIT_RE.test(text),
  };
}

function categoryKeys() {
  return CATEGORIES;
}

function countryKeys() {
  return COUNTRIES;
}

function scopePairs(record) {
  return [
    { country: "All", category: "All" },
    { country: "All", category: record.category },
    { country: record.country, category: "All" },
    { country: record.country, category: record.category },
  ];
}

function scopedRecords(records, country, category) {
  const countryRows = country === "All" ? records : records.filter((record) => record.country === country);
  return recordsForCategory(countryRows, category);
}

function key(...parts) {
  return parts.join("\u001f");
}

async function loadRecords() {
  const csvInputs = [];
  for (const dir of csvDirs) {
    try {
      const files = (await readdir(dir)).filter((file) => /^[A-Z]{2}_Trending(?:-.*)?\.csv$/.test(file));
      csvInputs.push(...files.map((file) => ({ dir, file })));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  if (!csvInputs.length) {
    throw new Error("No *_Trending*.csv files found. Put the raw CSV files in dataset/ or tmp/ and rerun npm run build:data.");
  }

  const deduped = new Map();

  for (const { dir, file } of csvInputs) {
    const code = file.slice(0, 2);
    const country = COUNTRY_BY_CODE[code];
    if (!country) continue;

    const csv = await readFile(path.join(dir, file), "utf8");
    const rows = csvParse(csv);

    for (const row of rows) {
      const category = CATEGORY_BY_ID[row.category_id];
      const publishedAt = new Date(row.publish_time);
      if (!category || Number.isNaN(publishedAt.getTime())) continue;

      const record = {
        id: row.video_id,
        country,
        category,
        title: row.title || "",
        description: row.description || "",
        tags: splitTags(row.tags),
        views: toNumber(row.views),
        likes: toNumber(row.likes),
        comments: toNumber(row.comments),
        publishedAt,
      };

      const key = `${country}:${record.id}`;
      const previous = deduped.get(key);
      if (!previous || record.views > previous.views) deduped.set(key, record);
    }
  }

  return Array.from(deduped.values()).filter((record) => record.views > 0);
}

function recordsForCategory(records, category) {
  return category === "All" ? records : records.filter((record) => record.category === category);
}

function buildMeta(records) {
  const videoCountsByCountry = Object.fromEntries(
    countryKeys().map((country) => [
      country,
      Object.fromEntries(categoryKeys().map((category) => [category, 0])),
    ]),
  );

  for (const record of records) {
    for (const { country, category } of scopePairs(record)) {
      videoCountsByCountry[country][category] += 1;
    }
  }

  return {
    categories: CATEGORIES,
    countries: COUNTRIES,
    videoCounts: videoCountsByCountry.All,
    videoCountsByCountry,
    totalVideos: records.length,
  };
}

function buildHeatmap(records) {
  const sums = new Map();
  for (const record of records) {
    const dow = (record.publishedAt.getUTCDay() + 6) % 7;
    const hour = record.publishedAt.getUTCHours();
    for (const { country, category } of scopePairs(record)) {
      addMetric(sums, key(country, category, dow, hour), record);
    }
  }

  const out = [];
  for (const country of countryKeys()) {
    for (const category of categoryKeys()) {
      for (let dow = 0; dow < 7; dow += 1) {
        for (let hour = 0; hour < 24; hour += 1) {
          const item = sums.get(key(country, category, dow, hour)) ?? { views: 0, likes: 0, comments: 0, n: 0 };
          out.push({
            country,
            category,
            dow,
            hour,
            avgViews: avg(item.views, item.n),
            avgLikes: avg(item.likes, item.n),
            avgComments: avg(item.comments, item.n),
            n: item.n,
          });
        }
      }
    }
  }
  return out;
}

function buildEmoji(records) {
  const values = new Map();
  for (const record of records) {
    const flag = hasEmoji(record.title);
    for (const { country, category } of scopePairs(record)) {
      const itemKey = key(country, category, flag);
      const item = values.get(itemKey) ?? [];
      item.push(record.views);
      values.set(itemKey, item);
    }
  }

  return countryKeys().flatMap((country) =>
    categoryKeys().flatMap((category) =>
      [false, true].map((flag) => {
        const group = values.get(key(country, category, flag)) ?? [];
        return { country, category, hasEmoji: flag, medianViews: median(group), n: group.length };
      }),
    ),
  );
}

function buildEmojiTop(records) {
  const byCategory = new Map();

  for (const record of records) {
    const emojis = [...new Set(extractEmojis(record.title))];
    for (const { country, category } of scopePairs(record)) {
      const scope = key(country, category);
      const catMap = byCategory.get(scope) ?? new Map();
      for (const emoji of emojis) {
        const item = catMap.get(emoji) ?? { views: 0, n: 0 };
        item.views += record.views;
        item.n += 1;
        catMap.set(emoji, item);
      }
      byCategory.set(scope, catMap);
    }
  }

  return Object.fromEntries(
    countryKeys().map((country) => [
      country,
      Object.fromEntries(
        categoryKeys().map((category) => {
          const rows = Array.from(byCategory.get(key(country, category)) ?? [])
            .filter(([, item]) => item.n >= (category === "All" ? 5 : 2))
            .sort((a, b) => avg(b[1].views, b[1].n) - avg(a[1].views, a[1].n) || b[1].n - a[1].n)
            .slice(0, 3)
            .map(([emoji]) => emoji);
          return [category, rows.length ? rows : ["n/a"]];
        }),
      ),
    ]),
  );
}

function buildTags(records) {
  const categoryViews = new Map();
  const tagViews = new Map();

  for (const record of records) {
    for (const { country, category } of scopePairs(record)) {
      addView(categoryViews, key(country, category), record.views);

      for (const tag of record.tags) {
        addView(tagViews, key(country, category, tag), record.views);
      }
    }
  }

  const out = [];
  for (const country of countryKeys()) {
    for (const category of categoryKeys()) {
      const scopeKey = key(country, category);
      const categoryAvg = avg(categoryViews.get(scopeKey)?.views ?? 0, categoryViews.get(scopeKey)?.n ?? 0) || 1;
      const minFreq = country === "All" && category === "All" ? 8 : 2;
      const rows = Array.from(tagViews.entries())
        .filter(([itemKey, item]) => {
          const [itemCountry, itemCategory] = itemKey.split("\u001f");
          return itemCountry === country && itemCategory === category && item.n >= minFreq;
        })
        .map(([itemKey, item]) => {
          const tag = itemKey.split("\u001f").slice(2).join("\u001f");
          return {
            country,
            category,
            tag: tag.length > 26 ? `${tag.slice(0, 23)}...` : tag,
            freq: item.n,
            uplift: avg(item.views, item.n) / categoryAvg - 1,
          };
        })
        .sort((a, b) => b.freq - a.freq || b.uplift - a.uplift)
        .slice(0, 60);
      out.push(...rows);
    }
  }
  return out;
}

function buildDescriptions(records) {
  const sums = new Map();

  for (const record of records) {
    const bucket = bucketForCount(words(record.description).length);
    for (const { country, category } of scopePairs(record)) {
      const itemKey = key(country, category, bucket.label);
      const item = sums.get(itemKey) ?? { views: 0, comments: 0, n: 0 };
      item.views += record.views;
      item.comments += record.comments;
      item.n += 1;
      sums.set(itemKey, item);
    }
  }

  return countryKeys().flatMap((country) =>
    categoryKeys().flatMap((category) =>
      DESCRIPTION_BUCKETS.map((bucket) => {
        const item = sums.get(key(country, category, bucket.label)) ?? { views: 0, comments: 0, n: 0 };
        return {
          country,
          category,
          bucket: bucket.label,
          bucketStart: bucket.start,
          bucketEnd: bucket.end,
          avgComments: avg(item.comments, item.n),
          avgViews: avg(item.views, item.n),
          n: item.n,
        };
      }),
    ),
  );
}

function buildTitlePatterns(records) {
  const out = [];

  for (const country of countryKeys()) {
    for (const category of categoryKeys()) {
      const rows = scopedRecords(records, country, category);
      const checks = rows.map((record) => ({ record, patterns: titlePatternChecks(record.title) }));

      for (const pattern of TITLE_PATTERNS) {
        const withPattern = checks.filter((item) => item.patterns[pattern]);
        const withoutPattern = checks.filter((item) => !item.patterns[pattern]);
        const withAvg = avg(withPattern.reduce((sum, item) => sum + item.record.views, 0), withPattern.length);
        const withoutAvg = avg(withoutPattern.reduce((sum, item) => sum + item.record.views, 0), withoutPattern.length);

        out.push({
          country,
          category,
          pattern,
          share: rows.length ? withPattern.length / rows.length : 0,
          uplift: withAvg && withoutAvg ? withAvg / withoutAvg - 1 : 0,
        });
      }
    }
  }

  return out;
}

async function writeJson(name, value) {
  await writeFile(path.join(outDir, `${name}.json`), `${JSON.stringify(value)}\n`);
}

async function main() {
  const records = await loadRecords();
  await mkdir(outDir, { recursive: true });

  await Promise.all([
    writeJson("meta", buildMeta(records)),
    writeJson("heatmap", buildHeatmap(records)),
    writeJson("emoji", buildEmoji(records)),
    writeJson("emojiTop", buildEmojiTop(records)),
    writeJson("tags", buildTags(records)),
    writeJson("descriptions", buildDescriptions(records)),
    writeJson("descriptionBuckets", DESCRIPTION_BUCKETS),
    writeJson("titlePatterns", buildTitlePatterns(records)),
  ]);

  console.log(`Built public/data/*.json from ${records.length.toLocaleString()} deduplicated videos.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
