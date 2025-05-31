/**
 * src/lib/utils.ts
 * @description Utility functions for the application, primarily for styling with tailwind-merge and clsx
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @description Combines multiple class names using clsx and tailwind-merge
 * @param {...ClassValue[]} inputs - Class names to combine
 * @returns {string} Merged class names with tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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