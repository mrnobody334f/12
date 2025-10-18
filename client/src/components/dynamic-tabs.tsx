import { motion } from "framer-motion";
import { Globe, LucideIcon, Search, Twitter, Instagram, Music, MessageSquare, Youtube } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface TabSource {
  id: string;
  name: string;
  site: string;
  icon: string;
}

interface DynamicTabsProps {
  sources: TabSource[];
  activeSource: string;
  onSourceChange: (sourceId: string) => void;
  showPlatformTabs?: boolean;
}

// Platform-specific tabs that are always shown
const platformTabs = [
  { id: "all", name: "Google", icon: Search },
  { id: "twitter", name: "Twitter", icon: Twitter },
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "tiktok", name: "TikTok", icon: Music },
  { id: "reddit", name: "Reddit", icon: MessageSquare },
  { id: "youtube", name: "YouTube", icon: Youtube },
];

export function DynamicTabs({ sources, activeSource, onSourceChange, showPlatformTabs = false }: DynamicTabsProps) {
  const getIcon = (iconName: string): LucideIcon => {
    return (Icons as any)[iconName] || Globe;
  };

  // Always show Google tab + intent-based sources
  // Optionally add platform tabs when showPlatformTabs is true
  const intentTabs = [
    { id: "all", name: "Google", icon: Search },
    ...sources.map(source => ({
      id: source.id,
      name: source.name,
      icon: getIcon(source.icon),
    }))
  ];

  // If showPlatformTabs, add the platform tabs (excluding Google since it's already there)
  const tabsToShow = showPlatformTabs 
    ? [
        ...intentTabs,
        ...platformTabs.filter(tab => tab.id !== "all") // Add platform tabs except Google
      ]
    : intentTabs;

  return (
    <div className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4">
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
      </div>
    </div>
  );
}
