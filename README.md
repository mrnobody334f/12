# NovaSearch - Next-Gen AI-Powered Search Engine

![NovaSearch](https://img.shields.io/badge/AI-Powered-purple) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Express](https://img.shields.io/badge/Express-4-green)

**NovaSearch** is a cutting-edge AI-powered meta-search engine that intelligently understands user intent and delivers results from multiple sources with AI-generated summaries. Think "Google + Perplexity + Amazon + TikTok" combined into one intelligent platform.

## ✨ Features

### 🧠 AI-Powered Intelligence
- **Smart Intent Detection**: Automatically classifies queries into shopping, news, learning, entertainment, or general categories
- **AI Summarization**: Generates concise summaries with top recommendations using Claude 3.5 Sonnet
- **Suggested Queries**: Provides related search suggestions to help users explore further

### 🌐 Multi-Source Search
- **Parallel Fetching**: Searches across multiple platforms simultaneously
- **Dynamic Source Tabs**: Interface adapts based on detected intent
- **Real-Time Results**: Live data from Google, YouTube, TikTok, Reddit, Amazon, news sites, and more

### 🎨 Beautiful UI/UX
- **Modern Design**: Clean, professional interface with smooth animations
- **Dark/Light Theme**: Seamless theme toggle with persistent storage
- **Responsive**: Perfect experience on mobile, tablet, and desktop
- **Framer Motion**: Smooth transitions and delightful micro-interactions

### ⚡ Performance
- **In-Memory Caching**: Intelligent caching to reduce API costs and improve speed
- **Optimized Loading**: Beautiful skeleton states and progressive enhancement
- **Error Handling**: Graceful error states with retry functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- API keys for:
  - [Serper.dev](https://serper.dev) - Search API
  - [OpenRouter](https://openrouter.ai) - AI API (Claude 3.5 Sonnet)

### Installation

1. **Clone the repository** (or use this Replit project)

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file or add to Replit Secrets:
```env
SERPER_API_KEY=your_serper_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
SESSION_SECRET=any_random_string_here
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5000` (or your Replit URL)

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- TailwindCSS + shadcn/ui components
- Framer Motion for animations
- TanStack Query for data fetching
- Wouter for routing

**Backend:**
- Node.js + Express
- TypeScript throughout
- Serper.dev API integration
- OpenRouter API integration
- In-memory caching

### Project Structure

```
novasearch/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/       # shadcn/ui primitives
│   │   │   ├── search-bar.tsx
│   │   │   ├── dynamic-tabs.tsx
│   │   │   ├── ai-summary.tsx
│   │   │   ├── result-card.tsx
│   │   │   └── ...
│   │   ├── pages/        # Page components
│   │   │   └── home.tsx
│   │   ├── lib/          # Utilities
│   │   └── App.tsx
│   └── index.html
├── server/                # Backend Express application
│   ├── lib/
│   │   ├── serper.ts    # Serper API integration
│   │   ├── openrouter.ts # AI integration
│   │   └── cache.ts     # Caching layer
│   ├── routes.ts        # API endpoints
│   └── index.ts
├── shared/               # Shared TypeScript types
│   └── schema.ts        # Zod schemas and types
└── README.md
```

## 🔌 API Endpoints

### Search
```
GET /api/search?query={query}
```
Returns search results with AI-detected intent, results from multiple sources, and AI summary.

**Response:**
```json
{
  "query": "best laptops 2025",
  "intent": "shopping",
  "results": [...],
  "summary": {
    "summary": "Top laptops for 2025 include...",
    "recommendations": [...],
    "suggestedQueries": [...]
  },
  "sources": [...]
}
```

### Intent Detection
```
POST /api/intent
Body: { "query": "your search query" }
```
Detects the intent category of a search query.

### Summarization
```
POST /api/summarize
Body: { "query": "...", "results": [...], "intent": "..." }
```
Generates AI summary for given search results.

### Health Check
```
GET /api/health
```
Returns server status and cache statistics.

## 🎯 Intent Categories

NovaSearch automatically detects and adapts to these intent types:

| Intent | Description | Example Tabs |
|--------|-------------|--------------|
| **Shopping** | Product searches, comparisons | Amazon, eBay, Walmart, AliExpress, Best Buy |
| **News** | Current events, headlines | CNN, BBC, Reuters, NY Times, TechCrunch |
| **Learning** | Educational content | Wikipedia, Medium, YouTube, Reddit, Stack Overflow |
| **Entertainment** | Videos, trends, social | TikTok, YouTube, Instagram, Reddit, Pinterest |
| **General** | Catch-all searches | Google, YouTube, TikTok, Reddit, Instagram |

## 🎨 Design System

NovaSearch follows a modern, professional design system:

- **Colors**: Vibrant blue primary, purple AI accent, green success indicators
- **Typography**: Inter for UI, JetBrains Mono for code
- **Spacing**: Consistent 4px grid system
- **Components**: Built on shadcn/ui with custom enhancements
- **Animations**: Subtle, purposeful transitions with Framer Motion

## 📊 Performance Optimizations

- **Caching Strategy**:
  - Search results: 5 minutes TTL
  - Intent detection: 10 minutes TTL
  - Automatic cleanup of expired entries

- **Parallel Processing**:
  - Multi-source searches run in parallel
  - Non-blocking AI summarization
  - Optimistic UI updates

- **Code Splitting**:
  - Component-level code splitting
  - Lazy loading for images
  - Efficient bundle size

## 🔒 Security & Privacy

- Environment variables for sensitive API keys
- CORS protection on backend routes
- No storage of user search data
- Secure API communication with credentials

## 🚢 Deployment

### Deploy on Replit (Recommended)
1. Fork this Repl
2. Add secrets (SERPER_API_KEY, OPENROUTER_API_KEY)
3. Click "Run"
4. Use the "Deploy" button to publish

### Deploy on Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy on Render
1. Create new Web Service
2. Connect repository
3. Set build command: `npm install`
4. Set start command: `npm run dev`
5. Add environment variables
6. Deploy

## 🧪 Testing

The application includes:
- Type safety with TypeScript throughout
- Zod schema validation for API responses
- Error boundaries for graceful failures
- Loading states for better UX

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SERPER_API_KEY` | API key from Serper.dev | Yes |
| `OPENROUTER_API_KEY` | API key from OpenRouter | Yes |
| `SESSION_SECRET` | Random string for sessions | Optional |

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Serper.dev** for the powerful search API
- **OpenRouter** for AI capabilities
- **shadcn/ui** for beautiful components
- **Vercel** for hosting infrastructure

## 📧 Support

For issues or questions, please open an issue on the repository.

---

**Built with ❤️ using React, TypeScript, and AI**
