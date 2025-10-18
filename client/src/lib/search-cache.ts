import type { SearchResponse } from "@shared/schema";

const CACHE_PREFIX = "novasearch_cache_";
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

interface CachedSearch {
  data: SearchResponse;
  timestamp: number;
}

export const searchCache = {
  get(key: string): SearchResponse | null {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;

      const { data, timestamp }: CachedSearch = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() - timestamp > CACHE_EXPIRY) {
        this.delete(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  },

  set(key: string, data: SearchResponse): void {
    try {
      const cached: CachedSearch = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cached));
    } catch (error) {
      console.error("Error writing to cache:", error);
      // If quota exceeded, clear old entries
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        this.cleanup();
        // Try again
        try {
          const cached: CachedSearch = {
            data,
            timestamp: Date.now(),
          };
          localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cached));
        } catch {
          // If still fails, ignore
        }
      }
    }
  },

  delete(key: string): void {
    localStorage.removeItem(CACHE_PREFIX + key);
  },

  cleanup(): void {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const { timestamp }: CachedSearch = JSON.parse(cached);
              if (now - timestamp > CACHE_EXPIRY) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // If parsing fails, remove the item
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning cache:", error);
    }
  },

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  },
};

// Clean up expired entries on page load
searchCache.cleanup();
