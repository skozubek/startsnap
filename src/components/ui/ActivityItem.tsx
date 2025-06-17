/**
 * src/components/ui/ActivityItem.tsx
 * @description Individual activity item component for the Community Pulse feed
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './card';
import type { ActivityFeedItem } from '../../types/activity';

/**
 * @description Props for the ActivityItem component
 * @param {ActivityFeedItem} activity - Single activity entry from activity_feed_curated view
 */
interface ActivityItemProps {
  activity: ActivityFeedItem;
}

/**
 * @description Formats a timestamp into a relative time string (e.g., "5m ago")
 * @param {string} timestamp - ISO date string
 * @returns {string} Formatted relative time
 */
const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return activityTime.toLocaleDateString();
};

/**
 * @description Gets the appropriate icon and styling for an activity type
 * @param {string} activityType - The type of activity
 * @returns {Object} Icon, background color, and text color for the activity
 */
const getActivityStyle = (activityType: string) => {
  switch (activityType) {
    case 'project_created':
    case 'project_type_evolved':
      return {
        icon: '🚀',
        bgColor: 'bg-startsnap-mountain-meadow',
        textColor: 'text-white'
      };
    case 'project_supported':
    case 'support_milestone_reached':
      return {
        icon: '❤️',
        bgColor: 'bg-startsnap-french-rose',
        textColor: 'text-white'
      };
    case 'vibe_log_added':
    case 'feedback_added':
    case 'feedback_reply_added':
      return {
        icon: '📝',
        bgColor: 'bg-startsnap-persian-blue',
        textColor: 'text-white'
      };
    case 'user_joined':
    case 'user_status_changed':
      return {
        icon: '🎉',
        bgColor: 'bg-startsnap-corn',
        textColor: 'text-startsnap-ebony-clay'
      };
    case 'project_updated':
    case 'profile_updated':
      return {
        icon: '✨',
        bgColor: 'bg-startsnap-heliotrope',
        textColor: 'text-white'
      };
    default:
      return {
        icon: '📌',
        bgColor: 'bg-startsnap-mischka',
        textColor: 'text-startsnap-ebony-clay'
      };
  }
};

/**
 * @description Determines the primary navigation target for an activity
 * @param {ActivityFeedItem} activity - The activity item
 * @returns {string} URL path to navigate to
 */
const getActivityLink = (activity: ActivityFeedItem): string => {
  // Priority: project > user profile
  if (activity.startsnap_slug) {
    return `/projects/${activity.startsnap_slug}`;
  }
  if (activity.target_username) {
    return `/profiles/${activity.target_username}`;
  }
  if (activity.actor_username) {
    return `/profiles/${activity.actor_username}`;
  }
  return '/'; // Fallback to home
};

/**
 * @description Renders enhanced activity text with clickable links for usernames and projects
 * @param {ActivityFeedItem} activity - The activity item
 * @returns {JSX.Element} Formatted text with embedded links
 */
const renderActivityText = (activity: ActivityFeedItem): JSX.Element => {
  let text = activity.display_text;
  const elements: JSX.Element[] = [];
  let lastIndex = 0;

  // Helper function to add a text segment
  const addTextSegment = (content: string, startIndex: number, endIndex: number) => {
    if (startIndex < endIndex) {
      elements.push(
        <span key={`text-${elements.length}`}>
          {content.substring(startIndex, endIndex)}
        </span>
      );
    }
  };

  // Helper function to add a link
  const addLink = (linkText: string, href: string, startIndex: number, endIndex: number) => {
    elements.push(
      <Link
        key={`link-${elements.length}`}
        to={href}
        className="font-semibold text-startsnap-persian-blue hover:text-startsnap-french-rose transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {linkText}
      </Link>
    );
  };

  // Find and replace usernames and project names with links
  const patterns = [
    // Actor username
    {
      text: activity.actor_username,
      href: `/profiles/${activity.actor_username}`,
      priority: 1
    },
    // Target username (if different from actor)
    ...(activity.target_username && activity.target_username !== activity.actor_username ? [{
      text: activity.target_username,
      href: `/profiles/${activity.target_username}`,
      priority: 2
    }] : []),
    // Project name
    ...(activity.startsnap_name && activity.startsnap_slug ? [{
      text: activity.startsnap_name,
      href: `/projects/${activity.startsnap_slug}`,
      priority: 3
    }] : [])
  ];

  // Sort patterns by their position in the text and priority
  const matches = patterns
    .map(pattern => ({
      ...pattern,
      index: text.indexOf(pattern.text)
    }))
    .filter(match => match.index !== -1)
    .sort((a, b) => a.index - b.index || a.priority - b.priority);

  // Build the elements array with text and links
  matches.forEach(match => {
    // Add text before the match
    addTextSegment(text, lastIndex, match.index);
    
    // Add the link
    addLink(match.text, match.href, match.index, match.index + match.text.length);
    
    lastIndex = match.index + match.text.length;
  });

  // Add remaining text
  addTextSegment(text, lastIndex, text.length);

  return <>{elements}</>;
};

/**
 * @description Individual activity item component that displays a single activity in the feed
 * @param {ActivityItemProps} props - Component props
 * @returns {JSX.Element} Clickable activity card with icon, text, and timestamp
 */
export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const style = getActivityStyle(activity.activity_type);
  const activityLink = getActivityLink(activity);
  const relativeTime = formatRelativeTime(activity.created_at);

  return (
    <Link to={activityLink} className="block group">
      <Card className="bg-startsnap-white rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] hover:shadow-[5px_5px_0px_#1f2937] hover:-translate-y-1 transition-all duration-200 group-hover:border-startsnap-french-rose">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Activity Icon */}
            <div className={`w-10 h-10 rounded-full ${style.bgColor} ${style.textColor} flex items-center justify-center text-lg font-bold border-2 border-gray-800 flex-shrink-0`}>
              {style.icon}
            </div>

            {/* Activity Text */}
            <div className="flex-1 min-w-0">
              <p className="font-['Roboto',Helvetica] text-startsnap-river-bed text-sm leading-relaxed">
                {renderActivityText(activity)}
              </p>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-startsnap-pale-sky font-['Inter',Helvetica] flex-shrink-0">
              {relativeTime}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};