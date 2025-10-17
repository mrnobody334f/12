import { z } from "zod";

// Intent types for search queries
export const intentTypes = ["shopping", "news", "learning", "entertainment", "general"] as const;
export type IntentType = typeof intentTypes[number];

// Search source configurations
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
    { id: "google", name: "Google", site: "google.com", icon: "Search" },
    { id: "youtube", name: "YouTube", site: "youtube.com", icon: "Youtube" },
    { id: "tiktok", name: "TikTok", site: "tiktok.com", icon: "Music" },
    { id: "reddit", name: "Reddit", site: "reddit.com", icon: "MessageSquare" },
    { id: "instagram", name: "Instagram", site: "instagram.com", icon: "Camera" },
  ],
};

// Search result schema
export const searchResultSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  snippet: z.string(),
  source: z.string(), // source ID (e.g., "amazon", "bestbuy")
  sourceName: z.string().optional(), // display name (e.g., "Amazon", "Best Buy")
  favicon: z.string().optional(),
  thumbnail: z.string().optional(),
  position: z.number().optional(),
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

// Search request/response
export const searchRequestSchema = z.object({
  query: z.string().min(1),
  source: z.string().optional(),
  intent: z.enum(intentTypes).optional(),
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
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;

// Cache entry (for backend)
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
