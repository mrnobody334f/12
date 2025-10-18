import { MapPin, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationSelectorProps {
  country?: string;
  countryCode?: string;
  city?: string;
  onLocationChange: (country: string, countryCode: string, city: string) => void;
}

const countries = [
  { name: "Global", code: "global" },
  { name: "United States", code: "us" },
  { name: "United Kingdom", code: "uk" },
  { name: "Canada", code: "ca" },
  { name: "Australia", code: "au" },
  { name: "Germany", code: "de" },
  { name: "France", code: "fr" },
  { name: "Spain", code: "es" },
  { name: "Italy", code: "it" },
  { name: "Japan", code: "jp" },
  { name: "China", code: "cn" },
  { name: "India", code: "in" },
  { name: "Brazil", code: "br" },
  { name: "Mexico", code: "mx" },
  { name: "Egypt", code: "eg" },
  { name: "South Africa", code: "za" },
  { name: "Saudi Arabia", code: "sa" },
  { name: "United Arab Emirates", code: "ae" },
  { name: "Singapore", code: "sg" },
  { name: "South Korea", code: "kr" },
  { name: "Netherlands", code: "nl" },
  { name: "Sweden", code: "se" },
  { name: "Norway", code: "no" },
  { name: "Denmark", code: "dk" },
  { name: "Poland", code: "pl" },
  { name: "Turkey", code: "tr" },
  { name: "Russia", code: "ru" },
  { name: "Indonesia", code: "id" },
  { name: "Thailand", code: "th" },
  { name: "Vietnam", code: "vn" },
  { name: "Philippines", code: "ph" },
  { name: "Malaysia", code: "my" },
  { name: "Argentina", code: "ar" },
  { name: "Chile", code: "cl" },
  { name: "Colombia", code: "co" },
  { name: "Peru", code: "pe" },
  { name: "Nigeria", code: "ng" },
  { name: "Kenya", code: "ke" },
  { name: "Pakistan", code: "pk" },
  { name: "Bangladesh", code: "bd" },
  { name: "New Zealand", code: "nz" },
  { name: "Ireland", code: "ie" },
  { name: "Switzerland", code: "ch" },
  { name: "Austria", code: "at" },
  { name: "Belgium", code: "be" },
  { name: "Portugal", code: "pt" },
  { name: "Greece", code: "gr" },
  { name: "Czech Republic", code: "cz" },
  { name: "Romania", code: "ro" },
  { name: "Hungary", code: "hu" },
  { name: "Israel", code: "il" },
];

export function LocationSelector({
  country = "",
  countryCode = "",
  city = "",
  onLocationChange,
}: LocationSelectorProps) {
  // Display "global" in the UI if no country code is set
  const displayCode = countryCode || "global";

  const handleCountryChange = (code: string) => {
    const selectedCountry = countries.find((c) => c.code === code);
    // If "Global" is selected, pass empty strings to backend
    const actualCountry = code === "global" ? "" : (selectedCountry?.name || "");
    const actualCode = code === "global" ? "" : code;
    onLocationChange(actualCountry, actualCode, city);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLocationChange(country, countryCode, e.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-card border border-card-border rounded-xl space-y-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-5 w-5 text-primary" />
        <Label className="text-sm font-medium">Search Location</Label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country" className="text-xs text-muted-foreground">
            Country
          </Label>
          <Select value={displayCode} onValueChange={handleCountryChange}>
            <SelectTrigger
              id="country"
              className="w-full"
              data-testid="select-country"
            >
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select country" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs text-muted-foreground">
            City (optional)
          </Label>
          <div className="relative">
            <Input
              id="city"
              type="text"
              placeholder="e.g., Cairo, London"
              value={city}
              onChange={handleCityChange}
              className="w-full"
              data-testid="input-city"
            />
          </div>
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
