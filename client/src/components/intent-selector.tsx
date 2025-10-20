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
      <div className="flex items-center gap-1.5">
        {/* Auto-detect toggle - compact */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border/60 bg-background flex-shrink-0 h-8">
          <Zap className="h-3 w-3 text-primary" />
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
        </div>

        {/* Intent tabs - Small buttons */}
        {!autoDetect && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {intentOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedIntent === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => onIntentChange(option.value)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap h-8",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover-elevate"
                  )}
                  data-testid={`intent-${option.value}`}
                >
                  <Icon className="h-3 w-3" />
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
