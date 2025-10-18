import type { Express } from "express";
import { createServer, type Server } from "http";
import { searchWithSerper } from "./lib/serper";
import { detectIntent, generateSummary } from "./lib/openrouter";
import { cache } from "./lib/cache";
import { storage } from "./storage";
import { 
  sourceConfig, 
  platformSources,
  type IntentType, 
  type SearchResult, 
  type SearchResponse,
  type SortOption,
} from "@shared/schema";

// Helper function to sort results
function sortResults(results: SearchResult[], sortBy: SortOption): SearchResult[] {
  switch (sortBy) {
    case "recent":
      return [...results].sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    case "mostViewed":
      return [...results].sort((a, b) => (b.views || 0) - (a.views || 0));
    case "mostEngaged":
      return [...results].sort((a, b) => (b.engagement || 0) - (a.engagement || 0));
    case "relevance":
    default:
      return [...results].sort((a, b) => (a.position || 999) - (b.position || 999));
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Intent detection endpoint
  app.post("/api/intent", async (req, res) => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      const cacheKey = `intent:${query}`;
      const cached = cache.get<IntentType>(cacheKey);
      if (cached) {
        return res.json({ intent: cached, cached: true });
      }

      const intent = await detectIntent(query);
      cache.set(cacheKey, intent, 10 * 60 * 1000);

      res.json({ intent, cached: false });
    } catch (error) {
      console.error("Intent detection error:", error);
      res.status(500).json({ error: "Failed to detect intent" });
    }
  });

  // Enhanced search endpoint with pagination and sorting
  app.get("/api/search", async (req, res) => {
    try {
      const { 
        query, 
        source, 
        intent: providedIntent,
        page = "1",
        limit = "20",
        sort = "relevance",
        autoDetect = "true",
      } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const sortBy = sort as SortOption;
      const shouldAutoDetect = autoDetect === "true";

      // Detect or use provided intent
      let intent: IntentType = "general";
      if (providedIntent && typeof providedIntent === "string") {
        intent = providedIntent as IntentType;
      } else if (shouldAutoDetect) {
        const intentCacheKey = `intent:${query}`;
        const cachedIntent = cache.get<IntentType>(intentCacheKey);
        if (cachedIntent) {
          intent = cachedIntent;
        } else {
          try {
            intent = await detectIntent(query);
            cache.set(intentCacheKey, intent, 10 * 60 * 1000);
          } catch (error) {
            console.error("Intent detection error:", error);
            // Fallback to general intent if AI detection fails
            intent = "general";
          }
        }
      }

      // Add to search history
      storage.addSearchHistory({
        query,
        timestamp: Date.now(),
        intent,
      });

      // Determine sources based on filter or intent
      let sources;
      if (source && source !== "all") {
        const platformSource = Object.values(platformSources).find(p => p.id === source);
        if (platformSource && platformSource.site) {
          sources = [platformSource];
        } else {
          sources = sourceConfig[intent] || sourceConfig.general;
        }
      } else {
        sources = sourceConfig[intent] || sourceConfig.general;
      }

      // Fetch results from sources
      const searchPromises = sources.map(async (src) => {
        try {
          const results = await searchWithSerper(query, src.site, 10);
          return results.map((result, idx) => ({
            ...result,
            source: src.id,
            sourceName: src.name,
            favicon: `https://www.google.com/s2/favicons?domain=${src.site}&sz=32`,
            views: Math.floor(Math.random() * 100000),
            engagement: Math.floor(Math.random() * 10000),
          }));
        } catch (error) {
          console.error(`Error fetching from ${src.name}:`, error);
          return [];
        }
      });

      const allResults = await Promise.all(searchPromises);
      let flatResults: SearchResult[] = allResults.flat();

      // Sort results
      flatResults = sortResults(flatResults, sortBy);

      // Pagination
      const totalResults = flatResults.length;
      const totalPages = Math.ceil(totalResults / limitNum);
      const startIdx = (pageNum - 1) * limitNum;
      const endIdx = startIdx + limitNum;
      const paginatedResults = flatResults.slice(startIdx, endIdx);

      // Generate AI summary for first page only
      let summary;
      if (pageNum === 1 && paginatedResults.length > 0) {
        try {
          summary = await generateSummary(query, paginatedResults, intent);
        } catch (error) {
          console.error("Summary generation error:", error);
        }
      }

      const response: SearchResponse = {
        query,
        intent,
        results: paginatedResults,
        summary,
        sources,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalResults,
          hasNext: pageNum < totalPages,
          hasPrevious: pageNum > 1,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to perform search" });
    }
  });

  // Autocomplete/Suggestions endpoint
  app.get("/api/suggestions", async (req, res) => {
    try {
      const { query } = req.query;

      if (!query || typeof query !== "string") {
        return res.json({ suggestions: [] });
      }

      // Get recent searches matching the query
      const history = storage.getSearchHistory(20);
      const historySuggestions = history
        .filter(h => h.query.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map(h => ({
          query: h.query,
          type: "history" as const,
        }));

      // Popular trending suggestions (could be enhanced with real trending data)
      const trendingSuggestions = [
        `${query} 2025`,
        `${query} news`,
        `${query} tutorial`,
        `${query} reviews`,
        `best ${query}`,
      ].map(q => ({
        query: q,
        type: "suggestion" as const,
      }));

      const allSuggestions = [...historySuggestions, ...trendingSuggestions].slice(0, 8);

      res.json({ suggestions: allSuggestions });
    } catch (error) {
      console.error("Suggestions error:", error);
      res.status(500).json({ error: "Failed to get suggestions" });
    }
  });

  // Bookmarks endpoints
  app.get("/api/bookmarks", (req, res) => {
    try {
      const bookmarks = storage.getBookmarks();
      res.json({ bookmarks });
    } catch (error) {
      console.error("Get bookmarks error:", error);
      res.status(500).json({ error: "Failed to get bookmarks" });
    }
  });

  app.post("/api/bookmarks", (req, res) => {
    try {
      const { query, results } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const bookmark = storage.addBookmark({
        query,
        timestamp: Date.now(),
        results,
      });

      res.json({ bookmark });
    } catch (error) {
      console.error("Add bookmark error:", error);
      res.status(500).json({ error: "Failed to add bookmark" });
    }
  });

  app.delete("/api/bookmarks/:id", (req, res) => {
    try {
      const { id } = req.params;
      const success = storage.removeBookmark(id);

      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Bookmark not found" });
      }
    } catch (error) {
      console.error("Delete bookmark error:", error);
      res.status(500).json({ error: "Failed to delete bookmark" });
    }
  });

  // Search history endpoints
  app.get("/api/history", (req, res) => {
    try {
      const { limit = "50" } = req.query;
      const limitNum = parseInt(limit as string, 10);
      const history = storage.getSearchHistory(limitNum);
      res.json({ history });
    } catch (error) {
      console.error("Get history error:", error);
      res.status(500).json({ error: "Failed to get history" });
    }
  });

  app.delete("/api/history", (req, res) => {
    try {
      storage.clearSearchHistory();
      res.json({ success: true });
    } catch (error) {
      console.error("Clear history error:", error);
      res.status(500).json({ error: "Failed to clear history" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      cache: {
        size: cache.size(),
      },
      timestamp: new Date().toISOString(),
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
