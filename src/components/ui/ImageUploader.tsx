/**
 * src/components/ui/ImageUploader.tsx
 * @description Reusable image uploader component with drag-and-drop functionality for uploading screenshots to Supabase Storage
 */

import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from './button';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * @description Props for the ImageUploader component
 */
interface ImageUploaderProps {
  /**
   * @description Callback function called when an image is successfully uploaded
   * @param {string} url - The public URL of the uploaded image
   */
  onUploadComplete: (url: string) => void;
  
  /**
   * @description Callback function called when an image is removed
   * @param {string} url - The URL of the removed image
   */
  onRemove: (url: string) => void;
  
  /**
   * @description Array of existing image URLs to display
   */
  existingImageUrls: string[];
}

/**
 * @description Interface for tracking upload progress of individual files
 */
interface UploadingFile {
  file: File;
  preview: string;
  uploading: boolean;
}

/**
 * @description Reusable image uploader component with drag-and-drop functionality
 * Uploads images immediately to Supabase Storage in user-scoped folders
 * @param {ImageUploaderProps} props - Component props
 * @returns {JSX.Element} ImageUploader component with drag-and-drop and preview functionality
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  onRemove,
  existingImageUrls
}) => {
  const { user } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * @description Validates if the file is an acceptable image type
   * @param {File} file - File to validate
   * @returns {boolean} Whether the file is a valid image
   */
  const isValidImageFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024; // 5MB limit
  };

  /**
   * @description Uploads a file to Supabase Storage
   * @async
   * @param {File} file - File to upload
   * @returns {Promise<string>} Public URL of the uploaded file
   * @throws {Error} If upload fails or user is not authenticated
   * @sideEffects Uploads file to Supabase Storage bucket
   */
  const uploadFileToStorage = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to upload files');
    }

    // Generate unique filename to avoid conflicts
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('project-screenshots')
      .upload(filePath, file);

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('project-screenshots')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  /**
   * @description Deletes a file from Supabase Storage
   * @async
   * @param {string} url - Public URL of the file to delete
   * @sideEffects Removes file from Supabase Storage bucket
   */
  const deleteFileFromStorage = async (url: string): Promise<void> => {
    try {
      // Extract file path from URL
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'project-screenshots');
      if (bucketIndex === -1) return;
      
      const filePath = urlParts.slice(bucketIndex + 1).join('/');
      
      const { error } = await supabase.storage
        .from('project-screenshots')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file from storage:', error);
      }
    } catch (error) {
      console.error('Error parsing URL for deletion:', error);
    }
  };

  /**
   * @description Handles file selection and upload process
   * @async
   * @param {FileList} files - Files selected for upload
   * @sideEffects Updates uploadingFiles state and triggers upload process
   */
  const handleFiles = useCallback(async (files: FileList) => {
    if (!user) {
      toast.error('Authentication Required', {
        description: 'You must be logged in to upload images.'
      });
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      if (!isValidImageFile(file)) {
        toast.error('Invalid File', {
          description: `${file.name} is not a valid image or exceeds 5MB limit.`
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview objects for uploading files
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload each file
    for (const uploadingFile of newUploadingFiles) {
      try {
        const publicUrl = await uploadFileToStorage(uploadingFile.file);
        
        // Remove from uploading list
        setUploadingFiles(prev => prev.filter(f => f.file !== uploadingFile.file));
        
        // Clean up preview URL
        URL.revokeObjectURL(uploadingFile.preview);
        
        // Notify parent component
        onUploadComplete(publicUrl);
        
        toast.success('Image Uploaded', {
          description: 'Screenshot has been uploaded successfully.'
        });
      } catch (error) {
        console.error('Upload error:', error);
        
        // Remove from uploading list
        setUploadingFiles(prev => prev.filter(f => f.file !== uploadingFile.file));
        
        // Clean up preview URL
        URL.revokeObjectURL(uploadingFile.preview);
        
        toast.error('Upload Failed', {
          description: error instanceof Error ? error.message : 'Failed to upload image.'
        });
      }
    }
  }, [user, onUploadComplete]);

  /**
   * @description Handles file input change event
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event from file input
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  /**
   * @description Handles drag over event for drag-and-drop functionality
   * @param {React.DragEvent} e - Drag event
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  /**
   * @description Handles drag leave event for drag-and-drop functionality
   * @param {React.DragEvent} e - Drag event
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  /**
   * @description Handles file drop event for drag-and-drop functionality
   * @param {React.DragEvent} e - Drop event
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  /**
   * @description Handles removal of an existing image
   * @async
   * @param {string} url - URL of the image to remove
   * @sideEffects Calls onRemove callback and deletes file from storage
   */
  const handleRemoveExisting = async (url: string) => {
    onRemove(url);
    await deleteFileFromStorage(url);
    
    toast.success('Image Removed', {
      description: 'Screenshot has been removed successfully.'
    });
  };

  /**
   * @description Handles removal of an uploading file
   * @param {UploadingFile} uploadingFile - File being uploaded to remove
   * @sideEffects Updates uploadingFiles state and cleans up preview URL
   */
  const handleRemoveUploading = (uploadingFile: UploadingFile) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== uploadingFile.file));
    URL.revokeObjectURL(uploadingFile.preview);
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-startsnap-french-rose bg-startsnap-wisp-pink'
            : 'border-gray-800 bg-startsnap-athens-gray hover:bg-gray-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-startsnap-pale-sky mb-4" />
        <p className="text-lg font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] mb-2">
          Drop screenshots here or click to browse
        </p>
        <p className="text-sm text-startsnap-pale-sky font-['Roboto',Helvetica]">
          Supports JPG, PNG, WebP up to 5MB
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Image Previews */}
      {(existingImageUrls.length > 0 || uploadingFiles.length > 0) && (
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
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-startsnap-french-rose hover:bg-red-600 border-2 border-gray-800"
                onClick={() => handleRemoveExisting(url)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Uploading Files */}
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={`uploading-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
                <img
                  src={uploadingFile.preview}
                  alt={`Uploading ${uploadingFile.file.name}`}
                  className="w-full h-full object-cover"
                />
                {uploadingFile.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              {!uploadingFile.uploading && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-startsnap-french-rose hover:bg-red-600 border-2 border-gray-800"
                  onClick={() => handleRemoveUploading(uploadingFile)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};