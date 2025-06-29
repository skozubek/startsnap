/**
 * src/screens/ProjectDetail/components/ScreenshotGallery.tsx
 * @description Component for displaying project screenshots in a responsive grid with lightbox functionality
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // Don't render anything if no URLs provided
  if (!urls || urls.length === 0) {
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
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!lightboxOpen) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      previousImage();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextImage();
    }
  };

  // Add global keyboard event listener
  useEffect(() => {
    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [lightboxOpen, currentImageIndex]); // Include currentImageIndex to ensure navigation works properly

  // Fallback image URL for when images fail to load
  const fallbackImageUrl = "https://placehold.co/400x300/e2e8f0/1f2937?text=Image+Unavailable";

  return (
    <>
      {/* Screenshot Grid */}
      <div className="px-4 py-6 border-b-2 border-gray-800 md:px-8">
        <div className="flex items-center mb-6">
          <h2 className="font-heading text-startsnap-ebony-clay text-2xl leading-8">
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
                // Optimize for thumbnail display: 400x300 with cover resize and quality 75
                imageUrl = getTransformedImageUrl(url, {
                  width: 400,
                  height: 300,
                  quality: 75,
                  resize: 'contain'
                });

              }
            } catch (error) {
              console.error(`Error transforming URL for image ${index + 1}:`, error);
              imageUrl = url; // Fallback to original URL
            }



            return (
              <div
                key={index}
                className="startsnap-gallery-item"
                onClick={() => openLightbox(index)}
              >
                {/* Simplified image container */}
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 md:duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Set fallback image
                      (e.target as HTMLImageElement).src = fallbackImageUrl;
                      (e.target as HTMLImageElement).className = "w-full h-full object-contain bg-gray-200";
                    }}
                  />

                  {/* Simple hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 group-active:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200 bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                      <span className="material-icons text-white text-2xl">
                        zoom_in
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal - Rendered via Portal to Document Body */}
      {lightboxOpen && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeLightbox}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot lightbox"
          style={{
            zIndex: 9999,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(30,41,59,0.9) 50%, rgba(0,0,0,0.85) 100%)',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          {/* Enhanced Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 text-white bg-black/30 hover:bg-white/20 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110 shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close lightbox"
            style={{ zIndex: 10001 }}
          >
            <X size={20} />
          </Button>

          {/* Enhanced Navigation Buttons */}
          {urls.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white bg-black/30 hover:bg-white/20 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                aria-label="Previous image"
                style={{ zIndex: 10001 }}
              >
                <ChevronLeft size={20} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white bg-black/30 hover:bg-white/20 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Next image"
                style={{ zIndex: 10001 }}
              >
                <ChevronRight size={20} />
              </Button>
            </>
          )}

          {/* Main Image Container - Enhanced with beautiful styling */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] bg-white rounded-2xl shadow-2xl border-4 border-gray-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              animation: 'scaleIn 0.3s ease-out'
            }}
          >
            {/* Image Header with StartSnap styling */}
            <div className="bg-startsnap-candlelight border-b-2 border-gray-800 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-icons text-startsnap-persian-blue text-xl">
                  photo_camera
                </span>
                <h3 className="font-subheading text-startsnap-ebony-clay text-lg">
                  Screenshot Preview
                </h3>
              </div>

              {/* Image Counter in header */}
              {urls.length > 1 && (
                <div className="bg-startsnap-wisp-pink border-2 border-gray-800 rounded-full px-3 py-1 shadow-[2px_2px_0px_#1f2937]">
                  <span className="font-ui text-startsnap-ebony-clay text-sm">
                    {currentImageIndex + 1} of {urls.length}
                  </span>
                </div>
              )}
            </div>

            {/* Image Container */}
            <div className="relative bg-gray-100 flex items-center justify-center min-h-[60vh]">
              {urls[currentImageIndex] && (
                <img
                  src={(() => {
                    try {
                      // Only transform Supabase URLs
                      if (urls[currentImageIndex].includes('supabase.co/storage')) {
                        // Optimize for lightbox display: 1200px max width with contain resize and higher quality
                        return getTransformedImageUrl(urls[currentImageIndex], {
                          width: 1200,
                          quality: 85,
                          resize: 'contain'
                        });
                      }
                      return urls[currentImageIndex];
                    } catch (error) {
                      return urls[currentImageIndex];
                    }
                  })()}
                  alt={`Screenshot ${currentImageIndex + 1}`}
                  className="max-w-full max-h-[75vh] object-contain shadow-lg transition-all duration-300"
                  style={{
                    filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.2))',
                    animation: 'imageSlideIn 0.4s ease-out'
                  }}
                  onError={(e) => {
                    // Set fallback image
                    (e.target as HTMLImageElement).src = fallbackImageUrl;
                    (e.target as HTMLImageElement).className = "max-w-full max-h-[75vh] object-contain shadow-lg bg-gray-200";
                  }}
                />
              )}


            </div>


          </div>

          {/* Add custom animations via inline styles */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes scaleIn {
              from {
                opacity: 0;
                transform: scale(0.9);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }

            @keyframes imageSlideIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>,
        document.body
      )}
    </>
  );
};