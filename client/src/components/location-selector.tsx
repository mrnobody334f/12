import { useState } from "react";
import { MapPin, Globe2, Check, ChevronsUpDown, Locate } from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { countriesData, type Country } from "@/data/google-locations";

interface LocationSelectorProps {
  country?: string;
  countryCode?: string;
  city?: string;
  onLocationChange: (country: string, countryCode: string, city: string) => void;
  detectedLocation?: {country: string; countryCode: string; city: string} | null | undefined;
}

export function LocationSelector({
  country = "",
  countryCode = "",
  city = "",
  onLocationChange,
  detectedLocation,
}: LocationSelectorProps) {
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  // Display "global" in the UI if no country code is set
  const displayCode = countryCode || "global";
  const selectedCountry = countriesData.find((c) => c.code === displayCode);
  
  // Get cities for the selected country
  const availableCities = selectedCountry?.cities || [];

  const handleCountrySelect = (code: string) => {
    const selected = countriesData.find((c) => c.code === code);
    // If "Global" is selected, pass empty strings to backend
    const actualCountry = code === "global" ? "" : (selected?.name || "");
    const actualCode = code === "global" ? "" : code;
    // Reset city when changing country
    onLocationChange(actualCountry, actualCode, "");
    setCountryOpen(false);
  };

  const handleCitySelect = (selectedCity: string) => {
    onLocationChange(country, countryCode, selectedCity);
    setCityOpen(false);
  };

  const handleUseMyLocation = () => {
    if (detectedLocation && detectedLocation.countryCode) {
      onLocationChange(detectedLocation.country, detectedLocation.countryCode, detectedLocation.city || "");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-card border border-card-border rounded-xl space-y-4"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <Label className="text-sm font-medium">Search Location</Label>
        </div>
        {detectedLocation && detectedLocation.countryCode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseMyLocation}
            className="gap-2"
            data-testid="button-use-my-location"
          >
            <Locate className="h-4 w-4" />
            <span className="text-xs">Use My Location</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Country Selector with Search */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-xs text-muted-foreground">
            Country
          </Label>
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={countryOpen}
                className="w-full justify-between"
                data-testid="button-country-selector"
              >
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">
                    {selectedCountry?.name || "Select country"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countriesData.map((c) => (
                      <CommandItem
                        key={c.code}
                        value={c.name}
                        onSelect={() => handleCountrySelect(c.code)}
                        data-testid={`option-country-${c.code}`}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            displayCode === c.code ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {c.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* City Selector with Search */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs text-muted-foreground">
            City (optional)
          </Label>
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={cityOpen}
                className="w-full justify-between"
                disabled={!countryCode || countryCode === "global" || availableCities.length === 0}
                data-testid="button-city-selector"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">
                    {city || (availableCities.length > 0 ? "Select city" : "Select country first")}
                  </span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    {availableCities.map((c) => (
                      <CommandItem
                        key={c}
                        value={c}
                        onSelect={() => handleCitySelect(c)}
                        data-testid={`option-city-${c.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            city === c ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {c}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {(country || city) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground"
        >
          Search results will be localized for{" "}
          {city && <span className="font-medium">{city}</span>}
          {city && country && ", "}
          {country && <span className="font-medium">{country}</span>}
        </motion.div>
      )}
    </motion.div>
  );
}
