import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/search-bar";
import { DynamicTabs } from "@/components/dynamic-tabs";
import { AISummaryCard } from "@/components/ai-summary";
import { ResultCard } from "@/components/result-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { SearchingSkeleton } from "@/components/loading-skeleton";
import type { SearchResponse } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSource, setActiveSource] = useState("all");

  const { data, isLoading, error, refetch } = useQuery<SearchResponse>({
    queryKey: [`/api/search?query=${encodeURIComponent(searchQuery)}`],
    enabled: !!searchQuery,
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setActiveSource("all");
  };

  const handleSourceChange = (sourceId: string) => {
    setActiveSource(sourceId);
  };

  const handleRetry = () => {
    refetch();
  };

  const filteredResults = data?.results.filter((result) => {
    if (activeSource === "all") return true;
    return result.source === activeSource;
  }) || [];

  const currentSources = data?.sources || [];
  const hasSearched = searchQuery.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-ai-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              NovaSearch
            </h1>
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
        </div>
      </div>

      {/* Dynamic Tabs */}
      {hasSearched && currentSources.length > 0 && !isLoading && (
        <DynamicTabs
          sources={currentSources}
          activeSource={activeSource}
          onSourceChange={handleSourceChange}
        />
      )}

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {!hasSearched && <EmptyState onSuggestedSearch={handleSearch} />}

        {hasSearched && isLoading && <SearchingSkeleton />}

        {hasSearched && error && (
          <ErrorState
            message="Failed to fetch search results. Please try again."
            onRetry={handleRetry}
          />
        )}

        {hasSearched && !isLoading && !error && data && (
          <div className="space-y-6">
            {/* AI Summary */}
            {data.summary && activeSource === "all" && (
              <AISummaryCard summary={data.summary} query={searchQuery} />
            )}

            {/* Results */}
            {filteredResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                    {activeSource !== "all" && ` from ${currentSources.find(s => s.id === activeSource)?.name || activeSource}`}
                  </p>
                </div>

                <div className="grid gap-4" data-testid="results-container">
                  {filteredResults.map((result, index) => (
                    <ResultCard key={`${result.link}-${index}`} result={result} index={index} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}"
                  {activeSource !== "all" && ` from ${currentSources.find(s => s.id === activeSource)?.name || activeSource}`}
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
                Next-generation AI-powered search engine that understands your intent and delivers intelligent, multi-source results.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>AI Intent Detection</li>
                <li>Multi-Source Search</li>
                <li>Smart Summarization</li>
                <li>Dynamic Filtering</li>
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
