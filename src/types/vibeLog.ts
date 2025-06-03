/**
 * src/types/vibeLog.ts
 * @description Type definitions for the Vibe Log system.
 */

/**
 * @description Interface for a VibeLog entry data from the database.
 */
export interface VibeLog {
  id: string;
  startsnap_id: string;
  log_type: string; // Consider an enum/literal union if log types are fixed
  title: string;
  content: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  user_id?: string; // ID of the user who created the log, usually the project owner
}

/**
 * @description Interface for VibeLog form data used for creating or editing entries.
 */
export interface VibeLogFormData {
  log_type: string;
  title: string;
  content: string;
}