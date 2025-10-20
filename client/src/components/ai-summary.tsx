import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { AISummary } from "@shared/schema";

interface AISummaryProps {
  summary: AISummary;
  query: string;
}

export function AISummaryCard({ summary, query }: AISummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Google Featured Snippet Style */}
      <div className="border border-border/60 rounded-lg p-5 bg-background/50">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">AI Overview</span>
        </div>

        {/* Summary Content */}
        <div className="space-y-4">
          <p className="text-sm leading-6" style={{ color: 'hsl(var(--google-gray))' }}>
            {summary.summary}
          </p>

          {/* Smart Recommendations - Inline style */}
          {summary.recommendations && summary.recommendations.length > 0 && (
            <div className="space-y-2">
              {summary.recommendations.slice(0, 3).map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2"
                >
                  <span className="text-sm font-medium text-foreground mt-0.5">•</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{rec.title}</span>
                    {rec.reason && (
                      <span className="text-sm" style={{ color: 'hsl(var(--google-gray))' }}>
                        {' — '}{rec.reason}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
