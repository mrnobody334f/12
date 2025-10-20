import { motion } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InfoPanelProps {
  title: string;
  image?: string;
  description: string;
  details?: Array<{ label: string; value: string }>;
  source?: string;
  sourceLink?: string;
}

export function InfoPanel({ title, image, description, details, source, sourceLink }: InfoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full lg:w-[380px] flex-shrink-0"
      data-testid="info-panel"
    >
      <Card className="overflow-hidden border-border/60 shadow-sm">
        {/* Image */}
        {image && (
          <div className="w-full h-[240px] bg-muted overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <h2 className="text-2xl font-semibold text-foreground leading-tight">
            {title}
          </h2>

          {/* Description */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>

          {/* Details */}
          {details && details.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              {details.map((detail, index) => (
                <div key={index} className="flex gap-3">
                  <span className="text-xs font-medium text-muted-foreground min-w-[80px]">
                    {detail.label}
                  </span>
                  <span className="text-xs text-foreground flex-1">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Source Link */}
          {source && sourceLink && (
            <div className="pt-3 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full gap-2"
              >
                <a
                  href={sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-info-source"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>View on {source}</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground mt-2 px-1">
        Information from web results
      </p>
    </motion.div>
  );
}
