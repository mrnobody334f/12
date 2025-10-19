import type { Express } from "express";
import { createServer, type Server } from "http";
import { searchWithSerper, getGoogleSuggestions, extractDomainsFromResults } from "./lib/serper";
import { detectIntent, generateSummary } from "./lib/openrouter";
import { getPopularSites } from "./lib/popular-sites";
import { cache } from "./lib/cache";
import { storage } from "./storage";

// Helper functions for global domain fallback
function getGlobalDomain(localDomain: string): string | null {
  const lowerDomain = localDomain.toLowerCase();
  
  // Specific mappings for known sites (same brand only)
  const globalDomainMap: Record<string, string> = {
    'amazon.sa': 'amazon.com',
    'amazon.ae': 'amazon.com',
    'amazon.eg': 'amazon.com',
    'amazon.in': 'amazon.com',
    'amazon.co.uk': 'amazon.com',
    'noon.sa': 'noon.com',
    'noon.ae': 'noon.com',
    'noon.eg': 'noon.com',
    'shein.sa': 'shein.com',
    'shein.ae': 'shein.com',
    'shein.eg': 'shein.com',
    'jarir.sa': 'jarir.com',
    'extra.sa': 'extra.com',
    'carrefourksa.com': 'carrefour.com',
    'carrefouruae.com': 'carrefour.com',
    'carrefouregypt.com': 'carrefour.com',
  };
  
  // Check explicit mapping first
  if (globalDomainMap[lowerDomain]) {
    return globalDomainMap[lowerDomain];
  }
  
  // Try to infer global domain from localized domain
  // Pattern: sitename.country_code -> sitename.com
  const parts = lowerDomain.split('.');
  if (parts.length >= 2) {
    const baseName = parts[0]; // e.g., "amazon" from "amazon.sa"
    const lastPart = parts[parts.length - 1]; // e.g., "sa" from "amazon.sa"
    
    // If it's a country code (2 letters) or country-specific domain, try .com
    if (lastPart.length === 2 || ['co', 'ae', 'sa', 'eg', 'in'].includes(lastPart)) {
      const globalDomain = `${baseName}.com`;
      // Only return if it's different from the original domain
      if (globalDomain !== lowerDomain) {
        console.log(`🌍 Inferred global domain: ${lowerDomain} → ${globalDomain}`);
        return globalDomain;
      }
    }
  }
  
  // No global variant found
  return null;
}

function getCountryLanguage(countryCode?: string): string {
  const languageMap: Record<string, string> = {
    'sa': 'ar', // Saudi Arabia - Arabic
    'ae': 'ar', // UAE - Arabic
    'eg': 'ar', // Egypt - Arabic
    'gb': 'en', // UK - English
    'us': 'en', // US - English
    'in': 'en', // India - English
  };
  
  return countryCode ? (languageMap[countryCode.toLowerCase()] || 'en') : 'en';
}
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
        // Return city for information but frontend will only use country on auto-detect
        city: data.city || ''
      };
      
      console.log(`Detected location (GeoIP): ${result.country} (${result.countryCode}) - City: ${result.city}`);
      
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

      console.log(`Reverse geocoding GPS coordinates: ${latitude}, ${longitude}`);

      // Try Nominatim first (OpenStreetMap's geocoding - more accurate)
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`;
        
        const nominatimResponse = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'NovaSearch/1.0'
          }
        });
        
        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json();
          
          if (nominatimData.address) {
            const result = {
              country: nominatimData.address.country || '',
              countryCode: (nominatimData.address.country_code || '').toLowerCase(),
              city: nominatimData.address.city || 
                    nominatimData.address.town || 
                    nominatimData.address.village || 
                    nominatimData.address.municipality || 
                    nominatimData.address.state || ''
            };
            
            console.log(`✓ Nominatim geocoded: ${result.city}, ${result.country} (${result.countryCode})`);
            console.log(`Full address data:`, nominatimData.address);
            
            if (result.countryCode) {
              return res.json(result);
            }
          }
        }
      } catch (nominatimError) {
        console.log('Nominatim failed, trying BigDataCloud...', nominatimError);
      }

      // Fallback to BigDataCloud
      const bigDataUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      
      const response = await fetch(bigDataUrl);
      
      if (!response.ok) {
        console.error(`BigDataCloud API returned status: ${response.status}`);
        return res.status(500).json({ error: "Failed to geocode location" });
      }
      
      const data = await response.json();
      
      const result = {
        country: data.countryName || '',
        countryCode: (data.countryCode || '').toLowerCase(),
        city: data.city || data.locality || data.principalSubdivision || ''
      };
      
      console.log(`✓ BigDataCloud geocoded: ${result.city}, ${result.country} (${result.countryCode})`);
      console.log(`Full data:`, data);
      
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
        timeFilter = "any",
        languageFilter = "any",
        fileTypeFilter = "any",
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
      
      // Extract filter parameters
      const timeFilterValue = timeFilter && typeof timeFilter === "string" ? timeFilter : "any";
      const languageFilterValue = languageFilter && typeof languageFilter === "string" ? languageFilter : "any";
      const fileTypeFilterValue = fileTypeFilter && typeof fileTypeFilter === "string" ? fileTypeFilter : "any";

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
      let intentSpecificSources;
      
      const sourceStr = source && typeof source === "string" ? source : undefined;
      
      if (sourceStr && sourceStr !== "all") {
        console.log(`🔍 Filtering by source: "${sourceStr}"`);
        // First, check if it's a platform source (Google, Twitter, etc.)
        const platformSource = Object.values(platformSources).find(p => p.id === sourceStr);
        if (platformSource) {
          console.log(`✅ Found platform source: ${platformSource.name}`);
          sources = [platformSource];
        } else {
          // Check if it's a dynamic domain tab (format: domain-com)
          const isDynamicDomain = sourceStr.includes('-') && !Object.values(sourceConfig).flat().some(s => s.id === sourceStr);
          
          if (isDynamicDomain) {
            // Convert id back to domain (e.g., "amazon-com" -> "amazon.com")
            const domain = sourceStr.replace(/-/g, '.');
            const domainName = domain.split('.')[0];
            const capitalizedName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
            
            console.log(`✅ Found dynamic domain tab: ${capitalizedName} (${domain})`);
            sources = [{
              id: sourceStr,
              name: capitalizedName,
              site: domain,
              icon: 'Globe'
            }];
          } else {
            // If not a platform source or dynamic domain, it might be a static source from sourceConfig
            const intentSources = sourceConfig[intent] || sourceConfig.general;
            const intentSource = intentSources.find(s => s.id === sourceStr);
            if (intentSource) {
              console.log(`✅ Found static source: ${intentSource.name} (${intentSource.site})`);
              sources = [intentSource];
            } else {
              console.log(`⚠️ Source "${sourceStr}" not found, using all ${intent} sources`);
              sources = intentSources;
            }
          }
        }
        console.log(`📊 Using ${sources.length} source(s):`, sources.map(s => s.name).join(', '));
      } else {
        // For "All" tab, just use Google (no site filters)
        sources = [platformSources.google];
      }

      // Create cache key for this specific search (include location and filters in key)
      const locationKey = `${locationCountryCode || ''}:${locationCity || ''}`;
      const filterKey = `${timeFilterValue}:${languageFilterValue}:${fileTypeFilterValue}`;
      const searchCacheKey = `search:${query}:${sourceStr || 'all'}:${pageNum}:${limitNum}:${sortBy}:${locationKey}:${filterKey}`;
      const cachedSearch = cache.get<SearchResult[]>(searchCacheKey);
      
      let flatResults: SearchResult[];
      let correctedQuery: string | undefined;
      let relatedSearches: string[] | undefined;
      
      if (cachedSearch) {
        console.log(`Using cached results for page ${pageNum}`);
        flatResults = cachedSearch;
        // Get corrected query and related searches from cache
        correctedQuery = cache.get<string>(`${searchCacheKey}:correctedQuery`) || undefined;
        relatedSearches = cache.get<string[]>(`${searchCacheKey}:relatedSearches`) || undefined;
      } else {
        // Fetch results from sources for this specific page
        const searchPromises = sources.map(async (src) => {
          try {
            // For Google search, don't filter by site - get real Google results
            // For other platforms (Twitter, Facebook, etc), use site: filter
            const siteFilter = (src.id === "google") ? undefined : src.site;
            
            // First attempt: Fetch results with site filter
            let searchData = await searchWithSerper(
              query, 
              siteFilter, 
              limitNum, 
              pageNum, 
              locationCountryCode, 
              locationCity,
              timeFilterValue,
              languageFilterValue,
              fileTypeFilterValue
            );
            
            // If no results and we're searching a specific site, try global domain
            let effectiveSite = siteFilter;
            if (siteFilter && searchData.results.length === 0) {
              const globalDomain = getGlobalDomain(siteFilter);
              if (globalDomain && globalDomain !== siteFilter) {
                console.log(`🌍 No results from ${siteFilter}, trying global domain ${globalDomain}`);
                
                // Determine language: use country's language if available, otherwise use query language or default to English
                let fallbackLanguage = 'en';
                if (locationCountryCode) {
                  fallbackLanguage = getCountryLanguage(locationCountryCode);
                } else if (languageFilterValue && languageFilterValue !== 'any') {
                  fallbackLanguage = languageFilterValue;
                } else {
                  // Detect language from query
                  const detectedLang = query.match(/[\u0600-\u06FF]/) ? 'ar' : 'en';
                  fallbackLanguage = detectedLang;
                }
                
                console.log(`  Using language: ${fallbackLanguage}`);
                
                // Retry with global domain
                const globalSearchData = await searchWithSerper(
                  query,
                  globalDomain,
                  limitNum,
                  pageNum,
                  undefined, // No country code for global search
                  undefined, // No city for global search
                  timeFilterValue,
                  fallbackLanguage, // Use appropriate language
                  fileTypeFilterValue
                );
                
                if (globalSearchData.results.length > 0) {
                  console.log(`✅ Found ${globalSearchData.results.length} results from global ${globalDomain}`);
                  searchData = globalSearchData;
                  effectiveSite = globalDomain;
                }
              }
            }
            
            // Store corrected query and related searches from first source (usually Google)
            if (!correctedQuery && searchData.correctedQuery) {
              correctedQuery = searchData.correctedQuery;
            }
            if (!relatedSearches && searchData.relatedSearches && searchData.relatedSearches.length > 0) {
              relatedSearches = searchData.relatedSearches;
            }
            
            return searchData.results.map((result, idx) => {
              // Extract domain from the result link for better favicon and source name
              let domain = effectiveSite || src.site;
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
                // Pass through rich snippet data from Serper
                rating: result.rating,
                ratingCount: result.ratingCount,
                price: result.price,
                sitelinks: result.sitelinks,
                image: result.image,
              };
            });
          } catch (error) {
            console.error(`Error fetching from ${src.name}:`, error);
            return [];
          }
        });

        const allResults = await Promise.all(searchPromises);
        flatResults = allResults.flat();
        
        // Note: No strict filtering needed here anymore because we're searching a specific site
        // The site: filter in Serper API already ensures results come from the target site
        // If we did a global fallback, those results are also from a valid global version of the site
        
        // Just log the result count for debugging
        if (sourceStr && sourceStr !== "all" && sources.length === 1) {
          console.log(`✅ Got ${flatResults.length} results from ${sources[0].name}`);
        }

        // Sort results
        flatResults = sortResults(flatResults, sortBy);
        
        // Cache the results and metadata for 5 minutes
        cache.set(searchCacheKey, flatResults, 5 * 60 * 1000);
        if (correctedQuery) {
          cache.set(`${searchCacheKey}:correctedQuery`, correctedQuery, 5 * 60 * 1000);
        }
        if (relatedSearches) {
          cache.set(`${searchCacheKey}:relatedSearches`, relatedSearches, 5 * 60 * 1000);
        }
      }

      // Extract dynamic domain tabs from results (for "All" tab only)
      // Only show intent-specific tabs if:
      // 1. autoDetect is enabled, OR
      // 2. manual intent is selected
      const shouldShowIntentTabs = shouldAutoDetect || (providedIntent && typeof providedIntent === "string");
      
      if ((!sourceStr || sourceStr === "all") && shouldShowIntentTabs && intent !== "general") {
        // Extract domains from the first 20 results to create dynamic tabs, filtered by intent
        const dynamicDomains = extractDomainsFromResults(
          flatResults.slice(0, 20).map(r => ({
            link: r.link,
            title: r.title,
            snippet: r.snippet
          })),
          intent // Pass intent to filter domains by type
        );
        intentSpecificSources = dynamicDomains;
        
        // Cache the dynamic domains for this query and intent
        const domainsCacheKey = `domains:${query}:${intent}:${locationKey}`;
        cache.set(domainsCacheKey, dynamicDomains, 10 * 60 * 1000); // Cache for 10 minutes
        
        // ALSO cache these domains as popular sites for this country+intent (24 hour cache)
        if (locationCountryCode && dynamicDomains.length > 0) {
          const popularSitesCacheKey = `popular-sites:${locationCountryCode}:${intent}`;
          // Only cache if we don't already have popular sites cached for this combination
          const existingPopularSites = cache.get(popularSitesCacheKey);
          if (!existingPopularSites) {
            // Take the top 10 domains
            const topDomains = dynamicDomains.slice(0, 10);
            cache.set(popularSitesCacheKey, topDomains, 24 * 60 * 60 * 1000); // 24 hours
            console.log(`💾 Cached ${topDomains.length} popular sites for ${locationCountryCode}/${intent} (24h):`, topDomains.map(d => d.name).join(', '));
          }
        }
        
        console.log(`📋 Extracted ${dynamicDomains.length} ${intent} domain tabs:`, dynamicDomains.map(d => d.name).join(', '));
      } else if (shouldShowIntentTabs && intent !== "general") {
        // For filtered searches, try to get cached dynamic domains
        const domainsCacheKey = `domains:${query}:${intent}:${locationKey}`;
        const cachedDomains = cache.get<typeof intentSpecificSources>(domainsCacheKey);
        
        if (cachedDomains) {
          intentSpecificSources = cachedDomains;
        }
      } else {
        // No intent tabs if autoDetect is off and no manual intent
        intentSpecificSources = undefined;
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
        intentSources: intentSpecificSources,
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
        correctedQuery,
        relatedSearches,
      };

      res.json(response);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to perform search" });
    }
  });

  // More tabs endpoint - fetch additional domain tabs from next page of results
  app.get("/api/more-tabs", async (req, res) => {
    try {
      const { 
        query, 
        page = "2",
        countryCode,
        city,
        intent = "general",
      } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const pageNum = parseInt(page as string, 10);
      const locationCountryCode = countryCode && typeof countryCode === "string" ? countryCode : undefined;
      const locationCity = city && typeof city === "string" ? city : undefined;
      const intentType = intent && typeof intent === "string" ? intent : "general";
      const locationKey = `${locationCountryCode || ''}:${locationCity || ''}`;
      
      // Check if we have cached domains for this page
      const domainsCacheKey = `domains:${query}:${intentType}:${locationKey}:page${pageNum}`;
      const cachedDomains = cache.get<Array<{id: string, name: string, site: string, icon: string}>>(domainsCacheKey);
      
      if (cachedDomains) {
        console.log(`Using cached more-tabs for page ${pageNum}`);
        return res.json({ domains: cachedDomains });
      }
      
      // Fetch results from next page
      // Note: We exclude city to get broader results and more domains
      try {
        const searchData = await searchWithSerper(
          query, 
          undefined, // No site filter - get real Google results
          20, // Get more results
          pageNum, 
          locationCountryCode, 
          undefined // Don't use city for domain extraction - get broader results
        );
        
        // Extract domains from these results, filtered by intent
        const dynamicDomains = extractDomainsFromResults(
          searchData.results.map(r => ({
            link: r.link,
            title: r.title,
            snippet: r.snippet
          })),
          intentType
        );
        
        // Cache the domains for 10 minutes
        cache.set(domainsCacheKey, dynamicDomains, 10 * 60 * 1000);
        
        console.log(`📋 Extracted ${dynamicDomains.length} more ${intentType} domain tabs from page ${pageNum}:`, dynamicDomains.map(d => d.name).join(', '));
        
        res.json({ domains: dynamicDomains });
      } catch (error) {
        console.error("Error fetching more tabs:", error);
        res.status(500).json({ error: "Failed to fetch more tabs" });
      }
    } catch (error) {
      console.error("More tabs error:", error);
      res.status(500).json({ error: "Failed to get more tabs" });
    }
  });

  // Get popular sites for country and intent
  app.get("/api/popular-sites", async (req, res) => {
    try {
      const { intent, countryCode, isGlobal = "false" } = req.query;

      if (!intent || typeof intent !== "string") {
        return res.status(400).json({ error: "Intent parameter is required" });
      }

      const country = typeof countryCode === "string" ? countryCode : undefined;
      const globalMode = isGlobal === "true";

      let sites;

      // For non-general intents and non-global mode, try cache first
      if (!globalMode && country && intent !== "general") {
        const popularSitesCacheKey = `popular-sites:${country}:${intent}`;
        const cachedSites = cache.get<Array<{id: string, name: string, site: string, icon: string}>>(popularSitesCacheKey);
        
        if (cachedSites && cachedSites.length > 0) {
          sites = cachedSites;
          console.log(`✅ Using cached popular sites for ${country}/${intent}:`, sites.map(s => s.name).join(', '));
        }
      }

      // If no cached sites, fallback to global sites
      if (!sites) {
        sites = getPopularSites(country, intent, globalMode);
        console.log(`🌍 Using global popular sites for ${globalMode ? 'global' : country || 'unknown'} / ${intent}:`, sites.map(s => s.name).join(', '));
      }

      res.json({ sites });
    } catch (error) {
      console.error("Popular sites error:", error);
      res.status(500).json({ error: "Failed to get popular sites" });
    }
  });

  // Autocomplete/Suggestions endpoint
  app.get("/api/suggestions", async (req, res) => {
    const { query } = req.query;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    try {
      // Get suggestions from Google Autocomplete API
      const googleSuggestions = await getGoogleSuggestions(query);
      
      // Get recent searches matching the query for additional context
      const history = storage.getSearchHistory(20);
      const historySuggestions = history
        .filter(h => 
          h.query.toLowerCase().includes(query.toLowerCase()) &&
          !googleSuggestions.some(gs => gs.toLowerCase() === h.query.toLowerCase())
        )
        .slice(0, 3)
        .map(h => ({
          query: h.query,
          type: "history" as const,
        }));

      // Map Google suggestions to our format
      const apiSuggestions = googleSuggestions.map(q => ({
        query: q,
        type: "suggestion" as const,
      }));

      // Combine: prioritize Google suggestions, then add unique history items
      const allSuggestions = [...apiSuggestions, ...historySuggestions].slice(0, 8);

      res.json({ suggestions: allSuggestions });
    } catch (error) {
      console.error("Suggestions error:", error);
      // Fallback to basic suggestions on error
      const fallbackSuggestions = [
        `${query} 2025`,
        `${query} news`,
        `${query} tutorial`,
      ].map(q => ({
        query: q,
        type: "suggestion" as const,
      }));
      res.json({ suggestions: fallbackSuggestions });
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
