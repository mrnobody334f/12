import { ArrowUpDown, Clock, Eye, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortOption } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SortOptionsProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
}

const sortOptions: { value: SortOption; label: string; icon: typeof Sparkles }[] = [
  {
    value: "relevance",
    label: "Most Relevant",
    icon: Sparkles,
  },
  {
    value: "recent",
    label: "Most Recent",
    icon: Clock,
  },
  {
    value: "mostViewed",
    label: "Most Viewed",
    icon: Eye,
  },
  {
    value: "mostEngaged",
    label: "Most Engaged",
    icon: Heart,
  },
];

export function SortOptions({ selectedSort, onSortChange, resultCount }: SortOptionsProps) {
  const currentOption = sortOptions.find(opt => opt.value === selectedSort) || sortOptions[0];
  const Icon = currentOption.icon;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {resultCount.toLocaleString()} result{resultCount !== 1 ? 's' : ''}
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            data-testid="button-sort"
          >
            <Icon className="h-4 w-4" />
            <span>{currentOption.label}</span>
            <ArrowUpDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {sortOptions.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = selectedSort === option.value;

            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={cn(
                  "gap-2 cursor-pointer",
                  isSelected && "bg-accent"
                )}
                data-testid={`sort-${option.value}`}
              >
                <OptionIcon className="h-4 w-4" />
                <span>{option.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
