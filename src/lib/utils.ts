/**
 * src/lib/utils.ts
 * @description Utility functions for the application, primarily for styling with tailwind-merge and clsx
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @description Configuration options for Supabase image transformations
 */
export interface ImageTransformations {
  width: number;
  quality?: number;
  format?: 'webp';
}

/**
 * @description Combines multiple class names using clsx and tailwind-merge
 * @param {...ClassValue[]} inputs - Class names to combine
 * @returns {string} Merged class names with tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @description Transforms a Supabase Storage URL into an optimized image URL using Supabase's Image Transformation API
 * @param {string} originalUrl - The original Supabase public storage URL
 * @param {ImageTransformations} options - Transformation options including width, quality, and format
 * @returns {string} The transformed URL with optimization parameters
 * @example
 * const optimizedUrl = getTransformedImageUrl(
 *   'https://project.supabase.co/storage/v1/object/public/bucket/image.jpg',
 *   { width: 400, quality: 80, format: 'webp' }
 * );
 */
export function getTransformedImageUrl(originalUrl: string, options: ImageTransformations): string {
  try {
    // Check if the URL is valid
    if (!originalUrl || typeof originalUrl !== 'string') {
      console.warn('Invalid URL provided to getTransformedImageUrl:', originalUrl);
      return originalUrl || '';
    }

    // For direct URLs that don't need transformation, return as is
    if (originalUrl.startsWith('http') && !originalUrl.includes('supabase.co/storage')) {
      return originalUrl;
    }

    // Parse the URL
    const url = new URL(originalUrl);
    
    // Check if this is a Supabase storage URL
    if (!url.pathname.includes('/storage/v1/object/public/')) {
      console.warn('URL is not a Supabase storage URL:', originalUrl);
      return originalUrl;
    }
    
    // Extract the bucket name and file path from the URL
    // The format is /storage/v1/object/public/BUCKET_NAME/FILE_PATH
    const pathParts = url.pathname.split('/public/');
    if (pathParts.length !== 2) {
      console.warn('Invalid Supabase storage URL format:', originalUrl);
      return originalUrl;
    }
    
    // Extract bucket name from the path
    const pathSegments = pathParts[0].split('/');
    const bucketName = pathSegments[pathSegments.length - 1];
    const filePath = pathParts[1];
    
    if (!bucketName || !filePath) {
      console.warn('Could not extract bucket name or file path from URL:', originalUrl);
      return originalUrl;
    }
    
    // Construct the transformation URL according to Supabase docs
    // Format: https://<PROJECT_REF>.supabase.co/storage/v1/render/image/public/BUCKET_NAME/FILE_PATH
    const baseUrl = `${url.origin}/storage/v1/render/image/public/${bucketName}/${filePath}`;
    
    // Add query parameters
    const params = new URLSearchParams();
    params.set('width', options.width.toString());
    params.set('quality', (options.quality ?? 75).toString());
    params.set('format', options.format ?? 'webp');
    
    const transformedUrl = `${baseUrl}?${params.toString()}`;
    console.log('Transformed URL:', transformedUrl);
    return transformedUrl;
  } catch (error) {
    console.error('Error transforming image URL:', error);
    // Return the original URL if transformation fails
    return originalUrl;
  }
}

/**
 * @description Formats a date string into a human-readable relative time
 * @param {string} dateString - ISO date string to format
 * @returns {string} Formatted relative time string (e.g., "Today", "2 days ago")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Launched: Today";
  } else if (diffInDays === 1) {
    return "Launched: Yesterday";
  } else if (diffInDays < 7) {
    return `Launched: ${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Launched: ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return `Launched: ${date.toLocaleDateString()}`;
  }
};

/**
 * @description Formats a date string into a detailed human-readable format with time
 * @param {string} dateString - ISO date string to format
 * @returns {string} Formatted detailed date and time string (e.g., "July 22, 2024 - 11:15 AM")
 */
export const formatDetailedDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * @description Validates a URL string
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional field)
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * @description Validates a GitHub URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is a valid GitHub URL
 */
export const isValidGithubUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional field)
  return isValidUrl(url) && url.match(/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?.*$/) !== null;
};

/**
 * @description Validates a Twitter URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is a valid Twitter URL
 */
export const isValidTwitterUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional field)
  return isValidUrl(url) && url.match(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?.*$/) !== null;
};

/**
 * @description Validates a LinkedIn URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is a valid LinkedIn URL
 */
export const isValidLinkedInUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional field)
  return isValidUrl(url) && url.match(/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?.*$/) !== null;
};

/**
 * @description Interface for profile link validation errors
 */
export interface LinkValidationErrors {
  github: string;
  twitter: string;
  linkedin: string;
  website: string;
}

/**
 * @description Interface for profile data with social links
 */
export interface ProfileLinks {
  github: string;
  twitter: string;
  linkedin: string;
  website: string;
}

/**
 * @description Validates all social media and website links in a profile
 * @param {ProfileLinks} profile - Profile object containing link URLs
 * @returns {Object} Object containing validation results and error messages
 */
export const validateSocialLinks = (profile: ProfileLinks): { isValid: boolean; errors: LinkValidationErrors } => {
  const errors: LinkValidationErrors = {
    github: "",
    twitter: "",
    linkedin: "",
    website: ""
  };

  let isValid = true;

  if (profile.github && !isValidGithubUrl(profile.github)) {
    errors.github = "Please enter a valid GitHub URL (e.g., https://github.com/username)";
    isValid = false;
  }

  if (profile.twitter && !isValidTwitterUrl(profile.twitter)) {
    errors.twitter = "Please enter a valid Twitter URL (e.g., https://twitter.com/username)";
    isValid = false;
  }

  if (profile.linkedin && !isValidLinkedInUrl(profile.linkedin)) {
    errors.linkedin = "Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)";
    isValid = false;
  }

  if (profile.website && !isValidUrl(profile.website)) {
    errors.website = "Please enter a valid website URL";
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * @description Generates a URL-friendly slug from a given string.
 * Converts to lowercase, replaces spaces and special characters with hyphens,
 * removes disallowed characters, collapses multiple hyphens, and trims leading/trailing hyphens.
 * @param {string} inputString - The string to convert into a slug.
 * @returns {string} The generated slug.
 *
 * @example
 * generateSlug("My Awesome Project!"); // "my-awesome-project"
 * generateSlug("  Leading/Trailing Spaces  "); // "leading-trailing-spaces"
 * generateSlug("Project with !@#$%^&*()_+|}{[]?/><,."); // "project-with"
 * generateSlug("Multiple --- hyphens -- together"); // "multiple-hyphens-together"
 */
export const generateSlug = (inputString: string): string => {
  if (!inputString) {
    return '';
  }

  const slug = inputString
    .toString() // Ensure it's a string
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace

    // Replace common accented characters with their non-accented counterparts
    .replace(/[àáâãäåæ]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõöø]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[ð]/g, 'd')
    .replace(/[ß]/g, 'ss') // German Eszett

    // Replace spaces and common punctuation with a hyphen
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphens
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text

  return slug;
};