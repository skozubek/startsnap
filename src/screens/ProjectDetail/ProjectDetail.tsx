/**
 * src/screens/ProjectDetail/ProjectDetail.tsx
 * @description Component for displaying detailed information about a StartSnap project
 */

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { ProjectInfoSection } from "./components/ProjectInfoSection";
import { VibeLogSection } from "./components/VibeLogSection";
import { FeedbackSection } from "./components/FeedbackSection";
import type { User } from '@supabase/supabase-js';

// Define types that were previously inline or implicitly defined
// These might be moved to a dedicated types.ts file if they grow further or are used elsewhere

/**
 * @description Interface for feedback reply data
 */
interface FeedbackReply {
  id: string;
  parent_feedback_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: {
    username: string;
  };
}

/**
 * @description Interface for feedback entry data
 */
interface FeedbackEntry {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: {
    username: string;
  };
  replies?: FeedbackReply[];
}

/**
 * @description Interface for VibeLog entry data from DB
 */
interface VibeLog {
  id: string;
  startsnap_id: string;
  log_type: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

/**
 * @description Interface for Startsnap project data (subset)
 */
interface StartsnapData { // More specific type than 'any'
  id: string;
  name: string;
  category: string;
  type: 'live' | 'idea';
  is_hackathon_entry: boolean;
  live_demo_url?: string;
  demo_video_url?: string;
  description: string;
  tags?: string[];
  tools_used?: string[];
  created_at: string;
  user_id: string;
  // Include other fields as necessary
}

/**
 * @description Interface for Creator profile data (subset)
 */
interface CreatorData { // More specific type than 'any'
  user_id: string;
  username: string;
  // Include other fields as necessary
}

/**
 * @description Interface for current user profile data (subset)
 */
interface UserProfile {
  username?: string;
}

/**
 * @description Page component that displays detailed project information
 * @returns {JSX.Element} Project detail page with project info, vibe log, and feedback
 */
export const ProjectDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [startsnap, setStartsnap] = useState<StartsnapData | null>(null);
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [vibeLogEntries, setVibeLogEntries] = useState<VibeLog[]>([]);
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const { user: currentUser } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isSupportedByCurrentUser, setIsSupportedByCurrentUser] = useState(false);
  const [currentSupportCount, setCurrentSupportCount] = useState(0);
  const [isSupportActionLoading, setIsSupportActionLoading] = useState(false);

  const VIBE_LOG_PAGE_SIZE = 3; // Number of vibe logs to show per page
  const [visibleVibeLogCount, setVisibleVibeLogCount] = useState(VIBE_LOG_PAGE_SIZE);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  useEffect(() => {
    if (currentUser) {
      const fetchCurrentUserProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', currentUser.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching current user profile for feedback section:', error);
            setCurrentUserProfile(null);
            return;
          }
          setCurrentUserProfile(data);
        } catch (error) {
          console.error('Error fetching current user profile:', error);
          setCurrentUserProfile(null);
        }
      };
      fetchCurrentUserProfile();
    } else {
      setCurrentUserProfile(null);
    }
  }, [currentUser]);

  /**
   * @description Fetches all project data including Startsnap details, creator, Vibe Logs, and Feedbacks.
   * @async
   */
  const fetchProjectData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data: projectData, error: projectError } = await supabase
        .from('startsnaps')
        .select('*, support_count')
        .eq('id', id)
        .maybeSingle();
      if (projectError) throw projectError;
      if (!projectData) {
        throw new Error('Project not found');
      }
      setStartsnap(projectData as StartsnapData);

      // Initialize support count
      setCurrentSupportCount(projectData.support_count || 0);

      // Check if current user has supported this project
      if (currentUser) {
        const { data: supportData } = await supabase
          .from('project_supporters')
          .select('*')
          .eq('startsnap_id', projectData.id)
          .eq('user_id', currentUser.id)
          .maybeSingle();
        
        setIsSupportedByCurrentUser(!!supportData);
      }

      if (projectData) {
        const { data: creatorData, error: creatorError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', projectData.user_id);
        if (creatorError && creatorError.code !== 'PGRST116') {
          console.error('Error fetching creator:', creatorError);
        } else {
          setCreator(creatorData?.[0] as CreatorData || null);
        }

        const { data: vibeLogsData, error: vibeLogsError } = await supabase
          .from('vibelogs')
          .select('*')
          .eq('startsnap_id', id)
          .order('created_at', { ascending: false });
        if (vibeLogsError) throw vibeLogsError;
        setVibeLogEntries((vibeLogsData as VibeLog[]) || []);
        setVisibleVibeLogCount(VIBE_LOG_PAGE_SIZE); // Reset visible count on new data fetch
      }

      await fetchFeedbacks(); // Fetch feedbacks separately or as part of this
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Fetches feedback entries and their associated user profiles and replies.
   * @async
   */
  const fetchFeedbacks = async () => {
    if (!id) return;
    try {
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('startsnap_id', id)
        .order('created_at', { ascending: true });

      if (feedbackError) throw feedbackError;

      if (feedbackData && feedbackData.length > 0) {
        const feedbacksWithProfilesAndReplies = await Promise.all(
          feedbackData.map(async (feedback) => {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('username')
              .eq('user_id', feedback.user_id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error fetching profile for feedback:', profileError);
            }

            const { data: repliesData, error: repliesError } = await supabase
              .from('feedback_replies')
              .select('*') // Select all reply fields
              .eq('parent_feedback_id', feedback.id)
              .order('created_at', { ascending: false });

            if (repliesError) {
              console.error('Error fetching replies:', repliesError);
              return {
                ...feedback,
                profile: profileData || { username: 'Anonymous' },
                replies: []
              } as FeedbackEntry;
            }

            const repliesWithProfiles = repliesData ? await Promise.all(
              repliesData.map(async (reply) => {
                const { data: replyProfileData, error: replyProfileErr } = await supabase
                  .from('profiles')
                  .select('username')
                  .eq('user_id', reply.user_id)
                  .single();
                if (replyProfileErr && replyProfileErr.code !== 'PGRST116') {
                    console.error('Error fetching profile for reply:', replyProfileErr);
                }
                return {
                  ...reply,
                  profile: replyProfileData || { username: 'Anonymous' }
                } as FeedbackReply;
              })
            ) : [];

            return {
              ...feedback,
              profile: profileData || { username: 'Anonymous' },
              replies: repliesWithProfiles || []
            } as FeedbackEntry;
          })
        );
        setFeedbackEntries(feedbacksWithProfilesAndReplies);
      } else {
        setFeedbackEntries([]);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedbackEntries([]);
    }
  };

  /**
   * @description Handles toggling project support status
   * @async
   * @sideEffects Updates project_supporters table and support_count via RPC
   */
  const handleSupportToggle = async () => {
    if (!currentUser || !startsnap) return;
    
    setIsSupportActionLoading(true);
    try {
      if (!isSupportedByCurrentUser) {
        // Add support
        const { error: supportError } = await supabase
          .from('project_supporters')
          .insert({ startsnap_id: startsnap.id, user_id: currentUser.id });
        
        if (supportError) throw supportError;

        const { data: newCount, error: rpcError } = await supabase
          .rpc('increment_support_count', { p_startsnap_id: startsnap.id });
        
        if (rpcError) throw rpcError;

        setIsSupportedByCurrentUser(true);
        setCurrentSupportCount(newCount || currentSupportCount + 1);
      } else {
        // Remove support
        const { error: supportError } = await supabase
          .from('project_supporters')
          .delete()
          .eq('startsnap_id', startsnap.id)
          .eq('user_id', currentUser.id);
        
        if (supportError) throw supportError;

        const { data: newCount, error: rpcError } = await supabase
          .rpc('decrement_support_count', { p_startsnap_id: startsnap.id });
        
        if (rpcError) throw rpcError;

        setIsSupportedByCurrentUser(false);
        setCurrentSupportCount(newCount || Math.max(0, currentSupportCount - 1));
      }
    } catch (error) {
      console.error('Error toggling project support:', error);
      alert('Failed to update project support. Please try again.');
    } finally {
      setIsSupportActionLoading(false);
    }
  };

  const handleLoadMoreVibeLogs = () => {
    setVisibleVibeLogCount(prevCount => Math.min(prevCount + VIBE_LOG_PAGE_SIZE, vibeLogEntries.length));
  };

  const handleShowLessVibeLogs = () => {
    setVisibleVibeLogCount(VIBE_LOG_PAGE_SIZE);
    // Optional: Scroll to the top of the VibeLog section if desired
    // const vibeLogSectionElement = document.getElementById('vibe-log-section'); // Assuming VibeLogSection has an id="vibe-log-section"
    // if (vibeLogSectionElement) {
    //   vibeLogSectionElement.scrollIntoView({ behavior: 'smooth' });
    // }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Loading project...</p>
      </div>
    );
  }

  if (!startsnap) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Project not found or ID is missing.</p>
      </div>
    );
  }

  const isOwner = !!(currentUser && currentUser.id === startsnap.user_id);

  return (
    <div className="flex flex-col w-full items-center gap-16 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <Card className="max-w-4xl w-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
        <CardContent className="p-0">
          <ProjectInfoSection
            startsnap={startsnap}
            creator={creator}
            isOwner={isOwner}
            currentUser={currentUser as User | null}
            isSupportedByCurrentUser={isSupportedByCurrentUser}
            currentSupportCount={currentSupportCount}
            isSupportActionLoading={isSupportActionLoading}
            onSupportToggle={handleSupportToggle}
          />
          <VibeLogSection
            startsnapId={startsnap.id}
            initialVibeLogEntries={vibeLogEntries.slice(0, visibleVibeLogCount)}
            isOwner={isOwner}
            currentUserId={currentUser?.id}
            onVibeLogChange={fetchProjectData}
          />
          {(visibleVibeLogCount < vibeLogEntries.length || visibleVibeLogCount > VIBE_LOG_PAGE_SIZE) && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 p-8 pt-0 border-b-2 border-gray-800">
              {visibleVibeLogCount > VIBE_LOG_PAGE_SIZE && (
                <Button
                  onClick={handleShowLessVibeLogs}
                  variant="outline"
                  className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] py-2 px-5 text-base hover:bg-gray-300"
                >
                  Show Less Vibe Logs
                </Button>
              )}
              {visibleVibeLogCount < vibeLogEntries.length && (
                <Button
                  onClick={handleLoadMoreVibeLogs}
                  variant="outline"
                  className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] py-2 px-5 text-base hover:bg-gray-300"
                >
                  Load More Vibe Logs
                </Button>
              )}
            </div>
          )}
          <FeedbackSection
            startsnapId={startsnap.id}
            initialFeedbackEntries={feedbackEntries}
            currentUser={currentUser as User | null}
            currentUserProfile={currentUserProfile}
            onFeedbackChange={fetchFeedbacks}
          />
        </CardContent>
      </Card>
    </div>
  );
};