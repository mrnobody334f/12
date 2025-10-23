import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ExternalLink, Globe, Download, Share2, Copy, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SiReddit, SiX, SiFacebook, SiInstagram, SiPinterest, SiYoutube } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import type { ImageResult } from "@shared/schema";

interface ImageLightboxProps {
  images: ImageResult[];
  initialIndex: number;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
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

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const handleDownload = async (format: string = 'original') => {
    try {
      // First try to download directly without conversion for better compatibility
      if (format === 'original') {
        // Try multiple methods for better compatibility
        try {
          // Method 1: Direct fetch with CORS
          const response = await fetch(currentImage.imageUrl, {
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Accept': 'image/*',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${currentImage.title || 'image'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast({
              title: "Download started",
              description: "Image download started",
            });
            return;
          }
        } catch (fetchError) {
          console.log('Direct fetch failed, trying alternative method...');
        }

        // Method 2: Try with no-cors mode
        try {
          const response = await fetch(currentImage.imageUrl, {
            mode: 'no-cors'
          });
          
          if (response.type === 'opaque') {
            // For no-cors, we can't read the response, so use direct link
            const link = document.createElement('a');
            link.href = currentImage.imageUrl;
            link.download = `${currentImage.title || 'image'}`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast({
              title: "Download started",
              description: "Image download started (alternative method)",
            });
            return;
          }
        } catch (noCorsError) {
          console.log('No-cors method failed, trying direct link...');
        }

        // Method 3: Direct link fallback
        const link = document.createElement('a');
        link.href = currentImage.imageUrl;
        link.download = `${currentImage.title || 'image'}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download started",
          description: "Image download started (direct link method)",
        });
        return;
      }

      // For format conversion, try with CORS handling
      const response = await fetch(currentImage.imageUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      let finalBlob = blob;
      let extension = format;
      let filename = currentImage.title || 'image';
      
      // Convert image to the requested format using Canvas
      finalBlob = await convertImageFormat(blob, format);
      
      const url = window.URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: `Image download started as ${extension.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: try direct download
      try {
        // Try to fetch and download as blob
        const response = await fetch(currentImage.imageUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${currentImage.title || 'image'}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          toast({
            title: "Download started",
            description: "Image download started (fallback method)",
          });
        } else {
          throw new Error('Failed to fetch image');
        }
      } catch (fallbackError) {
        toast({
          title: "Download failed",
          description: "Could not download the image. Please try right-clicking and 'Save image as'",
          variant: "destructive",
        });
      }
    }
  };

  // Helper function to convert image format using Canvas
  const convertImageFormat = async (blob: Blob, targetFormat: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Set crossOrigin to handle CORS issues
      img.crossOrigin = 'anonymous';
      
      img.onerror = () => {
        reject(new Error('Failed to load image for conversion'));
      };
      
      // Create object URL and set src
      const objectUrl = URL.createObjectURL(blob);
      img.src = objectUrl;
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error('Image conversion timeout'));
      }, 10000);
      
      // Handle image load
      img.onload = () => {
        try {
          // Clear timeout
          clearTimeout(timeout);
          
          // Clean up object URL
          URL.revokeObjectURL(objectUrl);
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Fill with white background for JPG (since JPG doesn't support transparency)
          if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          // Draw the image
          ctx.drawImage(img, 0, 0);
          
          // Convert to blob with the target format
          const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
          canvas.toBlob((convertedBlob) => {
            if (convertedBlob) {
              resolve(convertedBlob);
            } else {
              reject(new Error('Failed to convert image format'));
            }
          }, mimeType, 0.9); // 0.9 quality for JPEG
        } catch (error) {
          clearTimeout(timeout);
          reject(new Error('Canvas drawing failed'));
        }
      };
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentImage.title || 'Image',
          text: `Check out this image: ${currentImage.title}`,
          url: currentImage.link || currentImage.imageUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to copying link
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentImage.link || currentImage.imageUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Image link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy the link",
        variant: "destructive",
      });
    }
  };

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
        {/* Action Buttons - All buttons in top bar */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
          {/* Left side - Download & Share buttons */}
          <div className="flex gap-2">
            {/* Download Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload('original');
              }}
              className="text-white hover:bg-white/20 bg-black/70 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-200 px-3 py-2 text-sm"
              data-testid="button-download-image"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          
            {/* Download As Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 bg-black/70 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-200 px-3 py-2 text-sm"
                  data-testid="button-download-as"
                  onClick={(e) => e.stopPropagation()}
                >
                  Download As
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-black/95 backdrop-blur-md border-2 border-white/50 rounded-lg shadow-2xl">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload('original');
                }}
                className="text-white hover:bg-white/30 focus:bg-white/30 rounded-md font-medium"
              >
                Original Format
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload('jpg');
                }}
                className="text-white hover:bg-white/30 focus:bg-white/30 rounded-md font-medium"
              >
                JPG
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload('png');
                }}
                className="text-white hover:bg-white/30 focus:bg-white/30 rounded-md font-medium"
              >
                PNG
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload('webp');
                }}
                className="text-white hover:bg-white/30 focus:bg-white/30 rounded-md font-medium"
              >
                WebP
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
            {/* Share Button */}
        <Button
          variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="text-white hover:bg-white/20 bg-black/70 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-200 px-3 py-2 text-sm"
              data-testid="button-share-image"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
        </Button>

            {/* Copy Link Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyLink();
              }}
              className="text-white hover:bg-white/20 bg-black/70 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-200 px-3 py-2 text-sm"
              data-testid="button-copy-link"
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>

          {/* Right side - Navigation and Close buttons */}
          <div className="flex gap-2">
            {/* Navigation Buttons - Only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
                  className="text-white hover:bg-white/20 h-10 w-10 bg-black/70 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-200"
              data-testid="button-previous-image"
            >
                  <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
                  className="text-white hover:bg-white/20 h-10 w-10 bg-black/70 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-200"
              data-testid="button-next-image"
            >
                  <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white hover:bg-white/20 h-10 w-10 bg-black/70 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-200"
              data-testid="button-close-lightbox"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

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
              <span className="bg-white/10 px-2 py-1 rounded-full">
                {currentIndex + 1} of {images.length}
              </span>
              {currentImage.link && (
                <>
                  <a
                    href={currentImage.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors underline bg-white/10 px-2 py-1 rounded-full"
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
