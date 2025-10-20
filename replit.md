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
- **January 2025**: UI Enhancements - Did You Mean Fix & Font Customization
  - **Fixed "Did You Mean"**: Now correctly extracts spelling corrections from `searchInformation.showingResultsFor`
    - Also maintains fallback to `searchParameters.correctedQuery` for compatibility
    - Shows actual corrected queries from Serper API (e.g., "google" when you type "ggle")
  - **Enhanced Color Customizer**: Added comprehensive font customization options
    - New "Font" tab with 11 font families (including Arabic fonts: Cairo, Amiri, Tajawal)
    - Font size slider (12-24px) with live preview
    - Improved dark mode color application via dynamic style element
    - Separate localStorage persistence for font and color settings
  - **Verified GeoIP Integration**: Confirmed location parameters flow correctly to Serper
    - `effectiveCountryCode` properly sent as `gl` parameter in search requests
    - Observable in logs: `"gl": "eg"` for Egyptian users

- **January 2025**: GeoIP Auto-Detection & Popular Sites System
  - **Auto Country Detection**: Automatically detects user's country on page load using GeoIP (country only, no city)
    - Works seamlessly on initial visit without requiring permissions
    - Preserves manual location overrides
    - Fallback to 'global' if GeoIP fails
  - **Enhanced Intent Detection**: Improved AI-powered intent classification
    - Better prompts for Claude 3.5 Sonnet with clear examples and rules
    - Enhanced keyword fallback with weighted patterns (40+ patterns per intent)
    - Support for Arabic keywords across all modes
    - More accurate classification for shopping, news, learning, entertainment
  - **Popular Sites Database**: Comprehensive catalog of top sites by country and intent
    - 6 countries: US, UK, Egypt, Saudi Arabia, UAE, India
    - 10 sites per country per intent mode (shopping, news, learning, entertainment, general)
    - Global fallback sites for countries not in database
    - 300+ curated domains total
  - **Smart Dynamic Tabs**: Location-aware tabs with global/local toggle
    - Shows popular sites based on detected or selected country
    - Global toggle button to switch between local and worldwide sites
    - Location badge showing current mode (e.g., "Popular in SA")
    - Graceful fallback to legacy domain extraction if needed
    - Separate cache keys for each country/intent/mode combination
  
- **January 2025**: Dynamic tabs system implementation
  - **Dynamic Domain Extraction**: Tabs are now generated from actual search results (top 10 domains)
  - **Intent-Based Filtering**: Each mode (shopping, news, learning, entertainment) filters tabs by site type
  - **Intelligent Site Classification**: Curated allow lists for major sites (100+ vetted domains)
  - **Auto-Detect Control**: Tabs only appear when auto-detect is enabled OR manual intent is selected
  - **More Tabs Feature**: Load additional domain tabs from next page of search results
  
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
1. **GeoIP Location Detection**: Automatic country detection on page load without requiring permissions
2. **Enhanced AI Intent Detection**: Improved accuracy with better prompts and 40+ keyword patterns per mode
3. **Popular Sites System**: Country-aware site recommendations (300+ curated domains across 6 countries)
4. **Smart Dynamic Tabs**: Location-aware tabs with global/local toggle and intelligent fallback
5. **Multi-Source Search**: Parallel fetching from Google, YouTube, TikTok, Reddit, Amazon, news sites, etc.
6. **AI Summarization**: Smart summaries with top recommendations and suggested queries
7. **Real-time Results**: Live data from Serper.dev API with site-specific queries
8. **Beautiful UI**: Modern design with smooth animations, gradients, and responsive layout
9. **Theme Support**: Full light/dark mode toggle with persistent storage
10. **Intelligent Caching**: Optimized cache keys by country, intent, and mode for better performance

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
- `GET /api/popular-sites?intent={intent}&countryCode={code}&isGlobal={bool}` - Get popular sites by country and intent
- `GET /api/geocode?lat={lat}&lng={lng}` - Reverse geocode GPS coordinates to location
- `GET /api/more-tabs?query={query}&intent={intent}&page={num}` - Load additional domain tabs
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
│   ├── openrouter.ts (OpenRouter AI integration + enhanced intent detection)
│   ├── popular-sites.ts (Popular sites database by country and intent)
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
