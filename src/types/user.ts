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
  algorand_wallet_address?: string | null; // Algorand wallet address for tipping
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}

/**
 * @description Type alias for profile summary data displayed in the directory.
 * Uses Pick to select only the fields needed for the profiles directory listing.
 */
export type ProfileSummary = Pick<UserProfileData, 'user_id' | 'username' | 'bio' | 'status' | 'github_url' | 'twitter_url' | 'linkedin_url' | 'website_url'>;

/**
 * @description Available fields to sort profiles by.
 */
export type ProfileSortableField = 'username' | 'created_at';

/**
 * @description Sort direction for profiles.
 */
export type ProfileSortDirection = 'asc' | 'desc';

/**
 * @description Options for sorting profiles.
 */
export interface ProfileSortOption {
  field: ProfileSortableField;
  direction: ProfileSortDirection;
}

/**
 * @description Options for filtering profiles.
 */
export interface ProfileFilterOptions {
  status?: string; // User status filter
}

/**
 * @description Combines all profile discovery parameters.
 */
export interface ProfileDiscoveryState {
  searchTerm: string;
  filters: ProfileFilterOptions;
  sort: ProfileSortOption;
}

/**
 * @description Extends ProfileDiscoveryState with pagination parameters for paginated profile discovery.
 */
export interface PaginatedProfileDiscoveryState extends ProfileDiscoveryState {
  page: number;
  pageSize: number;
}