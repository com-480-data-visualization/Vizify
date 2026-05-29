# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Imane Lahrichi| 360854 |
| Imane Raihane| 362230 |
| Victor Zablocki | 361602 |

[Overview](#overview) • [Technical setup](#technical-setup) • [Intended usage](#intended-usage) • [Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Overview

Vizify is an interactive data visualization project about YouTube Trending metadata. It studies how creators design titles, tags, descriptions, emojis, categories, and publish timing to improve visibility on YouTube's trending page.

**Final website:** https://vizify-seven.vercel.app  
**Screencast:** https://youtu.be/u6vEdgHtyEo

The final application is a React + D3 dashboard built around five linked views:

- **Publish time**: heatmap of when trending videos are published by day, hour, country, and category.
- **Emojis**: comparison of titles with and without emojis, including top emojis by scope.
- **Title patterns**: grid of metadata patterns such as numbers, questions, uppercase, title length, emojis, and clickbait-style wording.
- **Tags**: bubble chart comparing frequent tags with their relative view uplift.
- **Descriptions**: description-length buckets and their relationship with comments.

The target audience is content creators, influencers, and media/communication students who want to understand the metadata strategies associated with trending visibility.

## Technical setup

### Requirements

- Node.js 18 or newer
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173/`.

### Build for production

```bash
npm run build
```

The static production files are generated in `dist/`.

### Preview the production build

```bash
npm run preview
```

### Data pipeline

The application reads preprocessed JSON files from `public/data/`. These files are already included in the repository so the dashboard can run without downloading the raw Kaggle CSV files.

To regenerate the aggregates from raw data:

1. Download the YouTube Trending CSV files from the Kaggle dataset: [Youtube Trending videos stats 2026](https://www.kaggle.com/datasets/bsthere/youtube-trending-videos-stats-2026).
2. Put the raw `*_Trending-*.csv` files in a local `dataset/` directory at the repository root.
3. Run:

```bash
npm run build:data
```

The build script writes the generated chart data to `public/data/*.json`.

More details about the generated data shapes are documented in [`src/data/README.md`](src/data/README.md).

## Intended usage

Use the top-level country and category filters to choose a comparison scope, then move through the dashboard views to answer creator-facing questions:

- When are trending videos usually published?
- Do titles with emojis perform differently from titles without emojis?
- Which title patterns are common, and which are associated with higher views?
- Which tags are frequent, and which tags show stronger relative reach?
- How does description length relate to commenting behavior?

The dashboard is designed as a data story: start from the overview, use the key questions to jump to a relevant visualization, then inspect individual charts through hover, click, slider, and filter interactions.

## Milestone 1 (20th March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

[Youtube Trending videos stats 2026](https://www.kaggle.com/datasets/bsthere/youtube-trending-videos-stats-2026)

The dataset comes from Kaggle, thus it’s already reliable and easy to use without any need for scraping. Overall, it is quite clean, with very few missing values, mostly in non-essential fields like the description. This means only minimal preprocessing is needed (mainly handling a few missing entries), allowing us to focus more on analysis and visualization rather than heavy data cleaning.

### Problematic

#### How do YouTubers write video metadata to maximize their visibility on the app, and do certain content niches exploit this better than others ? 
YouTube's Trending page appears algorithmic and based on meritocracy, but it has been shown that optimization is real and can play a big part in the virality of today's content. **Titles**, **tags**, **publish times** and other metadata are carefully chosen. 

Rather than observing what is currently popular, this project aims to study the design behind virality: the patterns in how trending videos are made and whether some content niches have found more effective formulas (maybe specific to their category) than others.

The core question is the "does how you describe a video actually change how it performs, and does that depend on what kind of content you make?". This contains several interconnected questions. First, do trending videos follow naming conventions such as clickbait, emojis, caps lock, or general sentiment, and does this vary by niche? Same for tag and keyword "omnipresence", specifically, whether or not some "high-performing" niches rely on specific keyword strategies. 

We also ask whether certain metadata combinations, such as tag count, title length, or publish hour, correlate with stronger visibility. And finally, we want to look at sub-genre: beyond YouTube's built-in categories, which specific niches go above average on Trending relative to their volume?

This work is aimed at content creators and influencers searching for optimization tips, as well as media and communication students studying how platform algorithms shape creative decisions.

### Exploratory Data Analysis

There's 178,399 rows, from 11 different countries. The typical trending video gets around 231,191 views. Countries with the highest median like-rate are Russia, Brasil, Germany and the United States.
The youtube categories with highest median views are Pets & Animals, Comedy, Nonprofits & Activism.
The top 10 most viewed videos amongst the trending video in early 2026 are all music videos (half of them song from Gorillaz or T.I.)
Gaming is the largest category by volume (about 76k rows).
To explore this further, we visualize the relationship between views and likes:

<img width="800" height="600" alt="Figure_1" src="https://github.com/user-attachments/assets/6e447495-3f4f-460c-ba89-9922ae76aae6" />


This plot highlights a strong positive relationship between views and likes, but also reveals some outliers with unusual engagement patterns. These observations motivate further analysis of this dataset.

### Related work


#### What others have already done with the data?

Existing work on YouTube trending video datasets typically follows two distinct approaches.

Some studies focus on exploratory data analysis. For example, the Kaggle notebook [Exploratory Data Analysis of YouTube Trending Videos](https://www.kaggle.com/code/hoonkeng/deep-analysis-on-youtube-trending-videos-eda) examines the distribution of views, likes, and comments, and highlights correlations between engagement metrics. This type of work provides a general overview of the dataset and helps identify common statistical patterns.

Other approaches rely on machine learning models to predict video performance. The project [Machine Learning Project: YouTube Trending Analysis](https://github.com/GateraGael/Machine-Learning-Project-Youtube-Trend-Analysis) uses metadata features such as title, category, and engagement variables to build predictive models of video popularity.

Additional works explore category performance, posting time effects, or sentiment analysis on titles and tags. These studies aim to identify patterns associated with higher engagement or visibility, often using statistical analysis.

Overall, prior work mainly focuses on describing patterns in the data or predicting outcomes based on available features.

#### Why is your approach original?

Despite all studies conducted on this dataset, a consistent gap remains: metadata is generally treated as an "outcome" rather than as the result of intentional creator behavior. Instead of focusing on what trending videos look like, we focus on how YouTube creators deliberately design their titles, tags, and descriptions to maximize their visibility.

Rather than only comparing engagement outcomes across categories, we shift the focus toward the strategies behind metadata design. In addition, our approach extends beyond static analysis by incorporating temporal dynamics, allowing us to study how videos become trending over time.

We also go further by examining whether engagement plays a causal role in visibility, rather than relying only on correlations, and by exploring potential biases and anomalies in the system.

Altogether, these studies give an oversight on what makes the algorithm decide to make a video viral, and not "what" goes viral.

#### What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).

We take inspiration from simple visualizations used in common platforms like FiveThirtyEight, The Economist, and Kaggle. In particular, we rely on bar charts to compare categories or countries, and scatter plots to detect unusual patterns and semantic grouping of the metadata.

Our goal is to use visuals that highlight evolution, differences, and anomalies, rather than only static summaries.

<img width="1361" height="683" alt="1_xRwFyfv9GeB4rUbCIuiDqw" src="https://github.com/user-attachments/assets/60e39899-c80c-48d5-a487-a5cdc405e21a" />


#### In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

We are using a newer dataset, we haven't worked with before.

## Milestone 2 (17th April, 5pm)

[Link to report in repo](https://github.com/com-480-data-visualization/Vizify/blob/a1e7be0b0b65123d2009b5ff2285bc3a65c5d855/Report%20Vizify%20MS2%20.pdf)


## Milestone 3 (29th May, 5pm)

**80% of the final grade**

For the final milestone, the repository contains the code and preprocessed data for the interactive D3.js visualization. The project focuses on telling a data story about how YouTube creators optimize metadata for trending visibility.

### Final deliverables

- **GitHub repository**: source code, generated data, setup instructions, and milestone documentation.
- **Interactive visualization**: React + D3 dashboard with country/category filtering and five visualization modules: https://vizify-seven.vercel.app
- **Technical README**: setup, build, data regeneration, and intended usage are documented above.
- **Process book**: final PDF report to document the path from idea to product, design decisions, challenges, sketches/plans, changes since earlier milestones, and peer assessment.
- **Screencast**: 2-minute demonstration focused on the main contribution and impact of the visualization: https://youtu.be/u6vEdgHtyEo

### Grading criteria from the assignment

- Visualization: 35%
- Technical implementation: 15%
- Screencast: 25%
- Process book: 25%

### Repository structure

```text
.
|-- public/data/              # Preprocessed JSON files consumed by the charts
|-- scripts/build-data.mjs    # CSV-to-JSON aggregation pipeline
|-- src/
|   |-- components/           # Layout, filters, and visualization components
|   |-- components/charts/    # D3 chart modules
|   `-- data/                 # Data loading helpers, constants, and docs
|-- index.html
|-- package.json
`-- README.md
```

### Main technical contributions

- Built a Vite + React application with D3-driven chart components.
- Preprocessed raw YouTube Trending CSV files into compact chart-specific JSON datasets.
- Added global country and category filtering across all final visualizations.
- Implemented interactive dashboard views for publish timing, emojis, title patterns, tags, and descriptions.
- Kept the raw-data regeneration path separate from the frontend runtime so the deployed app can load quickly from static JSON files.


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone
