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
    { pattern: /(كيف|كيفية|طريقة|كيف اسوي|ازاي|إزاي)/i, weight: 5 },
    { pattern: /(تعلم|تعليم|دراسة|دورة|تدريب|درس|دروس)/i, weight: 4 },
    { pattern: /(ما هو|ما هي|شرح|توضيح|معنى|تعريف)/i, weight: 4 },
    { pattern: /(عمل|تحضير|إعداد|طبخ|طبخ|وصفة|وصفات|خطوات|نصائح)/i, weight: 4 },
    
    // Other languages
    { pattern: /\b(comment|cómo|wie|nasıl|چگونه|कैसे|como)\b/i, weight: 5 },
    { pattern: /\b(apprendre|aprender|lernen|öğrenmek|یادگیری|सीखना|aprender|imparare)\b/i, weight: 4 }
  ];
  
  // Videos keywords - Multi-language
  const videosPatterns = [
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

  // Travel keywords - Multi-language
  const travelPatterns = [
    // English
    { pattern: /\b(travel|trip|vacation|holiday|journey)\b/i, weight: 5 },
    { pattern: /\b(hotel|hotels|accommodation|booking|reservation)\b/i, weight: 4 },
    { pattern: /\b(flight|flights|airline|airport|plane)\b/i, weight: 4 },
    { pattern: /\b(tourism|tourist|destination|visit|explore)\b/i, weight: 3.5 },
    { pattern: /\b(airbnb|booking|expedia|tripadvisor|kayak)\b/i, weight: 4 },
    { pattern: /\b(passport|visa|travel guide|itinerary)\b/i, weight: 3 },
    
    // Arabic
    { pattern: /(سفر|رحله|رحلات|عطلة|عطل|سياحة|سياحي)/i, weight: 5 },
    { pattern: /(فندق|فنادق|إقامة|حجز|حجوزات)/i, weight: 4 },
    { pattern: /(طيران|طائرة|مطار|رحلة جوية)/i, weight: 4 },
    { pattern: /(وجهة|زيارة|استكشاف|دليل سياحي)/i, weight: 3.5 },
    
    // Other languages
    { pattern: /\b(voyage|hôtel|vol|tourisme|viaje|hotel|vuelo|turismo)\b/i, weight: 4 }
  ];

  // Health keywords - Multi-language
  const healthPatterns = [
    // English
    { pattern: /\b(health|medical|medicine|doctor|hospital)\b/i, weight: 5 },
    { pattern: /\b(symptoms|disease|illness|treatment|cure)\b/i, weight: 4 },
    { pattern: /\b(pharmacy|drug|medication|prescription)\b/i, weight: 4 },
    { pattern: /\b(webmd|mayo clinic|healthline|nhs|medline)\b/i, weight: 4 },
    { pattern: /\b(patient|diagnosis|therapy|surgery)\b/i, weight: 3.5 },
    { pattern: /\b(covid|coronavirus|vaccine|vaccination)\b/i, weight: 4 },
    
    // Arabic
    { pattern: /(صحة|طبي|طب|دكتور|طبيب|مستشفى|مستشفيات)/i, weight: 5 },
    { pattern: /(أعراض|مرض|أمراض|علاج|شفاء|دواء|أدوية)/i, weight: 4 },
    { pattern: /(صيدلية|وصفة|تشخيص|جراحة|علاج)/i, weight: 4 },
    { pattern: /(مريض|مرضى|فحص|تحليل|تحاليل)/i, weight: 3.5 },
    
    // Other languages
    { pattern: /\b(santé|médecin|hôpital|salud|médico|hospital|gesundheit|arzt|krankenhaus)\b/i, weight: 4 }
  ];

  // Technology keywords - Multi-language
  const techPatterns = [
    // English
    { pattern: /\b(software|app|application|download|programming)\b/i, weight: 4 },
    { pattern: /\b(tech|technology|gadget|device|hardware)\b/i, weight: 4 },
    { pattern: /\b(github|stack overflow|techcrunch|ars technica|the verge)\b/i, weight: 4 },
    { pattern: /\b(code|coding|developer|programming|api)\b/i, weight: 4 },
    { pattern: /\b(review|reviews|comparison|specs|specifications)\b/i, weight: 3 },
    { pattern: /\b(update|upgrade|install|installation)\b/i, weight: 3 },
    
    // Arabic
    { pattern: /(برنامج|برامج|تطبيق|تطبيقات|تحميل|تنزيل)/i, weight: 4 },
    { pattern: /(تقنية|تكنولوجيا|جهاز|أجهزة|هاردوير)/i, weight: 4 },
    { pattern: /(كود|برمجة|مطور|مطورين|برمجيات)/i, weight: 4 },
    { pattern: /(مراجعة|مراجعات|مقارنة|مواصفات)/i, weight: 3 },
    
    // Other languages
    { pattern: /\b(logiciel|application|télécharger|technologie|software|aplicación|descargar|tecnología)\b/i, weight: 4 }
  ];

  // Finance keywords - Multi-language
  const financePatterns = [
    // English
    { pattern: /\b(finance|financial|money|investment|investing)\b/i, weight: 5 },
    { pattern: /\b(stock|stocks|market|trading|trader)\b/i, weight: 4 },
    { pattern: /\b(business|economy|economic|banking|bank)\b/i, weight: 4 },
    { pattern: /\b(bloomberg|reuters|yahoo finance|investopedia|cnbc)\b/i, weight: 4 },
    { pattern: /\b(crypto|cryptocurrency|bitcoin|ethereum|blockchain)\b/i, weight: 4 },
    { pattern: /\b(loan|credit|mortgage|insurance|tax)\b/i, weight: 3.5 },
    
    // Arabic
    { pattern: /(مال|مالي|استثمار|استثمارات|تداول|تداولات)/i, weight: 5 },
    { pattern: /(سهم|أسهم|بورصة|سوق|مؤشر)/i, weight: 4 },
    { pattern: /(أعمال|اقتصاد|اقتصادي|بنك|بنوك|مصرف)/i, weight: 4 },
    { pattern: /(عملة رقمية|بتكوين|بلوك تشين|كريبتو)/i, weight: 4 },
    { pattern: /(قرض|قروض|ائتمان|تأمين|ضريبة)/i, weight: 3.5 },
    
    // Other languages
    { pattern: /\b(finance|investissement|bourse|économie|finanzas|inversión|bolsa|economía)\b/i, weight: 4 }
  ];

  // Entertainment keywords - Multi-language
  const entertainmentPatterns = [
    // English
    { pattern: /\b(entertainment|celebrity|celebrities|famous|star)\b/i, weight: 4 },
    { pattern: /\b(imdb|spotify|steam|espn|tmz)\b/i, weight: 4 },
    { pattern: /\b(actor|actress|director|producer|artist)\b/i, weight: 3.5 },
    { pattern: /\b(oscar|grammy|award|awards|nomination)\b/i, weight: 3.5 },
    { pattern: /\b(concert|festival|event|show|performance)\b/i, weight: 3 },
    { pattern: /\b(gossip|rumor|scandal|news|latest)\b/i, weight: 3 },
    
    // Arabic
    { pattern: /(ترفيه|مشهور|مشاهير|نجم|نجوم|فنان|فنانين)/i, weight: 4 },
    { pattern: /(ممثل|ممثلة|مخرج|منتج|موسيقي)/i, weight: 3.5 },
    { pattern: /(جائزة|جوائز|ترشيح|ترشيحات|أوسكار)/i, weight: 3.5 },
    { pattern: /(حفلة|مهرجان|عرض|أداء|حفل)/i, weight: 3 },
    { pattern: /(إشاعة|فضيحة|أخبار|آخر الأخبار)/i, weight: 3 },
    
    // Other languages
    { pattern: /\b(divertissement|célébrité|fameux|entretenimiento|celebridad|famoso)\b/i, weight: 4 }
  ];

  // Food keywords - Multi-language
  const foodPatterns = [
    // English
    { pattern: /\b(food|recipe|recipes|cooking|cuisine)\b/i, weight: 5 },
    { pattern: /\b(restaurant|dining|meal|meals|eat|eating)\b/i, weight: 4 },
    { pattern: /\b(allrecipes|food network|yelp|zomato|epicurious)\b/i, weight: 4 },
    { pattern: /\b(ingredients|ingredient|preparation|cook|bake)\b/i, weight: 3.5 },
    { pattern: /\b(delicious|tasty|flavor|taste|spicy)\b/i, weight: 3 },
    { pattern: /\b(healthy|nutrition|diet|calories|protein)\b/i, weight: 3 },
    
    // Arabic
    { pattern: /(طعام|أكل|مأكولات|وصفة|وصفات|طبخ|طبخات)/i, weight: 5 },
    { pattern: /(مطعم|مطاعم|وجبة|وجبات|تناول|تناول الطعام)/i, weight: 4 },
    { pattern: /(مكونات|مكون|تحضير|طبخ|خبز|شوي)/i, weight: 3.5 },
    { pattern: /(لذيذ|طعم|نكهة|حار|حلو|مالح)/i, weight: 3 },
    { pattern: /(صحي|تغذية|حمية|سعرات|بروتين)/i, weight: 3 },
    
    // Other languages
    { pattern: /\b(nourriture|recette|cuisine|restaurant|comida|receta|cocina|restaurante)\b/i, weight: 4 }
  ];
  
  // Calculate scores for each intent
  const scores = {
    shopping: 0,
    news: 0,
    learning: 0,
    videos: 0,
    travel: 0,
    health: 0,
    tech: 0,
    finance: 0,
    entertainment: 0,
    food: 0,
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
  
  videosPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(lowerQuery)) scores.videos += weight;
  });
  
  travelPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(lowerQuery)) scores.travel += weight;
  });
  
  healthPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(lowerQuery)) scores.health += weight;
  });
  
  techPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(lowerQuery)) scores.tech += weight;
  });
  
  financePatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(lowerQuery)) scores.finance += weight;
  });
  
  entertainmentPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(lowerQuery)) scores.entertainment += weight;
  });
  
  foodPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(lowerQuery)) scores.food += weight;
  });
  
  // Find the highest scoring intent
  const maxScore = Math.max(
    scores.shopping, 
    scores.news, 
    scores.learning, 
    scores.videos,
    scores.travel,
    scores.health,
    scores.tech,
    scores.finance,
    scores.entertainment,
    scores.food
  );
  
  // Log for debugging (can be removed in production)
  console.log(`Intent detection for "${query}":`, {
    shopping: scores.shopping,
    news: scores.news,
    learning: scores.learning,
    videos: scores.videos,
    travel: scores.travel,
    health: scores.health,
    tech: scores.tech,
    finance: scores.finance,
    entertainment: scores.entertainment,
    food: scores.food,
    maxScore,
    detected: maxScore >= 2 ? 'specific intent' : 'general'
  });
  
  // Lower threshold to 1 for better sensitivity
  if (maxScore >= 1) {
    if (scores.shopping === maxScore) return 'shopping';
    if (scores.news === maxScore) return 'news';
    if (scores.learning === maxScore) return 'learning';
    if (scores.videos === maxScore) return 'videos';
    if (scores.travel === maxScore) return 'travel';
    if (scores.health === maxScore) return 'health';
    if (scores.tech === maxScore) return 'tech';
    if (scores.finance === maxScore) return 'finance';
    if (scores.entertainment === maxScore) return 'entertainment';
    if (scores.food === maxScore) return 'food';
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

4. **videos**: User wants videos, music, movies, games, or trending content
   - Keywords: video, movie, music, watch, stream, funny, meme, trending
   - Examples: "funny cat videos", "watch movies online", "latest songs"

5. **travel**: User wants travel, tourism, hotels, flights, or vacation planning
   - Keywords: travel, trip, vacation, hotel, flight, booking, tourism, destination
   - Examples: "best hotels in Paris", "cheap flights to London", "travel guide"

6. **health**: User wants health, medical, or wellness information
   - Keywords: health, medical, doctor, symptoms, medicine, treatment, pharmacy
   - Examples: "covid symptoms", "best medicine for headache", "health tips"

7. **tech**: User wants technology, software, or technical information
   - Keywords: software, app, download, programming, tech, gadget, review
   - Examples: "best photo editing software", "how to code Python", "iPhone review"

8. **finance**: User wants financial, business, or investment information
   - Keywords: finance, investment, stock, business, economy, crypto, banking
   - Examples: "stock market news", "best investment options", "bitcoin price"

9. **entertainment**: User wants celebrity, entertainment, or media content
   - Keywords: celebrity, famous, actor, movie, music, entertainment, gossip
   - Examples: "latest celebrity news", "best movies 2025", "famous actors"

10. **food**: User wants food, recipes, cooking, or restaurant information
    - Keywords: food, recipe, cooking, restaurant, meal, cuisine, ingredients
    - Examples: "best pasta recipe", "restaurants near me", "healthy meals"

11. **general**: All other queries that don't fit the above categories
    - Default for informational lookups, definitions, or mixed intent

CRITICAL RULES:
- Analyze the PRIMARY intent of the query
- If unclear, default to "general"
- Respond with ONLY ONE word: shopping, news, learning, videos, travel, health, tech, finance, entertainment, food, or general
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
      const validIntents: IntentType[] = ["shopping", "news", "learning", "videos", "travel", "health", "tech", "finance", "entertainment", "food", "general"];
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
export function generateBasicSummary(
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
        // Generate learning-specific summary
        if (query.toLowerCase().includes('how to') || query.toLowerCase().includes('طريقة')) {
          const topic = query.replace(/^(how to|طريقة عمل)\s+/i, '');
          summary = `Here's how to ${topic}:`;
          recommendations.push(
            { title: "Start with Basics", reason: "Build a strong foundation first" },
            { title: "Follow Step-by-Step", reason: "Take it one step at a time" },
            { title: "Practice Regularly", reason: "Consistent practice leads to mastery" }
          );
        } else if (query.toLowerCase().includes('what is') || query.toLowerCase().includes('ما هو')) {
          const topic = query.replace(/^(what is|ما هو)\s+/i, '');
          summary = `${topic} is a technology/concept that enables computers and systems to perform tasks that typically require human intelligence. It involves machine learning, data processing, and automated decision-making capabilities.`;
          recommendations.push(
            { title: "Learn the Basics", reason: "Understand fundamental concepts first" },
            { title: "Find Examples", reason: "Real-world examples help understanding" },
            { title: "Explore Applications", reason: "See how it's used in practice" }
          );
        } else {
          summary = `Educational resources about "${query}" available from ${sourceText}. ${totalResults} learning materials including guides, tutorials, and explanations.`;
          topResults.forEach((result, idx) => {
            recommendations.push({
              title: result.title,
              reason: `Comprehensive guide from ${result.sourceName} - Great for learning`
            });
          });
        }
        suggestedQueries.push(
          `how to ${query}`,
          `${query} tutorial`,
          `${query} guide`,
          `learn ${query}`
        );
        break;
        
      case 'videos':
        summary = `Trending video content about "${query}" from ${sourceText}. ${totalResults} videos, shows, and media content available.`;
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

// Function to detect if query is explanatory (should show AI summary)
export function isExplanatoryQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase().trim();
  
  // Question words and patterns that indicate explanatory queries
  const questionWords = [
    'ما هو', 'ما هي', 'ماذا', 'متى', 'أين', 'كيف', 'لماذا', 'من', 'أي',
    'what is', 'what are', 'what does', 'what do', 'how to', 'how do', 'how does',
    'why', 'when', 'where', 'who', 'which', 'can you', 'could you', 'would you',
    'إزاي', 'ازاي', 'أفضل طريقة', 'كيفية', 'طريقة', 'خطوات', 'نصائح', 'نصيحة',
    'تعريف', 'معنى', 'مفهوم', 'شرح', 'توضيح', 'معلومات عن', 'تفاصيل عن',
    'definition', 'meaning', 'explain', 'tell me about', 'information about'
  ];
  
  // Explanatory patterns
  const explanatoryPatterns = [
    /^(ما|what|how|why|when|where|who|which)\s+/i,
    /(كيف|how)\s+(to|do|does|can|should)/i,
    /(أفضل|best)\s+(طريقة|way|method)/i,
    /(نصائح|tips|advice)\s+(لـ|for)/i,
    /(خطوات|steps)\s+(لـ|to|for)/i,
    /(مقارنة|compare|comparison)/i,
    /(الفرق|difference)\s+(بين|between)/i,
    /(مميزات|advantages|benefits)/i,
    /(عيوب|disadvantages|drawbacks)/i,
    /(متى|when)\s+(يجب|should|can)/i,
    /(أين|where)\s+(يمكن|can)/i,
    /(من|who)\s+(أول|first|invented|created)/i
  ];
  
  // Check for question words
  const hasQuestionWord = questionWords.some(word => lowerQuery.includes(word));
  
  // Check for explanatory patterns
  const hasExplanatoryPattern = explanatoryPatterns.some(pattern => pattern.test(query));
  
  // Check for question marks
  const hasQuestionMark = query.includes('?') || query.includes('؟');
  
  // Check query length (longer queries are more likely to be explanatory)
  const isLongQuery = query.split(' ').length >= 3;
  
  // Check for complex sentence structure
  const hasComplexStructure = query.includes(' و ') || query.includes(' أو ') || 
                             query.includes(' but ') || query.includes(' and ') || 
                             query.includes(' or ') || query.includes(' with ');
  
  // Special cases for simple keywords that should NOT show AI summary
  const simpleKeywords = [
    'restaurant', 'hotel', 'shop', 'store', 'website', 'app', 'game', 'movie',
    'مطعم', 'فندق', 'متجر', 'موقع', 'تطبيق', 'لعبة', 'فيلم'
  ];
  
  const isSimpleKeyword = simpleKeywords.some(keyword => 
    lowerQuery === keyword || lowerQuery === `${keyword}s` || lowerQuery === `${keyword}es`
  );
  
  // If it's a simple keyword, don't show AI summary
  if (isSimpleKeyword) {
    return false;
  }
  
  // If it has question words/patterns or question marks, it's likely explanatory
  const isQuestionLike = hasQuestionWord || hasExplanatoryPattern || hasQuestionMark;
  
  // For question-like queries, be more lenient with length requirements
  if (isQuestionLike) {
    return true;
  }
  
  // For non-question queries, require longer length or complex structure
  return isLongQuery || hasComplexStructure;
}

export async function generateSummary(
  query: string,
  results: SearchResult[],
  intent: IntentType
): Promise<AISummary> {
  // Only generate AI summary for explanatory queries
  if (!isExplanatoryQuery(query)) {
    console.log(`❌ Query "${query}" is not explanatory, skipping AI summary`);
    return generateBasicSummary(query, results, intent);
  }
  
  console.log(`✅ Query "${query}" is explanatory, generating AI summary`);
  
  // For now, use basic summary since OpenRouter API is not working
  // TODO: Fix OpenRouter API or implement alternative AI service
  return generateBasicSummary(query, results, intent);

}
