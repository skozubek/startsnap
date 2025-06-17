/**
 * src/components/ui/PulsePanel.tsx
 * @description Community Pulse panel component that displays real-time activity feed with pagination
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { ActivityItem } from './ActivityItem';
import { supabase } from '../../lib/supabase';
import type { ActivityFeedItem } from '../../types/activity';
import { toast } from 'sonner';

/**
 * @description Props for the PulsePanel component
 * @param {boolean} isOpen - Whether the panel is open
 * @param {() => void} onClose - Function to close the panel
 */
interface PulsePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACTIVITIES_PER_PAGE = 5;
const MAX_ACTIVITIES_IN_MEMORY = 100; // Prevent memory bloat

/**
 * @description Community Pulse panel component with real-time activity feed and pagination
 * @param {PulsePanelProps} props - Component props
 * @returns {JSX.Element} Animated side panel with activity feed
 */
export const PulsePanel: React.FC<PulsePanelProps> = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Track the oldest activity timestamp for pagination
  const [oldestTimestamp, setOldestTimestamp] = useState<string | null>(null);
  
  // Ref to track if we have an active subscription
  const subscriptionRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  /**
   * @description Fetches initial activities from the activity_feed_curated view
   * @async
   * @sideEffects Updates activities, oldestTimestamp, hasMore, and loading state
   */
  const fetchInitialActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('activity_feed_curated')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(ACTIVITIES_PER_PAGE);

      if (fetchError) throw fetchError;

      const fetchedActivities = data || [];
      setActivities(fetchedActivities);
      
      // Set pagination state
      if (fetchedActivities.length > 0) {
        setOldestTimestamp(fetchedActivities[fetchedActivities.length - 1].created_at);
        setHasMore(fetchedActivities.length === ACTIVITIES_PER_PAGE);
      } else {
        setOldestTimestamp(null);
        setHasMore(false);
      }

    } catch (error: any) {
      console.error('Error fetching initial activities:', error);
      setError('Failed to load activity feed. Please try again.');
      toast.error('Feed Error', {
        description: 'Failed to load the activity feed.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * @description Loads more activities for pagination
   * @async
   * @sideEffects Appends new activities to the existing list and updates pagination state
   */
  const loadMoreActivities = useCallback(async () => {
    if (!hasMore || loadingMore || !oldestTimestamp) return;

    try {
      setLoadingMore(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('activity_feed_curated')
        .select('*')
        .order('created_at', { ascending: false })
        .lt('created_at', oldestTimestamp)
        .limit(ACTIVITIES_PER_PAGE);

      if (fetchError) throw fetchError;

      const newActivities = data || [];
      
      if (newActivities.length > 0) {
        setActivities(prev => {
          const combined = [...prev, ...newActivities];
          // Trim to prevent memory bloat
          return combined.slice(0, MAX_ACTIVITIES_IN_MEMORY);
        });
        setOldestTimestamp(newActivities[newActivities.length - 1].created_at);
        setHasMore(newActivities.length === ACTIVITIES_PER_PAGE);
      } else {
        setHasMore(false);
      }

    } catch (error: any) {
      console.error('Error loading more activities:', error);
      toast.error('Load Error', {
        description: 'Failed to load more activities.'
      });
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, oldestTimestamp]);

  /**
   * @description Refreshes the activity feed by fetching the latest activities
   * @async
   * @sideEffects Replaces current activities with fresh data from the server
   */
  const refreshActivities = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('activity_feed_curated')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(Math.max(activities.length, ACTIVITIES_PER_PAGE));

      if (fetchError) throw fetchError;

      const refreshedActivities = data || [];
      setActivities(refreshedActivities);
      
      if (refreshedActivities.length > 0) {
        setOldestTimestamp(refreshedActivities[refreshedActivities.length - 1].created_at);
        setHasMore(refreshedActivities.length >= ACTIVITIES_PER_PAGE);
      }

      toast.success('Feed Refreshed', {
        description: 'Activity feed updated with latest activities.'
      });

    } catch (error: any) {
      console.error('Error refreshing activities:', error);
      toast.error('Refresh Error', {
        description: 'Failed to refresh the activity feed.'
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [activities.length]);

  /**
   * @description Sets up real-time subscription to the activity_log table for new activities
   * @sideEffects Creates a Supabase real-time subscription and updates activities state
   */
  const setupRealtimeSubscription = useCallback(() => {
    if (isSubscribedRef.current) return;

    try {
      // Subscribe to the activity_log table for real-time updates
      const subscription = supabase
        .channel('activity_feed_realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_log',
            filter: 'visibility=eq.public'
          },
          async (payload) => {
            console.log('New activity received:', payload);
            
            // Fetch the complete activity data with joins from the view
            try {
              const { data: newActivityData, error } = await supabase
                .from('activity_feed_curated')
                .select('*')
                .eq('id', payload.new.id)
                .single();

              if (error) {
                console.error('Error fetching new activity details:', error);
                return;
              }

              if (newActivityData) {
                setActivities(prev => {
                  // Check if activity already exists (prevent duplicates)
                  const exists = prev.some(activity => activity.id === newActivityData.id);
                  if (exists) return prev;

                  // Add new activity to the beginning and trim if necessary
                  const updated = [newActivityData, ...prev];
                  return updated.slice(0, MAX_ACTIVITIES_IN_MEMORY);
                });
              }
            } catch (error) {
              console.error('Error processing real-time activity:', error);
            }
          }
        )
        .subscribe((status) => {
          console.log('Activity feed subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          } else if (status === 'CLOSED') {
            isSubscribedRef.current = false;
          }
        });

      subscriptionRef.current = subscription;
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  }, []);

  /**
   * @description Cleans up the real-time subscription
   * @sideEffects Unsubscribes from Supabase real-time channel
   */
  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
      isSubscribedRef.current = false;
    }
  }, []);

  // Effect to handle panel opening/closing and data fetching
  useEffect(() => {
    if (isOpen) {
      fetchInitialActivities();
      setupRealtimeSubscription();
    } else {
      cleanupSubscription();
    }

    return () => {
      cleanupSubscription();
    };
  }, [isOpen, fetchInitialActivities, setupRealtimeSubscription, cleanupSubscription]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      cleanupSubscription();
    };
  }, [cleanupSubscription]);

  /**
   * @description Handles scroll events to implement infinite scrolling
   * @param {React.UIEvent<HTMLDivElement>} e - Scroll event
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when user scrolls to 80% of the content
    if (scrollPercentage > 0.8 && hasMore && !loadingMore) {
      loadMoreActivities();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 border-l-4 border-startsnap-french-rose"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-800 bg-startsnap-beige">
              <div className="flex items-center gap-3">
                <span className="material-icons text-startsnap-mountain-meadow text-2xl">bolt</span>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
                  Community Pulse
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshActivities}
                  disabled={isRefreshing}
                  className="text-startsnap-oxford-blue hover:text-startsnap-french-rose"
                  aria-label="Refresh feed"
                >
                  <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-startsnap-oxford-blue hover:text-startsnap-french-rose"
                  aria-label="Close panel"
                >
                  <X size={24} />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-80px)]"
              onScroll={handleScroll}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-startsnap-pale-sky">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Loading activity feed...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button
                    onClick={fetchInitialActivities}
                    className="startsnap-button bg-startsnap-french-rose text-white"
                  >
                    Try Again
                  </Button>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-icons text-startsnap-pale-sky text-4xl mb-4 block">sentiment_neutral</span>
                  <p className="text-startsnap-pale-sky">No recent activity to show.</p>
                  <p className="text-sm text-startsnap-pale-sky mt-2">
                    Check back soon for community updates!
                  </p>
                </div>
              ) : (
                <>
                  <AnimatePresence initial={false}>
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ActivityItem activity={activity} />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Load More / Loading Indicator */}
                  {hasMore && (
                    <div className="flex justify-center py-4">
                      {loadingMore ? (
                        <div className="flex items-center gap-2 text-startsnap-pale-sky">
                          <Loader2 size={16} className="animate-spin" />
                          <span className="text-sm">Loading more...</span>
                        </div>
                      ) : (
                        <Button
                          onClick={loadMoreActivities}
                          variant="outline"
                          size="sm"
                          className="text-startsnap-oxford-blue border-startsnap-oxford-blue hover:bg-startsnap-oxford-blue hover:text-white"
                        >
                          Load More
                        </Button>
                      )}
                    </div>
                  )}

                  {!hasMore && activities.length > 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-startsnap-pale-sky">
                        You've reached the end of the activity feed
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};