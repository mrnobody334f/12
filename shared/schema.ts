import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Intent types for search queries
export const intentTypes = ["shopping", "news", "learning", "entertainment", "general"] as const;
export type IntentType = typeof intentTypes[number];

// Sort options for search results
export const sortOptions = ["relevance", "recent", "mostViewed", "mostEngaged"] as const;
export type SortOption = typeof sortOptions[number];

// Location schema for localized search
export const locationSchema = z.object({
  country: z.string().optional(),
  countryCode: z.string().optional(),
  city: z.string().optional(),
});

export type Location = z.infer<typeof locationSchema>;

// Dedicated social media and platform sources
export const platformSources = {
  all: { id: "all", name: "All", site: "", icon: "Globe" },
  google: { id: "google", name: "Google", site: "", icon: "Search" },
  twitter: { id: "twitter", name: "Twitter", site: "twitter.com", icon: "Twitter" },
  facebook: { id: "facebook", name: "Facebook", site: "facebook.com", icon: "Facebook" },
  instagram: { id: "instagram", name: "Instagram", site: "instagram.com", icon: "Instagram" },
  tiktok: { id: "tiktok", name: "TikTok", site: "tiktok.com", icon: "Music" },
  reddit: { id: "reddit", name: "Reddit", site: "reddit.com", icon: "MessageSquare" },
  youtube: { id: "youtube", name: "YouTube", site: "youtube.com", icon: "Youtube" },
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
  entertainment: [
    { id: "tiktok", name: "TikTok", site: "tiktok.com", icon: "Music" },
    { id: "youtube", name: "YouTube", site: "youtube.com", icon: "Youtube" },
    { id: "instagram", name: "Instagram", site: "instagram.com", icon: "Camera" },
    { id: "reddit", name: "Reddit", site: "reddit.com", icon: "MessageSquare" },
    { id: "pinterest", name: "Pinterest", site: "pinterest.com", icon: "Image" },
  ],
  general: [
    { id: "google", name: "Google", site: "", icon: "Search" },
    { id: "youtube", name: "YouTube", site: "youtube.com", icon: "Youtube" },
    { id: "facebook", name: "Facebook", site: "facebook.com", icon: "Facebook" },
    { id: "tiktok", name: "TikTok", site: "tiktok.com", icon: "Music" },
    { id: "reddit", name: "Reddit", site: "reddit.com", icon: "MessageSquare" },
    { id: "instagram", name: "Instagram", site: "instagram.com", icon: "Camera" },
    { id: "twitter", name: "Twitter", site: "twitter.com", icon: "Twitter" },
  ],
};

// Search result schema with enhanced metadata
export const searchResultSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  snippet: z.string(),
  source: z.string(),
  sourceName: z.string().optional(),
  favicon: z.string().optional(),
  thumbnail: z.string().optional(),
  position: z.number().optional(),
  date: z.string().optional(),
  views: z.number().optional(),
  engagement: z.number().optional(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

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
  city: z.string().optional(),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;

export const searchResponseSchema = z.object({
  query: z.string(),
  intent: z.enum(intentTypes),
  results: z.array(searchResultSchema),
  summary: aiSummarySchema.optional(),
  sources: z.array(z.object({
    id: z.string(),
    name: z.string(),
    site: z.string(),
    icon: z.string(),
  })),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalResults: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  }),
  location: locationSchema.optional(),
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
