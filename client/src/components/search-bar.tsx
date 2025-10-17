import { Search, X } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isSearching?: boolean;
}

export function SearchBar({ onSearch, initialQuery = "", isSearching = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-ai-accent/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex items-center bg-card border border-card-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="flex items-center justify-center w-14 h-14 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything across the web..."
            className="flex-1 h-14 bg-transparent text-lg font-medium placeholder:text-muted-foreground focus:outline-none pr-4"
            data-testid="input-search"
            disabled={isSearching}
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
    </motion.form>
  );
}
