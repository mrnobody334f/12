import { useState } from "react";
import { MapPin, Globe2, Check, ChevronsUpDown } from "lucide-react";
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

interface LocationSelectorProps {
  country?: string;
  countryCode?: string;
  city?: string;
  onLocationChange: (country: string, countryCode: string, city: string) => void;
}

interface Country {
  name: string;
  code: string;
  cities: string[];
}

const countriesData: Country[] = [
  { name: "Global", code: "global", cities: [] },
  { name: "Afghanistan", code: "af", cities: ["Kabul", "Kandahar", "Herat", "Mazar-i-Sharif", "Jalalabad"] },
  { name: "Albania", code: "al", cities: ["Tirana", "Durrës", "Vlorë", "Elbasan", "Shkodër"] },
  { name: "Algeria", code: "dz", cities: ["Algiers", "Oran", "Constantine", "Annaba", "Blida"] },
  { name: "Argentina", code: "ar", cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata"] },
  { name: "Australia", code: "au", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"] },
  { name: "Austria", code: "at", cities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"] },
  { name: "Bahrain", code: "bh", cities: ["Manama", "Riffa", "Muharraq", "Hamad Town", "Isa Town"] },
  { name: "Bangladesh", code: "bd", cities: ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet"] },
  { name: "Belgium", code: "be", cities: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège"] },
  { name: "Brazil", code: "br", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"] },
  { name: "Bulgaria", code: "bg", cities: ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse"] },
  { name: "Canada", code: "ca", cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Ottawa"] },
  { name: "Chile", code: "cl", cities: ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta"] },
  { name: "China", code: "cn", cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"] },
  { name: "Colombia", code: "co", cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"] },
  { name: "Croatia", code: "hr", cities: ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar"] },
  { name: "Czech Republic", code: "cz", cities: ["Prague", "Brno", "Ostrava", "Plzeň", "Liberec"] },
  { name: "Denmark", code: "dk", cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg"] },
  { name: "Egypt", code: "eg", cities: ["Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Port Said"] },
  { name: "Estonia", code: "ee", cities: ["Tallinn", "Tartu", "Narva", "Pärnu", "Kohtla-Järve"] },
  { name: "Finland", code: "fi", cities: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu"] },
  { name: "France", code: "fr", cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"] },
  { name: "Germany", code: "de", cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"] },
  { name: "Greece", code: "gr", cities: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa"] },
  { name: "Hong Kong", code: "hk", cities: ["Hong Kong", "Kowloon", "New Territories", "Tsuen Wan", "Sha Tin"] },
  { name: "Hungary", code: "hu", cities: ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs"] },
  { name: "Iceland", code: "is", cities: ["Reykjavík", "Kópavogur", "Hafnarfjörður", "Akureyri", "Reykjanesbær"] },
  { name: "India", code: "in", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai"] },
  { name: "Indonesia", code: "id", cities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang"] },
  { name: "Iran", code: "ir", cities: ["Tehran", "Mashhad", "Isfahan", "Karaj", "Shiraz"] },
  { name: "Iraq", code: "iq", cities: ["Baghdad", "Basra", "Mosul", "Erbil", "Kirkuk"] },
  { name: "Ireland", code: "ie", cities: ["Dublin", "Cork", "Limerick", "Galway", "Waterford"] },
  { name: "Israel", code: "il", cities: ["Jerusalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva"] },
  { name: "Italy", code: "it", cities: ["Rome", "Milan", "Naples", "Turin", "Palermo"] },
  { name: "Japan", code: "jp", cities: ["Tokyo", "Osaka", "Yokohama", "Nagoya", "Sapporo"] },
  { name: "Jordan", code: "jo", cities: ["Amman", "Zarqa", "Irbid", "Russeifa", "Aqaba"] },
  { name: "Kazakhstan", code: "kz", cities: ["Almaty", "Nur-Sultan", "Shymkent", "Karaganda", "Aktobe"] },
  { name: "Kenya", code: "ke", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"] },
  { name: "Kuwait", code: "kw", cities: ["Kuwait City", "Hawalli", "Salmiya", "Sabah Al-Salem", "Al Farwaniyah"] },
  { name: "Latvia", code: "lv", cities: ["Riga", "Daugavpils", "Liepāja", "Jelgava", "Jūrmala"] },
  { name: "Lebanon", code: "lb", cities: ["Beirut", "Tripoli", "Sidon", "Tyre", "Jounieh"] },
  { name: "Libya", code: "ly", cities: ["Tripoli", "Benghazi", "Misrata", "Bayda", "Zawiya"] },
  { name: "Lithuania", code: "lt", cities: ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys"] },
  { name: "Luxembourg", code: "lu", cities: ["Luxembourg City", "Esch-sur-Alzette", "Differdange", "Dudelange", "Ettelbruck"] },
  { name: "Malaysia", code: "my", cities: ["Kuala Lumpur", "George Town", "Ipoh", "Shah Alam", "Petaling Jaya"] },
  { name: "Mexico", code: "mx", cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana"] },
  { name: "Morocco", code: "ma", cities: ["Casablanca", "Rabat", "Fez", "Marrakesh", "Tangier"] },
  { name: "Netherlands", code: "nl", cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"] },
  { name: "New Zealand", code: "nz", cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga"] },
  { name: "Nigeria", code: "ng", cities: ["Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt"] },
  { name: "Norway", code: "no", cities: ["Oslo", "Bergen", "Stavanger", "Trondheim", "Drammen"] },
  { name: "Oman", code: "om", cities: ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur"] },
  { name: "Pakistan", code: "pk", cities: ["Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Multan"] },
  { name: "Palestine", code: "ps", cities: ["Gaza", "Hebron", "Nablus", "Ramallah", "Bethlehem"] },
  { name: "Peru", code: "pe", cities: ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Cusco"] },
  { name: "Philippines", code: "ph", cities: ["Manila", "Quezon City", "Davao", "Cebu", "Zamboanga"] },
  { name: "Poland", code: "pl", cities: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań"] },
  { name: "Portugal", code: "pt", cities: ["Lisbon", "Porto", "Amadora", "Braga", "Setúbal"] },
  { name: "Qatar", code: "qa", cities: ["Doha", "Al Rayyan", "Umm Salal", "Al Wakrah", "Al Khor"] },
  { name: "Romania", code: "ro", cities: ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța"] },
  { name: "Russia", code: "ru", cities: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan"] },
  { name: "Saudi Arabia", code: "sa", cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"] },
  { name: "Serbia", code: "rs", cities: ["Belgrade", "Novi Sad", "Niš", "Kragujevac", "Subotica"] },
  { name: "Singapore", code: "sg", cities: ["Singapore", "Jurong West", "Woodlands", "Tampines", "Bedok"] },
  { name: "Slovakia", code: "sk", cities: ["Bratislava", "Košice", "Prešov", "Žilina", "Nitra"] },
  { name: "Slovenia", code: "si", cities: ["Ljubljana", "Maribor", "Celje", "Kranj", "Velenje"] },
  { name: "South Africa", code: "za", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"] },
  { name: "South Korea", code: "kr", cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon"] },
  { name: "Spain", code: "es", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza"] },
  { name: "Sri Lanka", code: "lk", cities: ["Colombo", "Dehiwala-Mount Lavinia", "Moratuwa", "Negombo", "Kandy"] },
  { name: "Sudan", code: "sd", cities: ["Khartoum", "Omdurman", "Khartoum North", "Port Sudan", "Kassala"] },
  { name: "Sweden", code: "se", cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås"] },
  { name: "Switzerland", code: "ch", cities: ["Zurich", "Geneva", "Basel", "Lausanne", "Bern"] },
  { name: "Syria", code: "sy", cities: ["Damascus", "Aleppo", "Homs", "Latakia", "Hama"] },
  { name: "Taiwan", code: "tw", cities: ["Taipei", "Kaohsiung", "Taichung", "Tainan", "Hsinchu"] },
  { name: "Thailand", code: "th", cities: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Hat Yai"] },
  { name: "Tunisia", code: "tn", cities: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte"] },
  { name: "Turkey", code: "tr", cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"] },
  { name: "Ukraine", code: "ua", cities: ["Kyiv", "Kharkiv", "Odesa", "Dnipro", "Lviv"] },
  { name: "United Arab Emirates", code: "ae", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"] },
  { name: "United Kingdom", code: "gb", cities: ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool"] },
  { name: "United States", code: "us", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"] },
  { name: "Uruguay", code: "uy", cities: ["Montevideo", "Salto", "Paysandú", "Las Piedras", "Rivera"] },
  { name: "Venezuela", code: "ve", cities: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay"] },
  { name: "Vietnam", code: "vn", cities: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Haiphong", "Can Tho"] },
  { name: "Yemen", code: "ye", cities: ["Sana'a", "Aden", "Taiz", "Hodeidah", "Ibb"] },
];

export function LocationSelector({
  country = "",
  countryCode = "",
  city = "",
  onLocationChange,
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
