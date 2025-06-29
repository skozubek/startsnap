/**
 * src/screens/ProjectDetail/ProjectDetail.tsx
 * @description Component for displaying detailed information about a StartSnap project
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { ProjectInfoSection } from "./components/ProjectInfoSection";
import { VibeLogSection } from "./components/VibeLogSection";
import { FeedbackSection } from "./components/FeedbackSection";
import { ScreenshotGallery } from "./components/ScreenshotGallery";
import { ConfirmationDialog } from "../../components/ui/confirmation-dialog";
import { TippingDialog } from "../../components/ui/tipping-dialog";
import type { User } from '@supabase/supabase-js';
import type { StartSnapProject } from "../../types/startsnap"; // Import centralized type
import type { UserProfileData } from "../../types/user"; // Import UserProfileData
import type { FeedbackEntry, FeedbackReply } from "../../types/feedback"; // Import feedback types
import type { VibeLog } from "../../types/vibeLog"; // Import VibeLog type
import { toast } from "sonner";

// Define types that were previously inline or implicitly defined
// These might be moved to a dedicated types.ts file if they grow further or are used elsewhere

/**
 * @description Page component that displays detailed project information
 * @returns {JSX.Element} Project detail page with project info, vibe log, and feedback
 */
export const ProjectDetail = (): JSX.Element => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [startsnap, setStartsnap] = useState<StartSnapProject | null>(null);
  const [creator, setCreator] = useState<UserProfileData | null>(null);
  const [vibeLogEntries, setVibeLogEntries] = useState<VibeLog[]>([]);
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const { user: currentUser } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState<Pick<UserProfileData, 'username'> | null>(null);
  const [isSupportedByCurrentUser, setIsSupportedByCurrentUser] = useState(false);
  const [currentSupportCount, setCurrentSupportCount] = useState(0);
  const [isSupportActionLoading, setIsSupportActionLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [projectToDeleteName, setProjectToDeleteName] = useState('');
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isTippingDialogOpen, setIsTippingDialogOpen] = useState(false);

  const VIBE_LOG_PAGE_SIZE = 3; // Number of vibe logs to show per page
  const [visibleVibeLogCount, setVisibleVibeLogCount] = useState(VIBE_LOG_PAGE_SIZE);

  useEffect(() => {
    if (slug) {
      fetchProjectData();
    }
  }, [slug]);

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

  // New useEffect to fetch feedbacks when startsnap.id is available
  useEffect(() => {
    if (startsnap && startsnap.id) {
      fetchFeedbacks();
    }
  }, [startsnap]); // Or more specifically startsnap?.id, but startsnap itself covers it

  /**
   * @description Fetches all project data including Startsnap details, creator, Vibe Logs, and Feedbacks.
   * @async
   */
  const fetchProjectData = async () => {
    if (!slug) return;
    try {
      setLoading(true);


      const { data: projectData, error: projectError } = await supabase
        .from('startsnaps')
        .select('*, support_count, screenshot_urls')
        .eq('slug', slug)
        .maybeSingle();

      if (projectError) throw projectError;
      if (!projectData) {
        throw new Error('Project not found');
      }



      setStartsnap(projectData as StartSnapProject);

      // Initialize support count
      setCurrentSupportCount(projectData.support_count || 0);

      // Crucial: Now use projectData.id for subsequent fetches
      const projectId = projectData.id;

      // Check if current user has supported this project
      if (currentUser) {
        const { data: supportData } = await supabase
          .from('project_supporters')
          .select('*')
          .eq('startsnap_id', projectId)
          .eq('user_id', currentUser.id)
          .maybeSingle();

        setIsSupportedByCurrentUser(!!supportData);
      }

      // Fetch creator (already uses projectData.user_id, which is fine)
      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', projectData.user_id);
      if (creatorError && creatorError.code !== 'PGRST116') {
        console.error('Error fetching creator:', creatorError);
      } else {
        setCreator(creatorData?.[0] as UserProfileData || null);
      }

      // Fetch vibe logs
      const { data: vibeLogsData, error: vibeLogsError } = await supabase
        .from('vibelogs')
        .select('*')
        .eq('startsnap_id', projectId)
        .order('created_at', { ascending: false });
      if (vibeLogsError) throw vibeLogsError;
      setVibeLogEntries((vibeLogsData as VibeLog[]) || []);
      setVisibleVibeLogCount(VIBE_LOG_PAGE_SIZE); // Reset visible count on new data fetch

      // REMOVED: await fetchFeedbacks(); // No longer called directly here
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Optimized function to fetch feedback entries with their profiles and replies using batched queries.
   * Eliminates N+1 problem by batching profile lookups instead of making individual queries.
   * @async
   * @sideEffects Sets feedbackEntries state with complete nested data
   */
  const fetchFeedbacks = async () => {
    if (!startsnap?.id) {
      console.warn('Cannot fetch feedbacks: startsnap data or ID is not available yet. This might be normal on initial load.');
      return;
    }

    try {
      // 1. Fetch all feedbacks
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('startsnap_id', startsnap.id)
        .order('created_at', { ascending: true });

      if (feedbackError) throw feedbackError;

      if (!feedbackData || feedbackData.length === 0) {
        setFeedbackEntries([]);
        return;
      }

      // 2. Fetch all feedback replies in one query
      const feedbackIds = feedbackData.map(f => f.id);
      const { data: repliesData, error: repliesError } = await supabase
        .from('feedback_replies')
        .select('*')
        .in('parent_feedback_id', feedbackIds)
        .order('created_at', { ascending: false });

      if (repliesError) {
        console.error('Error fetching replies:', repliesError);
        // Continue without replies rather than failing completely
      }

      // 3. Batch fetch all unique user profiles (feedback authors + reply authors)
      const feedbackUserIds = feedbackData.map(f => f.user_id);
      const replyUserIds = repliesData ? repliesData.map(r => r.user_id) : [];
      const allUserIds = [...new Set([...feedbackUserIds, ...replyUserIds])]; // Remove duplicates

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', allUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue with anonymous profiles rather than failing
      }

      // 4. Create lookup maps for O(1) profile access
      const profileMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profileMap.set(profile.user_id, { username: profile.username });
        });
      }

      // 5. Group replies by feedback ID for O(1) lookup
      const repliesByFeedbackId = new Map();
      if (repliesData) {
        repliesData.forEach(reply => {
          if (!repliesByFeedbackId.has(reply.parent_feedback_id)) {
            repliesByFeedbackId.set(reply.parent_feedback_id, []);
          }
          repliesByFeedbackId.get(reply.parent_feedback_id).push({
            ...reply,
            profile: profileMap.get(reply.user_id) || { username: 'Anonymous' }
          });
        });
      }

      // 6. Combine all data
      const transformedFeedbacks: FeedbackEntry[] = feedbackData.map(feedback => ({
        ...feedback,
        profile: profileMap.get(feedback.user_id) || { username: 'Anonymous' },
        replies: repliesByFeedbackId.get(feedback.id) || []
      }));

      setFeedbackEntries(transformedFeedbacks);
    } catch (error) {
      console.error('Error fetching feedback with batched queries:', error);
      setFeedbackEntries([]);
    }
  };

  /**
   * @description Handles toggling project support status
   * @async
   * @sideEffects Updates project_supporters table (count handled automatically by database triggers)
   */
  const handleSupportToggle = async () => {
    if (!currentUser || !startsnap || !startsnap.id) return;

    setIsSupportActionLoading(true);
    const currentProjectId = startsnap.id;

    try {
      if (!isSupportedByCurrentUser) {
        // Add support - database trigger will automatically increment count
        const { error: supportError } = await supabase
          .from('project_supporters')
          .insert({ startsnap_id: currentProjectId, user_id: currentUser.id });

        if (supportError) throw supportError;

        // Update local state
        setIsSupportedByCurrentUser(true);

        // Fetch updated support count from database (set by trigger)
        const { data: updatedProject, error: fetchError } = await supabase
          .from('startsnaps')
          .select('support_count')
          .eq('id', currentProjectId)
          .single();

        if (fetchError) {
          console.warn('Could not fetch updated support count:', fetchError);
          // Fallback to optimistic update
          setCurrentSupportCount(prev => prev + 1);
        } else {
          setCurrentSupportCount(updatedProject.support_count || 0);
        }
      } else {
        // Remove support - database trigger will automatically decrement count
        const { error: supportError } = await supabase
          .from('project_supporters')
          .delete()
          .eq('startsnap_id', currentProjectId)
          .eq('user_id', currentUser.id);

        if (supportError) throw supportError;

        // Update local state
        setIsSupportedByCurrentUser(false);

        // Fetch updated support count from database (set by trigger)
        const { data: updatedProject, error: fetchError } = await supabase
          .from('startsnaps')
          .select('support_count')
          .eq('id', currentProjectId)
          .single();

        if (fetchError) {
          console.warn('Could not fetch updated support count:', fetchError);
          // Fallback to optimistic update
          setCurrentSupportCount(prev => Math.max(0, prev - 1));
        } else {
          setCurrentSupportCount(updatedProject.support_count || 0);
        }
      }
    } catch (error) {
      console.error('Error toggling project support:', error);
      toast.error('Support Update Failed', {
        description: 'Failed to update project support. Please try again.'
      });
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

  const openDeleteConfirmation = (name: string) => {
    setProjectToDeleteName(name);
    setIsDeleteConfirmOpen(true);
  };

  const handleTipCreator = () => {
    setIsTippingDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!startsnap || !startsnap.id) {
      console.error("Project data or ID is missing, cannot delete.");
      toast.error('Delete Failed', {
        description: 'Could not delete project. Essential data missing.'
      });
      setIsDeleteConfirmOpen(false);
      return;
    }

    setIsDeletingProject(true);
    try {
      // With ON DELETE CASCADE set up in the database,
      // only need to delete the main project record.
      const { error: projectDeleteError } = await supabase
        .from('startsnaps')
        .delete()
        .eq('id', startsnap.id);

      if (projectDeleteError) {
        // It's good to provide more specific error info if available
        console.error('Error deleting project:', projectDeleteError);
        throw new Error(`Error deleting project: ${projectDeleteError.message} (Code: ${projectDeleteError.code})`);
      }

      toast.success('Project Deleted Successfully!', {
        description: `"${projectToDeleteName}" has been permanently removed.`
      });
      setIsDeleteConfirmOpen(false);
      navigate('/'); // Navigate to profile page after deletion
    } catch (error: any) {
      console.error("Error during project deletion process:", error);
      toast.error('Delete Failed', {
        description: `Failed to delete project: ${error.message}`
      });
    } finally {
      setIsDeletingProject(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <div className="bg-startsnap-ebony-clay p-8 rounded-xl border-4 border-startsnap-french-rose shadow-[8px_8px_0px_#ef4444]">
          <p className="text-xl font-bold text-startsnap-beige">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!startsnap) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <div className="bg-startsnap-ebony-clay p-8 rounded-xl border-4 border-startsnap-french-rose shadow-[8px_8px_0px_#ef4444]">
          <p className="text-xl font-bold text-startsnap-beige">Project not found or ID is missing.</p>
        </div>
      </div>
    );
  }

  const isOwner = !!(currentUser && currentUser.id === startsnap.user_id);

  return (
    <>
      {/* Hero Background with Gradient */}
      <div className="w-full bg-startsnap-candlelight">
        <div className="flex flex-col w-full items-center pt-12 pb-8 px-4 md:px-8">
          {/* Project Showcase Zone */}
          <div className="w-full max-w-4xl">
            <Card className="w-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
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
                  onDeleteProjectRequest={openDeleteConfirmation}
                  onTipCreator={handleTipCreator}
                />
                <ScreenshotGallery urls={startsnap.screenshot_urls || []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dynamic Separator */}
      <div className="w-full bg-startsnap-beige relative">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]"></div>
        <div className="w-full max-w-4xl px-4 py-8 mx-auto relative md:px-8">
          <div className="flex items-center justify-center">
            <div className="flex-1 h-2 bg-startsnap-french-rose transform -skew-x-12"></div>
            <div className="px-6 py-2 bg-startsnap-ebony-clay text-startsnap-beige font-heading font-bold text-sm rounded-full border-2 border-startsnap-french-rose">
              VIBE LOGS & FEEDBACK
            </div>
            <div className="flex-1 h-2 bg-startsnap-french-rose transform skew-x-12"></div>
          </div>
        </div>
      </div>

      {/* Content Zone - White Background */}
      <div className="w-full bg-white pb-24 pt-8">
        <div className="flex flex-col w-full items-center px-4 md:px-8">
          <div className="w-full max-w-4xl">
            <Card className="w-full bg-transparent border-0 shadow-none rounded-none overflow-visible md:bg-startsnap-white md:rounded-xl md:overflow-hidden md:border-[3px] md:border-solid md:border-gray-800 md:shadow-[5px_5px_0px_#1f2937]">
              <CardContent className="p-0">
                <VibeLogSection
                  startsnapId={startsnap.id}
                  initialVibeLogEntries={vibeLogEntries.slice(0, visibleVibeLogCount)}
                  isOwner={isOwner}
                  projectName={startsnap.name}
                  isHackathonEntry={startsnap.is_hackathon_entry}
                  currentUserId={currentUser?.id}
                  onVibeLogChange={fetchProjectData}
                />
                {(visibleVibeLogCount < vibeLogEntries.length || visibleVibeLogCount > VIBE_LOG_PAGE_SIZE) && (
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 p-8 pt-0 border-b-2 border-gray-800">
                    {visibleVibeLogCount > VIBE_LOG_PAGE_SIZE && (
                      <Button
                        onClick={handleShowLessVibeLogs}
                        variant="secondary"
                        size="lg"
                      >
                        Show Less Vibe Logs
                      </Button>
                    )}
                    {visibleVibeLogCount < vibeLogEntries.length && (
                      <Button
                        onClick={handleLoadMoreVibeLogs}
                        variant="secondary"
                        size="lg"
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
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${projectToDeleteName}"? This action cannot be undone, and all associated data (vibe logs, feedback, etc.) will be permanently removed.`}
        confirmText="Delete Project"
        isLoading={isDeletingProject}
        type="danger"
      />

      <TippingDialog
        isOpen={isTippingDialogOpen}
        onClose={() => setIsTippingDialogOpen(false)}
        creatorAddress={creator?.algorand_wallet_address || ''}
        projectName={startsnap?.name || ''}
      />
    </>
  );
};