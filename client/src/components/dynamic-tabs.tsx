import { motion } from "framer-motion";
import { Globe, LucideIcon, Search, Twitter, Facebook, Instagram, Music, MessageSquare, Youtube, ExternalLink, Plus, ChevronLeft } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

// Function to generate platform-specific search URLs
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
    // Shopping sites
    amazon: `https://www.amazon.com/s?k=${encodedQuery}`,
    ebay: `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}`,
    walmart: `https://www.walmart.com/search?q=${encodedQuery}`,
    aliexpress: `https://www.aliexpress.com/wholesale?SearchText=${encodedQuery}`,
    bestbuy: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodedQuery}`,
    // News sites
    cnn: `https://www.cnn.com/search?q=${encodedQuery}`,
    bbc: `https://www.bbc.com/search?q=${encodedQuery}`,
    reuters: `https://www.reuters.com/search/news?blob=${encodedQuery}`,
    nytimes: `https://www.nytimes.com/search?query=${encodedQuery}`,
    techcrunch: `https://search.techcrunch.com/search?p=${encodedQuery}`,
    // Learning sites
    wikipedia: `https://en.wikipedia.org/wiki/Special:Search?search=${encodedQuery}`,
    medium: `https://medium.com/search?q=${encodedQuery}`,
    stackoverflow: `https://stackoverflow.com/search?q=${encodedQuery}`,
    // Entertainment sites
    pinterest: `https://www.pinterest.com/search/pins/?q=${encodedQuery}`,
  };
  
  // If we have a specific URL mapping, use it
  if (urlMap[platformId]) {
    return urlMap[platformId];
  }
  
  // Otherwise, if we have a site domain, use Google site search
  if (site && site.trim()) {
    return `https://www.google.com/search?q=site:${site}+${encodedQuery}`;
  }
  
  // Default to Google search
  return `https://www.google.com/search?q=${encodedQuery}`;
}

// Platform-specific tabs that are always shown
const platformTabs = [
  { id: "all", name: "All", icon: Globe },
  { id: "google", name: "Google", icon: Search },
  { id: "twitter", name: "Twitter", icon: Twitter },
  { id: "facebook", name: "Facebook", icon: Facebook },
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "tiktok", name: "TikTok", icon: Music },
  { id: "reddit", name: "Reddit", icon: MessageSquare },
  { id: "youtube", name: "YouTube", icon: Youtube },
];

export function DynamicTabs({ sources, intentSources, activeSource, onSourceChange, showPlatformTabs = false, searchQuery, detectedIntent, onLoadMoreTabs, location }: DynamicTabsProps) {
  const [additionalTabs, setAdditionalTabs] = useState<TabSource[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showingMore, setShowingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
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
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error("Failed to load more tabs:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  const handleBackToInitialTabs = () => {
    setShowingMore(false);
  };

  // Convert intent-based sources to tabs format (keep site info)
  const baseIntentTabs = intentSources?.map(source => ({
    id: source.id,
    name: source.name,
    icon: getIcon(source.icon),
    site: source.site,
  })) || [];
  
  // Combine base and additional tabs
  const intentTabs = [...baseIntentTabs, ...additionalTabs.map(source => ({
    id: source.id,
    name: source.name,
    icon: getIcon(source.icon),
    site: source.site,
  }))];
  
  const tabsToShow = platformTabs;
  const allTabs = [...platformTabs, ...intentTabs];

  // Get active tab details (check both platform and intent tabs)
  const activeTab = allTabs.find(tab => tab.id === activeSource);
  const activeSite = intentSources?.find(s => s.id === activeSource)?.site;
  const showOpenButton = searchQuery && activeSource !== "all" && activeTab;

  const handleOpenInNewTab = () => {
    if (searchQuery && activeSource) {
      const url = getPlatformSearchUrl(activeSource, searchQuery, activeSite);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Get intent mode label
  const getIntentModeLabel = (intent?: string) => {
    const labels: Record<string, string> = {
      shopping: "Shopping Mode",
      news: "News Mode",
      learning: "Learning Mode",
      entertainment: "Entertainment Mode",
    };
    return intent ? labels[intent] : null;
  };

  const intentModeLabel = getIntentModeLabel(detectedIntent);

  return (
    <div className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4">
        {/* Platform Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
          {tabsToShow.map((tab) => {
            const Icon = typeof tab.icon === 'string' ? getIcon(tab.icon) : tab.icon;
            const isActive = activeSource === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSourceChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 hover-elevate active-elevate-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground"
                )}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Intent-Based Tabs */}
        {intentTabs.length > 0 && (
          <div className="pb-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                {intentModeLabel || "Suggested Sites"}
              </span>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {intentTabs.map((tab) => {
                const Icon = typeof tab.icon === 'string' ? getIcon(tab.icon) : tab.icon;
                const isActive = activeSource === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onSourceChange(tab.id)}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 hover-elevate active-elevate-2",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground border border-border"
                    )}
                    data-testid={`tab-intent-${tab.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIntentTab"
                        className="absolute inset-0 bg-primary rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
              
              {/* More Tabs Button */}
              {onLoadMoreTabs && !isLoadingMore && (
                <button
                  onClick={handleLoadMoreTabs}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 hover-elevate active-elevate-2 bg-muted/50 text-foreground border border-dashed border-border"
                  data-testid="button-more-tabs"
                >
                  <Plus className="h-4 w-4" />
                  <span>More Sites</span>
                </button>
              )}
              
              {/* Loading Indicator */}
              {isLoadingMore && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {showOpenButton && (
          <div className="pb-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="gap-2"
              data-testid="button-open-in-new-tab"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open {activeTab.name} in new tab</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
