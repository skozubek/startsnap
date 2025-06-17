/**
 * src/components/ui/ActivityFeedSection.tsx
 * @description Main activity feed section component that fetches and displays community activities
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ActivityItem } from './ActivityItem';
import { Card, CardContent } from './card';
import type { ActivityFeedItem } from '../../types/activity';

/**
 * @description Skeleton loader component that mimics the ActivityItem structure
 * @returns {JSX.Element} Skeleton card with loading animation
 */
const ActivityItemSkeleton: React.FC = () => (
  <Card className="bg-startsnap-white rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        {/* Skeleton Icon */}
        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-800 flex-shrink-0 animate-pulse"></div>
        
        {/* Skeleton Text */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
        
        {/* Skeleton Timestamp */}
        <div className="w-12 h-3 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
      </div>
    </CardContent>
  </Card>
);

/**
 * @description Empty state component displayed when no activities are available
 * @returns {JSX.Element} Encouraging message for users to start engaging
 */
const EmptyState: React.FC = () => (
  <Card className="bg-startsnap-candlelight rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
    <CardContent className="p-8 text-center">
      <div className="text-4xl mb-4">🌟</div>
      <h3 className="text-xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] mb-2">
        Be the First to Make Waves!
      </h3>
      <p className="text-startsnap-river-bed font-['Roboto',Helvetica] leading-relaxed">
        The community pulse is just getting started. Create a project, support someone's work, 
        or share feedback to get the energy flowing!
      </p>
    </CardContent>
  </Card>
);

/**
 * @description Main activity feed section that fetches and displays community activities
 * @returns {JSX.Element} Complete activity feed with title, loading states, and activity items
 * @async
 * @sideEffects Fetches activity data from Supabase on component mount
 */
export const ActivityFeedSection: React.FC = () => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * @description Fetches the latest community activities from the curated feed
     * @async
     * @sideEffects Updates activities, loading, and error state
     */
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('activity_feed_curated')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15);

        if (fetchError) throw fetchError;

        setActivities(data || []);
      } catch (err) {
        console.error('Error fetching activity feed:', err);
        setError('Failed to load community activities');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="w-full max-w-screen-2xl px-8 py-16">
      {/* Section Title */}
      <h2 className="text-5xl font-bold text-startsnap-ebony-clay text-center mb-12 font-['Space_Grotesk',Helvetica]">
        🔥 Community Pulse
      </h2>

      {/* Activity Feed Content */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          // Loading State - Show skeleton items
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <ActivityItemSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : error ? (
          // Error State
          <Card className="bg-startsnap-french-rose rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk',Helvetica] mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-white font-['Roboto',Helvetica]">
                {error}. Please try refreshing the page.
              </p>
            </CardContent>
          </Card>
        ) : activities.length === 0 ? (
          // Empty State
          <EmptyState />
        ) : (
          // Activity Items
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};