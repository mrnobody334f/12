import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Intent types for search queries
export const intentTypes = ["shopping", "news", "learning", "videos", "travel", "health", "tech", "finance", "entertainment", "food", "general"] as const;
export type IntentType = typeof intentTypes[number];

// Sort options for search results
export const sortOptions = ["relevance", "recent", "mostViewed", "mostEngaged"] as const;
export type SortOption = typeof sortOptions[number];

// Location schema for localized search
export const locationSchema = z.object({
  country: z.string().optional(),
  countryCode: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  location: z.string().optional(), // Full location string like "Dallas, Texas, United States"
});

export type Location = z.infer<typeof locationSchema>;

// Dedicated social media and platform sources
export const platformSources = {
  all: { id: "all", name: "All", site: "", icon: "Globe" },
  google: { id: "google", name: "Google", site: "", icon: "Search" },
  x: { id: "x", name: "X", site: "x.com", icon: "X" },
  facebook: { id: "facebook", name: "Facebook", site: "facebook.com", icon: "Facebook" },
  instagram: { id: "instagram", name: "Instagram", site: "instagram.com", icon: "Instagram" },
  tiktok: { id: "tiktok", name: "TikTok", site: "tiktok.com", icon: "Music" },
  reddit: { id: "reddit", name: "Reddit", site: "reddit.com", icon: "MessageSquare" },
  youtube: { id: "youtube", name: "YouTube", site: "youtube.com", icon: "Youtube" },
  pinterest: { id: "pinterest", name: "Pinterest", site: "pinterest.com", icon: "Image" },
  linkedin: { id: "linkedin", name: "LinkedIn", site: "linkedin.com", icon: "Briefcase" },
  quora: { id: "quora", name: "Quora", site: "quora.com", icon: "HelpCircle" },
  wikipedia: { id: "wikipedia", name: "Wikipedia", site: "wikipedia.org", icon: "BookOpen" },
  stackoverflow: { id: "stackoverflow", name: "Stack Overflow", site: "stackoverflow.com", icon: "Code" },
  yelp: { id: "yelp", name: "Yelp", site: "yelp.com", icon: "MapPin" },
  github: { id: "github", name: "GitHub", site: "github.com", icon: "GitBranch" },
} as const;

// Search source configurations based on intent
export const sourceConfig = {
  shopping: [
    { id: "amazon", name: "Amazon", site: "amazon.com", icon: "ShoppingBag" },
    { id: "ebay", name: "eBay", site: "ebay.com", icon: "ShoppingCart" },
    { id: "walmart", name: "Walmart", site: "walmart.com", icon: "Store" },
    { id: "aliexpress", name: "AliExpress", site: "aliexpress.com", icon: "Package" },
    { id: "bestbuy", name: "Best Buy", site: "bestbuy.com", icon: "Laptop" },
  ],
  news: [
    { id: "cnn", name: "CNN", site: "cnn.com", icon: "Newspaper" },
    { id: "bbc", name: "BBC", site: "bbc.com", icon: "Radio" },
    { id: "reuters", name: "Reuters", site: "reuters.com", icon: "BookOpen" },
    { id: "nytimes", name: "NY Times", site: "nytimes.com", icon: "FileText" },
    { id: "techcrunch", name: "TechCrunch", site: "techcrunch.com", icon: "Zap" },
  ],
  learning: [
    { id: "wikipedia", name: "Wikipedia", site: "wikipedia.org", icon: "BookMarked" },
    { id: "medium", name: "Medium", site: "medium.com", icon: "PenTool" },
    { id: "youtube", name: "YouTube", site: "youtube.com", icon: "Youtube" },
    { id: "reddit", name: "Reddit", site: "reddit.com", icon: "MessageSquare" },
    { id: "stackoverflow", name: "Stack Overflow", site: "stackoverflow.com", icon: "Code" },
  ],
  videos: [
    { id: "youtube", name: "YouTube", site: "youtube.com", icon: "Youtube" },
    { id: "vimeo", name: "Vimeo", site: "vimeo.com", icon: "Video" },
    { id: "tiktok", name: "TikTok", site: "tiktok.com", icon: "Music" },
    { id: "instagram", name: "Instagram", site: "instagram.com", icon: "Camera" },
    { id: "twitch", name: "Twitch", site: "twitch.tv", icon: "Gamepad2" },
  ],
  travel: [
    { id: "booking", name: "Booking.com", site: "booking.com", icon: "MapPin" },
    { id: "expedia", name: "Expedia", site: "expedia.com", icon: "Plane" },
    { id: "tripadvisor", name: "TripAdvisor", site: "tripadvisor.com", icon: "Star" },
    { id: "airbnb", name: "Airbnb", site: "airbnb.com", icon: "Home" },
    { id: "kayak", name: "Kayak", site: "kayak.com", icon: "Search" },
  ],
  health: [
    { id: "webmd", name: "WebMD", site: "webmd.com", icon: "Heart" },
    { id: "mayoclinic", name: "Mayo Clinic", site: "mayoclinic.org", icon: "Stethoscope" },
    { id: "healthline", name: "Healthline", site: "healthline.com", icon: "Activity" },
    { id: "nhs", name: "NHS", site: "nhs.uk", icon: "Shield" },
    { id: "medlineplus", name: "MedlinePlus", site: "medlineplus.gov", icon: "BookOpen" },
  ],
  tech: [
    { id: "github", name: "GitHub", site: "github.com", icon: "GitBranch" },
    { id: "stackoverflow", name: "Stack Overflow", site: "stackoverflow.com", icon: "Code" },
    { id: "techcrunch", name: "TechCrunch", site: "techcrunch.com", icon: "Zap" },
    { id: "arstechnica", name: "Ars Technica", site: "arstechnica.com", icon: "Cpu" },
    { id: "theverge", name: "The Verge", site: "theverge.com", icon: "Monitor" },
  ],
  finance: [
    { id: "bloomberg", name: "Bloomberg", site: "bloomberg.com", icon: "TrendingUp" },
    { id: "reuters", name: "Reuters", site: "reuters.com", icon: "Newspaper" },
    { id: "yahoofinance", name: "Yahoo Finance", site: "finance.yahoo.com", icon: "DollarSign" },
    { id: "investopedia", name: "Investopedia", site: "investopedia.com", icon: "Calculator" },
    { id: "cnbc", name: "CNBC", site: "cnbc.com", icon: "BarChart" },
  ],
  entertainment: [
    { id: "imdb", name: "IMDb", site: "imdb.com", icon: "Film" },
    { id: "spotify", name: "Spotify", site: "spotify.com", icon: "Music" },
    { id: "steam", name: "Steam", site: "store.steampowered.com", icon: "Gamepad2" },
    { id: "espn", name: "ESPN", site: "espn.com", icon: "Trophy" },
    { id: "tmz", name: "TMZ", site: "tmz.com", icon: "Camera" },
  ],
  food: [
    { id: "allrecipes", name: "AllRecipes", site: "allrecipes.com", icon: "ChefHat" },
    { id: "foodnetwork", name: "Food Network", site: "foodnetwork.com", icon: "Utensils" },
    { id: "yelp", name: "Yelp", site: "yelp.com", icon: "MapPin" },
    { id: "zomato", name: "Zomato", site: "zomato.com", icon: "Store" },
    { id: "epicurious", name: "Epicurious", site: "epicurious.com", icon: "BookOpen" },
  ],
  general: [
    { id: "google", name: "Google", site: "", icon: "Search" },
    { id: "youtube", name: "YouTube", site: "youtube.com", icon: "Youtube" },
    { id: "facebook", name: "Facebook", site: "facebook.com", icon: "Facebook" },
    { id: "tiktok", name: "TikTok", site: "tiktok.com", icon: "Music" },
    { id: "reddit", name: "Reddit", site: "reddit.com", icon: "MessageSquare" },
    { id: "instagram", name: "Instagram", site: "instagram.com", icon: "Camera" },
    { id: "x", name: "X", site: "x.com", icon: "X" },
  ],
};

// Search result schema with enhanced metadata and rich snippets
export const searchResultSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  snippet: z.string(),
  source: z.string(),
  sourceName: z.string().optional(),
  favicon: z.string().optional(),
  thumbnail: z.string().optional(),
  image: z.string().optional(), // Main image for rich snippet
  position: z.number().optional(),
  date: z.string().optional(),
  views: z.union([z.number(), z.string()]).optional(), // Can be number or string like "1.2M"
  engagement: z.number().optional(),
  rating: z.number().optional(), // Rating value (e.g., 4.5)
  ratingCount: z.number().optional(), // Number of ratings
  price: z.string().optional(), // Price for shopping results
  // Social media metrics
  likes: z.union([z.number(), z.string()]).optional(), // Likes/reactions count
  comments: z.union([z.number(), z.string()]).optional(), // Comments count
  shares: z.union([z.number(), z.string()]).optional(), // Shares count
  subscribers: z.union([z.number(), z.string()]).optional(), // YouTube subscribers
  followers: z.union([z.number(), z.string()]).optional(), // Social media followers
  sitelinks: z.array(z.object({
    title: z.string(),
    link: z.string(),
  })).optional(), // Additional links under the main result
});

export type SearchResult = z.infer<typeof searchResultSchema>;

// Image result schema
export const imageResultSchema = z.object({
  title: z.string(),
  imageUrl: z.string().url(),
  link: z.string().url(),
  source: z.string(),
  thumbnail: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type ImageResult = z.infer<typeof imageResultSchema>;

// Video result schema
export const videoResultSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  snippet: z.string().optional(),
  source: z.string(),
  thumbnail: z.string().optional(),
  duration: z.string().optional(),
  channel: z.string().optional(),
  date: z.string().optional(),
  views: z.string().optional(),
  likes: z.string().optional(),
  comments: z.string().optional(),
  subscribers: z.string().optional(), // Channel subscribers
});

export type VideoResult = z.infer<typeof videoResultSchema>;

// Place result schema
export const placeResultSchema = z.object({
  title: z.string(),
  address: z.string().optional(),
  rating: z.number().optional(),
  ratingCount: z.number().optional(),
  type: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  thumbnail: z.string().optional(),
  cid: z.string().optional(),
  googleMapsUrl: z.string().optional(),
});

export type PlaceResult = z.infer<typeof placeResultSchema>;

// News result schema
export const newsResultSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  snippet: z.string(),
  source: z.string(),
  date: z.string().optional(),
  thumbnail: z.string().optional(),
});

export type NewsResult = z.infer<typeof newsResultSchema>;

// Intent detection response
export const intentResponseSchema = z.object({
  intent: z.enum(intentTypes),
  confidence: z.number(),
  reasoning: z.string().optional(),
});

export type IntentResponse = z.infer<typeof intentResponseSchema>;

// AI summary response
export const aiSummarySchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.object({
    title: z.string(),
    reason: z.string(),
    link: z.string().optional(),
  })),
  suggestedQueries: z.array(z.string()).optional(),
});

export type AISummary = z.infer<typeof aiSummarySchema>;

// Search filters
export const timeFilterOptions = ["any", "day", "week", "month", "year"] as const;
export type TimeFilter = typeof timeFilterOptions[number];

export const languageFilterOptions = [
  "any", "ar", "en", "fr", "es", "de", "it", "pt", "ru", "ja", "ko", "zh-cn", "zh-tw",
  "hi", "bn", "ur", "id", "tr", "vi", "th", "nl", "pl", "uk", "ro", "el", "cs", "sv",
  "hu", "fi", "da", "no", "he", "fa", "ms", "ta", "te", "mr", "gu", "kn", "ml"
] as const;
export type LanguageFilter = typeof languageFilterOptions[number];

export const fileTypeFilterOptions = ["any", "pdf", "doc", "ppt", "xls"] as const;
export type FileTypeFilter = typeof fileTypeFilterOptions[number];

// Search type for different Serper endpoints
export const searchTypeOptions = ["all", "images", "videos", "places", "news", "reviews"] as const;
export type SearchType = typeof searchTypeOptions[number];

// Search request/response with pagination
export const searchRequestSchema = z.object({
  query: z.string().min(1),
  source: z.string().optional(),
  intent: z.enum(intentTypes).optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
  sort: z.enum(sortOptions).optional().default("relevance"),
  country: z.string().optional(),
  countryCode: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  location: z.string().optional(), // Full location string like "Dallas, Texas, United States"
  timeFilter: z.enum(timeFilterOptions).optional(),
  languageFilter: z.enum(languageFilterOptions).optional(),
  fileTypeFilter: z.enum(fileTypeFilterOptions).optional(),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;

export const searchResponseSchema = z.object({
  query: z.string(),
  intent: z.enum(intentTypes).optional(),
  results: z.array(searchResultSchema),
  summary: aiSummarySchema.optional(),
  sources: z.array(z.object({
    id: z.string(),
    name: z.string(),
    site: z.string(),
    icon: z.string(),
  })).optional(),
  intentSources: z.array(z.object({
    id: z.string(),
    name: z.string(),
    site: z.string(),
    icon: z.string(),
  })).optional(),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalResults: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  }).optional(),
  location: locationSchema.optional(),
  correctedQuery: z.string().optional(),
  relatedSearches: z.array(z.string()).optional(),
  message: z.string().optional(),
  blocked: z.boolean().optional(),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;

// Bookmark schema
export const bookmarkSchema = z.object({
  id: z.string(),
  query: z.string(),
  timestamp: z.number(),
  results: z.array(searchResultSchema).optional(),
});

export type Bookmark = z.infer<typeof bookmarkSchema>;

export const insertBookmarkSchema = z.object({
  query: z.string(),
  timestamp: z.number(),
  results: z.array(searchResultSchema).optional(),
});

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

// Search history schema
export const searchHistorySchema = z.object({
  id: z.string(),
  query: z.string(),
  timestamp: z.number(),
  intent: z.enum(intentTypes).optional(),
});

export type SearchHistory = z.infer<typeof searchHistorySchema>;

export const insertSearchHistorySchema = z.object({
  query: z.string(),
  timestamp: z.number(),
  intent: z.enum(intentTypes).optional(),
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;

// Autocomplete suggestion schema
export const suggestionSchema = z.object({
  query: z.string(),
  type: z.enum(["trending", "history", "suggestion"]),
});

export type Suggestion = z.infer<typeof suggestionSchema>;

// Cache entry (for backend)
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
