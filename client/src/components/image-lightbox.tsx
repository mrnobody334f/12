import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiReddit, SiX, SiFacebook, SiInstagram, SiPinterest, SiYoutube } from "react-icons/si";
import type { ImageResult } from "@shared/schema";

interface ImageLightboxProps {
  images: ImageResult[];
  initialIndex: number;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentImage = images[currentIndex];

  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('reddit')) return <SiReddit className="h-5 w-5 text-orange-500" />;
    if (lowerSource.includes('twitter') || lowerSource.includes('x.com')) return <SiX className="h-5 w-5 text-white" />;
    if (lowerSource.includes('facebook')) return <SiFacebook className="h-5 w-5 text-blue-600" />;
    if (lowerSource.includes('instagram')) return <SiInstagram className="h-5 w-5 text-pink-500" />;
    if (lowerSource.includes('pinterest')) return <SiPinterest className="h-5 w-5 text-red-600" />;
    if (lowerSource.includes('youtube')) return <SiYoutube className="h-5 w-5 text-red-600" />;
    return <Globe className="h-5 w-5 text-white/70" />;
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
  };

  useState(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
        data-testid="lightbox-overlay"
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          data-testid="button-close-lightbox"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
              data-testid="button-previous-image"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
              data-testid="button-next-image"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Image Container */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-[95vw] max-h-[95vh] flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image with better sizing */}
          <div className="relative bg-black/50 rounded-lg overflow-hidden max-w-full max-h-[85vh]">
            <img
              src={currentImage.imageUrl}
              alt={currentImage.title}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
              onError={(e) => {
                if (currentImage.thumbnail) {
                  e.currentTarget.src = currentImage.thumbnail;
                }
              }}
            />
          </div>
          
          {/* Enhanced Image Info */}
          <div className="mt-4 w-full max-w-3xl px-4 space-y-3">
            {/* Source with Icon */}
            <div className="flex items-center justify-center gap-2">
              {getSourceIcon(currentImage.source)}
              <span className="text-white/80 text-sm font-medium">
                {currentImage.source}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-white font-semibold text-lg text-center line-clamp-3">
              {currentImage.title || 'Untitled Image'}
            </h3>
            
            {/* Footer Info */}
            <div className="flex items-center justify-center gap-4 text-sm text-white/60">
              <span>{currentIndex + 1} of {images.length}</span>
              {currentImage.link && (
                <>
                  <span>•</span>
                  <a
                    href={currentImage.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors underline"
                    onClick={(e) => e.stopPropagation()}
                    data-testid="link-view-source"
                  >
                    Visit page
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
