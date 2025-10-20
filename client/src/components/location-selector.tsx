import { useState } from "react";
import { MapPin, Globe2, Check, ChevronsUpDown, Locate, X, Map, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  const displayCode = countryCode || "global";
  const selectedCountry = countriesData.find((c) => c.code === displayCode);
  const availableCities = selectedCountry?.cities || [];

  const handleCountrySelect = (code: string) => {
    const selected = countriesData.find((c) => c.code === code);
    const actualCountry = code === "global" ? "" : (selected?.name || "");
    const actualCode = code === "global" ? "" : code;
    onLocationChange(actualCountry, actualCode, "");
    setCountryOpen(false);
  };

  const handleCitySelect = (selectedCity: string) => {
    onLocationChange(country, countryCode, selectedCity);
    setCityOpen(false);
  };

  const handleUseMyLocation = async () => {
    setIsGettingLocation(true);
    
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const response = await fetch('/api/location/geocode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        });

        if (response.ok) {
          const location = await response.json();
          if (location.countryCode) {
            onLocationChange(location.country, location.countryCode, location.city || "");
            toast({
              title: "Location detected",
              description: `Using your precise location: ${location.city ? location.city + ', ' : ''}${location.country}`,
            });
            setIsGettingLocation(false);
            return;
          }
        }
      } catch (error) {
        if ((error as GeolocationPositionError).code === 1) {
          toast({
            title: "Location access denied",
            description: "Search results will be global. You can manually select a location below.",
            variant: "default",
          });
          setIsGettingLocation(false);
          return;
        }
      }
    }

    toast({
      title: "Location detection failed",
      description: "Could not determine your location. Search results will be global.",
      variant: "destructive",
    });
    
    setIsGettingLocation(false);
  };

  const handleClearLocation = () => {
    onLocationChange("", "", "");
    toast({
      title: "Location cleared",
      description: "Search results will now be global",
    });
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-1.5"
      >
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-medium h-8"
              data-testid="button-location-selector"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs">Search Location</span>
              {displayCode !== "global" && (
                <X
                  className="h-3 w-3 opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearLocation();
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
        <PopoverContent className="w-[400px] p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Search Location</Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={displayCode === "global" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCountrySelect("global")}
                  className="gap-2"
                  data-testid="button-set-global"
                >
                  <Globe2 className="h-4 w-4" />
                  <span className="text-xs">Global</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseMyLocation}
                  className="gap-2"
                  disabled={isGettingLocation}
                  data-testid="button-use-my-location"
                >
                  <Locate className={cn("h-4 w-4", isGettingLocation && "animate-spin")} />
                  <span className="text-xs">
                    {isGettingLocation ? "Getting..." : "Use My Location"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-xs text-muted-foreground font-medium">
                  Country
                </Label>
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList className="max-h-[200px]">
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countriesData.map((c) => (
                        <CommandItem
                          key={c.code}
                          value={c.name}
                          onSelect={() => handleCountrySelect(c.code)}
                          data-testid={`option-country-${c.code}`}
                        >
                          <Map className="mr-2 h-4 w-4 text-muted-foreground" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs text-muted-foreground font-medium">
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
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">
                          {city || (availableCities.length > 0 ? "Select city" : "Select country first")}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="start">
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
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-primary/10 border border-primary/20 rounded-lg"
              >
                <p className="text-sm text-foreground">
                  <span className="font-medium">Search results will be localized for:</span>
                  <br />
                  <span className="text-primary font-semibold">
                    {city && <>{city}, </>}
                    {country}
                  </span>
                </p>
              </motion.div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="info-location"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">
            <strong>Location-Based Search</strong>
            <br />
            Get localized results tailored to your region. Use auto-detect for precision or manually select a country and city. Results will be optimized for your location's language, currency, and availability.
          </p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
    </TooltipProvider>
  );
}
