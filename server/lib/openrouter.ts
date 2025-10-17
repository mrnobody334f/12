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

export async function detectIntent(query: string): Promise<IntentType> {
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
    console.error("Intent detection error:", error);
    return "general";
  }
}

export async function generateSummary(
  query: string,
  results: SearchResult[],
  intent: IntentType
): Promise<AISummary> {
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
    console.error("Summary generation error:", error);
    return {
      summary: "Unable to generate summary at this time.",
      recommendations: [],
      suggestedQueries: [],
    };
  }
}
