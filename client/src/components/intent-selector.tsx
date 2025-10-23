import { ShoppingBag, Newspaper, BookOpen, Video, Globe, Zap, HelpCircle, Plane, Heart, Cpu, DollarSign, Trophy, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntentType } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IntentSelectorProps {
  selectedIntent?: IntentType;
  onIntentChange: (intent: IntentType | undefined) => void;
  autoDetect: boolean;
  onAutoDetectChange: (enabled: boolean) => void;
}

const intentOptions: { value: IntentType; label: string; icon: typeof Globe; color: string }[] = [
  {
    value: "general",
    label: "All",
    icon: Globe,
    color: "text-gray-600 dark:text-gray-400",
  },
  {
    value: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    value: "news",
    label: "News",
    icon: Newspaper,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "learning",
    label: "Learning",
    icon: BookOpen,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    value: "videos",
    label: "Videos",
    icon: Video,
    color: "text-pink-600 dark:text-pink-400",
  },
  {
    value: "travel",
    label: "Travel",
    icon: Plane,
    color: "text-cyan-600 dark:text-cyan-400",
  },
  {
    value: "health",
    label: "Health",
    icon: Heart,
    color: "text-red-600 dark:text-red-400",
  },
  {
    value: "tech",
    label: "Tech",
    icon: Cpu,
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    value: "finance",
    label: "Finance",
    icon: DollarSign,
    color: "text-green-600 dark:text-green-400",
  },
  {
    value: "entertainment",
    label: "Entertainment",
    icon: Trophy,
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    value: "food",
    label: "Food",
    icon: ChefHat,
    color: "text-yellow-600 dark:text-yellow-400",
  },
];

export function IntentSelector({
  selectedIntent,
  onIntentChange,
  autoDetect,
  onAutoDetectChange,
}: IntentSelectorProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {/* Auto-detect toggle - compact */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border/60 bg-background flex-shrink-0 h-8">
              <Zap className="h-3 w-3 text-primary" />
              <Label htmlFor="auto-detect" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                Auto
              </Label>
              <HelpCircle className="h-3 w-3 text-muted-foreground" />
              <Switch
                id="auto-detect"
                checked={autoDetect}
                onCheckedChange={onAutoDetectChange}
                data-testid="toggle-auto-detect"
                className="scale-75"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Automatically detect search intent (Shopping, News, Learning, Videos)</p>
          </TooltipContent>
        </Tooltip>

        {/* Intent sliding menu - Show when auto-detect is off */}
        {!autoDetect && (
          <div className="relative">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-[400px] pb-1">
              {intentOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedIntent === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => onIntentChange(option.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap h-8 flex-shrink-0",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/50 text-muted-foreground hover-elevate hover:bg-muted/70"
                    )}
                    data-testid={`intent-${option.value}`}
                  >
                    <Icon className={cn("h-3.5 w-3.5", !isSelected && option.color)} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
            {/* Gradient fade indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
