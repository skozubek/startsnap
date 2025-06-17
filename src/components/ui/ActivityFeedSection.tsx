/**
 * src/components/ui/ActivityFeedSection.tsx
 * @description Component for displaying the live activity feed with real-time updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ActivityItem } from './ActivityItem';
import { Button } from './button';
import type { ActivityFeedItem } from '../../types/activity';

/**
 * @description Props for the ActivityFeedSection component
 * @param {boolean} isInPanel - Whether the component is rendered inside the pulse panel
 */
interface ActivityFeedSectionProps {
  isInPanel?: boolean;
}

/**
 * @description Component that fetches and displays the live activity feed with real-time updates
 * @param {ActivityFeedSectionProps} props - Component props
 * @returns {JSX.Element} Activity feed section with live updates
 */
export const ActivityFeedSection: React.FC<ActivityFeedSectionProps> = ({ isInPanel = false }) => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * @description Fetches the latest activity feed from Supabase
   * @async
   * @sideEffects Updates activities, loading, and error state
   */
  const fetchActivities = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('activity_feed_curated')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(isInPanel ? 50 : 10); // More items in panel, fewer on main page

      if (fetchError) throw fetchError;

      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  }, [isInPanel]);

  /**
   * @description Sets up real-time subscription to activity log changes
   * @sideEffects Creates and manages Supabase subscription
   */
  useEffect(() => {
    // Initial fetch
    fetchActivities();

    // Set up real-time subscription
    const subscription = supabase
      .channel('activity_log_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: 'visibility=eq.public'
        },
        (payload) => {
          console.log('New activity detected:', payload);
          // Refetch activities when new ones are added
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchActivities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-startsnap-french-rose border-t-transparent rounded-full animate-spin"></div>
          <span className="text-startsnap-pale-sky font-['Roboto',Helvetica]">Loading activity feed...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <p className="text-startsnap-french-rose font-['Roboto',Helvetica]">{error}</p>
        <Button
          onClick={fetchActivities}
          className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold text-sm rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <span className="material-icons text-4xl text-startsnap-pale-sky">activity_zone</span>
        <p className="text-startsnap-pale-sky font-['Roboto',Helvetica] text-center">
          No recent activity yet. Be the first to create some buzz!
        </p>
      </div>
    );
  }

  return (
    <div className={`${isInPanel ? 'space-y-2' : 'space-y-4'}`}>
      {!isInPanel && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
            Community Pulse
          </h2>
          <span className="material-icons text-startsnap-mountain-meadow text-2xl">bolt</span>
        </div>
      )}

      <div className={`${isInPanel ? 'space-y-1' : 'space-y-3'}`}>
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {!isInPanel && activities.length >= 10 && (
        <div className="text-center pt-4">
          <p className="text-startsnap-pale-sky font-['Roboto',Helvetica] text-sm">
            Want to see more? Check out the full feed in the Community Pulse panel!
          </p>
        </div>
      )}
    </div>
  );
};