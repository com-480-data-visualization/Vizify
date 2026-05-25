# Swapping mock data for real content

All charts read from `useDataset(name)` in `useDataset.js`, which today returns
synchronous values from `mockData.js`. The dataset names map 1:1 to the named
exports in `mockData.js`:

| `useDataset(...)` name | Shape (see JSDoc in `mockData.js`) |
| --- | --- |
| `meta`              | `{ categories, countries, videoCounts, totalVideos }` |
| `heatmap`           | `HeatmapCell[]`        — one row per `(category, dow, hour)` |
| `emoji`             | `EmojiRow[]`           — two rows per category (`hasEmoji` true/false) |
| `emojiTop`          | `Record<category, string[]>` — top-3 emojis per category |
| `tags`              | `TagRow[]`             — `(category, tag, freq, uplift)` |
| `descriptions`      | `DescriptionBucket[]`  — one row per `(category, bucket)` |
| `descriptionBuckets`| bucket definitions (label + range) |
| `titlePatterns`     | `TitlePatternCell[]`   — `(category, pattern, share, uplift)` |

Pick one of the two options below.

## Option A — fetch real JSON from `public/data/`

1. Produce one JSON file per dataset name above, e.g.
   `public/data/heatmap.json`, `public/data/emoji.json`, … Each file must
   contain the same shape the corresponding mock export returns.
2. Open `src/data/useDataset.js` and flip the flag:
   ```js
   const USE_MOCK = false;
   ```
3. Reload. The hook will `fetch('/data/<name>.json')` on first use and cache
   the result. No chart code changes.

Tip: keep category and country strings identical to those in
`src/data/constants.js` — filters compare by string equality.

## Option B — paste real values over the mock exports

If you'd rather keep everything bundled and synchronous, edit `mockData.js`
directly: replace each `export const <name> = ...` with the real array or
object, keeping the documented shape. Leave `USE_MOCK = true` in
`useDataset.js`.

## Generating the JSON from a raw dataset

A future `scripts/build-data.mjs` should read the raw trending CSV/Parquet,
aggregate it into the shapes above, and write the eight files into
`public/data/`. The JSDoc blocks in `mockData.js` are the source of truth for
field names, units, and value ranges — mirror them exactly.
