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
  };
}

export async function searchWithSerper(
  query: string, 
  site?: string, 
  numResults: number = 10,
  page: number = 1,
  countryCode?: string,
  city?: string
): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  // Don't use site filter if site is undefined or empty - get real Google results
  const searchQuery = (site && site.trim()) ? `site:${site} ${query}` : query;

  try {
    // Prepare request body
    const requestBody: any = {
      q: searchQuery,
      num: Math.min(numResults, 100), // Serper supports up to 100 results
      autocorrect: true,
      page: page,
    };

    // Add location parameters if provided (only valid two-letter country codes)
    if (countryCode && /^[a-z]{2}$/i.test(countryCode)) {
      requestBody.gl = countryCode.toLowerCase();
    }
    if (city && city.trim()) {
      requestBody.location = city.trim();
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
    const locationInfo = countryCode || city ? ` [Location: ${city || ''}, ${countryCode || ''}]` : '';
    console.log(`Serper search: "${searchQuery}"${locationInfo} - Found ${data.organic?.length || 0} results`);
    if (data.organic && data.organic.length > 0) {
      console.log(`First result: ${data.organic[0].title} - ${data.organic[0].link}`);
    }
    
    return (data.organic || []).map((result) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      position: result.position,
      thumbnail: result.thumbnail,
      date: result.date,
    }));
  } catch (error) {
    console.error("Serper search error:", error);
    throw error;
  }
}
