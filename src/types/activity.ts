/**
 * src/types/activity.ts
 * @description Type definitions for the activity feed system
 */

/**
 * @description Represents a single activity entry from the activity_feed_curated view
 */
export interface ActivityFeedItem {
  id: string;
  activity_type: string;
  display_text: string;
  created_at: string; // ISO date string
  metadata: Record<string, any>;
  visibility: string;
  
  // Actor information
  actor_user_id: string;
  actor_username: string;
  
  // Target startsnap information
  target_startsnap_id?: string;
  startsnap_name?: string;
  startsnap_slug?: string;
  startsnap_category?: string;
  startsnap_type?: string;
  
  // Target vibe log information
  target_vibe_log_id?: string;
  vibe_log_title?: string;
  vibe_log_type?: string;
  
  // Target vibe request information
  target_vibe_request_id?: string;
  vibe_request_title?: string;
  vibe_request_type?: string;
  
  // Target user information (for user events)
  target_user_id?: string;
  target_username?: string;
  target_user_status?: string;
}