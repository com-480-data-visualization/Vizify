# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Imane Lahrichi| 360854 |
| Imane Raihane| 362230 |
| Victor Zablocki | 361602 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

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


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone
