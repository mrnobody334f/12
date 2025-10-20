import { motion } from "framer-motion";
import { Globe, LucideIcon, Search, Twitter, Facebook, Instagram, Music, MessageSquare, Youtube, ExternalLink, Plus, ChevronLeft, Globe2, ShoppingBag, Newspaper, BookOpen, Film, TrendingUp, Image, Video, MapPin } from "lucide-react";
import { SiReddit, SiTiktok, SiPinterest, SiLinkedin, SiAmazon, SiEbay, SiNetflix, SiSpotify } from "react-icons/si";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface TabSource {
  id: string;
  name: string;
  site: string;
  icon: string;
}

interface DynamicTabsProps {
  sources: TabSource[];
  intentSources?: TabSource[];
  activeSource: string;
  onSourceChange: (sourceId: string) => void;
  showPlatformTabs?: boolean;
  searchQuery?: string;
  detectedIntent?: string;
  onLoadMoreTabs?: () => Promise<TabSource[]>;
  location?: { countryCode?: string; city?: string };
}

function getPlatformSearchUrl(platformId: string, query: string, site?: string): string {
  const encodedQuery = encodeURIComponent(query);
  
  const urlMap: Record<string, string> = {
    google: `https://www.google.com/search?q=${encodedQuery}`,
    twitter: `https://twitter.com/search?q=${encodedQuery}`,
    facebook: `https://www.facebook.com/search/posts/?q=${encodedQuery}`,
    instagram: `https://www.instagram.com/explore/tags/${query.replace(/\s+/g, '')}`,
    tiktok: `https://www.tiktok.com/search?q=${encodedQuery}`,
    reddit: `https://www.reddit.com/search/?q=${encodedQuery}`,
    youtube: `https://www.youtube.com/results?search_query=${encodedQuery}`,
    pinterest: `https://www.pinterest.com/search/pins/?q=${encodedQuery}`,
    linkedin: `https://www.linkedin.com/search/results/all/?keywords=${encodedQuery}`,
    amazon: `https://www.amazon.com/s?k=${encodedQuery}`,
    ebay: `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}`,
    walmart: `https://www.walmart.com/search?q=${encodedQuery}`,
    aliexpress: `https://www.aliexpress.com/wholesale?SearchText=${encodedQuery}`,
    bestbuy: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodedQuery}`,
    cnn: `https://www.cnn.com/search?q=${encodedQuery}`,
    bbc: `https://www.bbc.com/search?q=${encodedQuery}`,
    reuters: `https://www.reuters.com/search/news?blob=${encodedQuery}`,
    nytimes: `https://www.nytimes.com/search?query=${encodedQuery}`,
    techcrunch: `https://search.techcrunch.com/search?p=${encodedQuery}`,
    wikipedia: `https://en.wikipedia.org/wiki/Special:Search?search=${encodedQuery}`,
    medium: `https://medium.com/search?q=${encodedQuery}`,
    stackoverflow: `https://stackoverflow.com/search?q=${encodedQuery}`,
  };
  
  if (urlMap[platformId]) {
    return urlMap[platformId];
  }
  
  if (site && site.trim()) {
    return `https://www.google.com/search?q=site:${site}+${encodedQuery}`;
  }
  
  return `https://www.google.com/search?q=${encodedQuery}`;
}

const mediaTabs = [
  { id: "images", name: "Images", icon: Image, color: "text-purple-600 dark:text-purple-400" },
  { id: "videos", name: "Videos", icon: Video, color: "text-red-600 dark:text-red-400" },
  { id: "places", name: "Places", icon: MapPin, color: "text-green-600 dark:text-green-400" },
  { id: "news", name: "News", icon: Newspaper, color: "text-blue-700 dark:text-blue-500" },
];

const platformTabs = [
  { id: "all", name: "All", icon: Globe, color: "text-blue-600 dark:text-blue-400" },
  { id: "google", name: "Google", icon: Search, color: "text-blue-600 dark:text-blue-400" },
  { id: "reddit", name: "Reddit", iconComponent: SiReddit, color: "text-orange-600 dark:text-orange-400" },
  { id: "twitter", name: "Twitter", icon: Twitter, color: "text-blue-500 dark:text-blue-400" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600 dark:text-blue-500" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-600 dark:text-red-400" },
  { id: "tiktok", name: "TikTok", iconComponent: SiTiktok, color: "text-black dark:text-white" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600 dark:text-pink-400" },
  { id: "pinterest", name: "Pinterest", iconComponent: SiPinterest, color: "text-red-700 dark:text-red-500" },
  { id: "linkedin", name: "LinkedIn", iconComponent: SiLinkedin, color: "text-blue-700 dark:text-blue-500" },
];

export function DynamicTabs({ sources, intentSources, activeSource, onSourceChange, showPlatformTabs = false, searchQuery, detectedIntent, onLoadMoreTabs, location }: DynamicTabsProps) {
  const [additionalTabs, setAdditionalTabs] = useState<TabSource[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showingMore, setShowingMore] = useState(false);

  const getIcon = (iconName: string): LucideIcon => {
    return (Icons as any)[iconName] || Globe;
  };

  const handleLoadMoreTabs = async () => {
    if (isLoadingMore || !onLoadMoreTabs) return;
    
    setIsLoadingMore(true);
    try {
      const newTabs = await onLoadMoreTabs();
      setAdditionalTabs(prev => [...prev, ...newTabs]);
      setShowingMore(true);
    } catch (error) {
      console.error("Failed to load more tabs:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const baseIntentTabs = intentSources?.map(source => ({
    id: source.id,
    name: source.name,
    icon: getIcon(source.icon),
    site: source.site,
  })) || [];
  
  const intentTabs = [...baseIntentTabs, ...additionalTabs.map(source => ({
    id: source.id,
    name: source.name,
    icon: getIcon(source.icon),
    site: source.site,
  }))];

  const allTabs = [...platformTabs, ...intentTabs];
  const activeTab = allTabs.find(tab => tab.id === activeSource);
  const activeSite = intentSources?.find(s => s.id === activeSource)?.site;
  const isMediaTab = ['images', 'videos', 'places', 'news'].includes(activeSource);
  const showOpenButton = searchQuery && activeSource !== "all" && !isMediaTab && activeTab;

  const handleOpenInNewTab = () => {
    if (searchQuery && activeSource) {
      const url = getPlatformSearchUrl(activeSource, searchQuery, activeSite);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getIntentModeConfig = (intent?: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      shopping: { 
        label: "Shopping Mode", 
        color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: ShoppingBag
      },
      news: { 
        label: "News Mode", 
        color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        icon: Newspaper
      },
      learning: { 
        label: "Learning Mode", 
        color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: BookOpen
      },
      entertainment: { 
        label: "Entertainment Mode", 
        color: "bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
        icon: Film
      },
    };
    return intent ? configs[intent] : null;
  };

  const intentModeConfig = getIntentModeConfig(detectedIntent);
  
  const getLocationDisplay = () => {
    if (location?.countryCode && location.countryCode !== 'global') {
      return `Popular in ${location.countryCode.toUpperCase()}`;
    }
    return null;
  };

  const locationDisplay = getLocationDisplay();

  return (
    <div className="space-y-3">
      {/* Platform Tabs - Main tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {platformTabs.map((tab) => {
          const IconComponent = tab.iconComponent;
          const Icon = tab.icon;
          const isActive = activeSource === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSourceChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-card hover-elevate active-elevate-2 text-foreground border border-border"
              )}
              data-testid={`tab-${tab.id}`}
            >
              {IconComponent ? (
                <IconComponent className={cn("h-4 w-4", !isActive && tab.color)} />
              ) : Icon ? (
                <Icon className={cn("h-4 w-4", !isActive && tab.color)} />
              ) : null}
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Media Tabs - Smaller, separated */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {mediaTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSource === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSourceChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 hover-elevate active-elevate-2 text-muted-foreground border border-border/50"
                )}
                data-testid={`tab-media-${tab.id}`}
              >
                <Icon className={cn("h-3.5 w-3.5", !isActive && tab.color)} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {intentTabs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {intentModeConfig && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Badge 
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider gap-2 px-4 py-1.5 border-2",
                    intentModeConfig.color
                  )}
                  data-testid="badge-intent-mode"
                >
                  {(() => {
                    const IntentIcon = intentModeConfig.icon;
                    return <IntentIcon className="h-4 w-4" />;
                  })()}
                  {intentModeConfig.label}
                </Badge>
              </motion.div>
            )}
            
            {locationDisplay && (
              <Badge 
                variant="secondary" 
                className="text-xs font-semibold gap-1.5 px-3 py-1" 
                data-testid="badge-location-mode"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {locationDisplay}
              </Badge>
            )}
            
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {intentTabs.map((tab) => {
              const Icon = typeof tab.icon === 'string' ? getIcon(tab.icon) : tab.icon;
              const isActive = activeSource === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSourceChange(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/60 hover-elevate active-elevate-2 text-foreground border border-border/50"
                  )}
                  data-testid={`tab-intent-${tab.id}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
            
            {onLoadMoreTabs && !isLoadingMore && (
              <button
                onClick={handleLoadMoreTabs}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 hover-elevate active-elevate-2 bg-muted/30 text-muted-foreground border border-dashed border-border"
                data-testid="button-more-tabs"
              >
                <Plus className="h-4 w-4" />
                <span>More Sites</span>
              </button>
            )}
            
            {isLoadingMore && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showOpenButton && activeTab && (
        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            className="gap-2 border-2"
            style={{
              borderColor: `hsl(var(--primary))`,
              color: `hsl(var(--primary))`,
            }}
            data-testid="button-open-in-new-tab"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open {activeTab.name} in new tab</span>
          </Button>
        </div>
      )}
    </div>
  );
}
