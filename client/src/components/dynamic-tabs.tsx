import { motion } from "framer-motion";
import { Globe, LucideIcon, Search, ExternalLink, Plus, ChevronLeft, Globe2, ShoppingBag, Newspaper, BookOpen, Film, TrendingUp, Image, Video, MapPin, X, Plane, Heart, Stethoscope, Activity, Shield, Cpu, Monitor, DollarSign, Calculator, BarChart, Trophy, Camera, ChefHat, Utensils, Store } from "lucide-react";
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
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface TabSource {
  id: string;
  name: string;
  site: string;
  icon: string;
}

interface CustomSite {
  id: string;
  name: string;
  url: string;
  domain: string;
}

interface DynamicTabsProps {
  sources: TabSource[];
  intentSources?: TabSource[];
  activeSource: string;
  activePlatformSource?: string;
  onSourceChange: (sourceId: string) => void;
  showPlatformTabs?: boolean;
  searchQuery?: string;
  detectedIntent?: string;
  onLoadMoreTabs?: () => Promise<TabSource[]>;
  location?: { countryCode?: string; state?: string; city?: string };
  customSites?: CustomSite[];
  onCustomSiteAdd?: (site: CustomSite) => void;
  onCustomSiteRemove?: (siteId: string) => void;
}

function getPlatformSearchUrl(platformId: string, query: string, site?: string, customSites?: CustomSite[]): string {
  const encodedQuery = encodeURIComponent(query);
  
  // Check if it's a custom site
  if (customSites) {
    const customSite = customSites.find(s => s.id === platformId);
    if (customSite) {
      // افتح الموقع نفسه بدلاً من بحث Google
      // نحاول إضافة البحث إذا كان الموقع يدعمه، وإلا نفتح الصفحة الرئيسية
      const url = customSite.url.endsWith('/') ? customSite.url.slice(0, -1) : customSite.url;
      
      // بعض المواقع لديها صفحات بحث معروفة
      const searchPatterns: Record<string, string> = {
        'blackhatworld.com': `${url}/search/search?keywords=${encodedQuery}`,
        'mawdoo3.com': `${url}/search?q=${encodedQuery}`,
      };
      
      // تحقق إذا كان الدومين له نمط بحث معروف
      const searchUrl = searchPatterns[customSite.domain];
      if (searchUrl) {
        return searchUrl;
      }
      
      // إذا لم يكن هناك نمط بحث معروف، افتح الصفحة الرئيسية
      return url;
    }
  }
  
  const urlMap: Record<string, string> = {
    google: `https://www.google.com/search?q=${encodedQuery}`,
    x: `https://x.com/search?q=${encodedQuery}`,
    facebook: `https://www.facebook.com/search/posts/?q=${encodedQuery}`,
    instagram: `https://www.instagram.com/explore/tags/${query.replace(/\s+/g, '')}`,
    tiktok: `https://www.tiktok.com/search?q=${encodedQuery}`,
    reddit: `https://www.reddit.com/search/?q=${encodedQuery}`,
    youtube: `https://www.youtube.com/results?search_query=${encodedQuery}`,
    pinterest: `https://www.pinterest.com/search/pins/?q=${encodedQuery}`,
    linkedin: `https://www.linkedin.com/search/results/all/?keywords=${encodedQuery}`,
    quora: `https://www.quora.com/search?q=${encodedQuery}`,
    wikipedia: `https://en.wikipedia.org/wiki/Special:Search?search=${encodedQuery}`,
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
    medium: `https://medium.com/search?q=${encodedQuery}`,
    stackoverflow: `https://stackoverflow.com/search?q=${encodedQuery}`,
    yelp: `https://www.yelp.com/search?find_desc=${encodedQuery}`,
    github: `https://github.com/search?q=${encodedQuery}&type=repositories`,
  };
  
  if (urlMap[platformId]) {
    return urlMap[platformId];
  }
  
  if (site && site.trim()) {
    return `https://www.google.com/search?q=site:${site}+${encodedQuery}`;
  }
  
  return `https://www.google.com/search?q=${encodedQuery}`;
}

const GoogleColoredIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

const mediaTabs = [
  { id: "all-media", name: "All", icon: Globe2, color: "text-gray-600 dark:text-gray-400" },
  { id: "images", name: "Images", icon: Image, color: "text-purple-600 dark:text-purple-400" },
  { id: "videos", name: "Videos", icon: Video, color: "text-red-600 dark:text-red-400" },
  { id: "places", name: "Places", icon: MapPin, color: "text-green-600 dark:text-green-400" },
  { id: "news", name: "News", icon: Newspaper, color: "text-blue-700 dark:text-blue-500" },
];

const platformTabs = [
  { id: "google", name: "Google", iconComponent: GoogleColoredIcon, color: "text-blue-600 dark:text-blue-400" },
  { id: "reddit", name: "Reddit", iconComponent: () => faReddit ? <FontAwesomeIcon icon={faReddit} /> : <Globe className="h-4 w-4" />, color: "text-orange-600 dark:text-orange-400" },
  { id: "x", name: "X", iconComponent: () => faXTwitter ? <FontAwesomeIcon icon={faXTwitter} /> : <Globe className="h-4 w-4" />, color: "text-black dark:text-white" },
  { id: "facebook", name: "Facebook", iconComponent: () => faFacebook ? <FontAwesomeIcon icon={faFacebook} /> : <Globe className="h-4 w-4" />, color: "text-blue-600 dark:text-blue-500" },
  { id: "youtube", name: "YouTube", iconComponent: () => faYoutube ? <FontAwesomeIcon icon={faYoutube} /> : <Globe className="h-4 w-4" />, color: "text-red-600 dark:text-red-400" },
  { id: "tiktok", name: "TikTok", iconComponent: () => faTiktok ? <FontAwesomeIcon icon={faTiktok} /> : <Globe className="h-4 w-4" />, color: "text-black dark:text-white" },
  { id: "instagram", name: "Instagram", iconComponent: () => faInstagram ? <FontAwesomeIcon icon={faInstagram} /> : <Globe className="h-4 w-4" />, color: "text-pink-600 dark:text-pink-400" },
  { id: "pinterest", name: "Pinterest", iconComponent: () => faPinterest ? <FontAwesomeIcon icon={faPinterest} /> : <Globe className="h-4 w-4" />, color: "text-red-700 dark:text-red-500" },
  { id: "linkedin", name: "LinkedIn", iconComponent: () => faLinkedin ? <FontAwesomeIcon icon={faLinkedin} /> : <Globe className="h-4 w-4" />, color: "text-blue-700 dark:text-blue-500" },
  { id: "quora", name: "Quora", iconComponent: () => faQuora ? <FontAwesomeIcon icon={faQuora} /> : <Globe className="h-4 w-4" />, color: "text-red-600 dark:text-red-400" },
  { id: "wikipedia", name: "Wikipedia", iconComponent: SiWikipedia, color: "text-gray-700 dark:text-gray-300" },
  { id: "stackoverflow", name: "Stack Overflow", iconComponent: () => <SiStackoverflow />, color: "text-orange-500" },
  { id: "yelp", name: "Yelp", iconComponent: () => <SiYelp />, color: "text-red-600" },
  { id: "github", name: "GitHub", iconComponent: () => <SiGithub />, color: "text-gray-800 dark:text-gray-200" },
];

export function DynamicTabs({ sources, intentSources, activeSource, activePlatformSource, onSourceChange, showPlatformTabs = false, searchQuery, detectedIntent, onLoadMoreTabs, location, customSites = [], onCustomSiteAdd, onCustomSiteRemove }: DynamicTabsProps) {
  // Create custom site tabs
  const customSiteTabs = customSites.map(site => ({
    id: site.id,
    name: site.name,
    iconComponent: () => <ExternalLink className="h-4 w-4" />,
    color: "text-blue-600 dark:text-blue-400"
  }));

  // Combine platform tabs with custom site tabs
  const allPlatformTabs = [...platformTabs, ...customSiteTabs];
  const [additionalTabs, setAdditionalTabs] = useState<TabSource[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showingMore, setShowingMore] = useState(false);
  const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState("");

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
  
  // Combine and deduplicate tabs to prevent duplicates
  const allIntentTabs = [...baseIntentTabs, ...additionalTabs.map(source => ({
    id: source.id,
    name: source.name,
    icon: getIcon(source.icon),
    site: source.site,
  }))];
  
  // Remove duplicates based on id
  const intentTabs = allIntentTabs.filter((tab, index, self) => 
    index === self.findIndex(t => t.id === tab.id)
  );


  const allTabs = [...platformTabs, ...intentTabs, ...customSiteTabs];
  const isMediaTab = ['images', 'videos', 'places', 'news'].includes(activeSource);
  const isAllMediaTab = activeSource === 'all-media';
  const effectiveActiveSource = (isMediaTab || isAllMediaTab) && activePlatformSource ? activePlatformSource : activeSource;
  const activeTab = allTabs.find(tab => tab.id === effectiveActiveSource);
  const activeSite = intentSources?.find(s => s.id === effectiveActiveSource)?.site;
  // Don't show open button for intent tabs (tabs from intentSources)
  const isIntentTab = intentSources?.some(s => s.id === effectiveActiveSource);
  const showOpenButton = searchQuery && effectiveActiveSource !== "web" && !isMediaTab && !isAllMediaTab && activeTab && !isIntentTab;

  const handleOpenInNewTab = () => {
    if (searchQuery && effectiveActiveSource) {
      const url = getPlatformSearchUrl(effectiveActiveSource, searchQuery, activeSite, customSites);
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
      videos: { 
        label: "Videos Mode", 
        color: "bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
        icon: Film
      },
      travel: { 
        label: "Travel Mode", 
        color: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
        icon: Plane
      },
      health: { 
        label: "Health Mode", 
        color: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
        icon: Heart
      },
      tech: { 
        label: "Tech Mode", 
        color: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
        icon: Cpu
      },
      finance: { 
        label: "Finance Mode", 
        color: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        icon: DollarSign
      },
      entertainment: { 
        label: "Entertainment Mode", 
        color: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
        icon: Trophy
      },
      food: { 
        label: "Food Mode", 
        color: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        icon: ChefHat
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

  const handleAddSite = () => {
    if (!newSiteUrl.trim()) return;
    
    const siteUrl = newSiteUrl.trim();
    if (onCustomSiteAdd) {
      const domain = siteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      // استخراج اسم الموقع من الدومين
      const siteName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
      onCustomSiteAdd({
        id: `custom-${Date.now()}`,
        name: siteName,
        url: siteUrl,
        domain,
      });
    }
    
    setNewSiteUrl("");
    setIsAddSiteDialogOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Platform Tabs - Main tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {allPlatformTabs.map((tab) => {
          const IconComponent = tab.iconComponent;
          // Platform tab is active if it's selected, or if we're on a media tab (including all-media) and it's the cached platform
          const isActive = (isMediaTab || isAllMediaTab) ? (activePlatformSource === tab.id) : (activeSource === tab.id);

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
                <div className={cn("h-4 w-4", !isActive && tab.color)}>
                  <IconComponent />
                </div>
              ) : null}
              <span>{tab.name}</span>
              {customSites.some(site => site.id === tab.id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Switch to Google before removing
                    onSourceChange('google');
                    if (onCustomSiteRemove) {
                      onCustomSiteRemove(tab.id);
                    }
                  }}
                  className="ml-1 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                  title="Remove site and switch to Google"
                >
                  <X className="h-3 w-3 text-red-500" />
                </button>
              )}
            </button>
          );
        })}
        
        <Dialog open={isAddSiteDialogOpen} onOpenChange={setIsAddSiteDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 hover-elevate active-elevate-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              data-testid="button-add-custom-site"
            >
              <Plus className="h-4 w-4" />
              <span>Add Site</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Custom Site to Search With</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Site URL</label>
                <Input
                  placeholder="Enter site URL (e.g., example.com)"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSite();
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddSite} 
                  className="flex-1"
                  disabled={!newSiteUrl.trim()}
                >
                  Add Site
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddSiteDialogOpen(false);
                    setNewSiteUrl("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Media Tabs - Smaller, separated */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {mediaTabs.map((tab) => {
            const Icon = tab.icon;
            // For 'all-media' tab, check if activeSource is 'all-media'
            // For other media tabs, check activeSource directly
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

       {/* Intent Mode Badge and Tabs Section - Shows when intent is detected AND on Google or intent-specific tab */}
       {intentModeConfig && (activeSource === 'google' || intentSources?.some(s => s.id === activeSource)) && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
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
            
            {/* Intent Tabs - Show in same line as badges */}
            {intentTabs.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0 flex-1">
                {intentTabs.map((tab) => {
                  const Icon = typeof tab.icon === 'string' ? getIcon(tab.icon) : tab.icon;
                  const isActive = isMediaTab ? (activePlatformSource === tab.id) : (activeSource === tab.id);

                  const handleIntentTabClick = () => {
                    // If clicking the same active tab, deselect it (go back to google)
                    if (isActive) {
                      onSourceChange('google');
                    } else {
                      onSourceChange(tab.id);
                    }
                  };

                  return (
                    <button
                      key={tab.id}
                      onClick={handleIntentTabClick}
                      className={cn(
                        "relative flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover-elevate active-elevate-2"
                      )}
                      data-testid={`tab-intent-${tab.id}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
                
                {onLoadMoreTabs && !isLoadingMore && (
                  <button
                    onClick={handleLoadMoreTabs}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition-all duration-200 hover-elevate active-elevate-2 bg-muted/30 text-muted-foreground border border-dashed border-border"
                    data-testid="button-more-tabs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>More</span>
                  </button>
                )}
                
                {isLoadingMore && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap bg-muted/30 text-muted-foreground border border-dashed border-border">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-muted-foreground"></div>
                    <span>Loading...</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
          </div>
        </div>
      )}

      {/* Additional Intent Tabs Section - Shows when intent-specific tabs exist but no intent mode */}
      {!intentModeConfig && intentTabs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => {
                // This will be handled by the parent component
                const siteName = prompt("Site Name:");
                const siteUrl = prompt("Site URL:");
                if (siteName && siteUrl && onCustomSiteAdd) {
                  const domain = siteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
                  onCustomSiteAdd({
                    id: `custom-${Date.now()}`,
                    name: siteName,
                    url: siteUrl,
                    domain,
                  });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 hover-elevate active-elevate-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              data-testid="button-add-custom-site"
            >
              <Plus className="h-4 w-4" />
              <span>Add Site</span>
            </button>
            
            {intentTabs.map((tab) => {
              const Icon = typeof tab.icon === 'string' ? getIcon(tab.icon) : tab.icon;
              const isActive = isMediaTab ? (activePlatformSource === tab.id) : (activeSource === tab.id);

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
