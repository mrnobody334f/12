import type { IntentType, AISummary, SearchResult } from "@shared/schema";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callOpenRouter(messages: OpenRouterMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://novasearch.app",
        "X-Title": "NovaSearch",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenRouter API error:", error);
    throw error;
  }
}

// Fallback keyword-based intent detection
function detectIntentByKeywords(query: string): IntentType {
  const lowerQuery = query.toLowerCase();
  
  // Shopping keywords with weights (higher weight = more specific to shopping)
  const shoppingPatterns = [
    { pattern: /\b(buy|purchase|shop|order)\b/i, weight: 3 },
    { pattern: /\b(price|cost|cheap|expensive|affordable)\b/i, weight: 2.5 },
    { pattern: /\b(deal|sale|discount|offer|coupon)\b/i, weight: 2.5 },
    { pattern: /\b(store|market|mall|retail)\b/i, weight: 2 },
    { pattern: /\b(product|item|merchandise)\b/i, weight: 2 },
    { pattern: /\b(review|compare|best|top|vs)\b/i, weight: 1.5 },
    { pattern: /\b(اشتري|شراء|سعر|متجر|منتج|أفضل)\b/i, weight: 3 }
  ];
  
  // News keywords
  const newsPatterns = [
    { pattern: /\b(news|latest|breaking|headline)\b/i, weight: 3 },
    { pattern: /\b(today|yesterday|tomorrow|current)\b/i, weight: 2 },
    { pattern: /\b(update|report|announce|develop)\b/i, weight: 2.5 },
    { pattern: /\b(recent|new|just|now)\b/i, weight: 1.5 },
    { pattern: /\b(أخبار|جديد|اليوم|عاجل)\b/i, weight: 3 }
  ];
  
  // Learning keywords
  const learningPatterns = [
    { pattern: /\b(how to|tutorial|guide)\b/i, weight: 3 },
    { pattern: /\b(learn|study|course|education)\b/i, weight: 2.5 },
    { pattern: /\b(what is|explain|definition|meaning)\b/i, weight: 2.5 },
    { pattern: /\b(teach|training|lesson|class)\b/i, weight: 2 },
    { pattern: /\b(كيف|تعلم|شرح|دورة|درس)\b/i, weight: 3 }
  ];
  
  // Entertainment keywords
  const entertainmentPatterns = [
    { pattern: /\b(video|movie|film|cinema)\b/i, weight: 2.5 },
    { pattern: /\b(music|song|album|artist)\b/i, weight: 2.5 },
    { pattern: /\b(watch|stream|play|download)\b/i, weight: 2 },
    { pattern: /\b(episode|series|show|season)\b/i, weight: 2.5 },
    { pattern: /\b(funny|comedy|meme|viral)\b/i, weight: 2 },
    { pattern: /\b(trending|popular|hit)\b/i, weight: 1.5 },
    { pattern: /\b(فيديو|فيلم|أغنية|مشاهدة|تحميل)\b/i, weight: 2.5 }
  ];
  
  // Calculate scores for each intent
  const scores = {
    shopping: 0,
    news: 0,
    learning: 0,
    entertainment: 0,
    general: 0
  };
  
  shoppingPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(lowerQuery)) scores.shopping += weight;
  });
  
  newsPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(lowerQuery)) scores.news += weight;
  });
  
  learningPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(lowerQuery)) scores.learning += weight;
  });
  
  entertainmentPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(lowerQuery)) scores.entertainment += weight;
  });
  
  // Find the highest scoring intent
  const maxScore = Math.max(scores.shopping, scores.news, scores.learning, scores.entertainment);
  
  // Only return a specific intent if the score is significant enough
  if (maxScore >= 2) {
    if (scores.shopping === maxScore) return 'shopping';
    if (scores.news === maxScore) return 'news';
    if (scores.learning === maxScore) return 'learning';
    if (scores.entertainment === maxScore) return 'entertainment';
  }
  
  return 'general';
}

export async function detectIntent(query: string): Promise<IntentType> {
  // First try AI-based detection if API key is available and has credits
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (apiKey) {
    const messages: OpenRouterMessage[] = [
      {
        role: "system",
        content: `You are an expert at understanding search intent. Classify the following search query into one of these categories:
- shopping: User wants to buy or compare products
- news: User wants current events or updates
- learning: Educational or informational intent
- entertainment: Searching for videos, trends, social content
- general: Catch-all default for other queries

Respond with ONLY the category name, nothing else.`,
      },
      {
        role: "user",
        content: `Classify this search query: "${query}"`,
      },
    ];

    try {
      const response = await callOpenRouter(messages);
      const intent = response.trim().toLowerCase() as IntentType;
      
      // Validate the intent
      const validIntents: IntentType[] = ["shopping", "news", "learning", "entertainment", "general"];
      if (validIntents.includes(intent)) {
        return intent;
      }
      
      return "general";
    } catch (error) {
      console.error("AI intent detection failed, falling back to keyword-based detection:", error);
      // Fall back to keyword-based detection
      return detectIntentByKeywords(query);
    }
  }
  
  // If no API key, use keyword-based detection
  return detectIntentByKeywords(query);
}

// Fallback summary generation without AI
function generateBasicSummary(
  query: string,
  results: SearchResult[],
  intent: IntentType
): AISummary {
  const topResults = results.slice(0, 3);
  const totalResults = results.length;
  
  // Generate smarter summaries based on intent and results
  let summary = "";
  const recommendations: Array<{title: string, reason: string}> = [];
  const suggestedQueries: string[] = [];
  
  // Smart summary generation
  if (totalResults === 0) {
    summary = `No results found for "${query}". Try different keywords or check your spelling.`;
  } else {
    const sources = Array.from(new Set(results.map(r => r.sourceName).filter(s => s)));
    const sourceText = sources.length > 1 ? `${sources.length} sources` : sources[0] || 'multiple sources';
    
    switch (intent) {
      case 'shopping':
        summary = `Found ${totalResults} shopping options for "${query}" from ${sourceText}. Review product details, prices, and customer ratings to make the best choice.`;
        topResults.forEach((result, idx) => {
          recommendations.push({
            title: result.title,
            reason: `Top ${idx + 1} result - Popular option from ${result.sourceName} with detailed information`
          });
        });
        suggestedQueries.push(
          `best ${query}`,
          `${query} reviews`,
          `${query} price comparison`,
          `cheap ${query}`
        );
        break;
        
      case 'news':
        summary = `Latest news about "${query}" from ${sourceText}. Stay updated with ${totalResults} recent articles and breaking developments.`;
        topResults.forEach((result, idx) => {
          const hasDate = result.date ? ` (${result.date})` : '';
          recommendations.push({
            title: result.title,
            reason: `Breaking story${hasDate} - ${result.sourceName} coverage`
          });
        });
        suggestedQueries.push(
          `${query} latest news`,
          `${query} today`,
          `${query} update`,
          `${query} breaking`
        );
        break;
        
      case 'learning':
        summary = `Educational resources about "${query}" available from ${sourceText}. ${totalResults} learning materials including guides, tutorials, and explanations.`;
        topResults.forEach((result, idx) => {
          recommendations.push({
            title: result.title,
            reason: `Comprehensive guide from ${result.sourceName} - Great for learning`
          });
        });
        suggestedQueries.push(
          `how to ${query}`,
          `${query} tutorial`,
          `${query} guide`,
          `learn ${query}`
        );
        break;
        
      case 'entertainment':
        summary = `Trending entertainment content about "${query}" from ${sourceText}. ${totalResults} videos, shows, and media content available.`;
        topResults.forEach((result, idx) => {
          recommendations.push({
            title: result.title,
            reason: `Popular content on ${result.sourceName} - High engagement`
          });
        });
        suggestedQueries.push(
          `${query} video`,
          `${query} watch online`,
          `${query} trending`,
          `${query} viral`
        );
        break;
        
      case 'general':
      default:
        summary = `Found ${totalResults} results for "${query}" from ${sourceText}. Browse comprehensive information and resources below.`;
        topResults.forEach((result, idx) => {
          recommendations.push({
            title: result.title,
            reason: `Highly relevant result from ${result.sourceName}`
          });
        });
        suggestedQueries.push(
          `${query} 2025`,
          `what is ${query}`,
          `${query} information`,
          `${query} details`
        );
        break;
    }
  }
  
  return {
    summary,
    recommendations: recommendations.slice(0, 3),
    suggestedQueries: suggestedQueries.slice(0, 3),
  };
}

export async function generateSummary(
  query: string,
  results: SearchResult[],
  intent: IntentType
): Promise<AISummary> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  // If no API key or no results, use basic summary
  if (!apiKey || results.length === 0) {
    return generateBasicSummary(query, results, intent);
  }
  
  const resultsText = results
    .slice(0, 10)
    .map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}\n   Source: ${r.source}`)
    .join("\n\n");

  const intentInstructions: Record<IntentType, string> = {
    shopping: "Focus on product recommendations, pricing insights, and trusted retailers. Provide 3 top product picks with reasons.",
    news: "Summarize the latest headlines and key developments. Highlight credible sources and breaking information.",
    learning: "Provide a comprehensive overview of the topic. Suggest learning resources and related concepts to explore.",
    entertainment: "Highlight popular and trending content. Recommend the most engaging options.",
    general: "Provide a concise overview of the search results. Suggest related queries that might be helpful.",
  };

  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: `You are an AI assistant for NovaSearch. Your task is to analyze search results and create a helpful summary.

${intentInstructions[intent]}

Respond in JSON format with this structure:
{
  "summary": "A 2-3 sentence summary of the key findings",
  "recommendations": [
    {"title": "Item name", "reason": "Why this is recommended"},
    {"title": "Item name", "reason": "Why this is recommended"},
    {"title": "Item name", "reason": "Why this is recommended"}
  ],
  "suggestedQueries": ["Related query 1", "Related query 2", "Related query 3"]
}`,
    },
    {
      role: "user",
      content: `Query: "${query}"\nIntent: ${intent}\n\nSearch Results:\n${resultsText}\n\nGenerate a JSON summary:`,
    },
  ];

  try {
    const response = await callOpenRouter(messages);
    
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || "No summary available.",
        recommendations: (parsed.recommendations || []).slice(0, 3),
        suggestedQueries: (parsed.suggestedQueries || []).slice(0, 3),
      };
    }
    
    // Fallback if JSON parsing fails
    return {
      summary: response.substring(0, 300),
      recommendations: [],
      suggestedQueries: [],
    };
  } catch (error) {
    console.error("AI summary generation failed, falling back to basic summary:", error);
    // Fall back to basic summary
    return generateBasicSummary(query, results, intent);
  }
}
