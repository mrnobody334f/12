// NovaSearch uses in-memory caching for search results
// No persistent storage needed for the MVP
// Cache is handled in server/lib/cache.ts

export interface IStorage {
  // Placeholder - cache is handled separately
}

export class MemStorage implements IStorage {
  constructor() {
    // No storage needed for NovaSearch MVP
  }
}

export const storage = new MemStorage();
