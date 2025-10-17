import { motion } from "framer-motion";
import { Globe, LucideIcon } from "lucide-react";
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
}

export function DynamicTabs({ sources, activeSource, onSourceChange }: DynamicTabsProps) {
  const getIcon = (iconName: string): LucideIcon => {
    return (Icons as any)[iconName] || Globe;
  };

  return (
    <div className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
          {/* All Sources Tab */}
          <button
            onClick={() => onSourceChange("all")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 hover-elevate active-elevate-2",
              activeSource === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground"
            )}
            data-testid="tab-all"
          >
            <Globe className="h-4 w-4" />
            <span>All Sources</span>
          </button>

          {sources.map((source) => {
            const Icon = getIcon(source.icon);
            return (
              <button
                key={source.id}
                onClick={() => onSourceChange(source.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 hover-elevate active-elevate-2",
                  activeSource === source.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground"
                )}
                data-testid={`tab-${source.id}`}
              >
                <Icon className="h-4 w-4" />
                <span>{source.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
