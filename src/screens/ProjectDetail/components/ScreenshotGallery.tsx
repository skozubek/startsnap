/**
 * src/screens/ProjectDetail/components/ScreenshotGallery.tsx
 * @description Component for displaying project screenshots in a responsive grid with lightbox functionality
 */

import React, { useState } from 'react';
import { getTransformedImageUrl } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * @description Props for the ScreenshotGallery component
 * @param {string[]} urls - Array of screenshot URLs to display
 */
interface ScreenshotGalleryProps {
  urls: string[];
}

/**
 * @description Gallery component for displaying project screenshots with lightbox functionality
 * @param {ScreenshotGalleryProps} props - Component props
 * @returns {JSX.Element | null} Screenshot gallery or null if no URLs provided
 */
export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ urls }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Debug logging
  console.log('🖼️ ScreenshotGallery - URLs received:', urls);
  console.log('🖼️ ScreenshotGallery - URLs length:', urls?.length);

  // Don't render anything if no URLs provided
  if (!urls || urls.length === 0) {
    console.log('🖼️ ScreenshotGallery - No URLs provided, returning null');
    return null;
  }

  /**
   * @description Opens the lightbox with the specified image
   * @param {number} index - Index of the image to display
   */
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  /**
   * @description Closes the lightbox
   */
  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  /**
   * @description Navigates to the previous image in the lightbox
   */
  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1));
  };

  /**
   * @description Navigates to the next image in the lightbox
   */
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === urls.length - 1 ? 0 : prev + 1));
  };

  /**
   * @description Handles keyboard navigation in the lightbox
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      previousImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    }
  };

  // Fallback image URL for when images fail to load
  const fallbackImageUrl = "https://placehold.co/400x300/e2e8f0/1f2937?text=Image+Unavailable";

  return (
    <>
      {/* Screenshot Grid */}
      <div className="px-8 py-6 border-b-2 border-gray-800">
        <div className="flex items-center mb-6">
          <h2 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8">
            Screenshots
          </h2>
          <span className="ml-1 text-startsnap-persian-blue text-2xl material-icons">
            photo_library
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {urls.map((url, index) => {
            // Determine if this is a Supabase URL that needs transformation
            let imageUrl = url;
            
            try {
              if (url.includes('supabase.co/storage')) {
                // Fix the URL structure before transformation
                // Remove any double 'object' in the path that might be causing issues
                const fixedUrl = url.replace('/storage/v1/object/public/object/', '/storage/v1/object/public/');
                imageUrl = getTransformedImageUrl(fixedUrl, { width: 400, format: 'webp' });
                console.log(`🔄 Fixed URL for image ${index + 1}:`, fixedUrl);
              }
            } catch (error) {
              console.error(`Error transforming URL for image ${index + 1}:`, error);
              imageUrl = url; // Fallback to original URL
            }
            
            console.log(`🖼️ Image ${index + 1}:
  Original URL: ${url}
  Display URL: ${imageUrl}`);
            
            return (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1f2937] transition-all duration-200"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={imageUrl}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                  onError={(e) => {
                    console.error(`🚨 Failed to load image ${index + 1}:`, imageUrl, e);
                    // Set fallback image
                    (e.target as HTMLImageElement).src = fallbackImageUrl;
                    (e.target as HTMLImageElement).className = "w-full h-48 object-contain bg-gray-200";
                  }}
                  onLoad={() => {
                    console.log(`✅ Successfully loaded image ${index + 1}:`, imageUrl);
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <span className="material-icons text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-3xl">
                    zoom_in
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot lightbox"
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close lightbox"
          >
            <X size={24} />
          </Button>

          {/* Navigation Buttons */}
          {urls.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </Button>
            </>
          )}

          {/* Main Image */}
          <div
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {urls[currentImageIndex] && (
              <img
                src={(() => {
                  try {
                    // Only transform Supabase URLs
                    if (urls[currentImageIndex].includes('supabase.co/storage')) {
                      // Fix the URL structure before transformation
                      const fixedUrl = urls[currentImageIndex].replace('/storage/v1/object/public/object/', '/storage/v1/object/public/');
                      return getTransformedImageUrl(fixedUrl, { width: 1280, format: 'webp' });
                    }
                    return urls[currentImageIndex];
                  } catch (error) {
                    console.error('Error transforming lightbox image URL:', error);
                    return urls[currentImageIndex];
                  }
                })()}
                alt={`Screenshot ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg border-2 border-gray-300"
                onError={(e) => {
                  console.error(`🚨 Failed to load lightbox image:`, urls[currentImageIndex], e);
                  // Set fallback image
                  (e.target as HTMLImageElement).src = fallbackImageUrl;
                  (e.target as HTMLImageElement).className = "max-w-full max-h-full object-contain rounded-lg border-2 border-gray-300 bg-gray-200";
                }}
                onLoad={() => {
                  console.log(`✅ Successfully loaded lightbox image:`, urls[currentImageIndex]);
                }}
              />
            )}
            
            {/* Image Counter */}
            {urls.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-['Roboto',Helvetica]">
                {currentImageIndex + 1} / {urls.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};