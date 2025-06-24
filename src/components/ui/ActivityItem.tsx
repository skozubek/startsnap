/**
 * src/components/ui/ActivityItem.tsx
 * @description Component for rendering individual activity feed items with refined, elegant design
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { UserAvatar, getAvatarName } from './user-avatar';
import { formatDetailedDate } from '../../lib/utils';
import type { ActivityFeedItem } from '../../types/activity';

/**
 * @description Props for the ActivityItem component
 * @param {ActivityFeedItem} activity - The activity data to display
 */
interface ActivityItemProps {
  activity: ActivityFeedItem;
}

/**
 * @description Renders activity text with clickable project names inline
 * @param {string} text - The display text to enhance
 * @param {string | null} projectName - The project name to make clickable
 * @param {string | null} projectSlug - The project slug for linking
 * @returns {JSX.Element | string} Text with inline clickable project name
 */
const renderActivityText = (
  text: string,
  projectName: string | null,
  projectSlug: string | null
): JSX.Element | string => {
  if (!projectName || !projectSlug) {
    return text;
  }

  // Find the project name in the text and make it clickable
  const projectIndex = text.indexOf(projectName);
  if (projectIndex === -1) {
    return text;
  }

  const beforeProject = text.substring(0, projectIndex);
  const afterProject = text.substring(projectIndex + projectName.length);

  return (
    <>
      {beforeProject}
      <Link
        to={`/projects/${projectSlug}`}
        className="font-semibold text-startsnap-persian-blue hover:text-startsnap-french-rose transition-colors duration-200"
      >
        {projectName}
      </Link>
      {afterProject}
    </>
  );
};

/**
 * @description Renders a single activity item with refined, elegant styling
 * @param {ActivityItemProps} props - Component props
 * @returns {JSX.Element} Beautifully refined activity item component
 */
export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  /**
   * @description Gets the appropriate icon for the activity type
   * @param {string} activityType - The type of activity
   * @returns {string} Material icon name
   */
  const getActivityIcon = (activityType: string): string => {
    switch (activityType) {
      case 'project_created':
        return 'rocket_launch';
      case 'project_updated':
        return 'edit';
      case 'project_type_evolved':
        return 'trending_up';
      case 'vibe_log_added':
        return 'insights';
      case 'user_joined':
        return 'person_add';
      case 'user_status_changed':
        return 'mood';
      case 'project_supported':
        return 'favorite';
      case 'feedback_added':
        return 'forum';
      case 'support_milestone_reached':
        return 'celebration';
      case 'feedback_reply_added':
        return 'reply';
            case 'tip_sent':
        return 'monetization_on';
      default:
        return 'activity_zone';
    }
  };

  /**
   * @description Gets the appropriate background gradient for the activity type
   * @param {string} activityType - The type of activity
   * @returns {string} Tailwind gradient class
   */
  const getActivityGradient = (activityType: string): string => {
    switch (activityType) {
      case 'project_created':
      case 'project_type_evolved':
        return 'from-startsnap-french-rose/8 to-transparent';
      case 'vibe_log_added':
        return 'from-startsnap-corn/8 to-transparent';
      case 'user_joined':
        return 'from-startsnap-mountain-meadow/8 to-transparent';
      case 'project_supported':
      case 'support_milestone_reached':
        return 'from-startsnap-french-rose/8 to-startsnap-persian-blue/4';
      case 'feedback_added':
      case 'feedback_reply_added':
        return 'from-startsnap-persian-blue/8 to-transparent';
      case 'project_updated':
        return 'from-startsnap-corn/6 to-startsnap-mountain-meadow/4';
      default:
        return 'from-startsnap-mischka/6 to-transparent';
    }
  };

  /**
   * @description Gets the appropriate icon color for the activity type
   * @param {string} activityType - The type of activity
   * @returns {string} Tailwind color class
   */
  const getActivityColor = (activityType: string): string => {
    switch (activityType) {
      case 'project_created':
      case 'project_type_evolved':
        return 'text-startsnap-french-rose';
      case 'vibe_log_added':
        return 'text-startsnap-corn';
      case 'user_joined':
        return 'text-startsnap-mountain-meadow';
      case 'project_supported':
      case 'support_milestone_reached':
        return 'text-startsnap-french-rose';
      case 'feedback_added':
      case 'feedback_reply_added':
        return 'text-startsnap-persian-blue';
      case 'tip_sent':
        return 'text-startsnap-corn';
      default:
        return 'text-startsnap-pale-sky';
    }
  };

  const icon = getActivityIcon(activity.activity_type);
  const iconColor = getActivityColor(activity.activity_type);
  const gradientBg = getActivityGradient(activity.activity_type);

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${gradientBg} hover:bg-gradient-to-r hover:from-white/20 hover:to-transparent hover:border-gray-300/60 hover:shadow-sm transition-all duration-300 group border border-gray-200/50 hover:translate-y-[-1px]`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Refined Activity Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center ${iconColor} group-hover:bg-white/90 transition-colors duration-200`}>
            <span className="material-icons text-base">{icon}</span>
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            {/* User Info with Clean Styling */}
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                to={`/profiles/${activity.actor_username}`}
                className="flex items-center gap-2 hover:opacity-75 transition-opacity duration-200 group/user"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/30 hover:ring-white/50 transition-all duration-200">
                  <UserAvatar
                    name={getAvatarName(null, activity.actor_username)}
                    size={24}
                    className="w-full h-full"
                  />
                </div>
                <span className="font-['Space_Grotesk',Helvetica] font-semibold text-startsnap-ebony-clay text-sm hover:text-startsnap-french-rose transition-colors duration-200">
                  {activity.actor_username}
                </span>
              </Link>
              <span className="text-xs text-startsnap-pale-sky font-['Inter',Helvetica] opacity-60">
                •
              </span>
              <span className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs opacity-75">
                {formatDetailedDate(activity.created_at)}
              </span>
            </div>

            {/* Activity Description with Inline Project Links */}
            <div className="font-['Roboto',Helvetica] text-startsnap-river-bed text-sm leading-relaxed">
              {renderActivityText(
                activity.display_text,
                activity.startsnap_name || null,
                activity.startsnap_slug || null
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>
    </div>
  );
};