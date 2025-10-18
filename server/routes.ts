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
  // Detect user location from IP address
  app.get("/api/location/detect", async (req, res) => {
    try {
      const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0] || 
                       req.headers['x-real-ip']?.toString() || 
                       req.socket.remoteAddress || '';
      
      console.log(`Location detection for IP: ${clientIp}`);
      
      const isLocalhost = !clientIp || 
                         clientIp.includes('::1') || 
                         clientIp.includes('127.0.0.1') ||
                         clientIp.includes('::ffff:127.0.0.1');
      
      if (isLocalhost) {
        console.log('Local IP detected, using ip-api.com without IP parameter');
      }
      
      const ipToCheck = isLocalhost ? '' : clientIp;
      const endpoint = ipToCheck 
        ? `http://ip-api.com/json/${ipToCheck}?fields=status,country,countryCode,city`
        : 'http://ip-api.com/json/?fields=status,country,countryCode,city';
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        console.error(`ip-api.com returned status: ${response.status}`);
        return res.json({
          country: '',
          countryCode: '',
          city: ''
        });
      }
      
      const data = await response.json();
      
      if (data.status !== 'success') {
        console.error(`ip-api.com failed:`, data);
        return res.json({
          country: '',
          countryCode: '',
          city: ''
        });
      }
      
      const result = {
        country: data.country || '',
        countryCode: (data.countryCode || '').toLowerCase(),
        city: data.city || ''
      };
      
      console.log(`Detected location: ${result.city}, ${result.country} (${result.countryCode})`);
      
      res.json(result);
    } catch (error) {
      console.error("Location detection error:", error);
      res.json({
        country: '',
        countryCode: '',
        city: ''
      });
    }
  });

  // Reverse geocode coordinates to location (more accurate than IP-based)
  app.post("/api/location/geocode", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      console.log(`Reverse geocoding: ${latitude}, ${longitude}`);

      // Using BigDataCloud's free reverse geocoding API (no API key needed)
      const endpoint = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        console.error(`Geocoding API returned status: ${response.status}`);
        return res.status(500).json({ error: "Failed to geocode location" });
      }
      
      const data = await response.json();
      
      const result = {
        country: data.countryName || '',
        countryCode: (data.countryCode || '').toLowerCase(),
        city: data.city || data.locality || data.principalSubdivision || ''
      };
      
      console.log(`Geocoded location: ${result.city}, ${result.country} (${result.countryCode})`);
      
      res.json(result);
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ error: "Failed to geocode location" });
    }
  });

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
        country,
        countryCode,
        city,
      } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const sortBy = sort as SortOption;
      const shouldAutoDetect = autoDetect === "true";
      
      // Extract location parameters
      const locationCountry = country && typeof country === "string" ? country : undefined;
      const locationCountryCode = countryCode && typeof countryCode === "string" ? countryCode : undefined;
      const locationCity = city && typeof city === "string" ? city : undefined;

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
        if (platformSource) {
          sources = [platformSource];
        } else {
          sources = sourceConfig[intent] || sourceConfig.general;
        }
      } else {
        sources = sourceConfig[intent] || sourceConfig.general;
      }

      // Create cache key for this specific search (include location in key)
      const locationKey = `${locationCountryCode || ''}:${locationCity || ''}`;
      const searchCacheKey = `search:${query}:${source || 'all'}:${pageNum}:${limitNum}:${sortBy}:${locationKey}`;
      const cachedSearch = cache.get<SearchResult[]>(searchCacheKey);
      
      let flatResults: SearchResult[];
      
      if (cachedSearch) {
        console.log(`Using cached results for page ${pageNum}`);
        flatResults = cachedSearch;
      } else {
        // Fetch results from sources for this specific page
        const searchPromises = sources.map(async (src) => {
          try {
            // For Google search or "all", don't filter by site - get real Google results
            const siteFilter = (src.id === "google" || source === "all") ? undefined : src.site;
            
            // Fetch results with pagination and location - pass page number and location to Serper API
            const results = await searchWithSerper(query, siteFilter, limitNum, pageNum, locationCountryCode, locationCity);
            
            return results.map((result, idx) => {
              // Extract domain from the result link for better favicon and source name
              let domain = src.site;
              let displayName = src.name;
              
              if (!siteFilter) {
                // For Google search, extract the actual domain from the result
                try {
                  const url = new URL(result.link);
                  domain = url.hostname.replace('www.', '');
                  // Capitalize first letter for display
                  displayName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
                } catch (e) {
                  domain = 'unknown.com';
                  displayName = 'Web';
                }
              }
              
              return {
                ...result,
                source: src.id,
                sourceName: displayName,
                favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
                views: Math.floor(Math.random() * 100000),
                engagement: Math.floor(Math.random() * 10000),
              };
            });
          } catch (error) {
            console.error(`Error fetching from ${src.name}:`, error);
            return [];
          }
        });

        const allResults = await Promise.all(searchPromises);
        flatResults = allResults.flat();

        // Sort results
        flatResults = sortResults(flatResults, sortBy);
        
        // Cache the results for 5 minutes
        cache.set(searchCacheKey, flatResults, 5 * 60 * 1000);
      }

      // Calculate pagination metadata
      // Estimate total results (Serper typically has ~100 results per query)
      const totalResults = Math.min(limitNum * 10, 1000); // Estimate max 1000 results
      const totalPages = Math.ceil(totalResults / limitNum);
      const paginatedResults = flatResults;

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
        location: (locationCountry || locationCountryCode || locationCity) ? {
          country: locationCountry,
          countryCode: locationCountryCode,
          city: locationCity,
        } : undefined,
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
