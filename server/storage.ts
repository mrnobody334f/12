import type { Bookmark, SearchHistory, InsertBookmark, InsertSearchHistory } from "@shared/schema";

export interface IStorage {
  // Bookmarks
  getBookmarks(): Bookmark[];
  addBookmark(bookmark: InsertBookmark): Bookmark;
  removeBookmark(id: string): boolean;
  
  // Search History
  getSearchHistory(limit?: number): SearchHistory[];
  addSearchHistory(history: InsertSearchHistory): SearchHistory;
  clearSearchHistory(): boolean;
}

export class MemStorage implements IStorage {
  private bookmarks: Map<string, Bookmark> = new Map();
  private searchHistory: SearchHistory[] = [];

  // Bookmarks
  getBookmarks(): Bookmark[] {
    return Array.from(this.bookmarks.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  addBookmark(bookmark: InsertBookmark): Bookmark {
    const id = `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newBookmark: Bookmark = { id, ...bookmark };
    this.bookmarks.set(id, newBookmark);
    return newBookmark;
  }

  removeBookmark(id: string): boolean {
    return this.bookmarks.delete(id);
  }

  // Search History
  getSearchHistory(limit: number = 50): SearchHistory[] {
    return this.searchHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  addSearchHistory(history: InsertSearchHistory): SearchHistory {
    const id = `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newHistory: SearchHistory = { id, ...history };
    
    // Avoid duplicate consecutive entries
    const lastEntry = this.searchHistory[this.searchHistory.length - 1];
    if (!lastEntry || lastEntry.query !== newHistory.query) {
      this.searchHistory.push(newHistory);
      
      // Keep only last 100 entries
      if (this.searchHistory.length > 100) {
        this.searchHistory = this.searchHistory.slice(-100);
      }
    }
    
    return newHistory;
  }

  clearSearchHistory(): boolean {
    this.searchHistory = [];
    return true;
  }
}

export const storage = new MemStorage();
