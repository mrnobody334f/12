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
    console.error("❌ OPENROUTER_API_KEY is not configured in environment variables");
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const requestBody = {
    model: "anthropic/claude-3.5-sonnet",
    messages,
    temperature: 0.7,
    max_tokens: 2000,
  };

  console.log("🤖 Calling OpenRouter API...", {
    model: requestBody.model,
    messageCount: messages.length,
    firstMessageRole: messages[0]?.role,
  });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://novasearch.app",
        "X-Title": "NovaSearch",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenRouter API failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data: OpenRouterResponse = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    console.log("✅ OpenRouter API success:", {
      responseLength: content.length,
      preview: content.substring(0, 100)
    });
    
    return content;
  } catch (error) {
    console.error("❌ OpenRouter API error:", error);
    throw error;
  }
}

// Fallback keyword-based intent detection with multi-language support
function detectIntentByKeywords(query: string): IntentType {
  const lowerQuery = query.toLowerCase();
  
  // Shopping keywords with weights (higher weight = more specific to shopping)
  // Supports: English, Arabic, French, Spanish, German, Turkish, Persian, Hindi, Portuguese, Italian
  const shoppingPatterns = [
    // Very high priority - Direct purchase intent with context (English)
    { pattern: /\b(online shopping|e-commerce|place order|order online|checkout|cart|add to cart)\b/i, weight: 5 },
    { pattern: /(تسوق اونلاين|تسوق عبر الانترنت|شراء اونلاين)/i, weight: 5 },
    
    // High priority - Direct purchase intent (English) - removed generic "order"
    { pattern: /\b(buy|purchase|shop for|shopping|buying)\b/i, weight: 5 },
    // High priority - Direct purchase intent (Arabic)
    { pattern: /(شراء|اشتري|شري|اشتريت|ابي اشتري|بشتري|نشتري)/i, weight: 5 },
    // High priority - Direct purchase intent (Other languages)
    { pattern: /\b(acheter|comprar|kaufen|satın al|خرید|خريد|खरीदें|compre|acquistare)\b/i, weight: 5 },
    
    // Price & cost (Multiple languages)
    { pattern: /\b(price|cost|cheap|expensive|affordable|budget|pricing)\b/i, weight: 3.5 },
    { pattern: /(سعر|اسعار|تكلفة|رخيص|غالي|ثمن|كم سعر)/i, weight: 3.5 },
    { pattern: /\b(prix|precio|preis|fiyat|قیمت|मूल्य|preço|prezzo)\b/i, weight: 3.5 },
    
    // Deals & discounts
    { pattern: /\b(deal|sale|discount|offer|coupon|promo|deals|sales)\b/i, weight: 3.5 },
    { pattern: /(عرض|عروض|خصم|خصومات|تخفيض|تخفيضات|تنزيلات)/i, weight: 3.5 },
    { pattern: /\b(offre|oferta|angebot|indirim|تخفیف|ऑफ़र|oferta|offerta)\b/i, weight: 3.5 },
    
    // Store & marketplace - reduced weight for generic terms
    { pattern: /\b(online store|shop online|marketplace|amazon|ebay)\b/i, weight: 3 },
    { pattern: /(متجر|متاجر|سوق|محل|محلات|بائع)/i, weight: 2.5 },
    { pattern: /\b(magasin|tienda|geschäft|mağaza|فروشگاه|दुकान|loja|negozio)\b/i, weight: 2.5 },
    
    // Product & items - only in shopping context
    { pattern: /\b(product review|shop product|buy product)\b/i, weight: 3 },
    { pattern: /(منتج|منتجات|سلعة|سلع)/i, weight: 2.5 },
    
    // Reviews & comparisons - reduced weight
    { pattern: /\b(product review|shopping review|price comparison)\b/i, weight: 2.5 },
    { pattern: /(مراجعة منتج|مقارنة اسعار)/i, weight: 2.5 },
    
    // Common shopping items (to catch queries like "احذيه", "shoes", etc.)
    { pattern: /(حذاء|احذية|أحذية|حذية|شوز|احذيه)/i, weight: 3.5 },
    { pattern: /(ملابس|لبس|ثياب|كلوثس|ثوب|قميص|بنطلون|فستان)/i, weight: 3.5 },
    { pattern: /(هاتف|جوال|موبايل|تلفون|ايفون|سامسونج)/i, weight: 3.5 },
    { pattern: /(لابتوب|كمبيوتر|حاسوب|لاب توب)/i, weight: 3.5 },
    { pattern: /\b(shoes|clothing|clothes|shirt|pants|dress|phone|laptop|computer)\b/i, weight: 3.5 }
  ];
  
  // News keywords - Multi-language
  const newsPatterns = [
    // English
    { pattern: /\b(news|latest|breaking|headline|press)\b/i, weight: 5 },
    { pattern: /\b(today|yesterday|this week|current events)\b/i, weight: 3 },
    { pattern: /\b(update|updates|report|announce|announcement)\b/i, weight: 3.5 },
    { pattern: /\b(recent|just|now|live|happening)\b/i, weight: 2.5 },
    
    // Arabic
    { pattern: /(أخبار|اخبار|خبر|جديد|عاجل|آخر الأخبار|الاخبار)/i, weight: 5 },
    { pattern: /(اليوم|امس|الآن|حالياً|حاليا|مباشر)/i, weight: 3 },
    { pattern: /(تحديث|تحديثات|تقرير|إعلان|اعلان)/i, weight: 3.5 },
    
    // Other languages
    { pattern: /\b(nouvelles|actualités|noticias|nachrichten|haberler|اخبار|समाचार|notícias|notizie)\b/i, weight: 5 },
    { pattern: /\b(dernier|último|neueste|son|آخرین|नवीनतम|último|ultimo)\b/i, weight: 3 }
  ];
  
  // Learning keywords - Multi-language
  const learningPatterns = [
    // English
    { pattern: /\b(how to|tutorial|guide|step by step)\b/i, weight: 5 },
    { pattern: /\b(learn|learning|study|course|education)\b/i, weight: 4 },
    { pattern: /\b(what is|what are|explain|definition|meaning)\b/i, weight: 4 },
    { pattern: /\b(teach|teaching|training|lesson|class)\b/i, weight: 3 },
    { pattern: /\b(documentation|docs|manual|reference)\b/i, weight: 3 },
    
    // Arabic
    { pattern: /(كيف|كيفية|طريقة|كيف اسوي|ازاي)/i, weight: 5 },
    { pattern: /(تعلم|تعليم|دراسة|دورة|تدريب|درس|دروس)/i, weight: 4 },
    { pattern: /(ما هو|ما هي|شرح|توضيح|معنى|تعريف)/i, weight: 4 },
    
    // Other languages
    { pattern: /\b(comment|cómo|wie|nasıl|چگونه|कैसे|como)\b/i, weight: 5 },
    { pattern: /\b(apprendre|aprender|lernen|öğrenmek|یادگیری|सीखना|aprender|imparare)\b/i, weight: 4 }
  ];
  
  // Entertainment keywords - Multi-language
  const entertainmentPatterns = [
    // English
    { pattern: /\b(video|movie|film|cinema|movies)\b/i, weight: 4 },
    { pattern: /\b(music|song|album|artist|singer)\b/i, weight: 4 },
    { pattern: /\b(watch|stream|streaming|play|download)\b/i, weight: 3 },
    { pattern: /\b(episode|series|show|season|tv)\b/i, weight: 3.5 },
    { pattern: /\b(funny|comedy|meme|viral|trending)\b/i, weight: 3 },
    { pattern: /\b(game|gaming|gameplay|gamer)\b/i, weight: 3.5 },
    
    // Arabic
    { pattern: /(فيديو|فيديوهات|فلم|فيلم|افلام|أفلام|سينما)/i, weight: 4 },
    { pattern: /(موسيقى|اغنية|أغنية|اغاني|أغاني|مغني|مطرب)/i, weight: 4 },
    { pattern: /(مشاهدة|شاهد|تحميل|تنزيل|استماع)/i, weight: 3 },
    { pattern: /(حلقة|حلقات|مسلسل|موسم|برنامج)/i, weight: 3.5 },
    { pattern: /(مضحك|كوميدي|ترفيه|ترفيهي|لعبة|العاب|ألعاب)/i, weight: 3 },
    
    // Other languages
    { pattern: /\b(vidéo|película|video|film|فیلم|वीडियो|vídeo)\b/i, weight: 4 },
    { pattern: /\b(musique|música|musik|müzik|موسیقی|संगीत|música|musica)\b/i, weight: 4 }
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
  
  // Log for debugging (can be removed in production)
  console.log(`Intent detection for "${query}":`, {
    shopping: scores.shopping,
    news: scores.news,
    learning: scores.learning,
    entertainment: scores.entertainment,
    maxScore,
    detected: maxScore >= 2 ? 'specific intent' : 'general'
  });
  
  // Threshold of 2 balances sensitivity with accuracy
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
        content: `You are an expert at understanding user search intent. Analyze the query and classify it into ONE of these categories:

1. **shopping**: User wants to buy, compare, or research products/services
   - Keywords: buy, price, cheap, expensive, shop, store, purchase, best, review, deal, sale
   - Examples: "buy laptop", "best headphones 2025", "iPhone 15 price"

2. **news**: User wants current events, breaking news, or recent updates
   - Keywords: news, latest, breaking, today, update, headline, recent
   - Examples: "latest tech news", "breaking news today", "bitcoin news"

3. **learning**: User wants to learn, understand, or get educated about something
   - Keywords: how to, tutorial, guide, learn, what is, explain, course, study
   - Examples: "how to code", "what is AI", "python tutorial"

4. **entertainment**: User wants videos, music, movies, games, or trending content
   - Keywords: video, movie, music, watch, stream, funny, meme, trending
   - Examples: "funny cat videos", "watch movies online", "latest songs"

5. **general**: All other queries that don't fit the above categories
   - Default for informational lookups, definitions, or mixed intent

CRITICAL RULES:
- Analyze the PRIMARY intent of the query
- If unclear, default to "general"
- Respond with ONLY ONE word: shopping, news, learning, entertainment, or general
- Do NOT add explanations, punctuation, or extra text`,
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
