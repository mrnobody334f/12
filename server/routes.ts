import type { Express } from "express";
import { createServer, type Server } from "http";
import { searchWithSerper } from "./lib/serper";
import { detectIntent, generateSummary } from "./lib/openrouter";
import { cache } from "./lib/cache";
import { sourceConfig, type IntentType, type SearchResult, type SearchResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Intent detection endpoint
  app.post("/api/intent", async (req, res) => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      // Check cache
      const cacheKey = `intent:${query}`;
      const cached = cache.get<IntentType>(cacheKey);
      if (cached) {
        return res.json({ intent: cached, cached: true });
      }

      // Detect intent using AI
      const intent = await detectIntent(query);
      
      // Cache the result
      cache.set(cacheKey, intent, 10 * 60 * 1000); // 10 minutes

      res.json({ intent, cached: false });
    } catch (error) {
      console.error("Intent detection error:", error);
      res.status(500).json({ error: "Failed to detect intent" });
    }
  });

  // Search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const { query, source, intent: providedIntent } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      // Check cache
      const cacheKey = `search:${query}:${source || 'all'}`;
      const cached = cache.get<SearchResponse>(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Detect intent if not provided
      let intent: IntentType;
      if (providedIntent && typeof providedIntent === "string") {
        intent = providedIntent as IntentType;
      } else {
        const intentCacheKey = `intent:${query}`;
        const cachedIntent = cache.get<IntentType>(intentCacheKey);
        if (cachedIntent) {
          intent = cachedIntent;
        } else {
          intent = await detectIntent(query);
          cache.set(intentCacheKey, intent, 10 * 60 * 1000);
        }
      }

      // Get sources based on intent
      const sources = sourceConfig[intent] || sourceConfig.general;

      // Fetch results from all sources in parallel
      const searchPromises = sources.map(async (src) => {
        try {
          const results = await searchWithSerper(query, src.site);
          return results.map((result) => ({
            ...result,
            source: src.id,
            sourceName: src.name,
            favicon: `https://www.google.com/s2/favicons?domain=${src.site}&sz=32`,
          }));
        } catch (error) {
          console.error(`Error fetching from ${src.name}:`, error);
          return [];
        }
      });

      const allResults = await Promise.all(searchPromises);
      const flatResults: SearchResult[] = allResults.flat();

      // Generate AI summary for all results
      let summary;
      if (flatResults.length > 0) {
        try {
          summary = await generateSummary(query, flatResults, intent);
        } catch (error) {
          console.error("Summary generation error:", error);
        }
      }

      const response: SearchResponse = {
        query,
        intent,
        results: flatResults,
        summary,
        sources,
      };

      // Cache the response
      cache.set(cacheKey, response, 5 * 60 * 1000); // 5 minutes

      res.json(response);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to perform search" });
    }
  });

  // Summarize endpoint (optional - for generating summaries separately)
  app.post("/api/summarize", async (req, res) => {
    try {
      const { query, results, intent } = req.body;

      if (!query || !results || !intent) {
        return res.status(400).json({ error: "Query, results, and intent are required" });
      }

      const summary = await generateSummary(query, results, intent);
      res.json(summary);
    } catch (error) {
      console.error("Summarization error:", error);
      res.status(500).json({ error: "Failed to generate summary" });
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
