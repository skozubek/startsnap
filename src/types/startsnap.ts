/**
 * src/types/startsnap.ts
 * @description Type definition for a StartSnap project.
 */

/**
 * @description Represents the structure of a StartSnap project.
 */
export interface StartSnapProject {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string;
  category: string; // Consider using an enum or literal union if categories are fixed and known
  type: "live" | "idea";
  is_hackathon_entry: boolean;
  tags?: string[];
  tools_used?: string[];
  created_at: string; // ISO date string
  updated_at?: string; // ISO date string, often present from Supabase
  support_count?: number;
  live_demo_url?: string;
  demo_video_url?: string;
  feedback_tags?: string[]; // Tags specifically for feedback areas
  screenshot_urls?: string[]; // Array of screenshot URLs
  // Add any other fields directly from the 'startsnaps' table as needed
}