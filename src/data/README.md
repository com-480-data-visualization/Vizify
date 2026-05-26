# Data pipeline

All charts read from `useDataset(name)` in `useDataset.js`, which fetches
preprocessed JSON files from `public/data/`. The dataset names map 1:1 to the
generated JSON files:

| `useDataset(...)` name | Shape |
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

## Regenerating from the raw CSV files

1. Put the raw `*_Trending-*.csv` files in `dataset/`.
2. Run:
   ```bash
   npm run build:data
   ```
3. Reload the app. The hook fetches `/data/<name>.json` on first use and
   caches the result. No chart code changes are needed.

Tip: keep category and country strings identical to those in
`src/data/constants.js` — filters compare by string equality.

## Mock fallback

`src/data/mockData.js` is kept only as a layout-development fallback. Production
data uses `public/data/*.json` with `USE_MOCK = false` in `useDataset.js`.
