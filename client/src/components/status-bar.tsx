import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IntentSelector } from "@/components/intent-selector";
import { LocationSelector } from "@/components/location-selector";
import { SearchTools, type TimeFilter, type LanguageFilter, type FileTypeFilter } from "@/components/search-tools";
import type { IntentType } from "@shared/schema";

interface StatusBarProps {
  autoDetectIntent: boolean;
  manualIntent: IntentType | undefined;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  location: string;
  timeFilter: TimeFilter;
  languageFilter: LanguageFilter;
  fileTypeFilter: FileTypeFilter;
  onIntentChange: (intent: IntentType | undefined) => void;
  onAutoDetectChange: (enabled: boolean) => void;
  onLocationChange: (country: string, countryCode: string, state: string, city: string, location: string) => void;
  onTimeFilterChange: (filter: TimeFilter) => void;
  onLanguageFilterChange: (filter: LanguageFilter) => void;
  onFileTypeFilterChange: (filter: FileTypeFilter) => void;
  onClearFilters: () => void;
  detectedLocation?: { country: string; countryCode: string; city: string };
}

export function StatusBar({
  autoDetectIntent,
  manualIntent,
  country,
  countryCode,
  state,
  city,
  location,
  timeFilter,
  languageFilter,
  fileTypeFilter,
  onIntentChange,
  onAutoDetectChange,
  onLocationChange,
  onTimeFilterChange,
  onLanguageFilterChange,
  onFileTypeFilterChange,
  onClearFilters,
  detectedLocation
}: StatusBarProps) {
  const intentText = autoDetectIntent ? "Auto-detect ON" : (manualIntent ? `Intent: ${manualIntent}` : "General");
  const locationText = location 
    ? location.replace(/,/g, ', ') 
    : (city && state ? `${city}, ${state}, ${country}` 
      : (state && country ? `${state}, ${country}` 
        : (city || state || country || "Global")));
  
  const hasActiveFilters = timeFilter !== "any" || languageFilter !== "any" || fileTypeFilter !== "any";
  const filterCount = [timeFilter !== "any", languageFilter !== "any", fileTypeFilter !== "any"].filter(Boolean).length;
  const filtersText = hasActiveFilters ? `${filterCount} filter${filterCount > 1 ? 's' : ''} active` : "No filters active";

  return (
    <div className="bg-muted/30 border-b border-border/20">
      <div className="max-w-[1400px] mx-auto px-4 py-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Status Summary */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Info className="h-3 w-3" />
              <span className="font-medium">Active Settings:</span>
            </div>
            <Badge variant="secondary" className="text-xs" data-testid="badge-intent-status">
              {intentText}
            </Badge>
            <span className="text-muted-foreground/50">•</span>
            <Badge variant="secondary" className="text-xs" data-testid="badge-location-status">
              {locationText}
            </Badge>
            <span className="text-muted-foreground/50">•</span>
            <Badge 
              variant={hasActiveFilters ? "default" : "secondary"} 
              className="text-xs"
              data-testid="badge-filters-status"
            >
              {filtersText}
            </Badge>
          </div>

          {/* Quick Settings Access */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs h-7"
                data-testid="button-adjust-settings"
              >
                Adjust Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Search Intent</h4>
                  <IntentSelector
                    selectedIntent={manualIntent}
                    onIntentChange={onIntentChange}
                    autoDetect={autoDetectIntent}
                    onAutoDetectChange={onAutoDetectChange}
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2">Location</h4>
                  <LocationSelector
                    country={country}
                    countryCode={countryCode}
                    state={state}
                    city={city}
                    location={location}
                    onLocationChange={onLocationChange}
                    detectedLocation={detectedLocation}
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2">Filters</h4>
                  <SearchTools
                    timeFilter={timeFilter}
                    languageFilter={languageFilter}
                    fileTypeFilter={fileTypeFilter}
                    onTimeFilterChange={onTimeFilterChange}
                    onLanguageFilterChange={onLanguageFilterChange}
                    onFileTypeFilterChange={onFileTypeFilterChange}
                    onClearFilters={onClearFilters}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
