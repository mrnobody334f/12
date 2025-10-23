import { Search, X, Clock, TrendingUp, Mic, MicOff, Keyboard, HelpCircle, ChevronDown, Globe } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faReddit, 
  faFacebook, 
  faYoutube, 
  faTiktok, 
  faInstagram, 
  faPinterest, 
  faLinkedin,
  faQuora,
  faXTwitter,
  faGoogle
} from '@fortawesome/free-brands-svg-icons';
import { SiWikipedia, SiStackoverflow, SiYelp, SiGithub } from "react-icons/si";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isSearching?: boolean;
  activeSource?: string;
  onSourceChange?: (sourceId: string) => void;
}

export function SearchBar({ onSearch, initialQuery = "", isSearching = false, activeSource = "google", onSourceChange }: SearchBarProps) {
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

  // Get platform icon
  const getPlatformIcon = (sourceId: string) => {
    switch (sourceId) {
      case 'facebook': return <FontAwesomeIcon icon={faFacebook} className="h-3 w-3" />;
      case 'youtube': return <FontAwesomeIcon icon={faYoutube} className="h-3 w-3" />;
      case 'reddit': return <FontAwesomeIcon icon={faReddit} className="h-3 w-3" />;
      case 'x': return <FontAwesomeIcon icon={faXTwitter} className="h-3 w-3" />;
      case 'instagram': return <FontAwesomeIcon icon={faInstagram} className="h-3 w-3" />;
      case 'pinterest': return <FontAwesomeIcon icon={faPinterest} className="h-3 w-3" />;
      case 'linkedin': return <FontAwesomeIcon icon={faLinkedin} className="h-3 w-3" />;
      case 'quora': return <FontAwesomeIcon icon={faQuora} className="h-3 w-3" />;
      case 'tiktok': return <FontAwesomeIcon icon={faTiktok} className="h-3 w-3" />;
      case 'google': return <FontAwesomeIcon icon={faGoogle} className="h-3 w-3" />;
      case 'wikipedia': return <SiWikipedia className="h-3 w-3" />;
      case 'stackoverflow': return <SiStackoverflow className="h-3 w-3" />;
      case 'yelp': return <SiYelp className="h-3 w-3" />;
      case 'github': return <SiGithub className="h-3 w-3" />;
      default: return <FontAwesomeIcon icon={faGoogle} className="h-3 w-3" />;
    }
  };

  // Get platform name
  const getPlatformName = (sourceId: string) => {
    switch (sourceId) {
      case 'facebook': return 'Facebook';
      case 'youtube': return 'YouTube';
      case 'reddit': return 'Reddit';
      case 'x': return 'X';
      case 'instagram': return 'Instagram';
      case 'pinterest': return 'Pinterest';
      case 'linkedin': return 'LinkedIn';
      case 'quora': return 'Quora';
      case 'tiktok': return 'TikTok';
      case 'google': return 'Google';
      case 'wikipedia': return 'Wikipedia';
      case 'stackoverflow': return 'Stack Overflow';
      case 'yelp': return 'Yelp';
      case 'github': return 'GitHub';
      default: return 'Google';
    }
  };

  // Available platforms
  const platforms = [
    { id: 'google', name: 'Google', icon: <FontAwesomeIcon icon={faGoogle} className="h-3 w-3" /> },
    { id: 'facebook', name: 'Facebook', icon: <FontAwesomeIcon icon={faFacebook} className="h-3 w-3" /> },
    { id: 'youtube', name: 'YouTube', icon: <FontAwesomeIcon icon={faYoutube} className="h-3 w-3" /> },
    { id: 'reddit', name: 'Reddit', icon: <FontAwesomeIcon icon={faReddit} className="h-3 w-3" /> },
    { id: 'x', name: 'X', icon: <FontAwesomeIcon icon={faXTwitter} className="h-3 w-3" /> },
    { id: 'instagram', name: 'Instagram', icon: <FontAwesomeIcon icon={faInstagram} className="h-3 w-3" /> },
    { id: 'pinterest', name: 'Pinterest', icon: <FontAwesomeIcon icon={faPinterest} className="h-3 w-3" /> },
    { id: 'linkedin', name: 'LinkedIn', icon: <FontAwesomeIcon icon={faLinkedin} className="h-3 w-3" /> },
    { id: 'quora', name: 'Quora', icon: <FontAwesomeIcon icon={faQuora} className="h-3 w-3" /> },
    { id: 'tiktok', name: 'TikTok', icon: <FontAwesomeIcon icon={faTiktok} className="h-3 w-3" /> },
    { id: 'wikipedia', name: 'Wikipedia', icon: <SiWikipedia className="h-3 w-3" /> },
    { id: 'stackoverflow', name: 'Stack Overflow', icon: <SiStackoverflow className="h-3 w-3" /> },
    { id: 'yelp', name: 'Yelp', icon: <SiYelp className="h-3 w-3" /> },
    { id: 'github', name: 'GitHub', icon: <SiGithub className="h-3 w-3" /> },
  ];

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
            <div className="flex items-center justify-center w-11 h-10 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Search..."
              className="flex-1 h-10 bg-transparent text-base font-medium placeholder:text-muted-foreground focus:outline-none pr-2"
              data-testid="input-search"
              disabled={isSearching}
              autoComplete="off"
            />
            
            <div className="flex items-center gap-1 mr-1.5">
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-full hover-elevate active-elevate-2 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-clear-search"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {isVoiceSupported && (
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={cn(
                    "p-1.5 rounded-full hover-elevate active-elevate-2 transition-colors",
                    isListening 
                      ? "text-primary bg-primary/10 animate-pulse" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid="button-voice-search"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}

              {/* Platform Selector Dropdown */}
              {onSourceChange && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      title="Change search platform"
                    >
                      {getPlatformIcon(activeSource)}
                      <span className="hidden sm:inline">{getPlatformName(activeSource)}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {platforms.map((platform) => (
                      <DropdownMenuItem
                        key={platform.id}
                        onClick={() => onSourceChange(platform.id)}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          activeSource === platform.id && "bg-accent"
                        )}
                      >
                        {platform.icon}
                        <span>{platform.name}</span>
                        {activeSource === platform.id && (
                          <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <button
                type="submit"
                disabled={!query.trim() || isSearching}
                className="px-4 h-8 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover-elevate active-elevate-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
