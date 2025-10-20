import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, MapPin, Globe2, Settings2 } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { IntentSelector } from "@/components/intent-selector";
import { LocationSelector } from "@/components/location-selector";
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

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Google-style Header - Only show when search has been made */}
      {hasSearched && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-6">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
                setAccumulatedResults([]);
              }}
              data-testid="link-home"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#4285f4] to-[#34a853] rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <h1 className="text-lg font-normal text-foreground hidden sm:block">
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

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <BookmarkHistory onSearchClick={handleSearch} />
              {data && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="gap-2"
                  onClick={handleBookmarkClick}
                  disabled={bookmarkMutation.isPending}
                  data-testid="button-bookmark"
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>

          {/* Intent Tabs - Google style */}
          <div className="border-b border-border/40">
            <div className="max-w-[1400px] mx-auto px-6">
              <IntentSelector
                selectedIntent={manualIntent}
                onIntentChange={handleIntentChange}
                autoDetect={autoDetectIntent}
                onAutoDetectChange={handleAutoDetectChange}
              />
            </div>
          </div>

          {/* Tools Row */}
          <div className="border-b border-border/20">
            <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center justify-between gap-4">
              {/* Location */}
              <div className="flex items-center gap-3">
                <LocationSelector
                  country={country}
                  countryCode={countryCode}
                  city={city}
                  onLocationChange={handleLocationChange}
                  detectedLocation={detectedLocation}
                />
              </div>

              {/* Tools Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                    data-testid="button-tools"
                  >
                    <Settings2 className="h-4 w-4" />
                    <span>Tools</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <SearchTools
                    timeFilter={timeFilter}
                    languageFilter={languageFilter}
                    fileTypeFilter={fileTypeFilter}
                    onTimeFilterChange={handleTimeFilterChange}
                    onLanguageFilterChange={handleLanguageFilterChange}
                    onFileTypeFilterChange={handleFileTypeFilterChange}
                    onClearFilters={handleClearFilters}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>
      )}

      {/* Google-style Homepage - Only show when no search */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#4285f4] via-[#34a853] to-[#fbbc04] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-4xl">N</span>
              </div>
              <h1 className="text-5xl font-normal text-foreground tracking-tight">
                NovaSearch
              </h1>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-2xl"
          >
            <SearchBar
              onSearch={handleSearch}
              initialQuery={searchQuery}
              isSearching={isLoading}
            />
          </motion.div>

          {/* Auto Intent Detection */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 w-full max-w-2xl"
          >
            <IntentSelector
              selectedIntent={manualIntent}
              onIntentChange={handleIntentChange}
              autoDetect={autoDetectIntent}
              onAutoDetectChange={handleAutoDetectChange}
            />
          </motion.div>

          {/* Search Location */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 w-full max-w-2xl"
          >
            <LocationSelector
              country={country}
              countryCode={countryCode}
              city={city}
              onLocationChange={handleLocationChange}
              detectedLocation={detectedLocation}
            />
          </motion.div>

          {/* Theme Toggle at bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
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
