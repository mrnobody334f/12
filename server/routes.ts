import type { Express } from "express";
import { createServer, type Server } from "http";
import { searchWithSerper, getGoogleSuggestions, extractDomainsFromResults, searchImagesWithSerper, searchVideosWithSerper, searchPlacesWithSerper, searchNewsWithSerper } from "./lib/serper";
import { searchWithSerperEnhanced, searchImagesWithSerperEnhanced, searchVideosWithSerperEnhanced, searchPlacesWithSerperEnhanced, searchNewsWithSerperEnhanced, getGoogleSuggestionsEnhanced } from "./lib/serper-enhanced";
import { detectIntent, generateSummary, generateBasicSummary } from "./lib/openrouter";
import { getPopularSites } from "./lib/popular-sites";
import { cache } from "./lib/cache";
import { storage } from "./storage";
import { filterQuery, filterResults, getBlockedMessage } from "./lib/content-filter";
import { 
  searchLocations, 
  getAllCountries, 
  getStatesOfCountry, 
  getCitiesOfState, 
  getCitiesOfCountry, 
  getCountryByCode, 
  getStateByCode, 
  initializeLocations, 
  isLocationsLoaded, 
  getLocationsCount 
} from "./lib/serper-locations";

// Helper function to detect location from IP
async function detectLocationFromIP(ip: string): Promise<{country: string; countryCode: string; city: string; state?: string; canonicalName?: string; fullName?: string} | null> {
  try {
    const clientIp = ip;
    
    const isLocalhost = !clientIp || 
                       clientIp.includes('::1') || 
                       clientIp.includes('127.0.0.1') ||
                       clientIp.includes('::ffff:127.0.0.1');
    
    const ipToCheck = isLocalhost ? '' : clientIp;
    const endpoint = ipToCheck 
      ? `http://ip-api.com/json/${ipToCheck}?fields=status,country,countryCode,city`
      : 'http://ip-api.com/json/?fields=status,country,countryCode,city';
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country,
        countryCode: data.countryCode.toLowerCase(),
        city: data.city,
        canonicalName: `${data.city}, ${data.country}`,
        fullName: `${data.city}, ${data.country}`
      };
    }
    
    return null;
  } catch (error) {
    console.error('Location detection error:', error);
    return null;
  }
}

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

// Helper function to convert string numbers like "1.2M" or "5K" to actual numbers
function parseNumberString(value: number | string | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const str = value.toString().toLowerCase().trim();
  if (str === '') return 0;
  
  const multipliers: Record<string, number> = {
    'k': 1000,
    'm': 1000000,
    'b': 1000000000,
  };
  
  const match = str.match(/^([\d.]+)([kmb]?)$/);
  if (match) {
    const num = parseFloat(match[1]);
    const multiplier = multipliers[match[2]] || 1;
    return num * multiplier;
  }
  
  return parseFloat(str) || 0;
}

// Helper function to parse date from various formats
function parseDate(dateStr: string | undefined): number {
  if (!dateStr) return 0;
  
  try {
    // Handle relative dates like "2 hours ago", "3 days ago"
    const relativeMatch = dateStr.match(/(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago/i);
    if (relativeMatch) {
      const value = parseInt(relativeMatch[1]);
      const unit = relativeMatch[2].toLowerCase();
      const now = Date.now();
      
      const multipliers: Record<string, number> = {
        'second': 1000,
        'minute': 60 * 1000,
        'hour': 60 * 60 * 1000,
        'day': 24 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
        'year': 365 * 24 * 60 * 60 * 1000,
      };
      
      return now - (value * (multipliers[unit] || 0));
    }
    
    // Try to parse as ISO date or standard date string
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.getTime();
    }
    
    return 0;
  } catch (e) {
    return 0;
  }
}

// Helper function to sort results
function sortResults(results: SearchResult[], sortBy: SortOption): SearchResult[] {
  switch (sortBy) {
    case "recent":
      return [...results].sort((a, b) => {
        // Parse dates to timestamps
        const timeA = parseDate(a.date);
        const timeB = parseDate(b.date);
        
        // Results with dates come first, sorted newest to oldest
        // Results without dates come last
        if (timeA === 0 && timeB === 0) return 0;
        if (timeA === 0) return 1;  // a goes to bottom
        if (timeB === 0) return -1; // b goes to bottom
        return timeB - timeA; // Newest first (higher timestamp = more recent)
      });
    case "mostViewed":
      return [...results].sort((a, b) => parseNumberString(b.views) - parseNumberString(a.views));
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
    console.log('🌍🌍🌍 /api/location/detect endpoint called!');
    try {
      const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0] || 
                       req.headers['x-real-ip']?.toString() || 
                       req.socket.remoteAddress || '';
      
      console.log(`🌍 Location detection for IP: ${clientIp}`);
      
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
      console.log('🌍 ip-api.com raw response:', data);
      
      if (data.status !== 'success') {
        console.error(`❌ ip-api.com failed:`, data);
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
      
      console.log(`✅ Detected location (GeoIP): ${result.country} (${result.countryCode}) - City: ${result.city}`);
      
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
        state,
        city,
        location,
        site,
        timeFilter = "any",
        languageFilter = "any",
        fileTypeFilter = "any",
      } = req.query;

      // Debug logging for location parameters
      console.log('🔍 SEARCH REQUEST LOCATION PARAMS:', {
        query,
        countryCode,
        country,
        state,
        city,
        location,
        site
      });

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      // CONTENT FILTER: Check if query contains blocked adult content
      const queryFilter = filterQuery(query);
      if (!queryFilter.allowed) {
        console.log(`🚫 Blocked search query: "${query}"`);
        return res.json({
          results: [],
          totalResults: 0,
          currentPage: 1,
          totalPages: 0,
          message: getBlockedMessage(),
          blocked: true,
        });
      }

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10);
      const sortBy = sort as SortOption;
      const shouldAutoDetect = autoDetect === "true";
      
      // Extract location parameters
      let locationCountry = country && typeof country === "string" ? country : undefined;
      let locationCountryCode = countryCode && typeof countryCode === "string" ? countryCode : undefined;
      let locationState = state && typeof state === "string" ? state : undefined;
      let locationCity = city && typeof city === "string" ? city : undefined;
      let locationString = location && typeof location === "string" ? location : undefined;
      
      // If no location parameters provided, use detected location for "Normal" mode
      if (!locationCountry && !locationCountryCode && !locationState && !locationCity && !locationString) {
        // Get detected location from IP
        try {
          const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0] || 
                           req.headers['x-real-ip']?.toString() || 
                           req.socket.remoteAddress || '';
          const detectedLocation = await detectLocationFromIP(clientIp);
          if (detectedLocation?.countryCode) {
            locationCountry = detectedLocation.country;
            locationCountryCode = detectedLocation.countryCode;
            locationState = detectedLocation.state || "";
            locationCity = detectedLocation.city || "";
            locationString = detectedLocation.canonicalName || detectedLocation.fullName || detectedLocation.country;
            console.log(`🌍 Using detected location for Normal mode: ${locationString}`);
          }
        } catch (error) {
          console.log('⚠️ Could not detect location for Normal mode, using global search');
        }
      }
      
      // Extract filter parameters
      const timeFilterValue = timeFilter && typeof timeFilter === "string" ? timeFilter : "any";
      const languageFilterValue = languageFilter && typeof languageFilter === "string" ? languageFilter : "any";
      const fileTypeFilterValue = fileTypeFilter && typeof fileTypeFilter === "string" ? fileTypeFilter : "any";

      // Detect or use provided intent
      let intent: IntentType = "general";
      if (providedIntent && typeof providedIntent === "string") {
        intent = providedIntent as IntentType;
      } else {
        // Always try to detect intent, regardless of shouldAutoDetect setting
        // Clear cache to force fresh detection
        const intentCacheKey = `intent:${query}`;
        cache.delete(intentCacheKey);
        
        try {
          intent = await detectIntent(query);
          console.log(`🎯 Detected intent for "${query}": ${intent}`);
          cache.set(intentCacheKey, intent, 10 * 60 * 1000);
        } catch (error) {
          console.error("Intent detection error:", error);
          // Fallback to general intent if AI detection fails
          intent = "general";
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
      
      if (sourceStr && sourceStr !== "web") {
        console.log(`🔍 Filtering by source: "${sourceStr}"`);
        // First, check if it's a platform source (Reddit, Twitter, etc.)
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
        // For "Web" tab, just use Google (no site filters) - gets real Google results with AI Summary
        sources = [platformSources.google];
      }

      // Create cache key for this specific search (include location and filters in key)
      const locationKey = `${locationCountryCode || ''}:${locationState || ''}:${locationCity || ''}`;
      const filterKey = `${timeFilterValue}:${languageFilterValue}:${fileTypeFilterValue}`;
      const siteKey = site || '';
      const searchCacheKey = `search:${query}:${sourceStr || 'all'}:${pageNum}:${limitNum}:${sortBy}:${locationKey}:${filterKey}:${siteKey}`;
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
            // For Web/Google search, don't filter by site - get real Google results
            // For other platforms (Facebook, etc), use site: filter
            // For X, force x.com (and fall back to twitter.com if needed)
            // If site parameter is provided, use it instead of src.site
            let siteFilter = site ? site : ((src.id === "google" || src.id === "web") ? undefined : src.site);
            let enhancedQuery = query;
            
            // Debug logging
            if (site) {
              console.log(`🔍 Site filter applied: ${site} for source: ${src.id}`);
            }

            // Special handling for X (formerly Twitter)
            if (src.id === "x" || src.site === "x.com") {
              siteFilter = "x.com"; // try x.com first
              enhancedQuery = query; // keep original user query
            }
            
            // First attempt: Fetch results with site filter using enhanced search
            let searchData = await searchWithSerperEnhanced(
              enhancedQuery, 
              siteFilter, 
              limitNum, 
              pageNum, 
              locationCountryCode,
              locationCountry,
              locationState,
              locationCity,
              undefined, // Don't pass locationString - let enhanced function build it
              timeFilterValue,
              languageFilterValue,
              fileTypeFilterValue
            );

            // If X has no results from x.com, try legacy twitter.com as a fallback
            if ((src.id === "x" || src.site === "x.com") && searchData.results.length === 0) {
              try {
                const fallbackData = await searchWithSerperEnhanced(
                  enhancedQuery,
                  "twitter.com",
                  limitNum,
                  pageNum,
                  locationCountryCode,
                  locationCountry,
                  locationState,
                  locationCity,
                  undefined, // Don't pass locationString - let enhanced function build it
                  timeFilterValue,
                  languageFilterValue,
                  fileTypeFilterValue
                );
                if (fallbackData.results.length > 0) {
                  searchData = fallbackData;
                }
              } catch (_err) {
                // swallow and continue with original (empty) results
              }
            }
            
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
                const globalSearchData = await searchWithSerperEnhanced(
                  query,
                  globalDomain,
                  limitNum,
                  pageNum,
                  undefined, // No country code for global search
                  undefined, // No country for global search
                  undefined, // No state for global search
                  undefined, // No city for global search
                  undefined, // No location for global search
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
              
              // Calculate engagement from available metrics (likes + comments + shares)
              const likes = parseNumberString(result.likes);
              const comments = parseNumberString(result.comments);
              const shares = parseNumberString(result.shares);
              const calculatedEngagement = likes + comments + shares;
              
              return {
                ...result,
                source: src.id,
                sourceName: displayName,
                favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
                engagement: calculatedEngagement, // Always set to 0 or calculated value
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
        if (sourceStr && sourceStr !== "web" && sources.length === 1) {
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

      // Extract dynamic domain tabs from results (for "Web" tab only)
      // Only show intent-specific tabs if:
      // 1. autoDetect is enabled, OR
      // Always show intent tabs when intent is detected (not general)
      const shouldShowIntentTabs = true;
      
      if (shouldShowIntentTabs && intent !== "general") {
        let resultsForExtraction = flatResults;
        
        // If we don't have results (e.g., when searching specific sites), perform a Google search to get results for extraction
        if (resultsForExtraction.length === 0) {
          console.log(`🔍 No results for extraction, performing Google search for intent tabs...`);
          try {
            const googleSearchResults = await searchWithSerperEnhanced({
              query: query,
              gl: countryCode || 'us',
              location: location || '',
              hl: language || 'en',
              num: 20,
              page: 1
            });
            
            if (googleSearchResults && googleSearchResults.organic) {
              resultsForExtraction = googleSearchResults.organic.map((result, index) => ({
                title: result.title,
                link: result.link,
                snippet: result.snippet,
                position: result.position || index + 1
              }));
              console.log(`✅ Got ${resultsForExtraction.length} Google results for extraction`);
            }
          } catch (error) {
            console.error('❌ Failed to get Google results for extraction:', error);
          }
        }
        
        // Extract domains from the results to create dynamic tabs, filtered by intent
        const dynamicDomains = extractDomainsFromResults(
          resultsForExtraction.slice(0, 20).map(r => ({
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

      // CONTENT FILTER: Filter out adult content from results
      flatResults = filterResults(flatResults);

      // Calculate pagination metadata
      // Serper API can return many pages, set a high limit to allow dynamic pagination
      const totalResults = limitNum * 100; // Allow up to 100 pages (2000 results)
      const totalPages = Math.ceil(totalResults / limitNum);
      const paginatedResults = flatResults;

      // Generate AI summary for first page only (for "Google" tab) and only for explanatory queries
      let summary;
      console.log(`🔍 SUMMARY DEBUG: pageNum=${pageNum}, resultsLength=${paginatedResults.length}, sourceStr="${sourceStr}"`);
      if (pageNum === 1 && paginatedResults.length > 0 && (!sourceStr || sourceStr === "google")) {
        // Import the function to check if query is explanatory
        const { isExplanatoryQuery } = await import('./lib/openrouter');
        
        if (isExplanatoryQuery(query)) {
          console.log(`✅ Query "${query}" is explanatory, generating AI summary`);
          try {
            summary = await generateSummary(query, paginatedResults, intent);
            console.log(`✅ AI summary generated successfully`);
          } catch (error) {
            console.error("Summary generation error:", error);
            // Fallback to basic summary when AI generation fails
            summary = generateBasicSummary(query, paginatedResults, intent);
            console.log(`🔄 Using basic summary fallback`);
          }
        } else {
          console.log(`❌ Query "${query}" is not explanatory, skipping AI summary completely`);
          // Don't generate any summary for non-explanatory queries
          summary = null;
        }
      } else {
        console.log(`❌ Summary not generated: pageNum=${pageNum}, resultsLength=${paginatedResults.length}, sourceStr="${sourceStr}"`);
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
        location: (locationCountry || locationCountryCode || locationState || locationCity) ? {
          country: locationCountry,
          countryCode: locationCountryCode,
          state: locationState,
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

  // Images search endpoint
  app.get("/api/search/images", async (req, res) => {
    try {
      const { query, countryCode, country, state, city, location, languageFilter = "any", limit = "20", site, page = "1" } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      // CONTENT FILTER: Check if query contains blocked adult content
      const queryFilter = filterQuery(query);
      if (!queryFilter.allowed) {
        console.log(`🚫 Blocked image search query: "${query}"`);
        return res.json({
          query,
          images: [],
          totalPages: 0,
          currentPage: 1,
          message: getBlockedMessage(),
          blocked: true,
        });
      }

      const locationCountryCode = countryCode && typeof countryCode === "string" ? countryCode : undefined;
      const locationCountry = country && typeof country === "string" ? country : undefined;
      const locationState = state && typeof state === "string" ? state : undefined;
      const locationCity = city && typeof city === "string" ? city : undefined;
      const locationString = location && typeof location === "string" ? location : undefined;
      const langFilter = languageFilter && typeof languageFilter === "string" ? languageFilter : "any";
      const limitNum = parseInt(limit as string, 10);
      const siteFilter = site && typeof site === "string" ? site : undefined;
      const pageNum = parseInt(page as string, 10) || 1;

      const cacheKey = `images:${query}:${locationCountryCode || 'global'}:${langFilter}:${limitNum}:${siteFilter || 'all'}:${pageNum}`;
      const cached = cache.get<any>(cacheKey);
      if (cached) {
        console.log(`Using cached images for "${query}" (site: ${siteFilter || 'all'}, page: ${pageNum})`);
        return res.json(cached);
      }

      const searchQueryWithSite = siteFilter ? `site:${siteFilter} ${query}` : query;
      let images = await searchImagesWithSerperEnhanced(searchQueryWithSite, limitNum, locationCountryCode, locationCountry, locationState, locationCity, undefined, langFilter);
      
      // CONTENT FILTER: Filter out adult content from image results
      images = filterResults(images);
      
      // Calculate total pages based on available results (Serper typically returns 10-20 results per page)
      const totalPages = Math.max(10, Math.ceil(images.length / limitNum));
      const response = { query, images, totalPages, currentPage: pageNum };
      cache.set(cacheKey, response, 30 * 60 * 1000);

      res.json(response);
    } catch (error) {
      console.error("Images search error:", error);
      res.status(500).json({ error: "Failed to search images" });
    }
  });

  // Videos search endpoint
  app.get("/api/search/videos", async (req, res) => {
    try {
      const { query, countryCode, country, state, city, location, languageFilter = "any", limit = "20", site, page = "1" } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      // CONTENT FILTER: Check if query contains blocked adult content
      const queryFilter = filterQuery(query);
      if (!queryFilter.allowed) {
        console.log(`🚫 Blocked video search query: "${query}"`);
        return res.json({
          query,
          videos: [],
          totalPages: 0,
          currentPage: 1,
          message: getBlockedMessage(),
          blocked: true,
        });
      }

      const locationCountryCode = countryCode && typeof countryCode === "string" ? countryCode : undefined;
      const locationCountry = country && typeof country === "string" ? country : undefined;
      const locationState = state && typeof state === "string" ? state : undefined;
      const locationCity = city && typeof city === "string" ? city : undefined;
      const locationString = location && typeof location === "string" ? location : undefined;
      const langFilter = languageFilter && typeof languageFilter === "string" ? languageFilter : "any";
      const limitNum = parseInt(limit as string, 10);
      const siteFilter = site && typeof site === "string" ? site : undefined;
      const pageNum = parseInt(page as string, 10) || 1;

      const cacheKey = `videos:${query}:${locationCountryCode || 'global'}:${langFilter}:${limitNum}:${siteFilter || 'all'}:${pageNum}`;
      const cached = cache.get<any>(cacheKey);
      if (cached) {
        console.log(`Using cached videos for "${query}" (site: ${siteFilter || 'all'}, page: ${pageNum})`);
        return res.json(cached);
      }

      const searchQueryWithSite = siteFilter ? `site:${siteFilter} ${query}` : query;
      let videos = await searchVideosWithSerperEnhanced(searchQueryWithSite, limitNum, locationCountryCode, locationCountry, locationState, locationCity, undefined, langFilter);
      
      // CONTENT FILTER: Filter out adult content from video results
      videos = filterResults(videos);
      
      // Calculate total pages based on available results (Serper typically returns 10-20 results per page)
      const totalPages = Math.max(10, Math.ceil(videos.length / limitNum));
      const response = { query, videos, totalPages, currentPage: pageNum };
      cache.set(cacheKey, response, 30 * 60 * 1000);

      res.json(response);
    } catch (error) {
      console.error("Videos search error:", error);
      res.status(500).json({ error: "Failed to search videos" });
    }
  });

  // Places search endpoint
  app.get("/api/search/places", async (req, res) => {
    try {
      const { query, countryCode, country, state, city, location, languageFilter = "any", limit = "20", site } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      // CONTENT FILTER: Check if query contains blocked adult content
      const queryFilter = filterQuery(query);
      if (!queryFilter.allowed) {
        console.log(`🚫 Blocked places search query: "${query}"`);
        return res.json({
          query,
          places: [],
          message: getBlockedMessage(),
          blocked: true,
        });
      }

      const locationCountryCode = countryCode && typeof countryCode === "string" ? countryCode : undefined;
      const locationCountry = country && typeof country === "string" ? country : undefined;
      const locationState = state && typeof state === "string" ? state : undefined;
      const locationCity = city && typeof city === "string" ? city : undefined;
      const locationString = location && typeof location === "string" ? location : undefined;
      const langFilter = languageFilter && typeof languageFilter === "string" ? languageFilter : "any";
      const limitNum = parseInt(limit as string, 10);
      const siteFilter = site && typeof site === "string" ? site : undefined;

      const cacheKey = `places:${query}:${locationCountryCode || 'global'}:${locationCity || 'none'}:${langFilter}:${limitNum}:${siteFilter || 'all'}`;
      const cached = cache.get<any>(cacheKey);
      if (cached) {
        console.log(`Using cached places for "${query}" (site: ${siteFilter || 'all'})`);
        return res.json(cached);
      }

      const searchQueryWithSite = siteFilter ? `site:${siteFilter} ${query}` : query;
      const places = await searchPlacesWithSerperEnhanced(searchQueryWithSite, limitNum, locationCountryCode, locationCountry, locationState, locationCity, undefined, langFilter);
      
      // Note: Places don't have traditional links in the same way, so we rely on SafeSearch
      // and query filtering for content protection
      
      const response = { query, places };
      cache.set(cacheKey, response, 30 * 60 * 1000);

      res.json(response);
    } catch (error) {
      console.error("Places search error:", error);
      res.status(500).json({ error: "Failed to search places" });
    }
  });

  // News search endpoint
  app.get("/api/search/news", async (req, res) => {
    try {
      const { query, countryCode, country, state, city, location, languageFilter = "any", timeFilter = "any", limit = "20", site } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      // CONTENT FILTER: Check if query contains blocked adult content
      const queryFilter = filterQuery(query);
      if (!queryFilter.allowed) {
        console.log(`🚫 Blocked news search query: "${query}"`);
        return res.json({
          query,
          news: [],
          message: getBlockedMessage(),
          blocked: true,
        });
      }

      const locationCountryCode = countryCode && typeof countryCode === "string" ? countryCode : undefined;
      const locationCountry = country && typeof country === "string" ? country : undefined;
      const locationState = state && typeof state === "string" ? state : undefined;
      const locationCity = city && typeof city === "string" ? city : undefined;
      const locationString = location && typeof location === "string" ? location : undefined;
      const langFilter = languageFilter && typeof languageFilter === "string" ? languageFilter : "any";
      const timeFilterValue = timeFilter && typeof timeFilter === "string" ? timeFilter : "any";
      const limitNum = parseInt(limit as string, 10);
      const siteFilter = site && typeof site === "string" ? site : undefined;

      const cacheKey = `news:${query}:${locationCountryCode || 'global'}:${langFilter}:${timeFilterValue}:${limitNum}:${siteFilter || 'all'}`;
      const cached = cache.get<any>(cacheKey);
      if (cached) {
        console.log(`Using cached news for "${query}" (site: ${siteFilter || 'all'})`);
        return res.json(cached);
      }

      const searchQueryWithSite = siteFilter ? `site:${siteFilter} ${query}` : query;
      let news = await searchNewsWithSerperEnhanced(searchQueryWithSite, limitNum, locationCountryCode, locationCountry, locationState, locationCity, undefined, langFilter, timeFilterValue);
      
      // CONTENT FILTER: Filter out adult content from news results
      news = filterResults(news);
      
      const response = { query, news };
      cache.set(cacheKey, response, 30 * 60 * 1000);

      res.json(response);
    } catch (error) {
      console.error("News search error:", error);
      res.status(500).json({ error: "Failed to search news" });
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

      const pageNum = parseInt(page as string, 10) || 1;
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
        const searchData = await searchWithSerperEnhanced(
          query, 
          undefined, // No site filter - get real Google results
          20, // Get more results
          pageNum, 
          locationCountryCode,
          undefined, // No country name needed for domain extraction
          undefined, // No state needed for domain extraction
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
    const { query, countryCode, country, state, city, location, languageFilter } = req.query;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    // Extract location parameters
    const locationCountryCode = countryCode && typeof countryCode === "string" ? countryCode : undefined;
    const locationCountry = country && typeof country === "string" ? country : undefined;
    const locationState = state && typeof state === "string" ? state : undefined;
    const locationCity = city && typeof city === "string" ? city : undefined;
    const locationString = location && typeof location === "string" ? location : undefined;
    const langFilter = languageFilter && typeof languageFilter === "string" ? languageFilter : "any";

    try {
      // Get suggestions from Google Autocomplete API
      const googleSuggestions = await getGoogleSuggestionsEnhanced(query, locationCountryCode, locationCountry, locationState, locationCity, undefined, langFilter);
      
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

  // Serper Locations API endpoints
  app.get("/api/locations/search", async (req, res) => {
    try {
      const { q: query, countryCode, limit = 10 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter is required" });
      }
      
      const results = searchLocations(
        query, 
        countryCode as string, 
        parseInt(limit as string)
      );
      
      res.json({ results });
    } catch (error) {
      console.error("Location search error:", error);
      res.status(500).json({ error: "Failed to search locations" });
    }
  });

  app.get("/api/locations/countries", async (req, res) => {
    try {
      const countries = getAllCountries();
      res.json({ countries });
    } catch (error) {
      console.error("Get countries error:", error);
      res.status(500).json({ error: "Failed to get countries" });
    }
  });

  app.get("/api/locations/states/:countryCode", async (req, res) => {
    try {
      const { countryCode } = req.params;
      const states = getStatesOfCountry(countryCode);
      res.json({ states });
    } catch (error) {
      console.error("Get states error:", error);
      res.status(500).json({ error: "Failed to get states" });
    }
  });

  app.get("/api/locations/cities/:countryCode/:stateName", async (req, res) => {
    try {
      const { countryCode, stateName } = req.params;
      const cities = getCitiesOfState(countryCode, stateName);
      res.json({ cities });
    } catch (error) {
      console.error("Get cities error:", error);
      res.status(500).json({ error: "Failed to get cities" });
    }
  });

  app.get("/api/locations/status", async (req, res) => {
    try {
      res.json({
        loaded: isLocationsLoaded(),
        count: getLocationsCount(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get locations status error:", error);
      res.status(500).json({ error: "Failed to get locations status" });
    }
  });

  // Initialize locations on server start
  app.get("/api/locations/init", async (req, res) => {
    try {
      await initializeLocations();
      res.json({
        success: true,
        loaded: isLocationsLoaded(),
        count: getLocationsCount(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Initialize locations error:", error);
      res.status(500).json({ error: "Failed to initialize locations" });
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
