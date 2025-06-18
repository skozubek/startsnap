/**
 * src/components/ui/ActivityFeedSection.tsx
 * @description Component for displaying the activity feed with real-time updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ActivityItem } from './ActivityItem';
import { Button } from './button';
import type { ActivityFeedItem } from '../../types/activity';

/**
 * @description Props for the ActivityFeedSection component
 * @param {boolean} isInPanel - Whether the component is rendered inside the PulsePanel
 * @param {string | null} latestActivityTimestamp - Timestamp of latest activity to trigger refresh
 */
interface ActivityFeedSectionProps {
  isInPanel?: boolean;
  latestActivityTimestamp?: string | null;
}

/**
 * @description Component that displays a feed of recent community activity
 * @param {ActivityFeedSectionProps} props - Component props
 * @returns {JSX.Element} Activity feed with loading states and error handling
 */
export const ActivityFeedSection: React.FC<ActivityFeedSectionProps> = ({ 
  isInPanel = false,
  latestActivityTimestamp 
}) => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = isInPanel ? 10 : 6;

  /**
   * @description Fetches activity feed data from Supabase
   * @async
   * @param {boolean} isLoadMore - Whether this is a load more operation
   * @sideEffects Updates activities, loading, error, and hasMore state
   */
  const fetchActivities = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const startIndex = isLoadMore ? activities.length : 0;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;

      const { data, error: fetchError } = await supabase
        .from('activity_feed_curated')
        .select('*')
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (isLoadMore) {
        setActivities(prev => [...prev, ...(data || [])]);
      } else {
        setActivities(data || []);
      }

      // Check if there are more items
      setHasMore((data || []).length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity feed. Please try again.');
      if (!isLoadMore) {
        setActivities([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activities.length, ITEMS_PER_PAGE]);

  /**
   * @description Effect to refresh activity feed when latestActivityTimestamp changes
   * @sideEffects Triggers fetchActivities when new activity is detected
   */
  useEffect(() => {
    if (latestActivityTimestamp && activities.length > 0) {
      // Check if the latest timestamp is newer than our current latest activity
      const currentLatest = activities[0]?.created_at;
      if (currentLatest && new Date(latestActivityTimestamp) > new Date(currentLatest)) {
        console.log('New activity detected, refreshing feed...');
        fetchActivities(false); // Refresh from the beginning
      }
    }
  }, [latestActivityTimestamp, activities, fetchActivities]);

  useEffect(() => {
    fetchActivities();
  }, []);

  /**
   * @description Handles loading more activities
   */
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchActivities(true);
    }
  };

  /**
   * @description Handles retry when there's an error
   */
  const handleRetry = () => {
    fetchActivities();
  };

  if (loading) {
    return (
      <div className={`${isInPanel ? 'p-6' : 'w-full max-w-screen-2xl px-8 py-16'}`}>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-startsnap-french-rose"></div>
          <p className="mt-4 text-startsnap-pale-sky">Loading community pulse...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isInPanel ? 'p-6' : 'w-full max-w-screen-2xl px-8 py-16'}`}>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={handleRetry}
            className="startsnap-button bg-startsnap-french-rose text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`${isInPanel ? 'p-6' : 'w-full max-w-screen-2xl px-8 py-16'}`}>
        <div className="text-center py-8">
          <span className="material-icons text-6xl text-startsnap-pale-sky mb-4">sentiment_satisfied</span>
          <p className="text-startsnap-pale-sky">No recent activity. Be the first to create something!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isInPanel ? 'h-full flex flex-col' : 'w-full max-w-screen-2xl px-8 py-16'}`}>
      {!isInPanel && (
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] mb-4">
            Community Pulse
          </h2>
          <p className="text-xl text-startsnap-river-bed font-['Roboto',Helvetica]">
            See what the community is building and sharing
          </p>
        </div>
      )}

      <div className={`${isInPanel ? 'flex-1 overflow-y-auto px-6 py-4' : ''} space-y-4`}>
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}

        {hasMore && (
          <div className="text-center pt-6">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="startsnap-button bg-startsnap-persian-blue text-white"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};