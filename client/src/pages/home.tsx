import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, MapPin, Globe2, Settings2 } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { IntentSelector } from "@/components/intent-selector";
import { LocationSelector } from "@/components/location-selector";
import { SearchControlCenter } from "@/components/search-control-center";
import { StatusBar } from "@/components/status-bar";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SearchResponse, IntentType, SortOption } from "@shared/schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSource, setActiveSource] = useState("all");
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
  const { toast} = useToast();

  const { data: detectedLocation } = useQuery<{country: string; countryCode: string; city: string}>({
    queryKey: ["/api/location/detect"],
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (detectedLocation && !country && !countryCode && !isManualLocation) {
      setCountry(detectedLocation.country);
      setCountryCode(detectedLocation.countryCode);
      setCity("");
    }
  }, [detectedLocation, country, countryCode, isManualLocation]);

  const effectiveCountry = country;
  const effectiveCountryCode = countryCode;
  const effectiveCity = city;

  const locationParams = (effectiveCountryCode && effectiveCountryCode !== "global" && effectiveCountryCode !== '') || effectiveCity 
    ? `&countryCode=${encodeURIComponent(effectiveCountryCode)}&country=${encodeURIComponent(effectiveCountry)}&city=${encodeURIComponent(effectiveCity)}`
    : "";

  const filterParams = `&timeFilter=${timeFilter}&languageFilter=${languageFilter}&fileTypeFilter=${fileTypeFilter}`;

  const { data, isLoading, error, refetch } = useQuery<SearchResponse>({
    queryKey: [
      `/api/search?query=${encodeURIComponent(searchQuery)}&source=${activeSource}&page=${currentPage}&limit=20&sort=${sortBy}&autoDetect=${autoDetectIntent}${
        !autoDetectIntent && manualIntent ? `&intent=${manualIntent}` : ""
      }${locationParams}${filterParams}`,
    ],
    enabled: !!searchQuery,
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
    setActiveSource("all");
    setCurrentPage(1);
    setAccumulatedResults([]);
    setTabsPage(2);
  };

  const handleSourceChange = (sourceId: string) => {
    setActiveSource(sourceId);
    setCurrentPage(1);
    setAccumulatedResults([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
    setAccumulatedResults([]);
  };

  const handleIntentChange = (intent: IntentType | undefined) => {
    setManualIntent(intent);
    setTabsPage(2);
    if (searchQuery) {
      setCurrentPage(1);
      refetch();
    }
  };

  const handleAutoDetectChange = (enabled: boolean) => {
    setAutoDetectIntent(enabled);
    if (searchQuery) {
      setCurrentPage(1);
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
    setAccumulatedResults([]);
  };

  const handleLanguageFilterChange = (filter: LanguageFilter) => {
    setLanguageFilter(filter);
    setCurrentPage(1);
    setAccumulatedResults([]);
  };

  const handleFileTypeFilterChange = (filter: FileTypeFilter) => {
    setFileTypeFilter(filter);
    setCurrentPage(1);
    setAccumulatedResults([]);
  };

  const handleClearFilters = () => {
    setTimeFilter("any");
    setLanguageFilter("any");
    setFileTypeFilter("any");
    setCurrentPage(1);
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
      {/* Compact Smart Header */}
      {hasSearched && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-background/80 shadow-sm">
          {/* Main Header Row - Compressed */}
          <div className="border-b border-border/20">
            <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center gap-3">
              {/* Logo - Smaller */}
              <div 
                className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 hover-elevate active-elevate-2 rounded-lg px-2 py-1 transition-all" 
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                  setAccumulatedResults([]);
                }}
                data-testid="link-home"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-[#4285f4] to-[#34a853] rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-base">N</span>
                </div>
                <h1 className="text-base font-semibold text-foreground hidden lg:block">
                  NovaSearch
                </h1>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <SearchBar
                  onSearch={handleSearch}
                  initialQuery={searchQuery}
                  isSearching={isLoading}
                />
              </div>

              {/* Compact Intent Selector as Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="gap-1.5 hidden sm:flex"
                    data-testid="button-intent-selector"
                  >
                    <Settings2 className="h-4 w-4" />
                    <span className="text-xs hidden md:inline">
                      {autoDetectIntent ? "Auto" : manualIntent || "Intent"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80">
                  <IntentSelector
                    selectedIntent={manualIntent}
                    onIntentChange={handleIntentChange}
                    autoDetect={autoDetectIntent}
                    onAutoDetectChange={handleAutoDetectChange}
                  />
                </PopoverContent>
              </Popover>

              {/* Right Actions - Compact */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <LocationSelector
                  country={country}
                  countryCode={countryCode}
                  city={city}
                  onLocationChange={handleLocationChange}
                  detectedLocation={detectedLocation}
                />
                <BookmarkHistory onSearchClick={handleSearch} />
                {data && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBookmarkClick}
                    disabled={bookmarkMutation.isPending}
                    data-testid="button-bookmark"
                    className="h-8 w-8"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                )}
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <StatusBar
            autoDetectIntent={autoDetectIntent}
            manualIntent={manualIntent}
            country={country}
            countryCode={countryCode}
            city={city}
            timeFilter={timeFilter}
            languageFilter={languageFilter}
            fileTypeFilter={fileTypeFilter}
            onIntentChange={handleIntentChange}
            onAutoDetectChange={handleAutoDetectChange}
            onLocationChange={handleLocationChange}
            onTimeFilterChange={handleTimeFilterChange}
            onLanguageFilterChange={handleLanguageFilterChange}
            onFileTypeFilterChange={handleFileTypeFilterChange}
            onClearFilters={handleClearFilters}
            detectedLocation={detectedLocation}
          />

          {/* Combined Tabs & Filters Row */}
          <div className="bg-background/30">
            <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center gap-3 overflow-x-auto">
              {/* Dynamic Tabs - Inline */}
              <div className="flex-1 min-w-0">
                <DynamicTabs
                  sources={currentSources}
                  intentSources={intentSources}
                  activeSource={activeSource}
                  onSourceChange={handleSourceChange}
                  showPlatformTabs={true}
                  searchQuery={searchQuery}
                  detectedIntent={detectedIntent}
                  onLoadMoreTabs={handleLoadMoreTabs}
                  location={{ countryCode, city }}
                />
              </div>
              
              {/* Filters - Inline */}
              <div className="flex-shrink-0">
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

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full max-w-4xl mb-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: "🤖", title: "AI Summaries", desc: "Get intelligent summaries powered by AI" },
                { icon: "🌐", title: "Multi-Source", desc: "Search across multiple platforms" },
                { icon: "⚡", title: "Lightning Fast", desc: "Instant results with smart caching" }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="p-6 rounded-xl bg-card border border-card-border hover-elevate transition-all text-center"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
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
      <main className={hasSearched ? "max-w-[800px] mx-auto px-6 py-6" : ""}>
        {hasSearched && isLoading && currentPage === 1 && <SearchingSkeleton />}

        {hasSearched && error && (
          <ErrorState
            message="Failed to fetch search results. Please try again."
            onRetry={handleRetry}
          />
        )}

        {hasSearched && !isLoading && !error && data && (
          <div className="space-y-6">
            {/* Corrected Query */}
            {data.correctedQuery && data.correctedQuery !== searchQuery && (
              <CorrectedQuery
                originalQuery={searchQuery}
                correctedQuery={data.correctedQuery}
                onSearch={handleSearch}
              />
            )}

            {/* Result Count */}
            {filteredResults.length > 0 && (
              <div className="text-sm text-muted-foreground">
                About {pagination?.totalResults?.toLocaleString() || filteredResults.length} results
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

                {/* Load More */}
                {pagination && pagination.hasNext && (
                  <div className="flex flex-col items-center gap-3 pt-4">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      size="lg"
                      className="min-w-[200px]"
                      data-testid="button-load-more"
                    >
                      {isLoadingMore ? "Loading..." : "Load More Results"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredResults.length} of {pagination.totalResults} results
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
