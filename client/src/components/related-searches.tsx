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
      className="w-full mt-12 border-t border-border/40 pt-8 pb-4"
    >
      <h3 className="text-base font-medium text-foreground mb-5">People also search for</h3>
      
      <div className="flex flex-wrap gap-2.5">
        {searches.slice(0, 12).map((search, index) => (
          <motion.button
            key={index}
            onClick={() => onSearch(search)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02, duration: 0.2 }}
            className="px-5 py-2.5 rounded-full border border-border/70 bg-background hover-elevate active-elevate-2 transition-all text-sm font-medium shadow-sm"
            style={{ color: 'hsl(var(--foreground))' }}
            data-testid={`button-related-search-${index}`}
          >
            {search}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
