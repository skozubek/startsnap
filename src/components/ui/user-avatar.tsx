/**
 * src/components/ui/user-avatar.tsx
 * @description Centralized user avatar component using boring-avatars for consistency
 */

import React from 'react';
import Avatar from 'boring-avatars';

interface UserAvatarProps {
  /** The name/seed for generating the avatar */
  name: string;
  /** Size of the avatar in pixels */
  size: number;
  /** Additional CSS classes */
  className?: string;
}

// Centralized avatar configuration
const AVATAR_CONFIG = {
  variant: 'beam' as const,
  colors: ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"]
};

/**
 * @description Centralized user avatar component for consistent styling across the app
 * @param {UserAvatarProps} props - Avatar configuration props
 * @returns {JSX.Element} Consistent boring-avatars component
 */
export const UserAvatar = ({ name, size, className = '' }: UserAvatarProps): JSX.Element => {
  // Ensure we always have a valid name for the avatar generation
  const avatarName = name || 'Anonymous';

  return (
    <div className={`rounded-full overflow-hidden ${className}`}>
      <Avatar
        name={avatarName}
        variant={AVATAR_CONFIG.variant}
        size={size}
        colors={AVATAR_CONFIG.colors}
      />
    </div>
  );
};

/**
 * @description Utility function to get a consistent name for avatar generation
 * @param {Object} user - User object from Supabase
 * @param {string} username - Username from profile
 * @returns {string} Consistent name for avatar generation
 */
export const getAvatarName = (user: any, username?: string): string => {
  if (username && username.trim()) {
    return username.trim();
  }
  if (user?.email) {
    return user.email;
  }
  return 'Anonymous';
};