/**
 * src/components/ui/ActivityFeedSection.tsx
 * @description Component for displaying the activity feed with real-time updates
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use ref to prevent circular dependencies
  const activitiesRef = useRef<ActivityFeedItem[]>([]);
  activitiesRef.current = activities;

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

      const startIndex = isLoadMore ? activitiesRef.current.length : 0;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;

      const { data, error: fetchError } = await supabase
        .from('activity_feed_curated')
        .select('*')
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (isLoadMore) {
        setActivities(prev => {
          const newData = data || [];
          // Filter out any activities that already exist to prevent duplicates
          const existingIds = new Set(prev.map(activity => activity.id));
          const uniqueNewData = newData.filter(activity => !existingIds.has(activity.id));
          return [...prev, ...uniqueNewData];
        });
      } else {
        setActivities(data || []);
      }

      // Check if there are more items - only false if we got less than requested
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
  }, [ITEMS_PER_PAGE]);

  /**
   * @description Handles scroll events to trigger auto-loading at 80% scroll position
   * @param {Event} event - Scroll event
   */
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !hasMore || loadingMore) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Trigger load more when user scrolls to 80% of the content
    if (scrollPercentage >= 0.8) {
      fetchActivities(true);
    }
  }, [hasMore, loadingMore, fetchActivities]);

  /**
   * @description Effect to set up scroll listener for auto-pagination and handle initial load
   */
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !isInPanel) {
      return;
    }

    // Check if we need to auto-load more content because container isn't scrollable
    const checkInitialLoad = () => {
      const { scrollHeight, clientHeight } = scrollContainer;
      // If content doesn't fill the container and we have more items, auto-load
      if (scrollHeight <= clientHeight && hasMore && !loadingMore && activities.length > 0) {
        fetchActivities(true);
      }
    };

    // Set up scroll listener
    scrollContainer.addEventListener('scroll', handleScroll);

    // Check if we need initial auto-load (small delay to ensure layout is complete)
    const timeoutId = setTimeout(checkInitialLoad, 100);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll, isInPanel, activities.length, hasMore, loadingMore, fetchActivities]);

  /**
   * @description Effect to refresh activity feed when latestActivityTimestamp changes
   * @sideEffects Triggers fetchActivities when new activity is detected
   */
  useEffect(() => {
    if (latestActivityTimestamp && activitiesRef.current.length > 0) {
      // Check if the latest timestamp is newer than our current latest activity
      const currentLatest = activitiesRef.current[0]?.created_at;
      if (currentLatest && new Date(latestActivityTimestamp) > new Date(currentLatest)) {
        // Clear loading states before refresh to prevent race conditions
        setLoadingMore(false);
        fetchActivities(false); // Refresh from the beginning
      }
    }
  }, [latestActivityTimestamp, fetchActivities]);

  useEffect(() => {
    fetchActivities();
  }, []);

  /**
   * @description Handles loading more activities manually
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
            variant="primary"
            size="lg"
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
          <h2 className="text-4xl font-heading text-startsnap-ebony-clay mb-4">
            Community Pulse
          </h2>
                      <p className="text-xl text-startsnap-river-bed font-body">
            See what the community is building and sharing
          </p>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className={`${isInPanel ? 'flex-1 overflow-y-auto px-4 py-4' : ''} space-y-3`}
      >
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}

        {/* Loading indicator for auto-scroll */}
        {loadingMore && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-startsnap-french-rose"></div>
            <p className="mt-2 text-sm text-startsnap-pale-sky">Loading more activities...</p>
          </div>
        )}

        {/* Manual Load More button - only show when not auto-loading */}
        {hasMore && !loadingMore && (
          <div className="text-center pt-6">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
              className="text-sm text-startsnap-river-bed hover:text-startsnap-ebony-clay bg-transparent hover:bg-startsnap-mischka/20 border border-startsnap-mischka px-4 py-2 rounded-md transition-colors"
            >
              Load More Activities
            </Button>
          </div>
        )}

        {/* End of feed indicator */}
        {!hasMore && activities.length > 0 && (
          <div className="text-center py-6 border-t border-startsnap-mischka/30 mt-4">
            <div className="flex items-center justify-center gap-2 text-startsnap-pale-sky">
              <span className="material-icons text-sm">check_circle</span>
              <p className="text-sm">You've reached the end of the activity feed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};