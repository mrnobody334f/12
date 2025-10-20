import { ShoppingBag, Newspaper, BookOpen, Music, Globe, Zap, HelpCircle } from "lucide-react";
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

const intentOptions: { value: IntentType; label: string; icon: typeof Globe }[] = [
  {
    value: "general",
    label: "All",
    icon: Globe,
  },
  {
    value: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
  },
  {
    value: "news",
    label: "News",
    icon: Newspaper,
  },
  {
    value: "learning",
    label: "Learning",
    icon: BookOpen,
  },
  {
    value: "entertainment",
    label: "Videos",
    icon: Music,
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
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {/* Auto-detect toggle - compact with tooltip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-background flex-shrink-0">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <Label htmlFor="auto-detect" className="text-xs font-medium cursor-pointer whitespace-nowrap">
            Auto
          </Label>
          <Switch
            id="auto-detect"
            checked={autoDetect}
            onCheckedChange={onAutoDetectChange}
            data-testid="toggle-auto-detect"
            className="scale-75"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="info-auto-detect"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                <strong>Smart Intent Detection</strong>
                <br />
                AI automatically analyzes your search query to determine if you're shopping, seeking news, learning, or looking for entertainment. This optimizes results and suggests the best sources for your needs.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Intent tabs - Google style */}
        {!autoDetect && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {intentOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedIntent === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => onIntentChange(option.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                    isSelected
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                  data-testid={`intent-${option.value}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
