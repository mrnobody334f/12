import { motion } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AISummary } from "@shared/schema";

interface AISummaryProps {
  summary: AISummary;
  query: string;
}

export function AISummaryCard({ summary, query }: AISummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="relative overflow-hidden border-l-4 border-l-ai-accent">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-ai-accent/5 via-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ai-accent/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-ai-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">AI Summary</h2>
                <p className="text-sm text-muted-foreground">for "{query}"</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover-elevate active-elevate-2 text-muted-foreground md:hidden"
              data-testid="button-toggle-summary"
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {/* Summary Content */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <p className="text-base leading-relaxed text-foreground">
                {summary.summary}
              </p>

              {/* Smart Recommendations */}
              {summary.recommendations && summary.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-ai-accent" />
                    Smart Recommendations
                  </h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    {summary.recommendations.slice(0, 3).map((rec, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all border-ai-accent/20">
                          <div className="flex items-start gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs bg-ai-accent/10 text-ai-accent border-ai-accent/20">
                              #{idx + 1}
                            </Badge>
                            <h4 className="text-sm font-semibold text-foreground flex-1 leading-tight">
                              {rec.title}
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {rec.reason}
                          </p>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Queries */}
              {summary.suggestedQueries && summary.suggestedQueries.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">You might also want to search:</h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.suggestedQueries.map((suggestedQuery, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover-elevate active-elevate-2"
                        data-testid={`badge-suggested-query-${idx}`}
                      >
                        {suggestedQuery}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
