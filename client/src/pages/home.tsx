import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, MapPin, Globe2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SearchResponse, IntentType, SortOption } from "@shared/schema";

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
  const { toast} = useToast();

  const { data: detectedLocation } = useQuery<{country: string; countryCode: string; city: string}>({
    queryKey: ["/api/location/detect"],
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const effectiveCountry = country;
  const effectiveCountryCode = countryCode;
  const effectiveCity = city;

  const locationParams = (effectiveCountryCode && effectiveCountryCode !== "global" && effectiveCountryCode !== '') || effectiveCity 
    ? `&countryCode=${encodeURIComponent(effectiveCountryCode)}&country=${encodeURIComponent(effectiveCountry)}&city=${encodeURIComponent(effectiveCity)}`
    : "";

  const { data, isLoading, error, refetch } = useQuery<SearchResponse>({
    queryKey: [
      `/api/search?query=${encodeURIComponent(searchQuery)}&source=${activeSource}&page=${currentPage}&limit=20&sort=${sortBy}&autoDetect=${autoDetectIntent}${
        !autoDetectIntent && manualIntent ? `&intent=${manualIntent}` : ""
      }${locationParams}`,
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
    setIsManualLocation(newCountryCode !== '' && newCountryCode !== 'global');
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

  // Load cached results from localStorage on mount
  useEffect(() => {
    if (searchQuery) {
      const cacheKey = `search_cache_${searchQuery}_${activeSource}_${sortBy}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          if (parsedCache.timestamp && Date.now() - parsedCache.timestamp < 5 * 60 * 1000) {
            // Cache valid for 5 minutes
            setAccumulatedResults(parsedCache.results);
          }
        } catch (e) {
          // Invalid cache, ignore
        }
      }
    }
  }, [searchQuery, activeSource, sortBy]);

  // Accumulate results when new data arrives
  useEffect(() => {
    if (data?.results) {
      if (currentPage === 1) {
        // First page - replace all results
        setAccumulatedResults(data.results);
        setIsLoadingMore(false);
        
        // Cache first page results
        const cacheKey = `search_cache_${searchQuery}_${activeSource}_${sortBy}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          results: data.results,
          timestamp: Date.now()
        }));
      } else {
        // Subsequent pages - append new results
        setAccumulatedResults(prev => {
          // Avoid duplicates by checking link
          const existingLinks = new Set(prev.map(r => r.link));
          const newResults = data.results.filter(r => !existingLinks.has(r.link));
          const allResults = [...prev, ...newResults];
          
          // Update cache with accumulated results
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
  const hasSearched = searchQuery.length > 0;
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-ai-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              NovaSearch
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <BookmarkHistory onSearchClick={handleSearch} />
            {hasSearched && data && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleBookmarkClick}
                disabled={bookmarkMutation.isPending}
                data-testid="button-bookmark"
              >
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Bookmark</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Search Hero Section */}
      <div className={`transition-all duration-500 ${hasSearched ? 'pt-8 pb-4' : 'pt-20 pb-12'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <SearchBar
            onSearch={handleSearch}
            initialQuery={searchQuery}
            isSearching={isLoading}
          />

          {/* Intent Selector */}
          {!hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 max-w-3xl mx-auto"
            >
              <IntentSelector
                selectedIntent={manualIntent}
                onIntentChange={handleIntentChange}
                autoDetect={autoDetectIntent}
                onAutoDetectChange={handleAutoDetectChange}
              />
            </motion.div>
          )}

          {hasSearched && (
            <div className="mt-4 max-w-3xl mx-auto space-y-4">
              <IntentSelector
                selectedIntent={manualIntent}
                onIntentChange={handleIntentChange}
                autoDetect={autoDetectIntent}
                onAutoDetectChange={handleAutoDetectChange}
              />
              <LocationSelector
                country={country}
                countryCode={countryCode}
                city={city}
                onLocationChange={handleLocationChange}
                detectedLocation={detectedLocation}
              />
            </div>
          )}

          {!hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 max-w-3xl mx-auto"
            >
              <LocationSelector
                country={country}
                countryCode={countryCode}
                city={city}
                onLocationChange={handleLocationChange}
                detectedLocation={detectedLocation}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Dynamic Tabs */}
      {hasSearched && !isLoading && (
        <DynamicTabs
          sources={currentSources}
          activeSource={activeSource}
          onSourceChange={handleSourceChange}
          searchQuery={searchQuery}
          showPlatformTabs={true}
        />
      )}

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {!hasSearched && <EmptyState onSuggestedSearch={handleSearch} />}

        {hasSearched && isLoading && currentPage === 1 && <SearchingSkeleton />}

        {hasSearched && error && (
          <ErrorState
            message="Failed to fetch search results. Please try again."
            onRetry={handleRetry}
          />
        )}

        {hasSearched && !isLoading && !error && data && (
          <div className="space-y-6">
            {/* Location Display */}
            {data.location && (data.location.city || data.location.country) ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <MapPin className="h-4 w-4" />
                <span>Showing results for</span>
                <Badge variant="secondary" className="gap-1" data-testid="badge-location">
                  {data.location.city && <span>{data.location.city}</span>}
                  {data.location.city && data.location.country && <span>,</span>}
                  {data.location.country && <span>{data.location.country}</span>}
                </Badge>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Globe2 className="h-4 w-4" />
                <span>Showing global search results</span>
                <Badge variant="outline" className="gap-1" data-testid="badge-global-search">
                  <Globe2 className="h-3 w-3" />
                  Global
                </Badge>
              </motion.div>
            )}

            {/* AI Summary */}
            {data.summary && activeSource === "all" && currentPage === 1 && (
              <AISummaryCard summary={data.summary} query={searchQuery} />
            )}

            {/* Sort Options */}
            {filteredResults.length > 0 && (
              <SortOptions
                selectedSort={sortBy}
                onSortChange={handleSortChange}
                resultCount={pagination?.totalResults || filteredResults.length}
              />
            )}

            {/* Results */}
            {filteredResults.length > 0 ? (
              <div className="space-y-4">
                <div className="grid gap-4" data-testid="results-container">
                  {filteredResults.map((result, index) => (
                    <ResultCard key={`${result.link}-${index}`} result={result} index={index} />
                  ))}
                </div>

                {/* Load More Button */}
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
                      {pagination.hasNext && ` • Page ${currentPage} of ${pagination.totalPages}`}
                    </p>
                  </div>
                )}

                {/* Traditional Pagination (optional - keep for page jumping) */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="pt-4">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      hasNext={pagination.hasNext}
                      hasPrevious={pagination.hasPrevious}
                    />
                  </div>
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

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">About NovaSearch</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Next-generation AI-powered search engine with advanced features like pagination, bookmarks, history tracking, and intelligent result sorting.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>AI Intent Detection</li>
                <li>Multi-Source Search</li>
                <li>Smart Sorting & Filtering</li>
                <li>Bookmarks & History</li>
                <li>Auto-complete Suggestions</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Legal</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>About Us</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 NovaSearch. Powered by AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
