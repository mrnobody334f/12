import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Sparkles } from "lucide-react";

export function OnboardingWelcome() {
  const { toast, dismiss } = useToast();
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        const { id } = toast({
          title: "Welcome to NovaSearch!",
          description: (
            <div className="space-y-2 mt-1">
              <p className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Discover powerful AI-powered search features:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>
                  <strong>Voice Search</strong> - Click the mic icon to speak your query
                </li>
                <li>
                  <strong>Smart Intent</strong> - AI understands what you're looking for
                </li>
                <li>
                  <strong>Location Results</strong> - Get relevant results for your area
                </li>
                <li>
                  <strong>Advanced Filters</strong> - Refine by time, language, and file type
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Try the interactive features below to get started!
              </p>
            </div>
          ),
          duration: 12000,
          action: (
            <ToastAction
              altText="Dismiss welcome message"
              onClick={() => {
                localStorage.setItem("hasSeenWelcome", "true");
                if (toastIdRef.current) {
                  dismiss(toastIdRef.current);
                }
              }}
              data-testid="button-dismiss-welcome"
            >
              Got it
            </ToastAction>
          ),
        });
        
        toastIdRef.current = id;
        localStorage.setItem("hasSeenWelcome", "true");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  return null;
}
