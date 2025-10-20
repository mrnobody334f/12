import { motion } from "framer-motion";
import { Star, ChevronRight, Share2, Copy, ExternalLink, BadgeCheck, Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { SearchResult } from "@shared/schema";
import { useState } from "react";

interface ResultCardProps {
  result: SearchResult;
  index: number;
}

export function ResultCard({ result, index }: ResultCardProps) {
  const [showActions, setShowActions] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(result.link);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.title,
          text: result.snippet,
          url: result.link,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      handleCopyLink();
    }
  };

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
      return url.hostname.replace('www.', '');
    } catch {
      return link;
    }
  };

  const getVerifiedSourceInfo = (link: string) => {
    try {
      const url = new URL(link);
      const hostname = url.hostname.toLowerCase();
      
      const verifiedSources: Record<string, { name: string; verified: boolean; stats?: string }> = {
        'youtube.com': { name: 'YouTube', verified: true, stats: 'subscribers' },
        'facebook.com': { name: 'Facebook', verified: true, stats: 'followers' },
        'instagram.com': { name: 'Instagram', verified: true, stats: 'followers' },
        'twitter.com': { name: 'Twitter/X', verified: true, stats: 'followers' },
        'x.com': { name: 'X', verified: true, stats: 'followers' },
        'linkedin.com': { name: 'LinkedIn', verified: true, stats: 'connections' },
        'tiktok.com': { name: 'TikTok', verified: true, stats: 'followers' },
        'reddit.com': { name: 'Reddit', verified: true, stats: 'members' },
      };

      for (const [domain, info] of Object.entries(verifiedSources)) {
        if (hostname.includes(domain)) {
          return info;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const faviconUrl = result.favicon || getFaviconUrl(result.link);
  const displayImage = result.image || result.thumbnail;
  const displayUrl = getDisplayUrl(result.link);
  const verifiedSource = getVerifiedSourceInfo(result.link);
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
      className="group relative p-4 rounded-xl hover-elevate transition-all duration-200"
      data-testid={`card-result-${index}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onFocus={() => setShowActions(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setShowActions(false);
        }
      }}
      tabIndex={0}
    >
      {/* Quick Actions - Show on Hover and Focus */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: showActions ? 1 : 0, x: showActions ? 0 : 10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-3 right-3 flex items-center gap-1 bg-background/95 backdrop-blur rounded-lg shadow-lg border border-border p-1"
        style={{ pointerEvents: showActions ? 'auto' : 'none' }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="h-7 w-7"
          data-testid={`button-share-${index}`}
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyLink}
          className="h-7 w-7"
          data-testid={`button-copy-${index}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-7 w-7"
        >
          <a 
            href={result.link} 
            target="_blank" 
            rel="noopener noreferrer"
            data-testid={`button-external-${index}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </motion.div>

      <div className="flex gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* URL breadcrumb with favicon and verified badge - Google style */}
          <div className="flex items-center gap-2 mb-2.5">
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
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-medium truncate text-[#006621] dark:text-[#99c794]">
                {displayUrl}
              </span>
              {verifiedSource && verifiedSource.verified && (
                <BadgeCheck className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Title - Larger and more prominent */}
          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group/title"
          >
            <h3 
              className="text-[21px] leading-[1.4] font-medium hover:underline line-clamp-2 cursor-pointer mb-2.5 text-primary group-hover/title:underline"
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

          {/* Description/Snippet - Longer and more descriptive */}
          <p 
            className="text-[15px] leading-[1.6] line-clamp-4 mb-1"
            style={{ color: 'hsl(var(--google-gray))' }}
          >
            {result.snippet}
          </p>

          {/* Verified Source Stats - for popular/verified platforms */}
          {verifiedSource && (result.views || result.ratingCount) && (
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {result.views && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{typeof result.views === 'number' ? result.views.toLocaleString() : result.views} views</span>
                </div>
              )}
              {result.ratingCount && verifiedSource.stats && (
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{result.ratingCount.toLocaleString()} {verifiedSource.stats}</span>
                </div>
              )}
            </div>
          )}

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
