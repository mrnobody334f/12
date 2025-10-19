// Popular websites by country and intent
// This database contains the most popular sites for each country and search intent

interface SiteConfig {
  id: string;
  name: string;
  site: string;
  icon: string;
}

// Global popular sites for each intent (fallback)
export const globalSites = {
  shopping: [
    { id: "amazon", name: "Amazon", site: "amazon.com", icon: "ShoppingBag" },
    { id: "ebay", name: "eBay", site: "ebay.com", icon: "ShoppingCart" },
    { id: "aliexpress", name: "AliExpress", site: "aliexpress.com", icon: "Package" },
    { id: "walmart", name: "Walmart", site: "walmart.com", icon: "Store" },
    { id: "etsy", name: "Etsy", site: "etsy.com", icon: "Heart" },
    { id: "target", name: "Target", site: "target.com", icon: "Target" },
    { id: "bestbuy", name: "Best Buy", site: "bestbuy.com", icon: "Laptop" },
    { id: "alibaba", name: "Alibaba", site: "alibaba.com", icon: "Building" },
    { id: "ikea", name: "IKEA", site: "ikea.com", icon: "Home" },
    { id: "wish", name: "Wish", site: "wish.com", icon: "Gift" },
  ],
  news: [
    { id: "bbc", name: "BBC", site: "bbc.com", icon: "Radio" },
    { id: "cnn", name: "CNN", site: "cnn.com", icon: "Newspaper" },
    { id: "reuters", name: "Reuters", site: "reuters.com", icon: "BookOpen" },
    { id: "aljazeera", name: "Al Jazeera", site: "aljazeera.com", icon: "Globe" },
    { id: "theguardian", name: "The Guardian", site: "theguardian.com", icon: "FileText" },
    { id: "nytimes", name: "NY Times", site: "nytimes.com", icon: "Newspaper" },
    { id: "techcrunch", name: "TechCrunch", site: "techcrunch.com", icon: "Zap" },
    { id: "bloomberg", name: "Bloomberg", site: "bloomberg.com", icon: "TrendingUp" },
    { id: "forbes", name: "Forbes", site: "forbes.com", icon: "DollarSign" },
    { id: "apnews", name: "AP News", site: "apnews.com", icon: "Rss" },
  ],
  learning: [
    { id: "wikipedia", name: "Wikipedia", site: "wikipedia.org", icon: "BookMarked" },
    { id: "youtube", name: "YouTube", site: "youtube.com", icon: "Youtube" },
    { id: "coursera", name: "Coursera", site: "coursera.org", icon: "GraduationCap" },
    { id: "udemy", name: "Udemy", site: "udemy.com", icon: "BookOpen" },
    { id: "khanacademy", name: "Khan Academy", site: "khanacademy.org", icon: "School" },
    { id: "medium", name: "Medium", site: "medium.com", icon: "PenTool" },
    { id: "stackoverflow", name: "Stack Overflow", site: "stackoverflow.com", icon: "Code" },
    { id: "quora", name: "Quora", site: "quora.com", icon: "MessageCircle" },
    { id: "edx", name: "edX", site: "edx.org", icon: "Award" },
    { id: "skillshare", name: "Skillshare", site: "skillshare.com", icon: "Palette" },
  ],
  entertainment: [
    { id: "youtube", name: "YouTube", site: "youtube.com", icon: "Youtube" },
    { id: "netflix", name: "Netflix", site: "netflix.com", icon: "Tv" },
    { id: "spotify", name: "Spotify", site: "spotify.com", icon: "Music" },
    { id: "twitch", name: "Twitch", site: "twitch.tv", icon: "Radio" },
    { id: "tiktok", name: "TikTok", site: "tiktok.com", icon: "Music" },
    { id: "instagram", name: "Instagram", site: "instagram.com", icon: "Camera" },
    { id: "reddit", name: "Reddit", site: "reddit.com", icon: "MessageSquare" },
    { id: "imdb", name: "IMDb", site: "imdb.com", icon: "Film" },
    { id: "pinterest", name: "Pinterest", site: "pinterest.com", icon: "Image" },
    { id: "soundcloud", name: "SoundCloud", site: "soundcloud.com", icon: "Headphones" },
  ],
  general: [
    { id: "google", name: "Google", site: "google.com", icon: "Search" },
    { id: "youtube", name: "YouTube", site: "youtube.com", icon: "Youtube" },
    { id: "facebook", name: "Facebook", site: "facebook.com", icon: "Facebook" },
    { id: "twitter", name: "Twitter", site: "twitter.com", icon: "Twitter" },
    { id: "reddit", name: "Reddit", site: "reddit.com", icon: "MessageSquare" },
    { id: "wikipedia", name: "Wikipedia", site: "wikipedia.org", icon: "BookMarked" },
    { id: "instagram", name: "Instagram", site: "instagram.com", icon: "Camera" },
    { id: "linkedin", name: "LinkedIn", site: "linkedin.com", icon: "Briefcase" },
    { id: "amazon", name: "Amazon", site: "amazon.com", icon: "ShoppingBag" },
    { id: "tiktok", name: "TikTok", site: "tiktok.com", icon: "Music" },
  ],
};

// Country-specific popular sites
export const countrySites: Record<string, {
  shopping?: SiteConfig[];
  news?: SiteConfig[];
  learning?: SiteConfig[];
  entertainment?: SiteConfig[];
  general?: SiteConfig[];
}> = {
  // United States
  us: {
    shopping: [
      { id: "amazon", name: "Amazon", site: "amazon.com", icon: "ShoppingBag" },
      { id: "walmart", name: "Walmart", site: "walmart.com", icon: "Store" },
      { id: "target", name: "Target", site: "target.com", icon: "Target" },
      { id: "bestbuy", name: "Best Buy", site: "bestbuy.com", icon: "Laptop" },
      { id: "ebay", name: "eBay", site: "ebay.com", icon: "ShoppingCart" },
      { id: "homedepot", name: "Home Depot", site: "homedepot.com", icon: "Home" },
      { id: "costco", name: "Costco", site: "costco.com", icon: "Building2" },
      { id: "macys", name: "Macy's", site: "macys.com", icon: "ShoppingBag" },
      { id: "etsy", name: "Etsy", site: "etsy.com", icon: "Heart" },
      { id: "newegg", name: "Newegg", site: "newegg.com", icon: "Laptop" },
    ],
    news: [
      { id: "cnn", name: "CNN", site: "cnn.com", icon: "Newspaper" },
      { id: "foxnews", name: "Fox News", site: "foxnews.com", icon: "Tv" },
      { id: "nytimes", name: "NY Times", site: "nytimes.com", icon: "Newspaper" },
      { id: "washingtonpost", name: "Washington Post", site: "washingtonpost.com", icon: "FileText" },
      { id: "usatoday", name: "USA Today", site: "usatoday.com", icon: "Globe" },
      { id: "nbcnews", name: "NBC News", site: "nbcnews.com", icon: "Radio" },
      { id: "cbsnews", name: "CBS News", site: "cbsnews.com", icon: "Tv" },
      { id: "bloomberg", name: "Bloomberg", site: "bloomberg.com", icon: "TrendingUp" },
      { id: "wsj", name: "Wall Street Journal", site: "wsj.com", icon: "DollarSign" },
      { id: "apnews", name: "AP News", site: "apnews.com", icon: "Rss" },
    ],
  },

  // United Kingdom
  gb: {
    shopping: [
      { id: "amazon-uk", name: "Amazon UK", site: "amazon.co.uk", icon: "ShoppingBag" },
      { id: "ebay-uk", name: "eBay UK", site: "ebay.co.uk", icon: "ShoppingCart" },
      { id: "argos", name: "Argos", site: "argos.co.uk", icon: "Store" },
      { id: "tesco", name: "Tesco", site: "tesco.com", icon: "ShoppingCart" },
      { id: "johnlewis", name: "John Lewis", site: "johnlewis.com", icon: "Building" },
      { id: "currys", name: "Currys", site: "currys.co.uk", icon: "Laptop" },
      { id: "asos", name: "ASOS", site: "asos.com", icon: "ShoppingBag" },
      { id: "boots", name: "Boots", site: "boots.com", icon: "Heart" },
      { id: "next", name: "Next", site: "next.co.uk", icon: "ShoppingBag" },
      { id: "ao", name: "AO.com", site: "ao.com", icon: "Zap" },
    ],
    news: [
      { id: "bbc", name: "BBC", site: "bbc.com", icon: "Radio" },
      { id: "theguardian", name: "The Guardian", site: "theguardian.com", icon: "FileText" },
      { id: "dailymail", name: "Daily Mail", site: "dailymail.co.uk", icon: "Newspaper" },
      { id: "telegraph", name: "The Telegraph", site: "telegraph.co.uk", icon: "BookOpen" },
      { id: "independent", name: "The Independent", site: "independent.co.uk", icon: "Globe" },
      { id: "skynews", name: "Sky News", site: "news.sky.com", icon: "Tv" },
      { id: "mirror", name: "The Mirror", site: "mirror.co.uk", icon: "Newspaper" },
      { id: "thesun", name: "The Sun", site: "thesun.co.uk", icon: "Sun" },
      { id: "times", name: "The Times", site: "thetimes.co.uk", icon: "FileText" },
      { id: "express", name: "Express", site: "express.co.uk", icon: "Zap" },
    ],
  },

  // Egypt
  eg: {
    shopping: [
      { id: "jumia-eg", name: "Jumia Egypt", site: "jumia.com.eg", icon: "ShoppingBag" },
      { id: "amazon-eg", name: "Amazon Egypt", site: "amazon.eg", icon: "Package" },
      { id: "noon-eg", name: "Noon Egypt", site: "noon.com", icon: "Sun" },
      { id: "souq", name: "Souq", site: "egypt.souq.com", icon: "Store" },
      { id: "aliexpress", name: "AliExpress", site: "aliexpress.com", icon: "Package" },
      { id: "ebay", name: "eBay", site: "ebay.com", icon: "ShoppingCart" },
      { id: "ubuy-eg", name: "Ubuy Egypt", site: "egypt.ubuy.com", icon: "Globe" },
      { id: "carrefour-eg", name: "Carrefour Egypt", site: "carrefouregypt.com", icon: "ShoppingCart" },
      { id: "b-tech", name: "B.TECH", site: "b-tech.com.eg", icon: "Laptop" },
      { id: "wadi", name: "Wadi", site: "wadi.com", icon: "ShoppingBag" },
    ],
    news: [
      { id: "ahram", name: "Al-Ahram", site: "ahram.org.eg", icon: "Newspaper" },
      { id: "youm7", name: "Youm7", site: "youm7.com", icon: "FileText" },
      { id: "masrawy", name: "Masrawy", site: "masrawy.com", icon: "Globe" },
      { id: "dostor", name: "El-Dostor", site: "dostor.org", icon: "Newspaper" },
      { id: "almasryalyoum", name: "Al-Masry Al-Youm", site: "almasryalyoum.com", icon: "BookOpen" },
      { id: "shorouknews", name: "Shorouk News", site: "shorouknews.com", icon: "Sun" },
      { id: "vetogate", name: "Veto Gate", site: "vetogate.com", icon: "Shield" },
      { id: "filbalad", name: "Fil Balad", site: "filbalad.com", icon: "MapPin" },
      { id: "elnabaa", name: "El-Nabaa", site: "elnabaa.net", icon: "Rss" },
      { id: "elwatan", name: "El-Watan", site: "elwatannews.com", icon: "Flag" },
    ],
  },

  // Saudi Arabia
  sa: {
    shopping: [
      { id: "noon-sa", name: "Noon", site: "noon.com", icon: "Sun" },
      { id: "amazon-sa", name: "Amazon Saudi", site: "amazon.sa", icon: "ShoppingBag" },
      { id: "jarir", name: "Jarir", site: "jarir.com", icon: "BookOpen" },
      { id: "extra", name: "eXtra", site: "extra.com", icon: "Laptop" },
      { id: "namshi", name: "Namshi", site: "namshi.com", icon: "ShoppingBag" },
      { id: "carrefour-sa", name: "Carrefour", site: "carrefourksa.com", icon: "ShoppingCart" },
      { id: "saco", name: "SACO", site: "saco.sa", icon: "Home" },
      { id: "shein-sa", name: "SHEIN", site: "shein.com", icon: "ShoppingBag" },
      { id: "aliexpress", name: "AliExpress", site: "aliexpress.com", icon: "Package" },
      { id: "6thstreet", name: "6thStreet", site: "6thstreet.com", icon: "ShoppingBag" },
    ],
    news: [
      { id: "okaz", name: "Okaz", site: "okaz.com.sa", icon: "Newspaper" },
      { id: "aleqt", name: "Aleqtisadiah", site: "aleqt.com", icon: "DollarSign" },
      { id: "alyaum", name: "Al-Yaum", site: "alyaum.com", icon: "Sun" },
      { id: "sabq", name: "Sabq", site: "sabq.org", icon: "Zap" },
      { id: "ajel", name: "Ajel", site: "ajel.sa", icon: "Globe" },
      { id: "arriyadiyah", name: "Arriyadiyah", site: "arriyadiyah.com", icon: "Trophy" },
      { id: "almowaten", name: "Al Mowaten", site: "almowaten.net", icon: "Flag" },
      { id: "alriyadh", name: "Alriyadh", site: "alriyadh.com", icon: "FileText" },
      { id: "saudigazette", name: "Saudi Gazette", site: "saudigazette.com.sa", icon: "Newspaper" },
      { id: "arabnews", name: "Arab News", site: "arabnews.com", icon: "Globe" },
    ],
  },

  // United Arab Emirates
  ae: {
    shopping: [
      { id: "noon-ae", name: "Noon", site: "noon.com", icon: "Sun" },
      { id: "amazon-ae", name: "Amazon UAE", site: "amazon.ae", icon: "ShoppingBag" },
      { id: "carrefour-ae", name: "Carrefour", site: "carrefouruae.com", icon: "ShoppingCart" },
      { id: "sharaf-dg", name: "Sharaf DG", site: "sharafdg.com", icon: "Laptop" },
      { id: "dubizzle", name: "Dubizzle", site: "dubizzle.com", icon: "Search" },
      { id: "namshi", name: "Namshi", site: "namshi.com", icon: "ShoppingBag" },
      { id: "lulu", name: "Lulu", site: "luluhypermarket.com", icon: "ShoppingCart" },
      { id: "awok", name: "AWOK", site: "awok.com", icon: "Home" },
      { id: "axiom", name: "Axiom", site: "axiomtelecom.com", icon: "Smartphone" },
      { id: "6thstreet", name: "6thStreet", site: "6thstreet.com", icon: "ShoppingBag" },
    ],
    news: [
      { id: "gulf-news", name: "Gulf News", site: "gulfnews.com", icon: "Newspaper" },
      { id: "khaleejtimes", name: "Khaleej Times", site: "khaleejtimes.com", icon: "FileText" },
      { id: "thenational", name: "The National", site: "thenationalnews.com", icon: "Flag" },
      { id: "albayan", name: "Al Bayan", site: "albayan.ae", icon: "BookOpen" },
      { id: "alittihad", name: "Al Ittihad", site: "alittihad.ae", icon: "Star" },
      { id: "wam", name: "WAM", site: "wam.ae", icon: "Globe" },
      { id: "emarat-alyoum", name: "Emarat Al Youm", site: "emaratalyoum.com", icon: "Sun" },
      { id: "247-ae", name: "24/7", site: "24.ae", icon: "Clock" },
      { id: "arabianbusiness", name: "Arabian Business", site: "arabianbusiness.com", icon: "Briefcase" },
      { id: "dubaieye", name: "Dubai Eye 103.8", site: "dubaieye1038.com", icon: "Radio" },
    ],
  },

  // India
  in: {
    shopping: [
      { id: "amazon-in", name: "Amazon India", site: "amazon.in", icon: "ShoppingBag" },
      { id: "flipkart", name: "Flipkart", site: "flipkart.com", icon: "ShoppingCart" },
      { id: "myntra", name: "Myntra", site: "myntra.com", icon: "ShoppingBag" },
      { id: "snapdeal", name: "Snapdeal", site: "snapdeal.com", icon: "Package" },
      { id: "ajio", name: "AJIO", site: "ajio.com", icon: "ShoppingBag" },
      { id: "tata-cliq", name: "Tata CLiQ", site: "tatacliq.com", icon: "Store" },
      { id: "bigbasket", name: "BigBasket", site: "bigbasket.com", icon: "ShoppingCart" },
      { id: "nykaa", name: "Nykaa", site: "nykaa.com", icon: "Heart" },
      { id: "croma", name: "Croma", site: "croma.com", icon: "Laptop" },
      { id: "shopclues", name: "ShopClues", site: "shopclues.com", icon: "Tag" },
    ],
    news: [
      { id: "timesofindia", name: "Times of India", site: "timesofindia.indiatimes.com", icon: "Newspaper" },
      { id: "hindustantimes", name: "Hindustan Times", site: "hindustantimes.com", icon: "FileText" },
      { id: "indiatoday", name: "India Today", site: "indiatoday.in", icon: "Globe" },
      { id: "ndtv", name: "NDTV", site: "ndtv.com", icon: "Tv" },
      { id: "thehindu", name: "The Hindu", site: "thehindu.com", icon: "BookOpen" },
      { id: "indianexpress", name: "Indian Express", site: "indianexpress.com", icon: "Newspaper" },
      { id: "zeenews", name: "Zee News", site: "zeenews.india.com", icon: "Radio" },
      { id: "abplive", name: "ABP Live", site: "abplive.com", icon: "Tv" },
      { id: "businesstoday", name: "Business Today", site: "businesstoday.in", icon: "Briefcase" },
      { id: "financialexpress", name: "Financial Express", site: "financialexpress.com", icon: "DollarSign" },
    ],
  },
};

// Get popular sites for a specific country and intent
export function getPopularSites(
  countryCode: string | undefined,
  intent: string,
  isGlobal: boolean = false
): SiteConfig[] {
  // If global mode or no country code, return global sites
  if (isGlobal || !countryCode || countryCode === 'global' || countryCode === '') {
    return globalSites[intent as keyof typeof globalSites] || globalSites.general;
  }

  // Normalize country code
  const normalizedCode = countryCode.toLowerCase();

  // Check if we have country-specific sites
  const countryData = countrySites[normalizedCode];
  
  if (countryData && countryData[intent as keyof typeof countryData]) {
    return countryData[intent as keyof typeof countryData]!;
  }

  // Fallback to global sites if no country-specific sites found
  return globalSites[intent as keyof typeof globalSites] || globalSites.general;
}
