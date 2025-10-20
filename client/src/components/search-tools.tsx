import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings2, Clock, Globe, FileText, X, Languages } from "lucide-react";

export type TimeFilter = "any" | "day" | "week" | "month" | "year";
export type LanguageFilter = "any" | "ar" | "en" | "fr" | "es" | "de";
export type FileTypeFilter = "any" | "pdf" | "doc" | "ppt" | "xls";

interface SearchToolsProps {
  timeFilter: TimeFilter;
  languageFilter: LanguageFilter;
  fileTypeFilter: FileTypeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  onLanguageFilterChange: (filter: LanguageFilter) => void;
  onFileTypeFilterChange: (filter: FileTypeFilter) => void;
  onClearFilters: () => void;
}

const getLanguageDisplay = (code: LanguageFilter): string => {
  const map: Record<LanguageFilter, string> = {
    any: "Any",
    ar: "🇸🇦 العربية",
    en: "🇬🇧 English",
    fr: "🇫🇷 Français",
    es: "🇪🇸 Español",
    de: "🇩🇪 Deutsch",
  };
  return map[code];
};

export function SearchTools({
  timeFilter,
  languageFilter,
  fileTypeFilter,
  onTimeFilterChange,
  onLanguageFilterChange,
  onFileTypeFilterChange,
  onClearFilters,
}: SearchToolsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = timeFilter !== "any" || languageFilter !== "any" || fileTypeFilter !== "any";

  const timeOptions = [
    { value: "any", label: "Any time" },
    { value: "day", label: "Past 24 hours" },
    { value: "week", label: "Past week" },
    { value: "month", label: "Past month" },
    { value: "year", label: "Past year" },
  ];

  const languageOptions = [
    { value: "any", label: "Any language" },
    { value: "ar", label: "العربية (Arabic)" },
    { value: "en", label: "English" },
    { value: "fr", label: "Français (French)" },
    { value: "es", label: "Español (Spanish)" },
    { value: "de", label: "Deutsch (German)" },
  ];

  const fileTypeOptions = [
    { value: "any", label: "Any type" },
    { value: "pdf", label: "PDF" },
    { value: "doc", label: "DOC/DOCX" },
    { value: "ppt", label: "PPT/PPTX" },
    { value: "xls", label: "XLS/XLSX" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Language Selector - Prominent */}
      {languageFilter !== "any" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="gap-2 bg-primary/90 hover:bg-primary"
                data-testid="button-active-language"
              >
                <Languages className="h-4 w-4" />
                <span className="font-medium">{getLanguageDisplay(languageFilter)}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Language</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLanguageFilterChange("any")}
                    className="h-auto p-1 text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <Select value={languageFilter} onValueChange={(value) => onLanguageFilterChange(value as LanguageFilter)}>
                  <SelectTrigger className="w-full" data-testid="select-language-filter-prominent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      )}
      
      {/* Tools Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            data-testid="button-search-tools"
          >
            <Settings2 className="h-4 w-4" />
            <span>Tools</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                {[timeFilter !== "any", languageFilter !== "any", fileTypeFilter !== "any"].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start" data-testid="popover-search-tools">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-foreground">Search Tools</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearFilters();
                    setIsOpen(false);
                  }}
                  className="h-auto p-1 text-xs text-destructive hover:text-destructive"
                  data-testid="button-clear-filters"
                >
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Language Filter - Featured */}
              <div className="space-y-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Languages className="h-4 w-4 text-primary" />
                  Language
                </label>
                <Select value={languageFilter} onValueChange={(value) => onLanguageFilterChange(value as LanguageFilter)}>
                  <SelectTrigger className="w-full" data-testid="select-language-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Time Range
                </label>
                <Select value={timeFilter} onValueChange={(value) => onTimeFilterChange(value as TimeFilter)}>
                  <SelectTrigger className="w-full" data-testid="select-time-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  File Type
                </label>
                <Select value={fileTypeFilter} onValueChange={(value) => onFileTypeFilterChange(value as FileTypeFilter)}>
                  <SelectTrigger className="w-full" data-testid="select-file-type-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      <AnimatePresence>
        {timeFilter !== "any" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Badge variant="secondary" className="gap-1.5" data-testid="badge-active-time-filter">
              <Clock className="h-3 w-3" />
              {timeOptions.find(o => o.value === timeFilter)?.label}
              <button
                onClick={() => onTimeFilterChange("any")}
                className="ml-1 hover:bg-muted rounded-sm p-0.5"
                data-testid="button-remove-time-filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.div>
        )}
        
        {fileTypeFilter !== "any" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Badge variant="secondary" className="gap-1.5" data-testid="badge-active-file-type-filter">
              <FileText className="h-3 w-3" />
              {fileTypeOptions.find(o => o.value === fileTypeFilter)?.label}
              <button
                onClick={() => onFileTypeFilterChange("any")}
                className="ml-1 hover:bg-muted rounded-sm p-0.5"
                data-testid="button-remove-file-type-filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
