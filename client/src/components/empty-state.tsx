import { Search, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface EmptyStateProps {
  onSuggestedSearch?: (query: string) => void;
}

const suggestedSearches = [
  { query: "Best laptop for developers 2025", intent: "shopping" },
  { query: "Latest AI technology news", intent: "news" },
  { query: "How to learn web development", intent: "learning" },
  { query: "Funny cat videos", intent: "videos" },
];

export function EmptyState({ onSuggestedSearch }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 max-w-2xl"
      >
        {/* Icon */}
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-ai-accent to-primary opacity-20 blur-3xl animate-pulse" />
          <div className="relative p-6 bg-gradient-to-br from-primary/10 to-ai-accent/10 rounded-3xl">
            <Sparkles className="h-16 w-16 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Welcome to NovaSearch
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Experience the next generation of intelligent search. Our AI understands your intent and delivers results from multiple sources with smart summarization.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl bg-card border border-card-border hover-elevate transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Multi-Source</h3>
            </div>
            <p className="text-sm text-muted-foreground">Search across Google, YouTube, TikTok, Reddit, and more simultaneously</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-card-border hover-elevate transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-ai-accent/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-ai-accent" />
              </div>
              <h3 className="font-semibold text-foreground">AI-Powered</h3>
            </div>
            <p className="text-sm text-muted-foreground">Intelligent intent detection and smart result summarization</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-card-border hover-elevate transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Dynamic Tabs</h3>
            </div>
            <p className="text-sm text-muted-foreground">Interface adapts based on shopping, news, learning, or videos</p>
          </div>
        </div>

        {/* Suggested Searches */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Try searching for:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedSearches.map((item, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer hover-elevate active-elevate-2 px-4 py-2 text-sm"
                onClick={() => onSuggestedSearch?.(item.query)}
                data-testid={`badge-suggested-${idx}`}
              >
                {item.query}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
