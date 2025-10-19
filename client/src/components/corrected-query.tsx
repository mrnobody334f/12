import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

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
      <Card className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">هل تقصد: </span>
              <button
                onClick={handleClick}
                className="font-semibold text-primary hover:underline focus:outline-none focus:underline"
                data-testid="button-corrected-query"
              >
                {correctedQuery}
              </button>
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
