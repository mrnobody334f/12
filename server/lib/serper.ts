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
  numResults: number = 10
): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured");
  }

  const searchQuery = site ? `site:${site} ${query}` : query;

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: searchQuery,
        num: Math.min(numResults, 10), // Serper API supports max 10 results per request
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data: SerperResponse = await response.json();
    
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
