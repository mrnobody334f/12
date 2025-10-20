import { useState, useEffect } from "react";
import { Palette, Download, Upload, RotateCcw, Sun, Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ColorConfig {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  card: string;
  cardForeground: string;
}

const defaultLightColors: ColorConfig = {
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  primary: "221 83% 53%",
  primaryForeground: "0 0% 100%",
  secondary: "240 5% 88%",
  secondaryForeground: "222 47% 11%",
  muted: "240 4% 90%",
  mutedForeground: "0 0% 45%",
  accent: "240 5% 89%",
  accentForeground: "222 47% 11%",
  destructive: "0 84% 60%",
  destructiveForeground: "210 40% 98%",
  border: "214 32% 91%",
  card: "240 5% 96%",
  cardForeground: "222 47% 11%",
};

const defaultDarkColors: ColorConfig = {
  background: "0 0% 8%",
  foreground: "0 0% 95%",
  primary: "215 60% 55%",
  primaryForeground: "0 0% 100%",
  secondary: "0 0% 18%",
  secondaryForeground: "0 0% 95%",
  muted: "0 0% 16%",
  mutedForeground: "0 0% 65%",
  accent: "0 0% 15%",
  accentForeground: "0 0% 95%",
  destructive: "0 70% 55%",
  destructiveForeground: "0 0% 100%",
  border: "0 0% 18%",
  card: "0 0% 12%",
  cardForeground: "0 0% 95%",
};

export function ColorCustomizer() {
  const [lightColors, setLightColors] = useState<ColorConfig>(defaultLightColors);
  const [darkColors, setDarkColors] = useState<ColorConfig>(defaultDarkColors);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadColors();
  }, []);

  useEffect(() => {
    if (isOpen) {
      applyColors();
    }
  }, [lightColors, darkColors, isOpen]);

  const loadColors = () => {
    const saved = localStorage.getItem("novasearch-colors");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLightColors(parsed.light || defaultLightColors);
        setDarkColors(parsed.dark || defaultDarkColors);
      } catch (e) {
        console.error("Failed to load colors:", e);
      }
    }
  };

  const saveColors = () => {
    const config = {
      light: lightColors,
      dark: darkColors,
    };
    localStorage.setItem("novasearch-colors", JSON.stringify(config));
    applyColors();
    toast({
      title: "Colors saved",
      description: "Your color scheme has been saved successfully",
    });
  };

  const applyColors = () => {
    const root = document.documentElement;
    
    Object.entries(lightColors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });
    
    const darkStyle = document.querySelector('.dark') as HTMLElement;
    if (darkStyle) {
      Object.entries(darkColors).forEach(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        darkStyle.style.setProperty(`--${cssVar}`, value);
      });
    }
  };

  const resetColors = () => {
    setLightColors(defaultLightColors);
    setDarkColors(defaultDarkColors);
    localStorage.removeItem("novasearch-colors");
    toast({
      title: "Colors reset",
      description: "Color scheme has been reset to defaults",
    });
  };

  const exportColors = () => {
    const config = {
      light: lightColors,
      dark: darkColors,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `novasearch-colors-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Colors exported",
      description: "Color scheme downloaded successfully",
    });
  };

  const importColors = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target?.result as string);
          if (config.light && config.dark) {
            setLightColors(config.light);
            setDarkColors(config.dark);
            saveColors();
            toast({
              title: "Colors imported",
              description: "Color scheme loaded successfully",
            });
          } else {
            throw new Error("Invalid format");
          }
        } catch (e) {
          toast({
            title: "Import failed",
            description: "Invalid color scheme file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const updateLightColor = (key: keyof ColorConfig, value: string) => {
    setLightColors((prev) => ({ ...prev, [key]: value }));
  };

  const updateDarkColor = (key: keyof ColorConfig, value: string) => {
    setDarkColors((prev) => ({ ...prev, [key]: value }));
  };

  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
    const sNorm = s / 100;
    const lNorm = l / 100;
    
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
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
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const ColorInput = ({ label, value, onChange, description }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
    description?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div
          className="w-8 h-8 rounded border-2 border-border"
          style={{ backgroundColor: `hsl(${value})` }}
        />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="H S% L%"
          className="font-mono text-xs"
          data-testid={`input-color-${label.toLowerCase().replace(/\s+/g, '-')}`}
        />
        <Input
          type="color"
          value={hslToHex(value)}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="w-16 p-1 h-9"
          data-testid={`input-color-picker-${label.toLowerCase().replace(/\s+/g, '-')}`}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-color-customizer">
          <Palette className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Color Customizer
          </DialogTitle>
          <DialogDescription>
            Customize your NovaSearch color scheme for both light and dark modes
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 flex-wrap">
          <Button onClick={saveColors} size="sm" data-testid="button-save-colors">
            Save Changes
          </Button>
          <Button onClick={exportColors} variant="outline" size="sm" data-testid="button-export-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={importColors} variant="outline" size="sm" data-testid="button-import-colors">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={resetColors} variant="outline" size="sm" data-testid="button-reset-colors">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>

        <Tabs defaultValue="light" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="light" className="gap-2" data-testid="tab-light-mode">
              <Sun className="h-4 w-4" />
              Light Mode
            </TabsTrigger>
            <TabsTrigger value="dark" className="gap-2" data-testid="tab-dark-mode">
              <Moon className="h-4 w-4" />
              Dark Mode
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="light" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Background & Text</CardTitle>
                    <CardDescription className="text-xs">Main background and foreground colors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Background"
                      value={lightColors.background}
                      onChange={(v) => updateLightColor('background', v)}
                      description="Main page background"
                    />
                    <ColorInput
                      label="Foreground"
                      value={lightColors.foreground}
                      onChange={(v) => updateLightColor('foreground', v)}
                      description="Main text color"
                    />
                    <ColorInput
                      label="Border"
                      value={lightColors.border}
                      onChange={(v) => updateLightColor('border', v)}
                      description="Default border color"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Primary Colors</CardTitle>
                    <CardDescription className="text-xs">Main brand colors for buttons and links</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Primary"
                      value={lightColors.primary}
                      onChange={(v) => updateLightColor('primary', v)}
                      description="Primary brand color"
                    />
                    <ColorInput
                      label="Primary Foreground"
                      value={lightColors.primaryForeground}
                      onChange={(v) => updateLightColor('primaryForeground', v)}
                      description="Text on primary background"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Secondary Colors</CardTitle>
                    <CardDescription className="text-xs">Secondary UI elements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Secondary"
                      value={lightColors.secondary}
                      onChange={(v) => updateLightColor('secondary', v)}
                    />
                    <ColorInput
                      label="Secondary Foreground"
                      value={lightColors.secondaryForeground}
                      onChange={(v) => updateLightColor('secondaryForeground', v)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Muted & Accent</CardTitle>
                    <CardDescription className="text-xs">Subtle background elements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Muted"
                      value={lightColors.muted}
                      onChange={(v) => updateLightColor('muted', v)}
                    />
                    <ColorInput
                      label="Muted Foreground"
                      value={lightColors.mutedForeground}
                      onChange={(v) => updateLightColor('mutedForeground', v)}
                    />
                    <ColorInput
                      label="Accent"
                      value={lightColors.accent}
                      onChange={(v) => updateLightColor('accent', v)}
                    />
                    <ColorInput
                      label="Accent Foreground"
                      value={lightColors.accentForeground}
                      onChange={(v) => updateLightColor('accentForeground', v)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Cards</CardTitle>
                    <CardDescription className="text-xs">Card backgrounds</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Card"
                      value={lightColors.card}
                      onChange={(v) => updateLightColor('card', v)}
                    />
                    <ColorInput
                      label="Card Foreground"
                      value={lightColors.cardForeground}
                      onChange={(v) => updateLightColor('cardForeground', v)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Destructive</CardTitle>
                    <CardDescription className="text-xs">Error and delete actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Destructive"
                      value={lightColors.destructive}
                      onChange={(v) => updateLightColor('destructive', v)}
                    />
                    <ColorInput
                      label="Destructive Foreground"
                      value={lightColors.destructiveForeground}
                      onChange={(v) => updateLightColor('destructiveForeground', v)}
                    />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="dark" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Background & Text</CardTitle>
                    <CardDescription className="text-xs">Main background and foreground colors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Background"
                      value={darkColors.background}
                      onChange={(v) => updateDarkColor('background', v)}
                      description="Main page background"
                    />
                    <ColorInput
                      label="Foreground"
                      value={darkColors.foreground}
                      onChange={(v) => updateDarkColor('foreground', v)}
                      description="Main text color"
                    />
                    <ColorInput
                      label="Border"
                      value={darkColors.border}
                      onChange={(v) => updateDarkColor('border', v)}
                      description="Default border color"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Primary Colors</CardTitle>
                    <CardDescription className="text-xs">Main brand colors for buttons and links</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Primary"
                      value={darkColors.primary}
                      onChange={(v) => updateDarkColor('primary', v)}
                      description="Primary brand color"
                    />
                    <ColorInput
                      label="Primary Foreground"
                      value={darkColors.primaryForeground}
                      onChange={(v) => updateDarkColor('primaryForeground', v)}
                      description="Text on primary background"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Secondary Colors</CardTitle>
                    <CardDescription className="text-xs">Secondary UI elements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Secondary"
                      value={darkColors.secondary}
                      onChange={(v) => updateDarkColor('secondary', v)}
                    />
                    <ColorInput
                      label="Secondary Foreground"
                      value={darkColors.secondaryForeground}
                      onChange={(v) => updateDarkColor('secondaryForeground', v)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Muted & Accent</CardTitle>
                    <CardDescription className="text-xs">Subtle background elements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Muted"
                      value={darkColors.muted}
                      onChange={(v) => updateDarkColor('muted', v)}
                    />
                    <ColorInput
                      label="Muted Foreground"
                      value={darkColors.mutedForeground}
                      onChange={(v) => updateDarkColor('mutedForeground', v)}
                    />
                    <ColorInput
                      label="Accent"
                      value={darkColors.accent}
                      onChange={(v) => updateDarkColor('accent', v)}
                    />
                    <ColorInput
                      label="Accent Foreground"
                      value={darkColors.accentForeground}
                      onChange={(v) => updateDarkColor('accentForeground', v)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Cards</CardTitle>
                    <CardDescription className="text-xs">Card backgrounds</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Card"
                      value={darkColors.card}
                      onChange={(v) => updateDarkColor('card', v)}
                    />
                    <ColorInput
                      label="Card Foreground"
                      value={darkColors.cardForeground}
                      onChange={(v) => updateDarkColor('cardForeground', v)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Destructive</CardTitle>
                    <CardDescription className="text-xs">Error and delete actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorInput
                      label="Destructive"
                      value={darkColors.destructive}
                      onChange={(v) => updateDarkColor('destructive', v)}
                    />
                    <ColorInput
                      label="Destructive Foreground"
                      value={darkColors.destructiveForeground}
                      onChange={(v) => updateDarkColor('destructiveForeground', v)}
                    />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
