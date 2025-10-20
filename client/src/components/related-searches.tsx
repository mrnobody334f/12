import { motion } from "framer-motion";

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full mt-12 border-t border-border/40 pt-6"
    >
      <h3 className="text-lg font-normal text-foreground mb-4">Related searches</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {searches.slice(0, 8).map((search, index) => (
          <motion.button
            key={index}
            onClick={() => onSearch(search)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            className="text-left px-4 py-3 rounded-lg border border-border/60 bg-background hover:bg-muted/30 transition-colors"
            data-testid={`button-related-search-${index}`}
          >
            <p className="text-sm font-medium" style={{ color: 'hsl(var(--primary))' }}>
              {search}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
