// Enhanced Serper API integration with improved location handling
import { detectLanguage } from './serper';

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

// Enhanced country code mapping
const COUNTRY_CODE_MAP: { [key: string]: string } = {
  'united states': 'us', 'usa': 'us', 'america': 'us',
  'united kingdom': 'gb', 'uk': 'gb', 'great britain': 'gb',
  'canada': 'ca', 'australia': 'au', 'germany': 'de',
  'france': 'fr', 'spain': 'es', 'italy': 'it',
  'japan': 'jp', 'china': 'cn', 'india': 'in',
  'brazil': 'br', 'mexico': 'mx', 'egypt': 'eg',
  'saudi arabia': 'sa', 'uae': 'ae', 'united arab emirates': 'ae',
  'russia': 'ru', 'south korea': 'kr', 'thailand': 'th',
  'singapore': 'sg', 'malaysia': 'my', 'indonesia': 'id',
  'philippines': 'ph', 'vietnam': 'vn', 'taiwan': 'tw',
  'hong kong': 'hk', 'south africa': 'za', 'nigeria': 'ng',
  'kenya': 'ke', 'morocco': 'ma', 'tunisia': 'tn',
  'algeria': 'dz', 'libya': 'ly', 'sudan': 'sd',
  'ethiopia': 'et', 'ghana': 'gh', 'uganda': 'ug',
  'tanzania': 'tz', 'zimbabwe': 'zw', 'botswana': 'bw',
  'namibia': 'na', 'zambia': 'zm', 'malawi': 'mw',
  'mozambique': 'mz', 'madagascar': 'mg', 'mauritius': 'mu',
  'seychelles': 'sc', 'comoros': 'km', 'djibouti': 'dj',
  'somalia': 'so', 'eritrea': 'er', 'burundi': 'bi',
  'rwanda': 'rw', 'central african republic': 'cf',
  'chad': 'td', 'niger': 'ne', 'mali': 'ml',
  'burkina faso': 'bf', 'senegal': 'sn', 'gambia': 'gm',
  'guinea-bissau': 'gw', 'guinea': 'gn', 'sierra leone': 'sl',
  'liberia': 'lr', 'ivory coast': 'ci', 'togo': 'tg',
  'benin': 'bj', 'cameroon': 'cm', 'equatorial guinea': 'gq',
  'gabon': 'ga', 'congo': 'cg', 'democratic republic of the congo': 'cd',
  'angola': 'ao', 'cabo verde': 'cv', 'sao tome and principe': 'st'
};

// Enhanced location building function
function buildLocationString(
  location?: string,
  country?: string,
  state?: string,
  city?: string
): string {
  if (location && location.trim()) {
    // Use provided location string, clean it up
    return location.trim().replace(/\s*,\s*/g, ',');
  }
  
  // Build location from parts
  const locationParts = [];
  
  if (city && city.trim()) {
    locationParts.push(city.trim());
    // Always add state when we have a city
    if (state && state.trim()) {
      locationParts.push(state.trim());
    }
  } else if (state && state.trim()) {
    // Use state directly without adding a major city
    locationParts.push(state.trim());
  }
  
  if (country && country.trim() && !locationParts.includes(country.trim())) {
    locationParts.push(country.trim());
  }
  
  return locationParts.join(',');
}

// Helper to get major city for a state when no city is specified
function getMajorCityForState(state: string, country?: string): string | undefined {
  const stateCityMap: { [key: string]: string } = {
    // US States
    'Texas': 'Houston',
    'California': 'Los Angeles',
    'Florida': 'Miami',
    'New York': 'New York',
    'Illinois': 'Chicago',
    'Pennsylvania': 'Philadelphia',
    'Ohio': 'Columbus',
    'Georgia': 'Atlanta',
    'North Carolina': 'Charlotte',
    'Michigan': 'Detroit',
    'New Jersey': 'Newark',
    'Virginia': 'Virginia Beach',
    'Washington': 'Seattle',
    'Arizona': 'Phoenix',
    'Massachusetts': 'Boston',
    'Tennessee': 'Nashville',
    'Indiana': 'Indianapolis',
    'Missouri': 'Kansas City',
    'Maryland': 'Baltimore',
    'Wisconsin': 'Milwaukee',
    'Colorado': 'Denver',
    'Minnesota': 'Minneapolis',
    'South Carolina': 'Columbia',
    'Alabama': 'Birmingham',
    'Louisiana': 'New Orleans',
    'Kentucky': 'Louisville',
    'Oregon': 'Portland',
    'Oklahoma': 'Oklahoma City',
    'Connecticut': 'Bridgeport',
    'Utah': 'Salt Lake City',
    'Iowa': 'Des Moines',
    'Nevada': 'Las Vegas',
    'Arkansas': 'Little Rock',
    'Mississippi': 'Jackson',
    'Kansas': 'Wichita',
    'New Mexico': 'Albuquerque',
    'Nebraska': 'Omaha',
    'West Virginia': 'Charleston',
    'Idaho': 'Boise',
    'Hawaii': 'Honolulu',
    'New Hampshire': 'Manchester',
    'Maine': 'Portland',
    'Montana': 'Billings',
    'Rhode Island': 'Providence',
    'Delaware': 'Wilmington',
    'South Dakota': 'Sioux Falls',
    'North Dakota': 'Fargo',
    'Alaska': 'Anchorage',
    'Vermont': 'Burlington',
    'Wyoming': 'Cheyenne',
  };
  
  return stateCityMap[state] || undefined;
}

// Enhanced country code resolution
function resolveCountryCode(countryCode?: string, country?: string): string | undefined {
  if (countryCode && countryCode.toLowerCase() !== 'global' && /^[a-z]{2}$/i.test(countryCode)) {
    return countryCode.toLowerCase();
  }
  
  if (country) {
    const normalizedCountry = country.toLowerCase().trim();
    const mappedCode = COUNTRY_CODE_MAP[normalizedCountry];
    if (mappedCode) {
      console.log(`🌍 Country code mapped: ${country} -> ${mappedCode}`);
      return mappedCode;
    }
  }
  
  return undefined;
}

// Enhanced search function with improved location handling
export async function searchWithSerperEnhanced(
  query: string, 
  site?: string, 
  numResults: number = 10,
  page: number = 1,
  countryCode?: string,
  country?: string,
  state?: string,
  city?: string,
  location?: string,
  timeFilter?: string,
  languageFilter?: string,
  fileTypeFilter?: string
): Promise<SerperSearchData> {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  // Build the search query with filters
  let enhancedQuery = query;
  
  if (fileTypeFilter && fileTypeFilter !== 'any') {
    enhancedQuery = `${enhancedQuery} filetype:${fileTypeFilter}`;
    console.log(`Added file type filter: ${fileTypeFilter}`);
  }
  
  const searchQuery = (site && site.trim()) ? `site:${site} ${enhancedQuery}` : enhancedQuery;
  const detectedLanguage = detectLanguage(query);

  try {
    // Prepare request body
    const requestBody: any = {
      q: searchQuery,
      num: Math.min(numResults, 100),
      autocorrect: true,
      page: page,
      hl: languageFilter && languageFilter !== 'any' ? languageFilter : detectedLanguage,
    };

    // COUNTRY CODE (gl parameter) - REQUIRED for localized search
    const finalCountryCode = resolveCountryCode(countryCode, country);
    if (finalCountryCode) {
      requestBody.gl = finalCountryCode;
      console.log(`🌍 Country code set: ${finalCountryCode}`);
    }
    
    // LOCATION PARAMETER - Build precise location string
    // Always use buildLocationString to ensure proper city fallback for states
    const locationString = buildLocationString(undefined, country, state, city);
    if (locationString) {
      requestBody.location = locationString;
      console.log(`🎯 FINAL LOCATION PARAMETER: "${requestBody.location}"`);
    }
    
    // Log final request parameters
    console.log(`🔍 ENHANCED SEARCH REQUEST:`, {
      query: requestBody.q,
      gl: requestBody.gl,
      location: requestBody.location,
      hl: requestBody.hl
    });
    
    // Add time filter if specified
    if (timeFilter && timeFilter !== 'any') {
      const timeRanges: { [key: string]: string } = {
        'day': 'd', 'week': 'w', 'month': 'm', 'year': 'y',
      };
      if (timeRanges[timeFilter]) {
        requestBody.tbs = `qdr:${timeRanges[timeFilter]}`;
      }
    }
    
    // ALWAYS enable strict safe search
    requestBody.safe = 'active';
    
    console.log(`🚀 Sending request to Serper API:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
    }

    const data: SerperResponse = await response.json();
    console.log(`🔍 SERPER RAW RESPONSE:`, JSON.stringify(data, null, 2));

    // Transform results
    const results = (data.organic || []).map((item, index) => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      position: item.position || index + 1,
      thumbnail: item.thumbnail,
      image: item.imageUrl,
      date: item.date,
      rating: item.rating,
      ratingCount: item.ratingCount,
      price: item.price,
      sitelinks: item.sitelinks,
    }));

    console.log(`✅ Enhanced search completed: Found ${results.length} results`);
    
    return {
      results,
      correctedQuery: data.searchParameters?.correctedQuery,
      relatedSearches: data.relatedSearches?.map(s => s.query) || [],
    };

  } catch (error) {
    console.error('Enhanced Serper search error:', error);
    throw error;
  }
}

// Enhanced videos search function
export async function searchVideosWithSerperEnhanced(
  query: string,
  numResults: number = 20,
  countryCode?: string,
  country?: string,
  state?: string,
  city?: string,
  location?: string,
  languageFilter?: string
): Promise<Array<{
  title: string;
  link: string;
  snippet: string;
  thumbnail?: string;
  duration?: string;
  views?: string;
  channel?: string;
  date?: string;
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

    // COUNTRY CODE (gl parameter) - REQUIRED for localized search
    const finalCountryCode = resolveCountryCode(countryCode, country);
    if (finalCountryCode) {
      requestBody.gl = finalCountryCode;
      console.log(`🌍 Videos - Country code set: ${finalCountryCode}`);
    }
    
    // LOCATION PARAMETER - Build precise location string
    const locationString = buildLocationString(undefined, country, state, city);
    if (locationString) {
      requestBody.location = locationString;
      console.log(`🎯 Videos - FINAL LOCATION PARAMETER: "${requestBody.location}"`);
    }
    
    // Log final request parameters
    console.log(`🔍 ENHANCED VIDEOS SEARCH REQUEST:`, {
      query: requestBody.q,
      gl: requestBody.gl,
      location: requestBody.location,
      hl: requestBody.hl
    });
    
    // ALWAYS enable strict safe search
    requestBody.safe = 'active';
    
    console.log(`🚀 Sending videos request to Serper API:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://google.serper.dev/videos', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Serper Videos API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🔍 SERPER VIDEOS RAW RESPONSE:`, JSON.stringify(data, null, 2));

    // Transform video results
    const results = (data.videos || []).map((video: any, index: number) => ({
      title: video.title || `Video ${index + 1}`,
      link: video.link || '',
      snippet: video.snippet || '',
      thumbnail: video.thumbnail,
      duration: video.duration,
      views: video.views,
      channel: video.channel,
      date: video.date,
    }));

    console.log(`✅ Enhanced videos search completed: Found ${results.length} results`);
    
    return results;

  } catch (error) {
    console.error('Enhanced Serper videos search error:', error);
    throw error;
  }
}

// Enhanced places search function
export async function searchPlacesWithSerperEnhanced(
  query: string,
  numResults: number = 20,
  countryCode?: string,
  country?: string,
  state?: string,
  city?: string,
  location?: string,
  languageFilter?: string
): Promise<Array<{
  title: string;
  link: string;
  snippet: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  price?: string;
  hours?: string;
  phone?: string;
  website?: string;
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

    // COUNTRY CODE (gl parameter) - REQUIRED for localized search
    const finalCountryCode = resolveCountryCode(countryCode, country);
    if (finalCountryCode) {
      requestBody.gl = finalCountryCode;
      console.log(`🌍 Places - Country code set: ${finalCountryCode}`);
    }
    
    // LOCATION PARAMETER - Build precise location string
    const locationString = buildLocationString(undefined, country, state, city);
    if (locationString) {
      requestBody.location = locationString;
      console.log(`🎯 Places - FINAL LOCATION PARAMETER: "${requestBody.location}"`);
    }
    
    // Log final request parameters
    console.log(`🔍 ENHANCED PLACES SEARCH REQUEST:`, {
      query: requestBody.q,
      gl: requestBody.gl,
      location: requestBody.location,
      hl: requestBody.hl
    });
    
    // ALWAYS enable strict safe search
    requestBody.safe = 'active';
    
    console.log(`🚀 Sending places request to Serper API:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Serper Places API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🔍 SERPER PLACES RAW RESPONSE:`, JSON.stringify(data, null, 2));

    // Transform places results
    const results = (data.places || []).map((place: any, index: number) => ({
      title: place.title || `Place ${index + 1}`,
      link: place.link || '',
      snippet: place.snippet || '',
      address: place.address,
      rating: place.rating,
      ratingCount: place.ratingCount,
      price: place.price,
      hours: place.hours,
      phone: place.phone,
      website: place.website,
      thumbnail: place.thumbnail,
    }));

    console.log(`✅ Enhanced places search completed: Found ${results.length} results`);
    
    return results;

  } catch (error) {
    console.error('Enhanced Serper places search error:', error);
    throw error;
  }
}

// Enhanced news search function
export async function searchNewsWithSerperEnhanced(
  query: string,
  numResults: number = 20,
  countryCode?: string,
  country?: string,
  state?: string,
  city?: string,
  location?: string,
  languageFilter?: string,
  timeFilter?: string
): Promise<Array<{
  title: string;
  link: string;
  snippet: string;
  date?: string;
  source?: string;
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

    // COUNTRY CODE (gl parameter) - REQUIRED for localized search
    const finalCountryCode = resolveCountryCode(countryCode, country);
    if (finalCountryCode) {
      requestBody.gl = finalCountryCode;
      console.log(`🌍 News - Country code set: ${finalCountryCode}`);
    }
    
    // LOCATION PARAMETER - Build precise location string
    const locationString = buildLocationString(undefined, country, state, city);
    if (locationString) {
      requestBody.location = locationString;
      console.log(`🎯 News - FINAL LOCATION PARAMETER: "${requestBody.location}"`);
    }
    
    // Add time filter if specified
    if (timeFilter && timeFilter !== 'any') {
      const timeRanges: { [key: string]: string } = {
        'day': 'd', 'week': 'w', 'month': 'm', 'year': 'y',
      };
      if (timeRanges[timeFilter]) {
        requestBody.tbs = `qdr:${timeRanges[timeFilter]}`;
      }
    }
    
    // Log final request parameters
    console.log(`🔍 ENHANCED NEWS SEARCH REQUEST:`, {
      query: requestBody.q,
      gl: requestBody.gl,
      location: requestBody.location,
      hl: requestBody.hl,
      tbs: requestBody.tbs
    });
    
    // ALWAYS enable strict safe search
    requestBody.safe = 'active';
    
    console.log(`🚀 Sending news request to Serper API:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Serper News API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🔍 SERPER NEWS RAW RESPONSE:`, JSON.stringify(data, null, 2));

    // Transform news results
    const results = (data.news || []).map((news: any, index: number) => ({
      title: news.title || `News ${index + 1}`,
      link: news.link || '',
      snippet: news.snippet || '',
      date: news.date,
      source: news.source,
      thumbnail: news.thumbnail,
    }));

    console.log(`✅ Enhanced news search completed: Found ${results.length} results`);
    
    return results;

  } catch (error) {
    console.error('Enhanced Serper news search error:', error);
    throw error;
  }
}

// Enhanced Google suggestions function
export async function getGoogleSuggestionsEnhanced(
  query: string,
  countryCode?: string,
  country?: string,
  state?: string,
  city?: string,
  location?: string,
  languageFilter?: string
): Promise<string[]> {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  const detectedLanguage = detectLanguage(query);

  try {
    const requestBody: any = {
      q: query,
      hl: languageFilter && languageFilter !== 'any' ? languageFilter : detectedLanguage,
    };

    // COUNTRY CODE (gl parameter) - REQUIRED for localized search
    const finalCountryCode = resolveCountryCode(countryCode, country);
    if (finalCountryCode) {
      requestBody.gl = finalCountryCode;
      console.log(`🌍 Suggestions - Country code set: ${finalCountryCode}`);
    }
    
    // LOCATION PARAMETER - Build precise location string
    const locationString = buildLocationString(undefined, country, state, city);
    if (locationString) {
      requestBody.location = locationString;
      console.log(`🎯 Suggestions - FINAL LOCATION PARAMETER: "${requestBody.location}"`);
    }
    
    // Log final request parameters
    console.log(`🔍 ENHANCED SUGGESTIONS REQUEST:`, {
      query: requestBody.q,
      gl: requestBody.gl,
      location: requestBody.location,
      hl: requestBody.hl
    });
    
    // ALWAYS enable strict safe search
    requestBody.safe = 'active';
    
    console.log(`🚀 Sending suggestions request to Serper API:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://google.serper.dev/autocomplete', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Serper Autocomplete API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🔍 SERPER SUGGESTIONS RAW RESPONSE:`, JSON.stringify(data, null, 2));

    // Transform suggestions results
    const results = (data.suggestions || []).map((suggestion: any) => suggestion.suggestion || suggestion);

    console.log(`✅ Enhanced suggestions search completed: Found ${results.length} results`);
    
    return results;

  } catch (error) {
    console.error('Enhanced Serper suggestions search error:', error);
    throw error;
  }
}

// Enhanced images search function
export async function searchImagesWithSerperEnhanced(
  query: string,
  numResults: number = 20,
  countryCode?: string,
  country?: string,
  state?: string,
  city?: string,
  location?: string,
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

    // COUNTRY CODE (gl parameter) - REQUIRED for localized search
    const finalCountryCode = resolveCountryCode(countryCode, country);
    if (finalCountryCode) {
      requestBody.gl = finalCountryCode;
      console.log(`🌍 Images - Country code set: ${finalCountryCode}`);
    }
    
    // LOCATION PARAMETER - Build precise location string
    const locationString = buildLocationString(undefined, country, state, city);
    if (locationString) {
      requestBody.location = locationString;
      console.log(`🎯 Images - FINAL LOCATION PARAMETER: "${requestBody.location}"`);
    }
    
    // Log final request parameters
    console.log(`🔍 ENHANCED IMAGES SEARCH REQUEST:`, {
      query: requestBody.q,
      gl: requestBody.gl,
      location: requestBody.location,
      hl: requestBody.hl
    });
    
    // ALWAYS enable strict safe search
    requestBody.safe = 'active';
    
    console.log(`🚀 Sending images request to Serper API:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Serper Images API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`🔍 SERPER IMAGES RAW RESPONSE:`, JSON.stringify(data, null, 2));

    // Transform image results
    const results = (data.images || []).map((image: any, index: number) => ({
      title: image.title || `Image ${index + 1}`,
      imageUrl: image.imageUrl || '',
      link: image.link || '',
      source: image.source || '',
      thumbnail: image.thumbnail,
      width: image.width,
      height: image.height,
    }));

    console.log(`✅ Enhanced images search completed: Found ${results.length} results`);
    
    return results;

  } catch (error) {
    console.error('Enhanced Serper images search error:', error);
    throw error;
  }
}
