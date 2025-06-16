/**
 * src/types/user.ts
 * @description Type definition for user profile data.
 */

/**
 * @description Represents the complete structure of a user profile from the profiles table.
 * This interface serves as the single source of truth for all user profile data across the application.
 */
export interface UserProfileData {
  user_id: string; // Primary key from profiles table, matches auth.users.id
  username: string;
  bio?: string | null;
  status?: string;
  github_url?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}

/**
 * @description Type alias for profile summary data displayed in the directory.
 * Uses Pick to select only the fields needed for the profiles directory listing.
 */
export type ProfileSummary = Pick<UserProfileData, 'user_id' | 'username' | 'bio' | 'status' | 'github_url' | 'twitter_url' | 'linkedin_url' | 'website_url'>;