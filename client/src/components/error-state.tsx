import { AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-8 max-w-md text-center space-y-6">
          <div className="inline-flex p-4 bg-destructive/10 rounded-full">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Oops! Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message || "We encountered an error while searching. Please try again."}
            </p>
          </div>

          {onRetry && (
            <Button
              onClick={onRetry}
              className="gap-2"
              data-testid="button-retry"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
