import { motion } from "framer-motion";

interface CorrectedQueryProps {
  originalQuery: string;
  correctedQuery: string;
  onSearch: (query: string) => void;
}

export function CorrectedQuery({ originalQuery, correctedQuery, onSearch }: CorrectedQueryProps) {
  const handleClick = () => {
    onSearch(correctedQuery);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full mb-4"
    >
      <div className="text-sm text-muted-foreground">
        Did you mean:{" "}
        <button
          onClick={handleClick}
          className="text-primary hover:underline focus:outline-none focus:underline font-normal"
          data-testid="button-corrected-query"
        >
          {correctedQuery}
        </button>
      </div>
    </motion.div>
  );
}
