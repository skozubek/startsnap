/**
 * src/types/feedback.ts
 * @description Type definitions for the feedback system.
 */
import type { UserProfileData } from "./user";

/**
 * @description Interface for feedback reply data.
 * Contains the content of a reply and metadata about its author and creation time.
 */
export interface FeedbackReply {
  id: string;
  parent_feedback_id: string;
  user_id: string;
  content: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  profile?: Pick<UserProfileData, 'username'>; // User who made the reply
}

/**
 * @description Interface for a feedback entry.
 * Contains the main feedback content, associated replies, and author information.
 */
export interface FeedbackEntry {
  id: string;
  user_id: string;
  content: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  profile?: Pick<UserProfileData, 'username'>; // User who gave the feedback
  replies?: FeedbackReply[];
}