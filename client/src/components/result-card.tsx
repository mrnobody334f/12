import { motion } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@shared/schema";

interface ResultCardProps {
  result: SearchResult;
  index: number;
}

export function ResultCard({ result, index }: ResultCardProps) {
  const getFaviconUrl = (link: string) => {
    try {
      const url = new URL(link);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  const faviconUrl = result.favicon || getFaviconUrl(result.link);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        className="p-4 hover-elevate active-elevate-2 transition-all duration-200 group cursor-pointer"
        data-testid={`card-result-${index}`}
      >
        <a
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block space-y-3"
        >
          <div className="flex items-start gap-3">
            {/* Thumbnail */}
            {result.thumbnail ? (
              <div className="flex-shrink-0 w-24 h-16 rounded-md overflow-hidden bg-muted">
                <img
                  src={result.thumbnail}
                  alt={result.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            <div className="flex-1 min-w-0 space-y-2">
              {/* Source Badge */}
              <div className="flex items-center gap-2">
                {faviconUrl ? (
                  <img
                    src={faviconUrl}
                    alt=""
                    className="w-4 h-4 rounded-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-4 h-4 text-muted-foreground" />
                )}
                <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                  {result.sourceName || result.source}
                </Badge>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {result.title}
              </h3>

              {/* Snippet */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {result.snippet}
              </p>

              {/* Link Preview */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{new URL(result.link).hostname}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </a>
      </Card>
    </motion.div>
  );
}
