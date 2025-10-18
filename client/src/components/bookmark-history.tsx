import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bookmark, History, Trash2, Search as SearchIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Bookmark as BookmarkType, SearchHistory } from "@shared/schema";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BookmarkHistoryProps {
  onSearchClick: (query: string) => void;
}

export function BookmarkHistory({ onSearchClick }: BookmarkHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: bookmarksData } = useQuery<{ bookmarks: BookmarkType[] }>({
    queryKey: ["/api/bookmarks"],
    enabled: isOpen,
  });

  const { data: historyData } = useQuery<{ history: SearchHistory[] }>({
    queryKey: ["/api/history"],
    enabled: isOpen,
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/bookmarks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/history");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  const bookmarks = bookmarksData?.bookmarks || [];
  const history = historyData?.history || [];

  const handleSearchFromHistory = (query: string) => {
    onSearchClick(query);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-bookmark-history"
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History & Bookmarks</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Search History & Bookmarks</SheetTitle>
          <SheetDescription>
            View your recent searches and saved bookmarks
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="history" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="bookmarks" data-testid="tab-bookmarks">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {history.length} recent searches
              </p>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearHistoryMutation.mutate()}
                  disabled={clearHistoryMutation.isPending}
                  className="gap-2"
                  data-testid="button-clear-history"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              <AnimatePresence>
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No search history yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item, index) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSearchFromHistory(item.query)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-card-border hover-elevate active-elevate-2 transition-all text-left"
                        data-testid={`history-item-${index}`}
                      >
                        <SearchIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.query}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleDateString()} •{" "}
                            {item.intent || "general"}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {bookmarks.length} saved bookmarks
              </p>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              <AnimatePresence>
                {bookmarks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bookmark className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No bookmarks saved yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookmarks.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-2 p-3 rounded-lg border border-card-border"
                      >
                        <button
                          onClick={() => handleSearchFromHistory(item.query)}
                          className="flex-1 text-left hover-elevate active-elevate-2 p-2 rounded transition-all"
                          data-testid={`bookmark-item-${index}`}
                        >
                          <p className="text-sm font-medium text-foreground mb-1">
                            {item.query}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Saved {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteBookmarkMutation.mutate(item.id)}
                          disabled={deleteBookmarkMutation.isPending}
                          className="h-8 w-8 flex-shrink-0"
                          data-testid={`delete-bookmark-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
