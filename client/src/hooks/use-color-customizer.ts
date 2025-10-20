import { useEffect } from 'react';

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

export function useColorCustomizer() {
  useEffect(() => {
    const saved = localStorage.getItem("novasearch-colors");
    if (!saved) return;

    try {
      const config = JSON.parse(saved);
      const lightColors: ColorConfig = config.light;
      const darkColors: ColorConfig = config.dark;

      if (!lightColors || !darkColors) return;

      const root = document.documentElement;
      
      Object.entries(lightColors).forEach(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVar}`, value);
      });

      const observer = new MutationObserver(() => {
        if (document.documentElement.classList.contains('dark')) {
          Object.entries(darkColors).forEach(([key, value]) => {
            const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            document.documentElement.style.setProperty(`--${cssVar}`, value);
          });
        } else {
          Object.entries(lightColors).forEach(([key, value]) => {
            const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            document.documentElement.style.setProperty(`--${cssVar}`, value);
          });
        }
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      return () => observer.disconnect();
    } catch (e) {
      console.error("Failed to apply custom colors:", e);
    }
  }, []);
}
