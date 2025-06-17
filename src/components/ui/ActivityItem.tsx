/**
 * src/components/ui/ActivityItem.tsx
 * @description Component for rendering individual activity feed items
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
 * @description Renders a single activity item with appropriate styling and links
 * @param {ActivityItemProps} props - Component props
 * @returns {JSX.Element} Styled activity item component
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
      default:
        return 'activity_zone';
    }
  };

  /**
   * @description Gets the appropriate color for the activity type
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
      default:
        return 'text-startsnap-pale-sky';
    }
  };

  const icon = getActivityIcon(activity.activity_type);
  const iconColor = getActivityColor(activity.activity_type);

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-startsnap-mischka/20 transition-colors duration-200 rounded-lg">
      {/* Activity Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-800 flex items-center justify-center ${iconColor}`}>
        <span className="material-icons text-sm">{icon}</span>
      </div>

      {/* Activity Content */}
      <div className="flex-1 min-w-0">
        {/* Actor Avatar and Name */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6">
            <UserAvatar
              name={getAvatarName(null, activity.actor_username)}
              size={24}
              className="w-full h-full"
            />
          </div>
          <span className="font-['Roboto',Helvetica] font-semibold text-startsnap-ebony-clay text-sm">
            {activity.actor_username}
          </span>
          <span className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs">
            {formatDetailedDate(activity.created_at)}
          </span>
        </div>

        {/* Activity Description */}
        <p className="font-['Roboto',Helvetica] text-startsnap-river-bed text-sm leading-relaxed mb-2">
          {activity.display_text}
        </p>

        {/* Project Link (if applicable) */}
        {activity.target_startsnap_id && activity.startsnap_slug && (
          <Link
            to={`/projects/${activity.startsnap_slug}`}
            className="inline-flex items-center gap-1 text-xs text-startsnap-persian-blue hover:text-startsnap-french-rose transition-colors"
          >
            <span className="material-icons text-xs">open_in_new</span>
            View Project
          </Link>
        )}
      </div>
    </div>
  );
};