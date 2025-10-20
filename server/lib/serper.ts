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
  // Additional social/engagement metrics that may be in rich snippets
  attributes?: Record<string, string | number>;
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
  searchInformation?: {
    showingResultsFor?: string;
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
    views?: number | string;
    likes?: number | string;
    comments?: number | string;
    shares?: number | string;
    subscribers?: number | string;
    followers?: number | string;
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
  
  // Known major sites for each category (allow lists)
  const knownShoppingSites = [
    'amazon', 'ebay', 'walmart', 'alibaba', 'aliexpress', 'etsy', 'shopify', 'target',
    'bestbuy', 'homedepot', 'lowes', 'costco', 'macys', 'kohls', 'wayfair', 'overstock',
    'noon', 'souq', 'jarir', 'extra', 'carrefour', 'lulu', 'shein', 'zara', 'h&m',
    'nike', 'adidas', 'ikea', 'sephora', 'ulta', 'nordstrom', 'newegg'
  ];
  
  const knownNewsSites = [
    'cnn', 'bbc', 'reuters', 'bloomberg', 'foxnews', 'nytimes', 'washingtonpost',
    'theguardian', 'theatlantic', 'forbes', 'fortune', 'wsj', 'usatoday', 'nbcnews',
    'abcnews', 'cbsnews', 'apnews', 'politico', 'thehill', 'npr', 'pbs', 'vice',
    'aljazeera', 'alarabiya', 'skynews', 'france24', 'dw', 'rt', 'sputnik',
    'youm7', 'elwatan', 'almostshar', 'almasryalyoum', 'alyaum', 'okaz', 'alriyadh'
  ];
  
  const knownLearningSites = [
    'wikipedia', 'wikihow', 'britannica', 'stackoverflow', 'stackexchange', 'github',
    'medium', 'dev.to', 'freecodecamp', 'w3schools', 'mdn', 'geeksforgeeks',
    'coursera', 'udemy', 'edx', 'khanacademy', 'skillshare', 'pluralsight', 'linkedin.com/learning',
    'mit.edu', 'stanford.edu', 'harvard.edu', 'yale.edu', 'oxford.ac.uk', 'cambridge.org',
    'edraak', 'rwaq', 'maharatech'
  ];
  
  const knownEntertainmentSites = [
    'youtube', 'tiktok', 'netflix', 'hulu', 'disneyplus', 'primevideo', 'hbomax',
    'spotify', 'applemusic', 'soundcloud', 'twitch', 'mixer', 'dlive',
    'instagram', 'pinterest', 'tumblr', 'deviantart', 'artstation',
    'ign', 'gamespot', 'kotaku', 'polygon', 'steam', 'epicgames', 'playstation', 'xbox'
  ];
  
  // Sites to EXCLUDE from each category
  const excludeFromShopping = ['pinterest', 'wikipedia', 'wiki', 'youtube', 'facebook', 'twitter', 'instagram', 'news', 'press'];
  const excludeFromNews = ['amazon', 'ebay', 'shop', 'store', 'alibaba', 'pinterest', 'instagram', 'game'];
  const excludeFromLearning = ['amazon', 'ebay', 'shop', 'store', 'pinterest', 'instagram', 'tiktok', 'game'];
  const excludeFromEntertainment = ['amazon', 'ebay', 'shop', 'store', 'news', 'press'];
  
  // Fallback patterns for sites not in the allow lists
  const shoppingPatterns = [
    'shop', 'store', 'buy', 'cart', 'checkout', 'price', 'product', 'sale', 'order', 'mall',
    'متجر', 'سوق', 'شراء', 'منتج', 'سعر', 'تسوق', 'طلب', 'أسعار'
  ];
  
  const newsPatterns = [
    'news', 'press', 'media', 'times', 'post', 'daily', 'journal', 'gazette', 'herald', 'tribune',
    'أخبار', 'صحيفة', 'جريدة', 'إخباري', 'عاجل', 'خبر'
  ];
  
  const learningPatterns = [
    '.edu', 'learn', 'course', 'tutorial', 'guide', 'university', 'academy', 'school', 'education',
    'تعليم', 'دورة', 'جامعة', 'تعلم', 'مدرسة', 'تدريب'
  ];
  
  const entertainmentPatterns = [
    'video', 'music', 'game', 'entertainment', 'fun', 'play', 'watch', 'stream', 'gaming',
    'ترفيه', 'فيديو', 'لعبة', 'موسيقى', 'مشاهدة', 'العاب'
  ];
  
  switch (intent) {
    case 'shopping':
      // Check if in known shopping sites first
      if (knownShoppingSites.some(site => lowerDomain.includes(site))) {
        return true;
      }
      // Exclude non-shopping sites
      if (excludeFromShopping.some(exclude => lowerDomain.includes(exclude))) {
        return false;
      }
      // Check patterns as fallback
      return shoppingPatterns.some(pattern => combinedText.includes(pattern));
      
    case 'news':
      // Check if in known news sites first
      if (knownNewsSites.some(site => lowerDomain.includes(site))) {
        return true;
      }
      // Exclude non-news sites
      if (excludeFromNews.some(exclude => lowerDomain.includes(exclude))) {
        return false;
      }
      // Check patterns as fallback
      return newsPatterns.some(pattern => combinedText.includes(pattern));
      
    case 'learning':
      // Check if in known learning sites first
      if (knownLearningSites.some(site => lowerDomain.includes(site))) {
        return true;
      }
      // Exclude non-learning sites
      if (excludeFromLearning.some(exclude => lowerDomain.includes(exclude))) {
        return false;
      }
      // Check patterns as fallback
      return learningPatterns.some(pattern => combinedText.includes(pattern));
      
    case 'entertainment':
      // Check if in known entertainment sites first
      if (knownEntertainmentSites.some(site => lowerDomain.includes(site))) {
        return true;
      }
      // Exclude non-entertainment sites
      if (excludeFromEntertainment.some(exclude => lowerDomain.includes(exclude))) {
        return false;
      }
      // Check patterns as fallback
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
  country?: string,
  city?: string,
  timeFilter?: string,
  languageFilter?: string,
  fileTypeFilter?: string
): Promise<SerperSearchData> {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  // Build the search query with filters (no city concatenation)
  let enhancedQuery = query;
  
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

    // Add country code only if provided (no default fallback)
    if (countryCode && countryCode.toLowerCase() !== 'global' && /^[a-z]{2}$/i.test(countryCode)) {
      requestBody.gl = countryCode.toLowerCase();
    }
    
    // Add location (city) with country for more accurate results
    // Serper API works best with format: "City, Country"
    if (city && city.trim()) {
      if (country && country.trim()) {
        // Format: "Cairo, Egypt" - Most accurate
        requestBody.location = `${city.trim()}, ${country.trim()}`;
        console.log(`Location parameter set: ${city}, ${country}`);
      } else {
        // Fallback: Just city name if country not provided
        requestBody.location = city.trim();
        console.log(`Location parameter set: ${city} (no country specified)`);
      }
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
    
    // ALWAYS enable strict safe search to block adult content
    requestBody.safe = 'active';
    
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
    
    // Log RAW response to see all available fields
    console.log('🔍 SERPER RAW RESPONSE:', JSON.stringify(data, null, 2));
    
    // Log search info for debugging
    let locationInfo = `[language=${requestBody.hl}`;
    if (requestBody.gl) locationInfo += `, country=${requestBody.gl}`;
    if (requestBody.location) locationInfo += `, location=${requestBody.location}`;
    locationInfo += requestBody.gl || requestBody.location ? ']' : ', global]';
    console.log(`Serper search: "${searchQuery}" ${locationInfo} - Found ${data.organic?.length || 0} results`);
    if (data.organic && data.organic.length > 0) {
      console.log(`First result: ${data.organic[0].title} - ${data.organic[0].link}`);
    }
    
    // Extract corrected query if available (from searchInformation.showingResultsFor or searchParameters.correctedQuery)
    const correctedQuery = data.searchInformation?.showingResultsFor || data.searchParameters?.correctedQuery;
    if (correctedQuery && correctedQuery !== query) {
      console.log(`Serper suggested correction: "${query}" → "${correctedQuery}"`);
    }
    
    // Extract related searches
    const relatedSearches = (data.relatedSearches || []).map(rs => rs.query);
    if (relatedSearches.length > 0) {
      console.log(`Related searches found: ${relatedSearches.length}`);
    }
    
    return {
      results: (data.organic || []).map((result) => {
        // Extract social metrics from attributes if available
        const attrs = result.attributes || {};
        
        return {
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
          // Extract social/engagement metrics from attributes or direct fields
          views: attrs.views || attrs.Views || undefined,
          likes: attrs.likes || attrs.Likes || undefined,
          comments: attrs.comments || attrs.Comments || undefined,
          shares: attrs.shares || attrs.Shares || undefined,
          subscribers: attrs.subscribers || attrs.Subscribers || undefined,
          followers: attrs.followers || attrs.Followers || undefined,
          sitelinks: result.sitelinks,
        };
      }),
      correctedQuery,
      relatedSearches,
    };
  } catch (error) {
    console.error("Serper search error:", error);
    throw error;
  }
}

export async function searchImagesWithSerper(
  query: string,
  numResults: number = 20,
  countryCode?: string,
  languageFilter?: string
): Promise<Array<{
  title: string;
  imageUrl: string;
  link: string;
  source: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}>> {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  const detectedLanguage = detectLanguage(query);

  try {
    const requestBody: any = {
      q: query,
      num: Math.min(numResults, 100),
      hl: languageFilter && languageFilter !== 'any' ? languageFilter : detectedLanguage,
    };

    if (countryCode && countryCode.toLowerCase() !== 'global' && /^[a-z]{2}$/i.test(countryCode)) {
      requestBody.gl = countryCode.toLowerCase();
    }

    // ALWAYS enable strict safe search to block adult content
    requestBody.safe = 'active';

    const response = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Serper Images API error: ${response.status}`);
    }

    const data: any = await response.json();
    console.log(`Serper images: "${query}" - Found ${data.images?.length || 0} results`);
    
    return (data.images || []).map((img: any) => ({
      title: img.title || '',
      imageUrl: img.imageUrl,
      link: img.link,
      source: extractDomainFromUrl(img.link),
      thumbnail: img.thumbnailUrl,
      width: img.imageWidth,
      height: img.imageHeight,
    }));
  } catch (error) {
    console.error("Serper images error:", error);
    throw error;
  }
}

export async function searchVideosWithSerper(
  query: string,
  numResults: number = 20,
  countryCode?: string,
  languageFilter?: string
): Promise<Array<{
  title: string;
  link: string;
  snippet?: string;
  source: string;
  thumbnail?: string;
  duration?: string;
  channel?: string;
  date?: string;
  views?: string;
}>> {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  const detectedLanguage = detectLanguage(query);

  try {
    const requestBody: any = {
      q: query,
      num: Math.min(numResults, 100),
      hl: languageFilter && languageFilter !== 'any' ? languageFilter : detectedLanguage,
    };

    if (countryCode && countryCode.toLowerCase() !== 'global' && /^[a-z]{2}$/i.test(countryCode)) {
      requestBody.gl = countryCode.toLowerCase();
    }

    // ALWAYS enable strict safe search to block adult content
    requestBody.safe = 'active';

    const response = await fetch("https://google.serper.dev/videos", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Serper Videos API error: ${response.status}`);
    }

    const data: any = await response.json();
    
    // Log RAW response to see all available fields
    console.log('🎥 SERPER VIDEOS RAW RESPONSE:', JSON.stringify(data, null, 2));
    
    console.log(`Serper videos: "${query}" - Found ${data.videos?.length || 0} results`);
    
    return (data.videos || []).map((video: any) => ({
      title: video.title || '',
      link: video.link,
      snippet: video.snippet,
      source: extractDomainFromUrl(video.link),
      thumbnail: video.imageUrl,
      duration: video.duration,
      channel: video.channel,
      date: video.date,
      views: video.views,
      likes: video.likes,
      comments: video.comments,
      subscribers: video.subscribers,
    }));
  } catch (error) {
    console.error("Serper videos error:", error);
    throw error;
  }
}

export async function searchPlacesWithSerper(
  query: string,
  numResults: number = 20,
  countryCode?: string,
  city?: string,
  languageFilter?: string
): Promise<Array<{
  title: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  type?: string;
  phone?: string;
  website?: string;
  thumbnail?: string;
  cid?: string;
  googleMapsUrl?: string;
}>> {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  let enhancedQuery = query;
  if (city && city.trim()) {
    const detectedLanguage = detectLanguage(query);
    const locationKeyword = detectedLanguage === 'ar' ? 'في' : 'in';
    enhancedQuery = `${query} ${locationKeyword} ${city}`;
  }

  const detectedLanguage = detectLanguage(query);

  try {
    const requestBody: any = {
      q: enhancedQuery,
      num: Math.min(numResults, 100),
      hl: languageFilter && languageFilter !== 'any' ? languageFilter : detectedLanguage,
    };

    if (countryCode && countryCode.toLowerCase() !== 'global' && /^[a-z]{2}$/i.test(countryCode)) {
      requestBody.gl = countryCode.toLowerCase();
    }

    // ALWAYS enable strict safe search to block adult content
    requestBody.safe = 'active';

    const response = await fetch("https://google.serper.dev/places", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Serper Places API error: ${response.status}`);
    }

    const data: any = await response.json();
    console.log(`Serper places: "${enhancedQuery}" - Found ${data.places?.length || 0} results`);
    
    return (data.places || []).map((place: any) => ({
      title: place.title || '',
      address: place.address,
      rating: place.rating,
      ratingCount: place.ratingCount,
      type: place.type,
      phone: place.phoneNumber,
      website: place.website,
      thumbnail: place.thumbnail,
      cid: place.cid,
      googleMapsUrl: place.cid ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title)}&query_place_id=${place.cid}` : undefined,
    }));
  } catch (error) {
    console.error("Serper places error:", error);
    throw error;
  }
}

export async function searchNewsWithSerper(
  query: string,
  numResults: number = 20,
  countryCode?: string,
  languageFilter?: string,
  timeFilter?: string
): Promise<Array<{
  title: string;
  link: string;
  snippet: string;
  source: string;
  date?: string;
  thumbnail?: string;
}>> {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  const detectedLanguage = detectLanguage(query);

  try {
    const requestBody: any = {
      q: query,
      num: Math.min(numResults, 100),
      hl: languageFilter && languageFilter !== 'any' ? languageFilter : detectedLanguage,
    };

    if (countryCode && countryCode.toLowerCase() !== 'global' && /^[a-z]{2}$/i.test(countryCode)) {
      requestBody.gl = countryCode.toLowerCase();
    }

    if (timeFilter && timeFilter !== 'any') {
      const timeRanges: { [key: string]: string } = {
        'day': 'd',
        'week': 'w',
        'month': 'm',
        'year': 'y',
      };
      if (timeRanges[timeFilter]) {
        requestBody.tbs = `qdr:${timeRanges[timeFilter]}`;
      }
    }

    // ALWAYS enable strict safe search to block adult content
    requestBody.safe = 'active';

    const response = await fetch("https://google.serper.dev/news", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Serper News API error: ${response.status}`);
    }

    const data: any = await response.json();
    console.log(`Serper news: "${query}" - Found ${data.news?.length || 0} results`);
    
    return (data.news || []).map((article: any) => ({
      title: article.title || '',
      link: article.link,
      snippet: article.snippet || '',
      source: article.source || extractDomainFromUrl(article.link),
      date: article.date,
      thumbnail: article.imageUrl,
    }));
  } catch (error) {
    console.error("Serper news error:", error);
    throw error;
  }
}
