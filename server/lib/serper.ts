interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position?: number;
  thumbnail?: string;
  date?: string;
}

interface SerperResponse {
  organic?: SerperResult[];
  searchParameters?: {
    q: string;
    correctedQuery?: string;
  };
  relatedSearches?: Array<{
    query: string;
  }>;
}

export interface SerperSearchData {
  results: SerperResult[];
  correctedQuery?: string;
  relatedSearches?: string[];
}

export async function getGoogleSuggestions(query: string): Promise<string[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    // Use Google's autocomplete API
    const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Google suggestions API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Google returns an array where the second element is the suggestions array
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return data[1].slice(0, 8); // Return up to 8 suggestions
    }
    
    return [];
  } catch (error) {
    console.error("Google suggestions error:", error);
    return [];
  }
}

function detectLanguage(text: string): string {
  const arabicPattern = /[\u0600-\u06FF]/;
  const chinesePattern = /[\u4E00-\u9FFF]/;
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF]/;
  const koreanPattern = /[\uAC00-\uD7AF]/;
  const russianPattern = /[\u0400-\u04FF]/;
  
  if (arabicPattern.test(text)) return 'ar';
  if (chinesePattern.test(text)) return 'zh';
  if (japanesePattern.test(text)) return 'ja';
  if (koreanPattern.test(text)) return 'ko';
  if (russianPattern.test(text)) return 'ru';
  
  return 'en';
}

export async function searchWithSerper(
  query: string, 
  site?: string, 
  numResults: number = 10,
  page: number = 1,
  countryCode?: string,
  city?: string,
  timeFilter?: string,
  languageFilter?: string,
  fileTypeFilter?: string
): Promise<SerperSearchData> {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  // Build the search query with location and filters
  let enhancedQuery = query;
  
  // Add city to query for better local results
  if (city && city.trim()) {
    const detectedLanguage = detectLanguage(query);
    const locationKeyword = detectedLanguage === 'ar' ? 'في' : 'in';
    enhancedQuery = `${query} ${locationKeyword} ${city}`;
    console.log(`Enhanced query with city: "${query}" → "${enhancedQuery}"`);
  }
  
  // Add file type filter to query if specified
  if (fileTypeFilter && fileTypeFilter !== 'any') {
    enhancedQuery = `${enhancedQuery} filetype:${fileTypeFilter}`;
    console.log(`Added file type filter: ${fileTypeFilter}`);
  }
  
  // Don't use site filter if site is undefined or empty - get real Google results
  const searchQuery = (site && site.trim()) ? `site:${site} ${enhancedQuery}` : enhancedQuery;
  
  const detectedLanguage = detectLanguage(query);

  try {
    // Prepare request body
    const requestBody: any = {
      q: searchQuery,
      num: Math.min(numResults, 100), // Serper supports up to 100 results
      autocorrect: true,
      page: page,
      hl: languageFilter && languageFilter !== 'any' ? languageFilter : detectedLanguage,
    };

    // Add country code only if provided (no default fallback, no city)
    if (countryCode && countryCode.toLowerCase() !== 'global' && /^[a-z]{2}$/i.test(countryCode)) {
      requestBody.gl = countryCode.toLowerCase();
    }
    
    // Add time filter if specified
    if (timeFilter && timeFilter !== 'any') {
      const timeRanges: { [key: string]: string } = {
        'day': 'd',    // past day
        'week': 'w',   // past week
        'month': 'm',  // past month
        'year': 'y',   // past year
      };
      if (timeRanges[timeFilter]) {
        requestBody.tbs = `qdr:${timeRanges[timeFilter]}`;
      }
    }
    
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data: SerperResponse = await response.json();
    
    // Log search info for debugging
    const locationInfo = requestBody.gl ? ` [country=${requestBody.gl}, language=${requestBody.hl}]` : ` [language=${requestBody.hl}, global]`;
    console.log(`Serper search: "${searchQuery}"${locationInfo} - Found ${data.organic?.length || 0} results`);
    if (data.organic && data.organic.length > 0) {
      console.log(`First result: ${data.organic[0].title} - ${data.organic[0].link}`);
    }
    
    // Extract corrected query if available
    const correctedQuery = data.searchParameters?.correctedQuery;
    if (correctedQuery && correctedQuery !== query) {
      console.log(`Serper suggested correction: "${query}" → "${correctedQuery}"`);
    }
    
    // Extract related searches
    const relatedSearches = (data.relatedSearches || []).map(rs => rs.query);
    if (relatedSearches.length > 0) {
      console.log(`Related searches found: ${relatedSearches.length}`);
    }
    
    return {
      results: (data.organic || []).map((result) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        position: result.position,
        thumbnail: result.thumbnail,
        date: result.date,
      })),
      correctedQuery,
      relatedSearches,
    };
  } catch (error) {
    console.error("Serper search error:", error);
    throw error;
  }
}
