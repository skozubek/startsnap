/**
 * src/types/user.ts
 * @description Type definition for user profile data.
 */

/**
 * @description Represents the structure of a user profile.
 */
export interface UserProfileData {
  user_id: string; // Primary key from profiles table, matches auth.users.id
  username: string;
  // Add other profile fields as needed, e.g., avatar_url, full_name, bio, etc.
}