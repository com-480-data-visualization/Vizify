// ============================================================================
// Domain constants - categories, countries, day labels
// ============================================================================
// Mirrors the values used in the preprocessed JSON files. If the real data
// pipeline ever uses different identifiers (e.g. country ISO codes), update
// COUNTRIES below and the mock data + chart code will follow.

export const CATEGORIES = [
  "All",
  "Gaming",
  "Music",
  "Entertainment",
  "People & Blogs",
  "Film & Animation",
  "Sports",
  "News & Politics",
  "Comedy",
  "Howto & Style",
  "Science & Technology",
  "Autos & Vehicles",
  "Education",
  "Pets & Animals",
  "Travel & Events",
  "Nonprofits & Activism",
];

export const COUNTRIES = [
  "All",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Russia",
  "Brazil",
  "Mexico",
  "Japan",
  "South Korea",
  "India",
  "Canada",
];

// Mon-first to match the Figma mockup column order.
export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}h`);
