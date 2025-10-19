import { motion } from "framer-motion";
import { ExternalLink, Globe, Star, ChevronRight } from "lucide-react";
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
  const displayImage = result.image || result.thumbnail;
  const hasRichSnippet = result.rating || result.price || (result.sitelinks && result.sitelinks.length > 0);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative h-3.5 w-3.5">
            <Star className="absolute h-3.5 w-3.5 text-gray-300" />
            <Star className="absolute h-3.5 w-3.5 fill-yellow-500 text-yellow-500" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="h-3.5 w-3.5 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        className="p-0 hover-elevate transition-all duration-200 group overflow-hidden"
        data-testid={`card-result-${index}`}
      >
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          {/* Image/Thumbnail - Left side on desktop */}
          {displayImage && (
            <div className="flex-shrink-0">
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="w-full sm:w-32 h-32 sm:h-24 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={displayImage}
                    alt={result.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.style.display = 'none';
                    }}
                  />
                </div>
              </a>
            </div>
          )}

          {/* Content - Right side */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* URL breadcrumb with favicon */}
            <div className="flex items-center gap-2 text-xs">
              {faviconUrl && (
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="text-muted-foreground truncate">
                {new URL(result.link).hostname.replace('www.', '')}
              </span>
            </div>

            {/* Title - Clickable */}
            <a
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <h3 className="text-lg font-medium text-primary hover:underline line-clamp-2 cursor-pointer" data-testid={`link-result-${index}`}>
                {result.title}
              </h3>
            </a>

            {/* Rating and Price */}
            {hasRichSnippet && (
              <div className="flex flex-wrap items-center gap-3">
                {result.rating && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {renderStars(result.rating)}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {result.rating.toFixed(1)}
                    </span>
                    {result.ratingCount && (
                      <span className="text-xs text-muted-foreground">
                        ({result.ratingCount.toLocaleString()})
                      </span>
                    )}
                  </div>
                )}
                {result.price && (
                  <Badge variant="secondary" className="font-semibold">
                    {result.price}
                  </Badge>
                )}
              </div>
            )}

            {/* Description/Snippet */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {result.snippet}
            </p>

            {/* Date if available */}
            {result.date && (
              <p className="text-xs text-muted-foreground">
                {result.date}
              </p>
            )}

            {/* Sitelinks */}
            {result.sitelinks && result.sitelinks.length > 0 && (
              <div className="pt-2 border-t border-border/50 mt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.sitelinks.slice(0, 4).map((sitelink, idx) => (
                    <a
                      key={idx}
                      href={sitelink.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline group/sitelink"
                      data-testid={`sitelink-${index}-${idx}`}
                    >
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{sitelink.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
