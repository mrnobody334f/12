import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface RelatedSearchesProps {
  searches: string[];
  onSearch: (query: string) => void;
}

export function RelatedSearches({ searches, onSearch }: RelatedSearchesProps) {
  if (!searches || searches.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-8"
    >
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">تم البحث أيضًا عن</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {searches.slice(0, 9).map((search, index) => (
            <motion.button
              key={index}
              onClick={() => onSearch(search)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className="text-left p-3 rounded-lg hover-elevate active-elevate-2 border border-border bg-card transition-all"
              data-testid={`button-related-search-${index}`}
            >
              <p className="text-sm text-foreground line-clamp-2">{search}</p>
            </motion.button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
