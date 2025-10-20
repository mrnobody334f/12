import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, MapPin, Globe2, Settings2, Mic, Sparkles, Filter, CheckCircle2, Search } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { IntentSelector } from "@/components/intent-selector";
import { LocationSelector } from "@/components/location-selector";
import { SearchControlCenter } from "@/components/search-control-center";
import { OnboardingWelcome } from "@/components/onboarding-welcome";
import { DynamicTabs } from "@/components/dynamic-tabs";
import { SortOptions } from "@/components/sort-options";
import { Pagination } from "@/components/pagination";
import { BookmarkHistory } from "@/components/bookmark-history";
import { AISummaryCard } from "@/components/ai-summary";
import { ResultCard } from "@/components/result-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { SearchingSkeleton } from "@/components/loading-skeleton";
import { CorrectedQuery } from "@/components/corrected-query";
import { RelatedSearches } from "@/components/related-searches";
import { SearchTools, type TimeFilter, type LanguageFilter, type FileTypeFilter } from "@/components/search-tools";
import { ImageResults, VideoResults, PlaceResults, NewsResults } from "@/components/media-results";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { SearchResponse, IntentType, SortOption, ImageResult, VideoResult, PlaceResult, NewsResult } from "@shared/schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSource, setActiveSource] = useState("web");
  const [activePlatformSource, setActivePlatformSource] = useState("web");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [autoDetectIntent, setAutoDetectIntent] = useState(true);
  const [manualIntent, setManualIntent] = useState<IntentType | undefined>(undefined);
  const [accumulatedResults, setAccumulatedResults] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");
  const [userLocation, setUserLocation] = useState<{country: string; countryCode: string; city: string} | null>(null);
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("any");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("any");
  const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>("any");
  const [isScrolled, setIsScrolled] = useState(false);
  const [maxReachedPage, setMaxReachedPage] = useState(10);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast} = useToast();

  const { data: detectedLocation } = useQuery<{country: string; countryCode: string; city: string}>({
    queryKey: ["/api/location/detect"],
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (detectedLocation && !country && !countryCode && !isManualLocation) {
      // Don't set country/countryCode in state to keep location selector clean
      // We'll use detectedLocation directly for search
    }
  }, [detectedLocation, country, countryCode, isManualLocation]);

  // Use manual location if set, otherwise use detected location for search
  const effectiveCountry = isManualLocation ? country : (detectedLocation?.country || country);
  const effectiveCountryCode = isManualLocation ? countryCode : (detectedLocation?.countryCode || countryCode);
  const effectiveCity = isManualLocation ? city : "";

  const locationParams = (effectiveCountryCode && effectiveCountryCode !== "global" && effectiveCountryCode !== '') || effectiveCity 
    ? `&countryCode=${encodeURIComponent(effectiveCountryCode)}&country=${encodeURIComponent(effectiveCountry)}&city=${encodeURIComponent(effectiveCity)}`
    : "";

  const mediaLocationParams = effectiveCountryCode && effectiveCountryCode !== "global" && effectiveCountryCode !== ''
    ? `&countryCode=${encodeURIComponent(effectiveCountryCode)}`
    : "";

  const placesLocationParams = locationParams;

  const filterParams = `&timeFilter=${timeFilter}&languageFilter=${languageFilter}&fileTypeFilter=${fileTypeFilter}`;

  const isMediaTab = ['images', 'videos', 'places', 'news'].includes(activeSource);
  const isAllMediaTab = activeSource === 'all-media';
  
  // Use activePlatformSource when on all-media tab
  const effectiveSearchSource = isAllMediaTab ? (activePlatformSource || 'web') : activeSource;
  
  const { data, isLoading, error, refetch } = useQuery<SearchResponse>({
    queryKey: [
      `/api/search?query=${encodeURIComponent(searchQuery)}&source=${effectiveSearchSource}&page=${currentPage}&limit=20&sort=${sortBy}&autoDetect=${autoDetectIntent}${
        !autoDetectIntent && manualIntent ? `&intent=${manualIntent}` : ""
      }${locationParams}${filterParams}`,
    ],
    enabled: !!searchQuery && !isMediaTab,
  });

  const getPlatformSite = (platformId: string): string => {
    const platformMap: Record<string, string> = {
      twitter: 'twitter.com',
      facebook: 'facebook.com',
      instagram: 'instagram.com',
      tiktok: 'tiktok.com',
      reddit: 'reddit.com',
      youtube: 'youtube.com',
      pinterest: 'pinterest.com',
      linkedin: 'linkedin.com',
      quora: 'quora.com',
      wikipedia: 'wikipedia.org',
    };
    return platformMap[platformId] || platformId;
  };

  const siteParam = activePlatformSource !== 'web' 
    ? `&site=${getPlatformSite(activePlatformSource)}` 
    : '';

  const { data: imagesData, isLoading: imagesLoading } = useQuery<{images: ImageResult[], totalPages?: number, currentPage?: number}>({
    queryKey: [`/api/search/images?query=${encodeURIComponent(searchQuery)}${mediaLocationParams}&languageFilter=${languageFilter}${siteParam}&page=${currentPage}`],
    enabled: !!searchQuery && activeSource === 'images',
  });

  const { data: videosData, isLoading: videosLoading } = useQuery<{videos: VideoResult[]}>({
    queryKey: [`/api/search/videos?query=${encodeURIComponent(searchQuery)}${mediaLocationParams}&languageFilter=${languageFilter}${siteParam}&page=${currentPage}`],
    enabled: !!searchQuery && activeSource === 'videos',
  });

  const { data: placesData, isLoading: placesLoading } = useQuery<{places: PlaceResult[]}>({
    queryKey: [`/api/search/places?query=${encodeURIComponent(searchQuery)}${placesLocationParams}&languageFilter=${languageFilter}${siteParam}`],
    enabled: !!searchQuery && activeSource === 'places',
  });

  const { data: newsData, isLoading: newsLoading } = useQuery<{news: NewsResult[]}>({
    queryKey: [`/api/search/news?query=${encodeURIComponent(searchQuery)}${mediaLocationParams}&languageFilter=${languageFilter}&timeFilter=${timeFilter}${siteParam}`],
    enabled: !!searchQuery && activeSource === 'news',
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/bookmarks", {
        query: searchQuery,
        results: data?.results,
      });
    },
    onSuccess: () => {
      toast({
        title: "Bookmark saved",
        description: `"${searchQuery}" has been added to your bookmarks`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save bookmark",
        variant: "destructive",
      });
    },
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setActiveSource("web");
    setActivePlatformSource("web");
    setCurrentPage(1);
    setMaxReachedPage(10);
    setAccumulatedResults([]);
    setTabsPage(2);
  };

  const handleSourceChange = (sourceId: string) => {
    const isMediaType = ['images', 'videos', 'places', 'news'].includes(sourceId);
    
    setActiveSource(sourceId);
    
    // Update platform source only for non-media tabs (excluding all-media)
    if (!isMediaType && sourceId !== 'all-media') {
      setActivePlatformSource(sourceId);
    }
    
    setCurrentPage(1);
    setMaxReachedPage(10);
    setAccumulatedResults([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (page >= maxReachedPage) {
      setMaxReachedPage(page + 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setCurrentPage(prev => {
      const nextPage = prev + 1;
      if (nextPage >= maxReachedPage) {
        setMaxReachedPage(nextPage + 1);
      }
      return nextPage;
    });
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
    setMaxReachedPage(10);
    setAccumulatedResults([]);
  };

  const handleIntentChange = (intent: IntentType | undefined) => {
    setManualIntent(intent);
    setTabsPage(2);
    if (searchQuery) {
      setCurrentPage(1);
      setMaxReachedPage(10);
      refetch();
    }
  };

  const handleAutoDetectChange = (enabled: boolean) => {
    setAutoDetectIntent(enabled);
    if (searchQuery) {
      setCurrentPage(1);
      setMaxReachedPage(10);
      refetch();
    }
  };

  const handleLocationChange = (newCountry: string, newCountryCode: string, newCity: string) => {
    setCountry(newCountry);
    setCountryCode(newCountryCode);
    setCity(newCity);
    setIsManualLocation(true);
    if (searchQuery) {
      setCurrentPage(1);
      setMaxReachedPage(10);
      refetch();
    }
  };

  const handleRetry = () => {
    refetch();
  };

  const handleBookmarkClick = () => {
    bookmarkMutation.mutate();
  };

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    setCurrentPage(1);
    setMaxReachedPage(10);
    setAccumulatedResults([]);
  };

  const handleLanguageFilterChange = (filter: LanguageFilter) => {
    setLanguageFilter(filter);
    setCurrentPage(1);
    setMaxReachedPage(10);
    setAccumulatedResults([]);
  };

  const handleFileTypeFilterChange = (filter: FileTypeFilter) => {
    setFileTypeFilter(filter);
    setCurrentPage(1);
    setMaxReachedPage(10);
    setAccumulatedResults([]);
  };

  const handleClearFilters = () => {
    setTimeFilter("any");
    setLanguageFilter("any");
    setFileTypeFilter("any");
    setCurrentPage(1);
    setMaxReachedPage(10);
    setAccumulatedResults([]);
  };
  
  const [tabsPage, setTabsPage] = useState(2);
  
  const handleLoadMoreTabs = async () => {
    try {
      const currentIntent = autoDetectIntent ? detectedIntent : manualIntent;
      if (!currentIntent || currentIntent === 'general') {
        console.log('No intent active, skipping more tabs');
        return [];
      }
      
      const response = await fetch(
        `/api/more-tabs?query=${encodeURIComponent(searchQuery)}&page=${tabsPage}&intent=${currentIntent}${locationParams}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch more tabs");
      }
      
      const result = await response.json();
      setTabsPage(prev => prev + 1);
      return result.domains || [];
    } catch (error) {
      console.error("Error loading more tabs:", error);
      return [];
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const cacheKey = `search_cache_${searchQuery}_${activeSource}_${sortBy}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          if (parsedCache.timestamp && Date.now() - parsedCache.timestamp < 5 * 60 * 1000) {
            setAccumulatedResults(parsedCache.results);
          }
        } catch (e) {
          // Invalid cache
        }
      }
    }
  }, [searchQuery, activeSource, sortBy]);

  useEffect(() => {
    if (data?.results) {
      if (currentPage === 1) {
        setAccumulatedResults(data.results);
        setIsLoadingMore(false);
        
        const cacheKey = `search_cache_${searchQuery}_${activeSource}_${sortBy}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          results: data.results,
          timestamp: Date.now()
        }));
      } else {
        setAccumulatedResults(prev => {
          const existingLinks = new Set(prev.map(r => r.link));
          const newResults = data.results.filter(r => !existingLinks.has(r.link));
          const allResults = [...prev, ...newResults];
          
          const cacheKey = `search_cache_${searchQuery}_${activeSource}_${sortBy}`;
          localStorage.setItem(cacheKey, JSON.stringify({
            results: allResults,
            timestamp: Date.now()
          }));
          
          return allResults;
        });
        setIsLoadingMore(false);
      }
    }
  }, [data, currentPage, searchQuery, activeSource, sortBy]);

  const filteredResults = accumulatedResults.length > 0 ? accumulatedResults : (data?.results || []);
  const currentSources = data?.sources || [];
  const intentSources = data?.intentSources || [];
  const detectedIntent = data?.intent;
  const hasSearched = searchQuery.length > 0;
  const pagination = data?.pagination;

  const getResultsLabel = (source: string): string => {
    if (source === "web") return "Web results";
    
    const platformNames: Record<string, string> = {
      twitter: "Twitter",
      facebook: "Facebook",
      instagram: "Instagram",
      tiktok: "TikTok",
      reddit: "Reddit",
      youtube: "YouTube",
      pinterest: "Pinterest",
      linkedin: "LinkedIn",
      quora: "Quora",
      wikipedia: "Wikipedia",
    };
    
    const platformName = platformNames[source.toLowerCase()];
    if (platformName) return `${platformName} results`;
    
    const domainName = source.replace(/\.(com|org|net|io|co|edu|gov)$/i, "");
    const capitalizedName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
    return `${capitalizedName} results`;
  };

  // Scroll Detection for Compact Header
  useEffect(() => {
    if (!hasSearched) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        const scrollPosition = window.scrollY;
        const shouldBeScrolled = scrollPosition > 150;
        if (shouldBeScrolled !== isScrolled) {
          setIsScrolled(shouldBeScrolled);
        }
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [hasSearched, isScrolled]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if user is typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Allow Escape to blur
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // "/" - Focus search (works always, not just on homepage)
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-testid="input-search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Ctrl+K or Cmd+K - Quick search (focus search bar)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-testid="input-search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Escape - Clear search and go home
      if (e.key === 'Escape' && hasSearched) {
        setSearchQuery("");
        setCurrentPage(1);
        setAccumulatedResults([]);
      }

      // Arrow navigation for results (when results are visible)
      if (hasSearched && filteredResults.length > 0) {
        const results = document.querySelectorAll('[data-testid^="card-result-"]');
        const focused = document.activeElement;
        const currentIndex = Array.from(results).findIndex(el => el.contains(focused));

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentIndex < results.length - 1) {
            const nextResult = results[currentIndex + 1] as HTMLElement;
            const link = nextResult.querySelector('a');
            if (link) link.focus();
          } else if (currentIndex === -1 && results.length > 0) {
            const firstLink = results[0].querySelector('a') as HTMLElement;
            if (firstLink) firstLink.focus();
          }
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentIndex > 0) {
            const prevResult = results[currentIndex - 1] as HTMLElement;
            const link = prevResult.querySelector('a');
            if (link) link.focus();
          }
        }

        // Enter - Open focused result
        if (e.key === 'Enter' && focused && focused.tagName === 'A') {
          (focused as HTMLAnchorElement).click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSearched, filteredResults, setSearchQuery, setCurrentPage, setAccumulatedResults]);

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Onboarding Welcome Toast */}
      <OnboardingWelcome />
      
      {/* Compact Smart Header */}
      {hasSearched && (
        <header className="border-b border-border/40 bg-white dark:bg-background shadow-sm">
          {/* Main Header Row - Compact */}
          <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center gap-3">
            {/* Logo */}
            <div 
              className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 hover-elevate active-elevate-2 rounded-lg px-1.5 py-0.5 transition-all" 
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
                setAccumulatedResults([]);
              }}
              data-testid="link-home"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-[#4285f4] to-[#34a853] rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">N</span>
              </div>
            </div>

            {/* Search Bar - Larger */}
            <div className="flex-1 max-w-2xl">
              <SearchBar
                onSearch={handleSearch}
                initialQuery={searchQuery}
                isSearching={isLoading}
              />
            </div>

            {/* Location Selector - Clear */}
            <LocationSelector
              country={country}
              countryCode={countryCode}
              city={city}
              onLocationChange={handleLocationChange}
              detectedLocation={detectedLocation}
            />

            {/* Intent Auto-detect Toggle & Manual Options */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <IntentSelector
                selectedIntent={manualIntent}
                onIntentChange={handleIntentChange}
                autoDetect={autoDetectIntent}
                onAutoDetectChange={handleAutoDetectChange}
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <SearchTools
                timeFilter={timeFilter}
                languageFilter={languageFilter}
                fileTypeFilter={fileTypeFilter}
                onTimeFilterChange={handleTimeFilterChange}
                onLanguageFilterChange={handleLanguageFilterChange}
                onFileTypeFilterChange={handleFileTypeFilterChange}
                onClearFilters={handleClearFilters}
              />
              <BookmarkHistory onSearchClick={handleSearch} />
              {data && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBookmarkClick}
                  disabled={bookmarkMutation.isPending}
                  data-testid="button-bookmark"
                  className="h-7 w-7"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>

          {/* Sources & Filters Row */}
          <div className="border-t border-border/20 bg-muted/30">
            <div className="max-w-[1400px] mx-auto px-4 py-2">
              <DynamicTabs
                sources={currentSources}
                intentSources={intentSources}
                activeSource={activeSource}
                activePlatformSource={activePlatformSource}
                onSourceChange={handleSourceChange}
                showPlatformTabs={true}
                searchQuery={searchQuery}
                detectedIntent={detectedIntent}
                onLoadMoreTabs={handleLoadMoreTabs}
                location={{ countryCode, city }}
              />
            </div>
          </div>
        </header>
      )}

      {/* Enhanced Landing Page */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 py-12">
          {/* Logo & Tagline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-10 text-center"
          >
            <div className="flex flex-col items-center gap-5">
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-[#4285f4] via-[#34a853] to-[#fbbc04] rounded-3xl flex items-center justify-center shadow-2xl"
                animate={{ 
                  boxShadow: [
                    "0 20px 60px -15px rgba(66, 133, 244, 0.3)",
                    "0 25px 70px -15px rgba(52, 168, 83, 0.4)",
                    "0 20px 60px -15px rgba(66, 133, 244, 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-white font-bold text-5xl">N</span>
              </motion.div>
              <div>
                <h1 className="text-6xl font-normal text-foreground tracking-tight mb-2">
                  NovaSearch
                </h1>
                <p className="text-lg text-muted-foreground">
                  AI-powered search with smart insights
                </p>
              </div>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-3xl mb-8"
          >
            <SearchBar
              onSearch={handleSearch}
              initialQuery={searchQuery}
              isSearching={isLoading}
            />
            <p className="text-xs text-muted-foreground text-center mt-3">
              Press <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">Ctrl+K</kbd> or <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">/</kbd> to search
            </p>
          </motion.div>

          {/* Sample Queries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-3xl mb-10"
          >
            <p className="text-sm text-muted-foreground mb-3 text-center">Try searching for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { query: "أفضل هواتف 2025", icon: "🛒" },
                { query: "How to learn React", icon: "📚" },
                { query: "Latest AI news", icon: "📰" },
                { query: "Healthy recipes", icon: "🍳" },
                { query: "أفضل مطاعم القاهرة", icon: "🍽️" },
                { query: "Best laptops 2025", icon: "💻" }
              ].map((sample, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSearch(sample.query)}
                  className="px-4 py-2 text-sm bg-card border border-card-border rounded-full hover-elevate active-elevate-2 transition-all flex items-center gap-2"
                  data-testid={`button-sample-${i}`}
                >
                  <span>{sample.icon}</span>
                  <span>{sample.query}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Interactive Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full max-w-4xl mb-10"
          >
            <h2 className="text-lg font-semibold text-center mb-6">
              Powerful Features to Enhance Your Search
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Voice Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-5 rounded-xl bg-card border border-card-border hover-elevate transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Mic className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">Voice Search</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Speak your query in English or Arabic for hands-free searching
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const voiceButton = document.querySelector('[data-testid="button-voice-search"]') as HTMLButtonElement;
                        if (voiceButton) voiceButton.click();
                      }}
                      data-testid="button-try-voice"
                    >
                      Try it now
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Location-based Results */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-5 rounded-xl bg-card border border-card-border hover-elevate transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">Location-based Results</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get relevant results for your location or search anywhere globally
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid="button-try-location"
                        >
                          Try it now
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <LocationSelector
                          country={country}
                          countryCode={countryCode}
                          city={city}
                          onLocationChange={handleLocationChange}
                          detectedLocation={detectedLocation}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </motion.div>

              {/* Auto-Intent Detection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-5 rounded-xl bg-card border border-card-border hover-elevate transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">
                      Smart Intent Detection
                      {autoDetectIntent && (
                        <CheckCircle2 className="inline-block h-4 w-4 text-green-500 ml-2" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      AI automatically understands if you want products, news, or information
                    </p>
                    <Button
                      size="sm"
                      variant={autoDetectIntent ? "secondary" : "outline"}
                      onClick={() => handleAutoDetectChange(!autoDetectIntent)}
                      data-testid="button-try-intent"
                    >
                      {autoDetectIntent ? "Enabled" : "Enable now"}
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Advanced Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="p-5 rounded-xl bg-card border border-card-border hover-elevate transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Filter className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">Advanced Filters</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Refine by time, language, and file type to find exactly what you need
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid="button-try-filters"
                        >
                          Try it now
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Search Filters</h4>
                          <SearchTools
                            timeFilter={timeFilter}
                            languageFilter={languageFilter}
                            fileTypeFilter={fileTypeFilter}
                            onTimeFilterChange={handleTimeFilterChange}
                            onLanguageFilterChange={handleLanguageFilterChange}
                            onFileTypeFilterChange={handleFileTypeFilterChange}
                            onClearFilters={handleClearFilters}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Search Control Center */}
          <SearchControlCenter
            country={country}
            countryCode={countryCode}
            city={city}
            onLocationChange={handleLocationChange}
            detectedLocation={detectedLocation}
            autoDetectIntent={autoDetectIntent}
            manualIntent={manualIntent}
            onIntentChange={handleIntentChange}
            onAutoDetectChange={handleAutoDetectChange}
          />

          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            <ThemeToggle />
          </motion.div>
        </div>
      )}

      {/* Content Area */}
      <main className={hasSearched ? "max-w-[1400px] mx-auto px-6 py-4" : ""}>
        {hasSearched && (isLoading || imagesLoading || videosLoading || placesLoading || newsLoading) && currentPage === 1 && <SearchingSkeleton />}

        {hasSearched && error && (
          <ErrorState
            message="Failed to fetch search results. Please try again."
            onRetry={handleRetry}
          />
        )}

        {hasSearched && !isLoading && !error && data && (!isMediaTab || isAllMediaTab) && (
          <div className="space-y-6">
            {/* Corrected Query */}
            {data.correctedQuery && data.correctedQuery !== searchQuery && (
              <CorrectedQuery
                originalQuery={searchQuery}
                correctedQuery={data.correctedQuery}
                onSearch={handleSearch}
              />
            )}

            {/* Result Label and Sort Options */}
            {filteredResults.length > 0 && (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="text-xs font-medium px-3 py-1">
                    {getResultsLabel(activeSource)}
                  </Badge>
                  {isManualLocation && (country || city) && (
                    <Badge variant="secondary" className="text-xs px-3 py-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {city ? `${city}, ${country}` : country}
                    </Badge>
                  )}
                </div>
                <SortOptions
                  selectedSort={sortBy}
                  onSortChange={handleSortChange}
                  resultCount={pagination?.totalResults || filteredResults.length}
                />
              </div>
            )}

            {/* AI Summary as Featured Snippet */}
            {data.summary && activeSource === "all" && currentPage === 1 && (
              <AISummaryCard summary={data.summary} query={searchQuery} />
            )}

            {/* Results */}
            {filteredResults.length > 0 ? (
              <div className="space-y-8">
                <div className="space-y-8" data-testid="results-container">
                  {filteredResults.map((result, index) => (
                    <ResultCard key={`${result.link}-${index}`} result={result} index={index} />
                  ))}
                </div>

                {/* Numbered Pagination */}
                {pagination && pagination.totalResults > 0 && (
                  <div className="flex flex-col items-center gap-4 pt-8 pb-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.min(Math.ceil(pagination.totalResults / 20), maxReachedPage)}
                      onPageChange={handlePageChange}
                      hasNext={pagination.hasNext && currentPage < Math.ceil(pagination.totalResults / 20)}
                      hasPrevious={currentPage > 1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Page {currentPage} of {Math.ceil(pagination.totalResults / 20)}
                    </p>
                  </div>
                )}

                {/* Related Searches */}
                {data.relatedSearches && data.relatedSearches.length > 0 && (
                  <RelatedSearches
                    searches={data.relatedSearches}
                    onSearch={handleSearch}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}"
                  {activeSource !== "all" && ` in ${activeSource}`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Media Results */}
        {hasSearched && activeSource === 'images' && !imagesLoading && imagesData && (
          <ImageResults 
            images={imagesData.images} 
            currentPage={currentPage}
            totalPages={imagesData.totalPages || 10}
            onPageChange={handlePageChange}
          />
        )}

        {hasSearched && activeSource === 'videos' && !videosLoading && videosData && (
          <VideoResults videos={videosData.videos} />
        )}

        {hasSearched && activeSource === 'places' && !placesLoading && placesData && (
          <PlaceResults places={placesData.places} />
        )}

        {hasSearched && activeSource === 'news' && !newsLoading && newsData && (
          <NewsResults news={newsData.news} />
        )}
      </main>

      {/* Footer - Simple Google style */}
      {!hasSearched && (
        <footer className="fixed bottom-0 w-full border-t border-border/40 bg-white/80 dark:bg-background/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span>About</span>
              <span>Privacy</span>
              <span>Terms</span>
              <span className="text-foreground/50">&copy; 2025 NovaSearch</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
