import { useState, useEffect } from "react";
import { Palette, RotateCcw, Sun, Moon } from "lucide-react";
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

interface SimpleColorConfig {
  background: string;
  foreground: string;
  primary: string;
  card: string;
}

const defaultLightColors: SimpleColorConfig = {
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  primary: "221 83% 53%",
  card: "240 5% 96%",
};

const defaultDarkColors: SimpleColorConfig = {
  background: "0 0% 8%",
  foreground: "0 0% 95%",
  primary: "215 60% 55%",
  card: "0 0% 12%",
};

export function ColorCustomizer() {
  const [lightColors, setLightColors] = useState<SimpleColorConfig>(defaultLightColors);
  const [darkColors, setDarkColors] = useState<SimpleColorConfig>(defaultDarkColors);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadColors();
  }, []);

  useEffect(() => {
    applyColors();
  }, [lightColors, darkColors]);

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
      title: "تم حفظ الألوان",
      description: "تم حفظ نظام الألوان بنجاح",
    });
  };

  const applyColors = () => {
    const root = document.documentElement;
    
    // Apply light mode colors to :root
    Object.entries(lightColors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });
    
    // Update dark mode styles by modifying CSS variables when .dark class is present
    // We need to update the style tag or use a different approach
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

  const resetColors = () => {
    setLightColors(defaultLightColors);
    setDarkColors(defaultDarkColors);
    localStorage.removeItem("novasearch-colors");
    toast({
      title: "تم إعادة التعيين",
      description: "تم إعادة تعيين الألوان إلى الافتراضية",
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

  const updateLightColor = (key: keyof SimpleColorConfig, hex: string) => {
    setLightColors(prev => ({
      ...prev,
      [key]: hexToHsl(hex)
    }));
  };

  const updateDarkColor = (key: keyof SimpleColorConfig, hex: string) => {
    setDarkColors(prev => ({
      ...prev,
      [key]: hexToHsl(hex)
    }));
  };

  const colorLabels = {
    background: { ar: "لون الخلفية", en: "Background" },
    foreground: { ar: "لون النص", en: "Text" },
    primary: { ar: "اللون الأساسي", en: "Primary" },
    card: { ar: "لون البطاقات", en: "Cards" },
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
            تخصيص الألوان
          </DialogTitle>
          <DialogDescription>
            قم بتخصيص ألوان الموقع حسب ذوقك
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="light" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="light" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              الوضع النهاري
            </TabsTrigger>
            <TabsTrigger value="dark" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              الوضع الليلي
            </TabsTrigger>
          </TabsList>

          <TabsContent value="light" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>ألوان الوضع النهاري</CardTitle>
                <CardDescription>اختر الألوان التي تناسبك في الوضع النهاري</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(Object.keys(lightColors) as Array<keyof SimpleColorConfig>).map((key) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`light-${key}`} className="text-sm font-medium">
                        {colorLabels[key].ar}
                      </Label>
                    </div>
                    <Input
                      id={`light-${key}`}
                      type="color"
                      value={hslToHex(lightColors[key])}
                      onChange={(e) => updateLightColor(key, e.target.value)}
                      className="w-20 h-10 cursor-pointer"
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
                <CardTitle>ألوان الوضع الليلي</CardTitle>
                <CardDescription>اختر الألوان التي تناسبك في الوضع الليلي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(Object.keys(darkColors) as Array<keyof SimpleColorConfig>).map((key) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`dark-${key}`} className="text-sm font-medium">
                        {colorLabels[key].ar}
                      </Label>
                    </div>
                    <Input
                      id={`dark-${key}`}
                      type="color"
                      value={hslToHex(darkColors[key])}
                      onChange={(e) => updateDarkColor(key, e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                      data-testid={`input-dark-${key}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end mt-4">
          <Button
            variant="outline"
            onClick={resetColors}
            data-testid="button-reset-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            إعادة التعيين
          </Button>
          <Button
            onClick={saveColors}
            data-testid="button-save-colors"
          >
            حفظ التغييرات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
