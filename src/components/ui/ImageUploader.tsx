/**
 * src/components/ui/ImageUploader.tsx
 * @description Reusable image uploader component with drag-and-drop functionality for project screenshots
 */

import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from './button';
import { toast } from 'sonner';
import { getTransformedImageUrl } from '../../lib/utils';

/**
 * @description Props for the ImageUploader component
 */
interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  onRemove: (url: string) => void;
  existingImageUrls: string[];
  mode?: 'create' | 'edit'; // Add mode to differentiate behavior
}

/**
 * @description Interface for tracking upload progress of individual images
 */
interface UploadingImage {
  file: File;
  preview: string;
  uploading: boolean;
}

/**
 * @description Reusable image uploader component with drag-and-drop functionality
 * @param {ImageUploaderProps} props - Component props
 * @returns {JSX.Element} ImageUploader component
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  onRemove,
  existingImageUrls,
  mode = 'create'
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * @description Handles file upload to Supabase Storage
   * @async
   * @param {File} file - File to upload
   * @sideEffects Uploads file to Supabase Storage and calls onUploadComplete
   */
  const uploadFile = useCallback(async (file: File) => {
    if (!user) {
      toast.error('Authentication Required', {
        description: 'You must be logged in to upload images.'
      });
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('project-screenshots')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-screenshots')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);

      toast.success('Image Uploaded', {
        description: 'Screenshot has been uploaded successfully.'
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Upload Failed', {
        description: 'Failed to upload image. Please try again.'
      });
    }
  }, [user, onUploadComplete]);

  /**
   * @description Handles file selection and upload
   * @async
   * @param {FileList} files - Selected files
   * @sideEffects Updates uploadingImages state and triggers file uploads
   */
  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid File Type', {
          description: 'Please select only image files.'
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File Too Large', {
          description: 'Please select images smaller than 5MB.'
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview objects for uploading images
    const newUploadingImages: UploadingImage[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true
    }));

    setUploadingImages(prev => [...prev, ...newUploadingImages]);

    // Upload each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      await uploadFile(file);

      // Remove from uploading state after upload
      setUploadingImages(prev =>
        prev.filter(img => img.file !== file)
      );
    }
  }, [uploadFile]);

  /**
   * @description Handles click on upload area to trigger file input
   * @param {React.MouseEvent} event - Click event
   * @sideEffects Triggers file input click
   */
  const handleUploadAreaClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    fileInputRef.current?.click();
  };

  /**
   * @description Handles file input change
   * @param {React.ChangeEvent<HTMLInputElement>} event - Change event
   * @sideEffects Processes selected files
   */
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  /**
   * @description Handles drag over event
   * @param {React.DragEvent} event - Drag event
   */
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  /**
   * @description Handles drag leave event
   * @param {React.DragEvent} event - Drag event
   */
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  /**
   * @description Handles file drop
   * @param {React.DragEvent} event - Drop event
   * @sideEffects Processes dropped files
   */
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  };

  /**
   * @description Handles removal of existing images
   * @async
   * @param {string} url - URL of image to remove
   * @param {React.MouseEvent} event - Click event
   * @sideEffects In create mode: deletes image from Supabase Storage immediately. In edit mode: only updates form state.
   */
  const handleRemoveExisting = async (url: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // In edit mode, only update form state - don't delete from storage yet
    if (mode === 'edit') {
      onRemove(url);
      toast.success('Image Marked for Removal', {
        description: 'Image will be deleted when you save the project.'
      });
      return;
    }

    // In create mode, delete immediately (existing behavior)
    try {
      // Extract file path from URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];
      const filePath = `${userId}/${fileName}`;

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('project-screenshots')
        .remove([filePath]);

      if (error) throw error;

      onRemove(url);

      toast.success('Image Removed', {
        description: 'Screenshot has been removed successfully.'
      });
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Remove Failed', {
        description: 'Failed to remove image. Please try again.'
      });
    }
  };

  /**
   * @description Handles removal of uploading images
   * @param {UploadingImage} image - Image to remove
   * @param {React.MouseEvent} event - Click event
   * @sideEffects Updates uploadingImages state
   */
  const handleRemoveUploading = (image: UploadingImage, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    URL.revokeObjectURL(image.preview);
    setUploadingImages(prev => prev.filter(img => img !== image));
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        onClick={handleUploadAreaClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragOver
            ? 'border-startsnap-french-rose bg-startsnap-wisp-pink'
            : 'border-gray-800 bg-startsnap-athens-gray hover:bg-gray-200'
          }
        `}
      >
        <div className="flex flex-col items-center gap-4">
          <span className="material-icons text-4xl text-startsnap-pale-sky">
            cloud_upload
          </span>
          <div>
            <p className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-lg">
              Drop images here or click to upload
            </p>
            <p className="font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm mt-1">
              PNG, JPG, GIF up to 5MB each
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {(existingImageUrls.length > 0 || uploadingImages.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Existing Images */}
          {existingImageUrls.map((url, index) => {
            // Optimize existing images for thumbnail display
            let optimizedUrl = url;
            try {
              if (url.includes('supabase.co/storage')) {
                optimizedUrl = getTransformedImageUrl(url, {
                  width: 120,
                  height: 96,
                  quality: 75,
                  resize: 'cover'
                });
              }
            } catch (error) {
              console.error(`Error optimizing preview image ${index + 1}:`, error);
              optimizedUrl = url; // Fallback to original URL
            }

            return (
              <div key={`existing-${index}`} className="relative group">
                <img
                  src={optimizedUrl}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-800"
                  loading="lazy"
                />
                <Button
                  type="button"
                  onClick={(event) => handleRemoveExisting(url, event)}
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-startsnap-french-rose text-white rounded-full border-2 border-gray-800 shadow-[2px_2px_0px_#1f2937] opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <span className="material-icons text-sm">close</span>
                </Button>
              </div>
            );
          })}

          {/* Uploading Images */}
          {uploadingImages.map((image, index) => (
            <div key={`uploading-${index}`} className="relative group">
              <img
                src={image.preview}
                alt={`Uploading ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border-2 border-gray-800"
              />
              {image.uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <Button
                type="button"
                onClick={(event) => handleRemoveUploading(image, event)}
                className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-startsnap-french-rose text-white rounded-full border-2 border-gray-800 shadow-[2px_2px_0px_#1f2937] opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <span className="material-icons text-sm">close</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};