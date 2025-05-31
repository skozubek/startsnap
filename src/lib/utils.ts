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