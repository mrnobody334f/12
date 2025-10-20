import { Search, X, Clock, TrendingUp, Mic, MicOff, Keyboard, HelpCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Suggestion } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isSearching?: boolean;
}

export function SearchBar({ onSearch, initialQuery = "", isSearching = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-SA'; // Default to Arabic, can be changed

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        // Automatically search after voice input
        onSearch(transcript);
        toast({
          title: "Voice detected",
          description: `Searching for: "${transcript}"`,
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: event.error === 'no-speech' ? 'No speech detected. Please try again.' : 'An error occurred. Please try again.',
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onSearch, toast]);

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

  const handleVoiceSearch = async () => {
    if (!isVoiceSupported || !recognitionRef.current) {
      toast({
        title: "Voice search not supported",
        description: "Your browser doesn't support voice search. Please use a modern browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now to search",
      });
    } catch (error) {
      console.error('Microphone permission error:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice search.",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        ref={searchBarRef}
        className="w-full relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center bg-card border border-card-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="flex items-center justify-center w-9 h-8 text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Search..."
              className="flex-1 h-8 bg-transparent text-sm font-medium placeholder:text-muted-foreground focus:outline-none pr-2"
              data-testid="input-search"
              disabled={isSearching}
              autoComplete="off"
            />
            
            <div className="flex items-center gap-0.5 mr-1">
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full hover-elevate active-elevate-2 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-clear-search"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              
              {isVoiceSupported && (
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={cn(
                    "p-1 rounded-full hover-elevate active-elevate-2 transition-colors",
                    isListening 
                      ? "text-primary bg-primary/10 animate-pulse" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid="button-voice-search"
                >
                  {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                </button>
              )}

              <button
                type="submit"
                disabled={!query.trim() || isSearching}
                className="px-3 h-7 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover-elevate active-elevate-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                data-testid="button-search"
              >
                {isSearching ? "..." : "Search"}
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
    </TooltipProvider>
  );
}
