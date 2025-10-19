interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position?: number;
  thumbnail?: string;
  imageUrl?: string;
  date?: string;
  rating?: number;
  ratingCount?: number;
  price?: string;
  sitelinks?: Array<{
    title: string;
    link: string;
  }>;
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
  results: Array<{
    title: string;
    link: string;
    snippet: string;
    position?: number;
    thumbnail?: string;
    image?: string;
    date?: string;
    rating?: number;
    ratingCount?: number;
    price?: string;
    sitelinks?: Array<{
      title: string;
      link: string;
    }>;
  }>;
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

export function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;
    
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    return domain;
  } catch (error) {
    return '';
  }
}

export function getDomainName(domain: string): string {
  const parts = domain.split('.');
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }
  return domain;
}

function isSiteOfType(domain: string, title: string, snippet: string, intent: string): boolean {
  const lowerDomain = domain.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerSnippet = snippet.toLowerCase();
  const combinedText = `${lowerDomain} ${lowerTitle} ${lowerSnippet}`;
  
  // Sites to EXCLUDE from each category
  const excludeFromShopping = ['pinterest', 'wikipedia', 'wiki', 'youtube', 'facebook', 'twitter', 'instagram'];
  const excludeFromNews = ['amazon', 'ebay', 'shop', 'store', 'alibaba', 'pinterest', 'instagram'];
  const excludeFromLearning = ['amazon', 'ebay', 'shop', 'store', 'pinterest', 'instagram', 'tiktok'];
  const excludeFromEntertainment = ['amazon', 'ebay', 'shop', 'store', 'news', 'press'];
  
  // Shopping sites patterns
  const shoppingPatterns = [
    'shop', 'store', 'buy', 'cart', 'checkout', 'price', 'product', 'sale', 'order',
    'amazon', 'ebay', 'walmart', 'alibaba', 'etsy', 'shopify', 'market', 'mall',
    'noon', 'souq', 'jarir', 'extra', 'carrefour', 'lulu', 'shein', 'fashion',
    'متجر', 'سوق', 'شراء', 'منتج', 'سعر', 'تسوق', 'طلب', 'أسعار'
  ];
  
  // News sites patterns
  const newsPatterns = [
    'news', 'press', 'media', 'times', 'post', 'daily', 'journal', 'gazette', 'herald',
    'reuters', 'cnn', 'bbc', 'bloomberg', 'aljazeera', 'alarabiya', 'skynews', 'breaking',
    'أخبار', 'صحيفة', 'جريدة', 'إخباري', 'عاجل', 'خبر'
  ];
  
  // Learning sites patterns
  const learningPatterns = [
    'wiki', 'edu', 'learn', 'course', 'tutorial', 'guide', 'university', 'academy',
    'stackoverflow', 'medium', 'coursera', 'udemy', 'khan', 'education', 'school',
    'تعليم', 'دورة', 'جامعة', 'تعلم', 'مدرسة', 'تدريب'
  ];
  
  // Entertainment sites patterns
  const entertainmentPatterns = [
    'video', 'music', 'game', 'entertainment', 'fun', 'play', 'watch', 'stream',
    'youtube', 'tiktok', 'netflix', 'spotify', 'twitch', 'instagram', 'pinterest',
    'ترفيه', 'فيديو', 'لعبة', 'موسيقى', 'مشاهدة', 'العاب'
  ];
  
  switch (intent) {
    case 'shopping':
      // Exclude non-shopping sites first
      if (excludeFromShopping.some(exclude => lowerDomain.includes(exclude))) {
        return false;
      }
      // Then check if it matches shopping patterns
      return shoppingPatterns.some(pattern => combinedText.includes(pattern));
      
    case 'news':
      // Exclude non-news sites first
      if (excludeFromNews.some(exclude => lowerDomain.includes(exclude))) {
        return false;
      }
      // Then check if it matches news patterns
      return newsPatterns.some(pattern => combinedText.includes(pattern));
      
    case 'learning':
      // Exclude non-learning sites first
      if (excludeFromLearning.some(exclude => lowerDomain.includes(exclude))) {
        return false;
      }
      // Then check if it matches learning patterns
      return learningPatterns.some(pattern => combinedText.includes(pattern));
      
    case 'entertainment':
      // Exclude non-entertainment sites first
      if (excludeFromEntertainment.some(exclude => lowerDomain.includes(exclude))) {
        return false;
      }
      // Then check if it matches entertainment patterns
      return entertainmentPatterns.some(pattern => combinedText.includes(pattern));
      
    case 'general':
    default:
      // For general, accept everything
      return true;
  }
}

export function extractDomainsFromResults(
  results: Array<{link: string, title: string, snippet?: string}>,
  intent?: string
): Array<{
  id: string;
  name: string;
  site: string;
  icon: string;
}> {
  const domainMap = new Map<string, {title: string, snippet: string, count: number}>();
  
  // Exclude major social platforms from tabs (they have their own platform tabs)
  const excludedDomains = ['google.', 'youtube.', 'twitter.', 'facebook.', 'instagram.', 'tiktok.', 'reddit.'];
  
  results.forEach((result) => {
    const domain = extractDomainFromUrl(result.link);
    const isExcluded = excludedDomains.some(excluded => domain.includes(excluded));
    
    if (domain && !isExcluded) {
      // If we have an intent, filter by site type
      if (intent && intent !== 'general') {
        const matchesIntent = isSiteOfType(domain, result.title, result.snippet || '', intent);
        if (!matchesIntent) {
          return; // Skip this result
        }
      }
      
      if (domainMap.has(domain)) {
        const existing = domainMap.get(domain)!;
        domainMap.set(domain, {
          title: existing.title,
          snippet: existing.snippet,
          count: existing.count + 1
        });
      } else {
        domainMap.set(domain, {
          title: result.title,
          snippet: result.snippet || '',
          count: 1
        });
      }
    }
  });
  
  // Sort by count (most frequent first) and take top 10
  const sortedDomains = Array.from(domainMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  
  return sortedDomains.map(([domain, data]) => {
    const domainName = getDomainName(domain);
    const capitalizedName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
    
    return {
      id: domain.replace(/\./g, '-'),
      name: capitalizedName,
      site: domain,
      icon: 'Globe'
    };
  });
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
        image: result.imageUrl || result.thumbnail,
        date: result.date,
        rating: result.rating,
        ratingCount: result.ratingCount,
        price: result.price,
        sitelinks: result.sitelinks,
      })),
      correctedQuery,
      relatedSearches,
    };
  } catch (error) {
    console.error("Serper search error:", error);
    throw error;
  }
}
