import { ShoppingBag, Newspaper, BookOpen, Music, Globe, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { IntentType } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface IntentSelectorProps {
  selectedIntent?: IntentType;
  onIntentChange: (intent: IntentType | undefined) => void;
  autoDetect: boolean;
  onAutoDetectChange: (enabled: boolean) => void;
}

const intentOptions: { value: IntentType; label: string; icon: typeof Globe; description: string }[] = [
  {
    value: "general",
    label: "General",
    icon: Globe,
    description: "All-purpose search",
  },
  {
    value: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    description: "Products & deals",
  },
  {
    value: "news",
    label: "News",
    icon: Newspaper,
    description: "Latest updates",
  },
  {
    value: "learning",
    label: "Learning",
    icon: BookOpen,
    description: "Educational content",
  },
  {
    value: "entertainment",
    label: "Entertainment",
    icon: Music,
    description: "Videos & trends",
  },
];

export function IntentSelector({
  selectedIntent,
  onIntentChange,
  autoDetect,
  onAutoDetectChange,
}: IntentSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Auto-detect toggle */}
      <div className="flex items-center justify-between p-4 bg-card border border-card-border rounded-xl">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" />
          <div>
            <Label htmlFor="auto-detect" className="text-sm font-medium cursor-pointer">
              Auto Intent Detection
            </Label>
            <p className="text-xs text-muted-foreground">
              AI analyzes your query to determine intent
            </p>
          </div>
        </div>
        <Switch
          id="auto-detect"
          checked={autoDetect}
          onCheckedChange={onAutoDetectChange}
          data-testid="toggle-auto-detect"
        />
      </div>

      {/* Manual intent selection */}
      {!autoDetect && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <Label className="text-sm font-medium text-muted-foreground">
            Select Search Intent
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {intentOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedIntent === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => onIntentChange(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover-elevate active-elevate-2",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-card-border"
                  )}
                  data-testid={`intent-${option.value}`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-center">
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className={cn(
                      "text-xs",
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
