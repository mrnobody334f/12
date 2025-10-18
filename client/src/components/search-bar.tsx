import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Suggestion } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isSearching?: boolean;
}

export function SearchBar({ onSearch, initialQuery = "", isSearching = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const { data: suggestionsData } = useQuery<{ suggestions: Suggestion[] }>({
    queryKey: [`/api/suggestions?query=${encodeURIComponent(query)}`],
    enabled: query.length > 1 && showSuggestions,
  });

  const suggestions = suggestionsData?.suggestions || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    if (query.length > 1) {
      setShowSuggestions(true);
    }
  };

  return (
    <motion.div
      ref={searchBarRef}
      className="w-full max-w-3xl mx-auto relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-ai-accent/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex items-center bg-card border border-card-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="flex items-center justify-center w-14 h-14 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Search anything across the web..."
              className="flex-1 h-14 bg-transparent text-lg font-medium placeholder:text-muted-foreground focus:outline-none pr-4"
              data-testid="input-search"
              disabled={isSearching}
              autoComplete="off"
            />
            
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="mr-2 p-2 rounded-full hover-elevate active-elevate-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-clear-search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className="mr-2 px-6 h-10 bg-primary text-primary-foreground rounded-xl font-medium hover-elevate active-elevate-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              data-testid="button-search"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-card border border-card-border rounded-xl shadow-xl overflow-hidden z-50"
            data-testid="suggestions-dropdown"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.query}-${index}`}
                onClick={() => handleSuggestionClick(suggestion.query)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left hover-elevate active-elevate-2 transition-colors",
                  "border-b border-border last:border-b-0"
                )}
                data-testid={`suggestion-${index}`}
              >
                {suggestion.type === "history" ? (
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-foreground flex-1">
                  {suggestion.query}
                </span>
                <span className="text-xs text-muted-foreground">
                  {suggestion.type === "history" ? "Recent" : "Trending"}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
