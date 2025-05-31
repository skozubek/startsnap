/**
 * src/lib/form-schemas.ts
 * @description Zod schemas for form validation across the application
 */

import * as z from 'zod';
import { isValidUrl, isValidGithubUrl, isValidTwitterUrl, isValidLinkedInUrl } from './utils';

/**
 * @description Schema for authentication forms
 */
export const authFormSchema = z.object({
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .refine((email) => {
      // More strict email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    }, { message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

/**
 * @description Schema for profile form
 */
export const profileFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username must be less than 30 characters" }),
  bio: z.string().max(500, { message: "Bio must be less than 500 characters" }).optional(),
  status: z.string(),
  github: z.string().refine(val => !val || isValidGithubUrl(val), {
    message: "Please enter a valid GitHub URL (e.g., https://github.com/username)"
  }).optional(),
  twitter: z.string().refine(val => !val || isValidTwitterUrl(val), {
    message: "Please enter a valid Twitter URL (e.g., https://twitter.com/username)"
  }).optional(),
  linkedin: z.string().refine(val => !val || isValidLinkedInUrl(val), {
    message: "Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)"
  }).optional(),
  website: z.string().refine(val => !val || isValidUrl(val), {
    message: "Please enter a valid website URL"
  }).optional()
});

/**
 * @description Schema for project creation/editing form
 */
export const projectFormSchema = z.object({
  projectType: z.string(),
  projectName: z.string().min(3, { message: "Project name must be at least 3 characters" })
    .max(100, { message: "Project name must be less than 100 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" })
    .max(1000, { message: "Description must be less than 1000 characters" }),
  category: z.string({ required_error: "Please select a category" }),
  liveUrl: z.string().refine(val => !val || isValidUrl(val), {
    message: "Please enter a valid URL"
  }).optional(),
  videoUrl: z.string().refine(val => !val || isValidUrl(val), {
    message: "Please enter a valid URL"
  }).optional(),
  tags: z.array(z.string()),
  isHackathon: z.boolean().default(false),
  toolsUsed: z.array(z.string()),
  feedbackAreas: z.array(z.string()),
  // Form input fields for array management
  tagsInput: z.string().optional(),
  toolsInput: z.string().optional(),
  feedbackInput: z.string().optional(),
  // Vibe log fields (optional for edit mode)
  vibeLogType: z.string().optional(),
  vibeLogTitle: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100).optional(),
  vibeLogContent: z.string().min(10, { message: "Content must be at least 10 characters" }).max(1000).optional(),
});

/**
 * @description Schema for feedback form
 */
export const feedbackFormSchema = z.object({
  content: z.string().min(10, { message: "Feedback must be at least 10 characters" })
    .max(1000, { message: "Feedback must be less than 1000 characters" })
});

/**
 * @description Schema for vibe log form
 */
export const vibeLogFormSchema = z.object({
  logType: z.string({ required_error: "Please select a log type" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must be less than 100 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" })
    .max(1000, { message: "Content must be less than 1000 characters" })
});