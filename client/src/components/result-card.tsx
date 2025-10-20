import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
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

  const getDisplayUrl = (link: string) => {
    try {
      const url = new URL(link);
      const path = url.pathname === '/' ? '' : url.pathname;
      return url.hostname.replace('www.', '') + path;
    } catch {
      return link;
    }
  };

  const faviconUrl = result.favicon || getFaviconUrl(result.link);
  const displayImage = result.image || result.thumbnail;
  const displayUrl = getDisplayUrl(result.link);
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
            <Star className="absolute h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
            <Star className="absolute h-3.5 w-3.5 fill-yellow-500 text-yellow-500" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
        );
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="group p-4 rounded-xl hover-elevate transition-all duration-200"
      data-testid={`card-result-${index}`}
    >
      <div className="flex gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* URL breadcrumb with favicon - Google style */}
          <div className="flex items-center gap-2 mb-2">
            {faviconUrl && (
              <img
                src={faviconUrl}
                alt=""
                className="w-[20px] h-[20px] rounded-sm flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-sm font-medium truncate text-[#006621] dark:text-[#99c794]">
                {displayUrl}
              </span>
            </div>
          </div>

          {/* Title - Google blue */}
          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group/title"
          >
            <h3 
              className="text-xl leading-7 font-medium hover:underline line-clamp-2 cursor-pointer mb-2 text-primary group-hover/title:underline"
              data-testid={`link-result-${index}`}
            >
              {result.title}
            </h3>
          </a>

          {/* Rating and Price */}
          {hasRichSnippet && (
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {result.rating && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {renderStars(result.rating)}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {result.rating.toFixed(1)}
                  </span>
                  {result.ratingCount && (
                    <span className="text-xs" style={{ color: 'hsl(var(--google-gray))' }}>
                      ({result.ratingCount.toLocaleString()})
                    </span>
                  )}
                </div>
              )}
              {result.price && (
                <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
                  {result.price}
                </Badge>
              )}
            </div>
          )}

          {/* Date if available */}
          {result.date && (
            <p className="text-sm mb-1" style={{ color: 'hsl(var(--google-gray))' }}>
              {result.date}
            </p>
          )}

          {/* Description/Snippet - Google gray */}
          <p 
            className="text-sm leading-6 line-clamp-2"
            style={{ color: 'hsl(var(--google-gray))' }}
          >
            {result.snippet}
          </p>

          {/* Sitelinks - Google style */}
          {result.sitelinks && result.sitelinks.length > 0 && (
            <div className="mt-3 space-y-1">
              {result.sitelinks.slice(0, 4).map((sitelink, idx) => (
                <a
                  key={idx}
                  href={sitelink.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:underline group/sitelink"
                  data-testid={`sitelink-${index}-${idx}`}
                >
                  <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--primary))' }} />
                  <span className="text-sm truncate" style={{ color: 'hsl(var(--primary))' }}>
                    {sitelink.title}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Image/Thumbnail - Right side, Google style */}
        {displayImage && (
          <div className="flex-shrink-0">
            <a
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="w-[112px] h-[112px] rounded-lg overflow-hidden bg-muted border border-border/40">
                <img
                  src={displayImage}
                  alt={result.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.parentElement!.style.display = 'none';
                  }}
                />
              </div>
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
