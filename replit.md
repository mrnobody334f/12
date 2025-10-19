# NovaSearch - Next-Gen AI-Powered Search Engine

## Overview
NovaSearch is a cutting-edge AI-powered meta-search engine that intelligently understands user intent and delivers results from multiple sources with AI-generated summaries. Think "Google + Perplexity + Amazon + TikTok" combined into one intelligent platform.

## Purpose
To provide users with a next-generation search experience that:
- Automatically detects search intent (shopping, news, learning, entertainment, general)
- Dynamically adapts the interface with relevant source tabs
- Aggregates real-time results from multiple platforms
- Delivers AI-powered summaries and smart recommendations

## Current State
**Status**: MVP Complete - Full-stack AI search engine with beautiful UI and intelligent backend

**Last Updated**: January 2025

## Recent Changes
- **January 2025**: Dynamic tabs system implementation
  - **Dynamic Domain Extraction**: Tabs are now generated from actual search results (top 10 domains)
  - **Intent-Based Filtering**: Each mode (shopping, news, learning, entertainment) filters tabs by site type
    - Shopping mode: Shows only e-commerce sites from search results
    - News mode: Shows only news/media sites from search results  
    - Learning mode: Shows only educational sites from search results
    - Entertainment mode: Shows only entertainment/social sites from search results
  - **Location-Aware Tabs**: Tabs adapt based on selected country (e.g., SA shows Jarir, Noon; US shows Amazon, Walmart)
  - **Intelligent Site Classification**: Curated allow lists for major sites (100+ vetted domains) plus pattern matching fallback with exclude lists
    - Shopping: Amazon, eBay, Walmart, Target, Noon, Jarir, and 20+ more
    - News: CNN, BBC, Guardian, Atlantic, Forbes, Reuters, and 35+ more  
    - Learning: Wikipedia, Stack Overflow, Medium, MIT, Stanford, and 25+ more
    - Entertainment: YouTube, TikTok, Netflix, Spotify, Instagram, and 20+ more
  - **Auto-Detect Control**: Tabs only appear when auto-detect is enabled OR manual intent is selected
  - **More Tabs Feature**: Load additional domain tabs from next page of search results
  - **Cache Optimization**: Separate cache keys for each intent and location combination
  
- **January 2025**: Initial implementation
  - Built complete schema with intent types, search results, and AI summary models
  - Created stunning frontend with React, Framer Motion, and shadcn/ui components
  - Implemented SearchBar, DynamicTabs, AISmartSummary, ResultCard components
  - Added beautiful loading states, empty states, and error handling
  - Integrated theme toggle with light/dark mode support
  - Built backend API with Serper.dev and OpenRouter integration
  - Implemented caching layer for performance optimization
  - Created endpoints for intent detection, search, and summarization

## Project Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **Styling**: TailwindCSS with custom design system
- **Animations**: Framer Motion
- **State Management**: TanStack Query v5
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React

### Backend Stack
- **Runtime**: Node.js with Express
- **Build Tool**: Vite
- **Type Safety**: TypeScript throughout
- **Caching**: In-memory cache with TTL
- **External APIs**:
  - Serper.dev for multi-source search
  - OpenRouter (Claude 3.5 Sonnet) for AI intent detection and summarization

### Key Features
1. **AI Intent Detection**: Automatically classifies queries into shopping, news, learning, entertainment, or general
2. **Dynamic Source Tabs**: Interface adapts based on detected intent with relevant sources
3. **Multi-Source Search**: Parallel fetching from Google, YouTube, TikTok, Reddit, Amazon, news sites, etc.
4. **AI Summarization**: Smart summaries with top recommendations and suggested queries
5. **Real-time Results**: Live data from Serper.dev API with site-specific queries
6. **Beautiful UI**: Modern design with smooth animations, gradients, and responsive layout
7. **Theme Support**: Full light/dark mode toggle with persistent storage
8. **Caching**: Intelligent caching to reduce API costs and improve performance

## Data Model

### Search Intent Types
- `shopping`: Product searches, comparisons, purchasing intent
- `news`: Current events, headlines, breaking news
- `learning`: Educational content, tutorials, how-to guides
- `entertainment`: Videos, trends, social media content
- `general`: General web searches, catch-all category

### Source Configuration
Each intent type has dedicated sources:
- **Shopping**: Amazon, eBay, Walmart, AliExpress, Best Buy
- **News**: CNN, BBC, Reuters, NY Times, TechCrunch
- **Learning**: Wikipedia, Medium, YouTube, Reddit, Stack Overflow
- **Entertainment**: TikTok, YouTube, Instagram, Reddit, Pinterest
- **General**: Google, YouTube, TikTok, Reddit, Instagram

### API Endpoints
- `GET /api/search?query={query}&source={source}&intent={intent}` - Main search endpoint
- `POST /api/intent` - Detect search intent from query
- `POST /api/summarize` - Generate AI summary for results
- `GET /api/health` - Health check and cache stats

## File Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── search-bar.tsx
│   │   ├── dynamic-tabs.tsx
│   │   ├── ai-summary.tsx
│   │   ├── result-card.tsx
│   │   ├── loading-skeleton.tsx
│   │   ├── empty-state.tsx
│   │   └── error-state.tsx
│   ├── pages/
│   │   ├── home.tsx (main search page)
│   │   └── not-found.tsx
│   ├── lib/
│   │   └── queryClient.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
server/
├── lib/
│   ├── serper.ts (Serper.dev integration)
│   ├── openrouter.ts (OpenRouter AI integration)
│   └── cache.ts (in-memory caching)
├── routes.ts (API endpoints)
├── storage.ts (minimal - no persistent storage needed)
└── index.ts
shared/
└── schema.ts (TypeScript types and Zod schemas)
```

## Environment Variables
Required secrets (configured in Replit Secrets):
- `SERPER_API_KEY`: API key for Serper.dev search API
- `OPENROUTER_API_KEY`: API key for OpenRouter AI API
- `SESSION_SECRET`: Session secret (not actively used in MVP)

## Design System

### Colors
- **Primary**: Vibrant blue (`221 83% 53%`) for CTAs and active states
- **AI Accent**: Purple (`262 83% 58%`) for AI-related features
- **Success**: Green (`142 71% 45%`) for verified sources
- **Background**: White (light) / Dark blue-gray (dark)
- **Card**: Subtle gray elevated surfaces

### Typography
- **Font Family**: Inter (sans-serif), JetBrains Mono (monospace)
- **Hierarchy**: Clear distinction between titles, snippets, and metadata

### Spacing
- Consistent use of Tailwind spacing scale (2, 4, 6, 8, 12, 16)
- Generous padding in search bar and cards
- Proper gap spacing in grids and flexbox layouts

### Components
- All components follow shadcn/ui patterns
- Proper use of hover-elevate and active-elevate-2 utilities
- Smooth transitions with Framer Motion
- Responsive design with mobile-first approach

## User Preferences
None configured yet - this is the initial implementation.

## Running the Project
1. Start the development server: `npm run dev`
2. The app runs on port 5000 (frontend + backend on same port via Vite)
3. Search functionality requires valid API keys for Serper and OpenRouter

## Known Limitations
- Results are fetched in real-time (no historical data)
- Cache TTL is 5 minutes for search results, 10 minutes for intent detection
- Some sources may have rate limits or blocking (handled gracefully)
- AI summary generation depends on OpenRouter API availability

## Future Enhancements (Post-MVP)
- Redis caching for better performance
- Search history and personalization
- Advanced filters (date range, content type)
- Autocomplete suggestions with trending searches
- AdSense integration
- User accounts and saved searches
- Analytics and usage tracking
