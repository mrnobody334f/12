import { motion } from "framer-motion";
import { MapPin, Settings2, Mic, Globe2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LocationSelector } from "@/components/location-selector";
import { IntentSelector } from "@/components/intent-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IntentType } from "@shared/schema";

interface SearchControlCenterProps {
  country: string;
  countryCode: string;
  city: string;
  onLocationChange: (country: string, countryCode: string, state: string, city: string, location: string) => void;
  detectedLocation?: { country: string; countryCode: string; city: string };
  autoDetectIntent: boolean;
  manualIntent: IntentType | undefined;
  onIntentChange: (intent: IntentType | undefined) => void;
  onAutoDetectChange: (enabled: boolean) => void;
}

export function SearchControlCenter({
  country,
  countryCode,
  city,
  onLocationChange,
  detectedLocation,
  autoDetectIntent,
  manualIntent,
  onIntentChange,
  onAutoDetectChange,
}: SearchControlCenterProps) {
  const locationDisplay = city || country || "Global";
  const intentDisplay = autoDetectIntent ? "Auto-detect" : manualIntent || "General";
  
  const handleVoiceClick = () => {
    const voiceButton = document.querySelector('[data-testid="button-voice-search"]') as HTMLButtonElement;
    if (voiceButton) {
      voiceButton.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="w-full max-w-3xl"
    >
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Quick Settings
          </h3>
          <p className="text-xs text-muted-foreground">
            Customize your search experience before you start
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location Control */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Location</span>
            </div>
            <LocationSelector
              country={country}
              countryCode={countryCode}
              city={city}
              onLocationChange={onLocationChange}
              detectedLocation={detectedLocation}
            />
            <div className="text-xs text-muted-foreground mt-1">
              Current: <Badge variant="secondary" className="text-xs">
                <Globe2 className="h-3 w-3 mr-1" />
                {locationDisplay}
              </Badge>
            </div>
          </div>

          {/* Intent Control */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Search Intent</span>
            </div>
            <div className="flex-1">
              <IntentSelector
                selectedIntent={manualIntent}
                onIntentChange={onIntentChange}
                autoDetect={autoDetectIntent}
                onAutoDetectChange={onAutoDetectChange}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Mode: <Badge variant="secondary" className="text-xs">
                {intentDisplay}
              </Badge>
            </div>
          </div>

          {/* Voice Search Control */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Voice Search</span>
            </div>
            <Button
              onClick={handleVoiceClick}
              variant="outline"
              className="w-full justify-start gap-2"
              data-testid="button-voice-search-control"
            >
              <Mic className="h-4 w-4" />
              Click to speak
            </Button>
            <div className="text-xs text-muted-foreground mt-1">
              Speak your query in English or Arabic
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
