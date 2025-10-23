import { useState, useEffect, useMemo, useCallback } from "react";
import { MapPin, Globe2, Check, ChevronsUpDown, X, Map, Search, Loader2, Flag } from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getAllCountries, searchLocations, initializeLocations, type LocationResult, type SerperLocation } from "@/data/google-locations";

// Helper function to get flag icon class
const getFlagIconClass = (countryCode: string): string => {
  if (!countryCode || countryCode === 'global') return '';
  return `fi fi-${countryCode.toLowerCase()}`;
};

// Helper function to format location type for display
const formatLocationType = (targetType: string): string => {
  const typeMap: { [key: string]: string } = {
    'Country': 'Country',
    'State': 'State', 
    'City': 'City',
    'Region': 'Region',
    'Neighborhood': 'Neighborhood',
    'County': 'County',
    'Airport': 'Airport',
    'Province': 'Province',
    'Territory': 'Territory',
    'District': 'District',
    'DMA Region': 'DMA Region',
    'Metropolitan Area': 'Metro Area',
    'Town': 'Town',
    'Village': 'Village',
    'Borough': 'Borough',
    'Canton': 'Canton',
    'Department': 'Department',
    'Prefecture': 'Prefecture',
    'Governorate': 'Governorate',
    'Emirate': 'Emirate',
    'Autonomous Region': 'Autonomous Region',
    'Special Administrative Region': 'SAR'
  };
  return typeMap[targetType] || targetType;
};

interface LocationSelectorProps {
  country?: string;
  countryCode?: string;
  state?: string;
  city?: string;
  location?: string; // Full location string
  isManualLocation?: boolean; // Whether location was set manually
  locationMode?: 'manual' | 'normal' | 'global'; // Track the current mode
  onLocationChange: (country: string, countryCode: string, state: string, city: string, location: string) => void;
  detectedLocation?: {country: string; countryCode: string; city: string; state?: string; canonicalName?: string; fullName?: string} | null | undefined;
}

export function LocationSelector({
  country = "",
  countryCode = "",
  state = "",
  city = "",
  location = "",
  isManualLocation = false,
  locationMode = 'manual',
  onLocationChange,
  detectedLocation,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [tempCountry, setTempCountry] = useState(country);
  const [tempCountryCode, setTempCountryCode] = useState(countryCode);
  const [tempLocation, setTempLocation] = useState(location);
  const [tempLocationQuery, setTempLocationQuery] = useState("");
  const [tempCountryQuery, setTempCountryQuery] = useState("");
  const [selectedLocationResult, setSelectedLocationResult] = useState<LocationResult | null>(null);

  const [countriesData, setCountriesData] = useState<SerperLocation[]>([]);
  
  // Debug logging for countriesData
  useEffect(() => {
    console.log('🔍 Countries data updated:', countriesData.length, countriesData.slice(0, 3));
  }, [countriesData]);

      // Popular countries for quick access
      const popularCountries = [
        'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
        'France', 'Japan', 'China', 'India', 'Brazil', 'Italy', 'Spain',
        'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Austria',
        'Belgium', 'Ireland', 'New Zealand', 'South Korea', 'Singapore', 'United Arab Emirates',
        'Palestine', 'Egypt', 'Jordan', 'Lebanon', 'Saudi Arabia', 'Turkey'
      ];
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    console.log('🚀 LocationSelector mounted, initializing...');
    initializeLocations();
    loadCountries();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(tempLocationQuery);
    }, 150); // Reduced from 300ms to 150ms for faster response

    return () => clearTimeout(timer);
  }, [tempLocationQuery]);

  // Load countries
  const loadCountries = useCallback(async () => {
    console.log('🔄 loadCountries called');
    setIsLoadingCountries(true);
    try {
      console.log('🔄 Loading countries...');
      const countries = await getAllCountries();
      console.log('✅ Loaded countries:', countries.length, countries.slice(0, 3));
      setCountriesData(countries);
      console.log('✅ Countries data set:', countries.length > 0 ? 'SUCCESS' : 'EMPTY');
    } catch (error) {
      console.error('❌ Failed to load countries:', error);
    } finally {
      setIsLoadingCountries(false);
    }
  }, []);

  // Search locations when query changes
  useEffect(() => {
    const searchLocationsAsync = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setLocationResults([]);
        return;
      }

      setIsLoadingLocations(true);
      try {
            const results = await searchLocations(debouncedQuery, tempCountryCode || undefined, 8); // Reduced from 10 to 8 for faster loading
        setLocationResults(results);
      } catch (error) {
        console.error('Failed to search locations:', error);
        setLocationResults([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    searchLocationsAsync();
  }, [debouncedQuery, tempCountryCode]);

  const selectedCountry = countriesData.find((c) => c.countryCode === tempCountryCode);
  const displayCode = tempCountryCode || "global";

  // Filter and sort countries based on search query
  const filteredCountries = useMemo(() => {
    if (!tempCountryQuery) {
      // Show popular countries first when no search query
      const popular = countriesData.filter(country => 
        popularCountries.includes(country.name)
      );
      const others = countriesData.filter(country => 
        !popularCountries.includes(country.name)
      );
      return [...popular, ...others];
    } else {
      // Filter by search query and prioritize popular countries
      const query = tempCountryQuery.toLowerCase();
      const matching = countriesData.filter(country =>
        country.name.toLowerCase().includes(query)
      );
      
      // Sort: popular countries first, then alphabetical
      return matching.sort((a, b) => {
        const aPopular = popularCountries.includes(a.name);
        const bPopular = popularCountries.includes(b.name);
        
        if (aPopular && !bPopular) return -1;
        if (!aPopular && bPopular) return 1;
        return a.name.localeCompare(b.name);
      });
    }
  }, [countriesData, tempCountryQuery, popularCountries]);

  const handleCountrySelect = (code: string) => {
    const selected = countriesData.find((c) => c.countryCode === code);
    const actualCountry = code === "global" ? "" : (selected?.name || "");
    const actualCode = code === "global" ? "" : code;

    setTempCountry(actualCountry);
    setTempCountryCode(actualCode);
    setTempLocation(""); // Reset location when country changes
    setTempLocationQuery("");
    setTempCountryQuery(""); // Reset country search
    setSelectedLocationResult(null); // Clear selected location result
  };

  const handleLocationSelect = (locationResult: LocationResult) => {
    console.log('🔍 LOCATION SELECTED:', locationResult);
    setSelectedLocationResult(locationResult); // Save the complete location result
    setTempLocation(locationResult.fullName);
    setTempLocationQuery(locationResult.fullName);
  };

  const handleNormalClick = async () => {
    // For Normal mode, don't pass any location parameters to the frontend
    // The server will use the detected location automatically
    onLocationChange("", "", "", "", "");
    toast({
      title: "Location set to normal",
      description: "Search results will be optimized for your current location",
    });
    setIsOpen(false);
  };

  const handleGlobalClick = () => {
    // Clear all location selections and set to global
    setTempCountry("");
    setTempCountryCode("");
    setTempLocation("");
    setTempLocationQuery("");
    setSelectedLocationResult(null);
    // Completely remove all location filters - no country, state, city, or location applied
    onLocationChange("", "", "", "", "");
    toast({
      title: "Location set to global",
      description: "Search results will be global (no location filters applied)",
    });
    setIsOpen(false);
  };

  const handleSave = () => {
    console.log('🔍 LOCATION SELECTOR SAVE:', {
      selectedLocationResult,
      tempLocation,
      tempCountry,
      tempCountryCode
    });

    if (selectedLocationResult) {
      // Use canonicalName for Serper API (without spaces after commas)
      console.log('✅ Using selectedLocationResult:', {
        country: selectedLocationResult.country,
        countryCode: selectedLocationResult.countryCode,
        state: selectedLocationResult.state,
        city: selectedLocationResult.city,
        targetType: selectedLocationResult.targetType,
        canonicalName: selectedLocationResult.canonicalName
      });
      
      // ✅ إرسال الموقع المحدد بدقة حسب نوعه
      onLocationChange(
        selectedLocationResult.country || tempCountry,
        selectedLocationResult.countryCode || tempCountryCode,
        selectedLocationResult.state || "",    // State (إذا كان State أو City)
        selectedLocationResult.city || "",     // City (فقط إذا كان City)
        selectedLocationResult.canonicalName || selectedLocationResult.fullName  // للـ Serper API
      );
    } else if (tempCountry) {
      // User selected country only (no city/state selected from dropdown)
      console.log('✅ Using country only:', tempCountry, tempCountryCode);
      onLocationChange(tempCountry, tempCountryCode, "", "", "");
    } else {
      // Fallback to empty (global)
      console.log('✅ Using global (no location)');
      onLocationChange("", "", "", "", "");
    }
    setIsOpen(false);
    
    if (selectedLocationResult) {
      toast({
        title: "Location updated",
        description: `Search results will be localized for ${selectedLocationResult.fullName}`,
      });
    } else if (tempCountry) {
      toast({
        title: "Location updated", 
        description: `Search results will be localized for ${tempCountry}`,
      });
    }
  };

  const handleClearLocation = () => {
    setTempLocation("");
    setTempLocationQuery("");
    setSelectedLocationResult(null); // Clear selected location result
  };

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
                className="h-8 gap-2 px-3"
              data-testid="button-location-selector"
            >
              <MapPin className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {locationMode === 'manual' && (country || city || state || location) ? (location || (city && state && country ? `${city}, ${state}, ${country}` : (state && country ? `${state}, ${country}` : (city && country ? `${city}, ${country}` : (country ? `${country}` : "Search Location"))))) : 
                   locationMode === 'global' ? "Global" : "Search Location"}
                </span>
                <span className="sm:hidden">Location</span>
            </Button>
          </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Set search location for localized results</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-96 p-0" align="start">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Choose search region</h3>
                <Button
                variant="ghost"
                  size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
                </Button>
              </div>

            {/* Country Selection */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
              </label>
              <Input
                placeholder="Search country"
                value={tempCountryQuery}
                onChange={(e) => setTempCountryQuery(e.target.value)}
                className="w-full"
              />
              <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg">
                {/* Global Option */}
                <div
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    !tempCountryCode || tempCountryCode === "global" 
                      ? "bg-gray-100 dark:bg-gray-800" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => {
                    handleCountrySelect("global");
                    // Clear all location selections and set to global
                    setTempCountry("");
                    setTempCountryCode("");
                    setTempLocation("");
                    setTempLocationQuery("");
                    setSelectedLocationResult(null);
                    // Apply global search immediately
                    onLocationChange("", "", "", "", "");
                    toast({
                      title: "Location set to global",
                      description: "Search results will be global",
                    });
                    setIsOpen(false);
                  }}
                >
                  <Globe2 className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">All regions (Global)</span>
                  {(!tempCountryCode || tempCountryCode === "global") && (
                    <Check className="h-4 w-4 ml-auto text-green-600" />
                  )}
            </div>

                    {/* Countries List */}
                    {countriesData.length > 0 ? (
                      <>
                        {/* Show selected country at top if exists and not global */}
                        {selectedCountry && tempCountryCode && tempCountryCode !== "global" && (
                          <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <span className={`${getFlagIconClass(selectedCountry.countryCode)} me-2`} style={{ width: '20px', height: '15px' }}></span>
                              <div className="flex flex-col flex-1">
                                <span className="font-medium text-blue-700 dark:text-blue-300">{selectedCountry.name}</span>
                                <span className="text-sm text-blue-600 dark:text-blue-400">({formatLocationType(selectedCountry.targetType)}) - Selected</span>
                              </div>
                              <Check className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                        )}
                        
                        {/* Show filtered countries */}
                        {filteredCountries.map((country) => (
                          <div
                            key={country.countryCode}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                              tempCountryCode === country.countryCode 
                                ? "bg-gray-100 dark:bg-gray-800" 
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                            onClick={() => handleCountrySelect(country.countryCode)}
                          >
                            <span className={`${getFlagIconClass(country.countryCode)} me-2`} style={{ width: '20px', height: '15px' }}></span>
                            <div className="flex flex-col flex-1">
                              <span className="font-medium">{country.name}</span>
                              <span className="text-sm text-gray-500">({formatLocationType(country.targetType)})</span>
                            </div>
                            {tempCountryCode === country.countryCode && (
                              <Check className="h-4 w-4 ml-auto text-green-600" />
                            )}
                          </div>
                        ))}
                        
                        {/* No countries found */}
                        {filteredCountries.length === 0 && tempCountryQuery && (
                          <div className="text-center p-4 text-gray-500">
                            No countries found
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        {isLoadingCountries ? "Loading countries..." : `No countries available (${countriesData.length} loaded)`}
                      </div>
                    )}
              </div>
              </div>

            {/* City/State Selection */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  City / State (optional)
                </label>
                {/* Clear button - only show if there's a selected location */}
                {selectedLocationResult && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearLocation}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                    title="Clear selected location"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder={tempCountryCode && tempCountryCode !== "global" ? "Search city or state" : "Select a country first"}
                value={tempLocationQuery}
                onChange={(e) => setTempLocationQuery(e.target.value)}
                className="w-full"
                disabled={!tempCountryCode || tempCountryCode === "global"}
              />
                
                {/* City/State Results */}
                {tempLocationQuery && tempCountryCode && tempCountryCode !== "global" && (
                  <div className="space-y-1 max-h-[150px] overflow-y-auto border rounded-lg">
                    {locationResults.map((result) => (
                      <div
                        key={result.fullName}
                        className="flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleLocationSelect(result)}
                      >
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div className="flex flex-col flex-1">
                          <span className="font-medium">{result.fullName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{result.countryCode}</span>
                            <span className="text-sm text-gray-500">({formatLocationType(result.targetType)})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Only show "No cities or states found" if no location is selected */}
                    {locationResults.length === 0 && tempLocationQuery.length >= 2 && !selectedLocationResult && (
                      <div className="text-center p-4 text-gray-500">
                        No cities or states found
                      </div>
                    )}
                  </div>
                )}
              </div>

            {/* Loading State */}
            {isLoadingCountries && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">Loading regions...</span>
            </div>
            )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNormalClick}
                    className="flex-1"
                    data-testid="button-normal"
                  >
                    <Globe2 className="mr-2 h-4 w-4" />
                    Normal
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGlobalClick}
                    className="flex-1"
                    data-testid="button-global"
                  >
                    <Globe2 className="mr-2 h-4 w-4" />
                    Global
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="flex-1"
                    data-testid="button-save-location"
                  >
                    Save
                  </Button>
                </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}