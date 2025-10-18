import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Loader2 } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { IntentSelector } from "@/components/intent-selector";
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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SearchResponse, IntentType, SortOption, SearchResult } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSource, setActiveSource] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [autoDetectIntent, setAutoDetectIntent] = useState(true);
  const [manualIntent, setManualIntent] = useState<IntentType | undefined>(undefined);
  const [allLoadedResults, setAllLoadedResults] = useState<SearchResult[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<SearchResponse>({
    queryKey: [
      `/api/search?query=${encodeURIComponent(searchQuery)}&source=${activeSource}&page=${currentPage}&limit=20&sort=${sortBy}&autoDetect=${autoDetectIntent}${
        !autoDetectIntent && manualIntent ? `&intent=${manualIntent}` : ""
      }`,
    ],
    enabled: !!searchQuery,
  });

  // Reset loaded results when search query or filters change
  useEffect(() => {
    if (data && currentPage === 1) {
      setAllLoadedResults(data.results);
    } else if (data && currentPage > 1) {
      setAllLoadedResults(prev => [...prev, ...data.results]);
      setIsLoadingMore(false);
    }
  }, [data, currentPage]);

  // Reset page when search query or source changes
  useEffect(() => {
    setCurrentPage(1);
    setAllLoadedResults([]);
  }, [searchQuery, activeSource, sortBy, autoDetectIntent, manualIntent]);

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/bookmarks", {
        query: searchQuery,
        results: allLoadedResults,
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
    setAllLoadedResults([]);
  };

  const handleSourceChange = (sourceId: string) => {
    setActiveSource(sourceId);
    setCurrentPage(1);
    setAllLoadedResults([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
    setAllLoadedResults([]);
  };

  const handleIntentChange = (intent: IntentType | undefined) => {
    setManualIntent(intent);
    if (searchQuery) {
      setCurrentPage(1);
      setAllLoadedResults([]);
      refetch();
    }
  };

  const handleAutoDetectChange = (enabled: boolean) => {
    setAutoDetectIntent(enabled);
    if (searchQuery) {
      setCurrentPage(1);
      setAllLoadedResults([]);
      refetch();
    }
  };

  const handleRetry = () => {
    refetch();
  };

  const handleBookmarkClick = () => {
    bookmarkMutation.mutate();
  };

  const currentSources = data?.sources || [];
  const hasSearched = searchQuery.length > 0;
  const pagination = data?.pagination;
  const hasMoreResults = pagination?.hasNext || false;
  const showLoadMore = hasMoreResults && !isLoadingMore;

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
            {hasSearched && allLoadedResults.length > 0 && (
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
            isSearching={isLoading && currentPage === 1}
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
            <div className="mt-4 max-w-3xl mx-auto">
              <IntentSelector
                selectedIntent={manualIntent}
                onIntentChange={handleIntentChange}
                autoDetect={autoDetectIntent}
                onAutoDetectChange={handleAutoDetectChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Tabs */}
      {hasSearched && !isLoading && (
        <DynamicTabs
          sources={currentSources}
          activeSource={activeSource}
          onSourceChange={handleSourceChange}
          showPlatformTabs={!autoDetectIntent}
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

        {hasSearched && !error && (
          <div className="space-y-6">
            {/* AI Summary */}
            {data?.summary && activeSource === "all" && currentPage === 1 && (
              <AISummaryCard summary={data.summary} query={searchQuery} />
            )}

            {/* Sort Options */}
            {allLoadedResults.length > 0 && (
              <SortOptions
                selectedSort={sortBy}
                onSortChange={handleSortChange}
                resultCount={allLoadedResults.length}
              />
            )}

            {/* Results */}
            {allLoadedResults.length > 0 ? (
              <div className="space-y-4">
                <div className="grid gap-4" data-testid="results-container">
                  <AnimatePresence mode="popLayout">
                    {allLoadedResults.map((result, index) => (
                      <motion.div
                        key={`${result.link}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <ResultCard result={result} index={index} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Load More Button */}
                {showLoadMore && (
                  <div className="flex justify-center py-8">
                    <Button
                      onClick={handleLoadMore}
                      size="lg"
                      className="gap-2"
                      data-testid="button-load-more"
                    >
                      Load More Results
                    </Button>
                  </div>
                )}

                {/* Loading More Indicator */}
                {isLoadingMore && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading more results...</span>
                    </div>
                  </div>
                )}

                {/* Traditional Pagination (as fallback) */}
                {!showLoadMore && !isLoadingMore && pagination && pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    hasNext={pagination.hasNext}
                    hasPrevious={pagination.hasPrevious}
                  />
                )}
              </div>
            ) : !isLoading && (
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
                Next-generation AI-powered search engine with comprehensive Google-like results, advanced features like pagination, bookmarks, history tracking, and intelligent result sorting.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Google-Like Comprehensive Search</li>
                <li>AI Intent Detection</li>
                <li>Load More & Pagination</li>
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
