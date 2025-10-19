import { motion } from "framer-motion";
import { Globe, LucideIcon, Search, Twitter, Facebook, Instagram, Music, MessageSquare, Youtube, ExternalLink } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
}

// Function to generate platform-specific search URLs
function getPlatformSearchUrl(platformId: string, query: string): string {
  const encodedQuery = encodeURIComponent(query);
  
  const urlMap: Record<string, string> = {
    google: `https://www.google.com/search?q=${encodedQuery}`,
    twitter: `https://twitter.com/search?q=${encodedQuery}`,
    facebook: `https://www.facebook.com/search/posts/?q=${encodedQuery}`,
    instagram: `https://www.instagram.com/explore/tags/${query.replace(/\s+/g, '')}`,
    tiktok: `https://www.tiktok.com/search?q=${encodedQuery}`,
    reddit: `https://www.reddit.com/search/?q=${encodedQuery}`,
    youtube: `https://www.youtube.com/results?search_query=${encodedQuery}`,
  };
  
  return urlMap[platformId] || `https://www.google.com/search?q=${encodedQuery}`;
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

export function DynamicTabs({ sources, intentSources, activeSource, onSourceChange, showPlatformTabs = false, searchQuery, detectedIntent }: DynamicTabsProps) {
  const getIcon = (iconName: string): LucideIcon => {
    return (Icons as any)[iconName] || Globe;
  };

  // Convert intent-based sources to tabs format
  const intentTabs = intentSources?.map(source => ({
    id: source.id,
    name: source.name,
    icon: getIcon(source.icon),
  })) || [];
  
  const tabsToShow = platformTabs;
  const allTabs = [...platformTabs, ...intentTabs];

  // Get active tab details (check both platform and intent tabs)
  const activeTab = allTabs.find(tab => tab.id === activeSource);
  const showOpenButton = searchQuery && activeSource !== "all" && activeTab;

  const handleOpenInNewTab = () => {
    if (searchQuery && activeSource) {
      const url = getPlatformSearchUrl(activeSource, searchQuery);
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
        {intentTabs.length > 0 && intentModeLabel && (
          <div className="pb-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold text-ai-accent uppercase tracking-wider">
                {intentModeLabel}
              </span>
              <div className="flex-1 h-px bg-ai-accent/20"></div>
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
                        ? "bg-ai-accent text-background"
                        : "bg-ai-accent/10 text-ai-accent border border-ai-accent/30"
                    )}
                    data-testid={`tab-intent-${tab.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIntentTab"
                        className="absolute inset-0 bg-ai-accent rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
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
