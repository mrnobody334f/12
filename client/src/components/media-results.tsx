import { motion } from "framer-motion";
import { Star, MapPin, ExternalLink, Clock, Eye, Calendar, Phone, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ImageResult, VideoResult, PlaceResult, NewsResult } from "@shared/schema";

interface ImageResultsProps {
  images: ImageResult[];
}

export function ImageResults({ images }: ImageResultsProps) {
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">No images found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02, duration: 0.2 }}
          className="group relative rounded-lg overflow-hidden bg-muted hover-elevate"
          data-testid={`image-result-${index}`}
        >
          <a
            href={image.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block aspect-square"
          >
            <img
              src={image.imageUrl}
              alt={image.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = image.thumbnail || '';
              }}
            />
          </a>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-xs line-clamp-2">{image.title}</p>
            <p className="text-white/70 text-xs mt-1">{image.source}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface VideoResultsProps {
  videos: VideoResult[];
}

export function VideoResults({ videos }: VideoResultsProps) {
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">No videos found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
          className="group rounded-xl overflow-hidden hover-elevate"
          data-testid={`video-result-${index}`}
        >
          <a
            href={video.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative aspect-video bg-muted">
              {video.thumbnail && (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              )}
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {video.channel && <span>{video.channel}</span>}
                {video.views && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{video.views}</span>
                    </div>
                  </>
                )}
                {video.date && (
                  <>
                    <span>•</span>
                    <span>{video.date}</span>
                  </>
                )}
              </div>
              {video.snippet && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {video.snippet}
                </p>
              )}
            </div>
          </a>
        </motion.div>
      ))}
    </div>
  );
}

interface PlaceResultsProps {
  places: PlaceResult[];
}

export function PlaceResults({ places }: PlaceResultsProps) {
  if (places.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">No places found</p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative h-4 w-4">
            <Star className="absolute h-4 w-4 text-gray-300 dark:text-gray-600" />
            <Star className="absolute h-4 w-4 fill-yellow-500 text-yellow-500" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="space-y-4">
      {places.map((place, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
          className="flex gap-4 p-4 rounded-xl hover-elevate"
          data-testid={`place-result-${index}`}
        >
          {place.thumbnail && (
            <div className="flex-shrink-0">
              <img
                src={place.thumbnail}
                alt={place.title}
                className="w-24 h-24 rounded-lg object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">{place.title}</h3>
            
            {place.rating && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-0.5">
                  {renderStars(place.rating)}
                </div>
                <span className="text-sm font-medium">{place.rating.toFixed(1)}</span>
                {place.ratingCount && (
                  <span className="text-xs text-muted-foreground">
                    ({place.ratingCount.toLocaleString()})
                  </span>
                )}
              </div>
            )}

            <div className="space-y-1 text-sm">
              {place.type && (
                <Badge variant="secondary" className="text-xs">
                  {place.type}
                </Badge>
              )}
              {place.address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{place.address}</span>
                </div>
              )}
              {place.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{place.phone}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              {place.googleMapsUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                  data-testid={`button-map-${index}`}
                >
                  <a href={place.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="h-4 w-4" />
                    View on Maps
                  </a>
                </Button>
              )}
              {place.website && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                  data-testid={`button-website-${index}`}
                >
                  <a href={place.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface NewsResultsProps {
  news: NewsResult[];
}

export function NewsResults({ news }: NewsResultsProps) {
  if (news.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">No news found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((article, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
          className="group flex gap-4 p-4 rounded-xl hover-elevate"
          data-testid={`news-result-${index}`}
        >
          {article.thumbnail && (
            <div className="flex-shrink-0">
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-32 h-24 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              </a>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group/link"
            >
              <h3 className="font-semibold text-lg mb-1 group-hover/link:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
            </a>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span className="font-medium">{article.source}</span>
              {article.date && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{article.date}</span>
                  </div>
                </>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.snippet}
            </p>

            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
              data-testid={`link-news-${index}`}
            >
              Read more
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
