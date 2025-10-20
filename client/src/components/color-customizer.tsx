import { useState, useEffect } from "react";
import { Palette, RotateCcw, Sun, Moon, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ColorConfig {
  background: string;
  foreground: string;
  primary: string;
  card: string;
}

interface FontConfig {
  family: string;
  baseSize: number;
  headingSize: number;
  subheadingSize: number;
}

const defaultLightColors: ColorConfig = {
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  primary: "221 83% 53%",
  card: "240 5% 96%",
};

const defaultDarkColors: ColorConfig = {
  background: "0 0% 8%",
  foreground: "0 0% 95%",
  primary: "215 60% 55%",
  card: "0 0% 12%",
};

const defaultFont: FontConfig = {
  family: "Inter",
  baseSize: 16,
  headingSize: 26,
  subheadingSize: 18,
};

const fontFamilies = [
  { value: "Inter", label: "Inter (Default)" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Verdana", label: "Verdana" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Cairo", label: "Cairo" },
  { value: "Amiri", label: "Amiri" },
  { value: "Tajawal", label: "Tajawal" },
];

export function ColorCustomizer() {
  const [lightColors, setLightColors] = useState<ColorConfig>(defaultLightColors);
  const [darkColors, setDarkColors] = useState<ColorConfig>(defaultDarkColors);
  const [font, setFont] = useState<FontConfig>(defaultFont);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    applySettings();
  }, [lightColors, darkColors, font]);

  const loadSettings = () => {
    const savedColors = localStorage.getItem("novasearch-colors");
    if (savedColors) {
      try {
        const parsed = JSON.parse(savedColors);
        setLightColors(parsed.light || defaultLightColors);
        setDarkColors(parsed.dark || defaultDarkColors);
      } catch (e) {
        console.error("Failed to load colors:", e);
      }
    }

    const savedFont = localStorage.getItem("novasearch-font");
    if (savedFont) {
      try {
        const parsed = JSON.parse(savedFont);
        const baseSize = Math.max(12, Math.min(24, parsed.baseSize || parsed.size || defaultFont.baseSize));
        let headingSize = Math.max(20, Math.min(40, parsed.headingSize || defaultFont.headingSize));
        let subheadingSize = Math.max(14, Math.min(32, parsed.subheadingSize || defaultFont.subheadingSize));
        
        if (subheadingSize >= headingSize - 1) {
          subheadingSize = Math.max(14, headingSize - 2);
        }
        
        setFont({
          family: parsed.family || defaultFont.family,
          baseSize,
          headingSize,
          subheadingSize,
        });
      } catch (e) {
        console.error("Failed to load font:", e);
      }
    }
  };

  const saveSettings = () => {
    const colorConfig = {
      light: lightColors,
      dark: darkColors,
    };
    localStorage.setItem("novasearch-colors", JSON.stringify(colorConfig));
    localStorage.setItem("novasearch-font", JSON.stringify(font));
    
    applySettings();
    toast({
      title: "Settings saved",
      description: "All customizations have been saved successfully",
    });
  };

  const applySettings = () => {
    const root = document.documentElement;
    
    Object.entries(lightColors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });
    
    root.style.setProperty('--font-family', font.family);
    root.style.setProperty('--font-size-base', `${font.baseSize}px`);
    root.style.setProperty('--font-size-heading', `${font.headingSize}px`);
    root.style.setProperty('--font-size-subheading', `${font.subheadingSize}px`);
    document.body.style.fontFamily = font.family;
    document.body.style.fontSize = `${font.baseSize}px`;
    
    const styleId = 'dynamic-dark-colors';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    const darkStyles = Object.entries(darkColors)
      .map(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `--${cssVar}: ${value};`;
      })
      .join('\n    ');
    
    styleEl.textContent = `
      .dark {
        ${darkStyles}
      }
    `;
  };

  const resetSettings = () => {
    setLightColors(defaultLightColors);
    setDarkColors(defaultDarkColors);
    setFont(defaultFont);
    localStorage.removeItem("novasearch-colors");
    localStorage.removeItem("novasearch-font");
    toast({
      title: "Reset complete",
      description: "All settings have been reset to defaults",
    });
  };

  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')));
    const lightness = l / 100;
    const saturation = s / 100;
    
    const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lightness - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    const l = (max + min) / 2;
    const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));
    
    if (diff !== 0) {
      if (max === r) {
        h = 60 * (((g - b) / diff) % 6);
      } else if (max === g) {
        h = 60 * ((b - r) / diff + 2);
      } else {
        h = 60 * ((r - g) / diff + 4);
      }
    }
    
    if (h < 0) h += 360;
    
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const updateLightColor = (key: keyof ColorConfig, hex: string) => {
    setLightColors(prev => ({
      ...prev,
      [key]: hexToHsl(hex)
    }));
  };

  const updateDarkColor = (key: keyof ColorConfig, hex: string) => {
    setDarkColors(prev => ({
      ...prev,
      [key]: hexToHsl(hex)
    }));
  };

  const colorLabels = {
    background: "Background",
    foreground: "Text",
    primary: "Primary",
    card: "Cards",
  } as const;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover-elevate active-elevate-2"
          data-testid="button-color-customizer"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Customize Appearance
          </DialogTitle>
          <DialogDescription>
            Customize colors and fonts to match your preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="light" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="light" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Light
            </TabsTrigger>
            <TabsTrigger value="dark" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Dark
            </TabsTrigger>
            <TabsTrigger value="font" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font
            </TabsTrigger>
          </TabsList>

          <TabsContent value="light" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Light Mode Colors</CardTitle>
                <CardDescription>Choose colors for light theme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(Object.keys(lightColors) as Array<keyof ColorConfig>).map((key) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`light-${key}`} className="text-sm font-medium">
                        {colorLabels[key]}
                      </Label>
                    </div>
                    <Input
                      id={`light-${key}`}
                      type="color"
                      value={hslToHex(lightColors[key])}
                      onChange={(e) => updateLightColor(key, e.target.value)}
                      className="w-24 h-10 cursor-pointer"
                      data-testid={`input-light-${key}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dark" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Dark Mode Colors</CardTitle>
                <CardDescription>Choose colors for dark theme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(Object.keys(darkColors) as Array<keyof ColorConfig>).map((key) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`dark-${key}`} className="text-sm font-medium">
                        {colorLabels[key]}
                      </Label>
                    </div>
                    <Input
                      id={`dark-${key}`}
                      type="color"
                      value={hslToHex(darkColors[key])}
                      onChange={(e) => updateDarkColor(key, e.target.value)}
                      className="w-24 h-10 cursor-pointer"
                      data-testid={`input-dark-${key}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="font" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Font Settings</CardTitle>
                <CardDescription>Customize font family and sizes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select
                    value={font.family}
                    onValueChange={(value) => setFont(prev => ({ ...prev, family: value }))}
                  >
                    <SelectTrigger id="font-family" data-testid="select-font-family">
                      <SelectValue placeholder="Select font family" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((fontFamily) => (
                        <SelectItem key={fontFamily.value} value={fontFamily.value}>
                          <span style={{ fontFamily: fontFamily.value }}>
                            {fontFamily.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="base-font-size">Base Font Size</Label>
                    <span className="text-sm text-muted-foreground">{font.baseSize}px</span>
                  </div>
                  <Slider
                    id="base-font-size"
                    min={12}
                    max={24}
                    step={1}
                    value={[font.baseSize]}
                    onValueChange={(values) => setFont(prev => ({ ...prev, baseSize: values[0] }))}
                    className="w-full"
                    data-testid="slider-base-font-size"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Small (12px)</span>
                    <span>Large (24px)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="heading-font-size">Main Headings Size</Label>
                    <span className="text-sm text-muted-foreground">{font.headingSize}px</span>
                  </div>
                  <Slider
                    id="heading-font-size"
                    min={20}
                    max={40}
                    step={1}
                    value={[font.headingSize]}
                    onValueChange={(values) => {
                      const newHeadingSize = values[0];
                      const maxSubheadingSize = newHeadingSize - 2;
                      setFont(prev => ({
                        ...prev,
                        headingSize: newHeadingSize,
                        subheadingSize: Math.max(14, Math.min(prev.subheadingSize, maxSubheadingSize))
                      }));
                    }}
                    className="w-full"
                    data-testid="slider-heading-font-size"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Small (20px)</span>
                    <span>Large (40px)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subheading-font-size">Subheadings Size</Label>
                    <span className="text-sm text-muted-foreground">{font.subheadingSize}px</span>
                  </div>
                  <Slider
                    id="subheading-font-size"
                    min={14}
                    max={Math.max(14, Math.min(font.headingSize - 2, 32))}
                    step={1}
                    value={[Math.max(14, Math.min(font.subheadingSize, font.headingSize - 2))]}
                    onValueChange={(values) => {
                      const requestedSize = values[0];
                      setFont(prev => ({
                        ...prev,
                        subheadingSize: Math.max(14, Math.min(requestedSize, prev.headingSize - 2))
                      }));
                    }}
                    className="w-full"
                    data-testid="slider-subheading-font-size"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Small (14px)</span>
                    <span>Large ({Math.max(14, Math.min(font.headingSize - 2, 32))}px)</span>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-md border bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <h1 style={{ fontFamily: font.family, fontSize: `${font.headingSize}px`, fontWeight: 600 }}>
                    Main Heading (h1, h2)
                  </h1>
                  <h3 style={{ fontFamily: font.family, fontSize: `${font.subheadingSize}px`, fontWeight: 600 }}>
                    Subheading (h3, h4, titles)
                  </h3>
                  <p style={{ fontFamily: font.family, fontSize: `${font.baseSize}px` }}>
                    Regular text and search results will use this size.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end mt-4">
          <Button
            variant="outline"
            onClick={resetSettings}
            data-testid="button-reset-settings"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={saveSettings}
            data-testid="button-save-settings"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
