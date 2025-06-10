/**
 * src/components/ui/ImageUploader.tsx
 * @description Reusable image uploader component with drag-and-drop functionality for project screenshots
 */

import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from './button';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

/**
 * @description Props for the ImageUploader component
 */
interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  onRemove: (url: string) => void;
  existingImageUrls: string[];
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
 * @returns {JSX.Element} Image uploader component
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  onRemove,
  existingImageUrls
}) => {
  const { user } = useAuth();
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('project-screenshots')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-screenshots')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      
      // Remove from uploading state
      setUploadingImages(prev => prev.filter(img => img.file !== file));

      toast.success('Image Uploaded', {
        description: 'Screenshot has been uploaded successfully.'
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Upload Failed', {
        description: 'Failed to upload image. Please try again.'
      });
      
      // Remove from uploading state on error
      setUploadingImages(prev => prev.filter(img => img.file !== file));
    }
  }, [user, onUploadComplete]);

  /**
   * @description Handles file selection and starts upload process
   * @param {FileList} files - Selected files
   * @sideEffects Adds files to uploading state and starts upload
   */
  const handleFiles = useCallback((files: FileList) => {
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

    validFiles.forEach(file => {
      const preview = URL.createObjectURL(file);
      const uploadingImage: UploadingImage = {
        file,
        preview,
        uploading: true
      };

      setUploadingImages(prev => [...prev, uploadingImage]);
      uploadFile(file);
    });
  }, [uploadFile]);

  /**
   * @description Handles removing an existing image
   * @async
   * @param {React.MouseEvent} event - Click event
   * @param {string} url - URL of image to remove
   * @sideEffects Deletes file from Supabase Storage and calls onRemove
   */
  const handleRemoveExisting = async (event: React.MouseEvent, url: string) => {
    // CRITICAL FIX: Prevent form submission
    event.preventDefault();
    event.stopPropagation();

    try {
      // Extract file path from URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];
      const filePath = `${userId}/${fileName}`;

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
   * @description Handles removing an uploading image
   * @param {React.MouseEvent} event - Click event
   * @param {UploadingImage} uploadingImage - Image being uploaded
   * @sideEffects Removes image from uploading state
   */
  const handleRemoveUploading = (event: React.MouseEvent, uploadingImage: UploadingImage) => {
    // CRITICAL FIX: Prevent form submission
    event.preventDefault();
    event.stopPropagation();

    URL.revokeObjectURL(uploadingImage.preview);
    setUploadingImages(prev => prev.filter(img => img !== uploadingImage));
  };

  /**
   * @description Handles drag over events
   * @param {React.DragEvent} event - Drag event
   */
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  /**
   * @description Handles drag leave events
   * @param {React.DragEvent} event - Drag event
   */
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  /**
   * @description Handles file drop events
   * @param {React.DragEvent} event - Drop event
   */
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  /**
   * @description Handles file input change
   * @param {React.ChangeEvent<HTMLInputElement>} event - Change event
   */
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  /**
   * @description Handles click on upload area
   * @param {React.MouseEvent} event - Click event
   */
  const handleUploadAreaClick = (event: React.MouseEvent) => {
    // CRITICAL FIX: Prevent form submission
    event.preventDefault();
    event.stopPropagation();
    
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-startsnap-french-rose bg-startsnap-wisp-pink'
            : 'border-gray-400 hover:border-startsnap-french-rose hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadAreaClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-lg font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-startsnap-pale-sky font-['Roboto',Helvetica]">
              PNG, JPG, GIF up to 5MB each
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {(existingImageUrls.length > 0 || uploadingImages.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Existing Images */}
          {existingImageUrls.map((url, index) => (
            <div key={`existing-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
                <img
                  src={url}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button" // CRITICAL FIX: Explicitly set button type
                onClick={(e) => handleRemoveExisting(e, url)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-startsnap-french-rose text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Uploading Images */}
          {uploadingImages.map((uploadingImage, index) => (
            <div key={`uploading-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
                <img
                  src={uploadingImage.preview}
                  alt={`Uploading ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {uploadingImage.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button
                type="button" // CRITICAL FIX: Explicitly set button type
                onClick={(e) => handleRemoveUploading(e, uploadingImage)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-startsnap-french-rose text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Remove image"
                disabled={uploadingImage.uploading}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};