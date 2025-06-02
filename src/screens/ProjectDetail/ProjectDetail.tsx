/**
 * src/screens/ProjectDetail/ProjectDetail.tsx
 * @description Component for displaying detailed information about a StartSnap project
 */

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { supabase } from "../../lib/supabase";
import { getCategoryDisplay, getVibeLogDisplay } from "../../config/categories";
import { formatDetailedDate } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { UserAvatar, getAvatarName } from "../../components/ui/user-avatar";
import { AddVibeLogModal } from "../../components/ui/add-vibe-log-modal";
import { FeedbackModal } from "../../components/ui/FeedbackModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../../components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Separator } from "../../components/ui/separator";

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
 * @description Page component that displays detailed project information
 * @returns {JSX.Element} Project detail page with project info, vibe log, and feedback
 */
export const ProjectDetail = (): JSX.Element => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [startsnap, setStartsnap] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [vibeLogEntries, setVibeLogEntries] = useState<any[]>([]);
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState<{ username?: string } | null>(null);
  const [isVibeLogModalOpen, setIsVibeLogModalOpen] = useState(false);
  const [editingVibeLog, setEditingVibeLog] = useState<any>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<FeedbackEntry | null>(null);
  const [feedbackContentForModal, setFeedbackContentForModal] = useState("");

  // New state for reply functionality
  const [replyingToFeedbackId, setReplyingToFeedbackId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingReply, setEditingReply] = useState<FeedbackReply | null>(null);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  // Fetch current user's profile for consistent avatar display in feedback input
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
   * @description Fetches project data, creator profile, vibe logs, and feedback from Supabase
   * @async
   * @sideEffects Updates state with fetched project data and related information
   */
  const fetchProjectData = async () => {
    try {
      setLoading(true);

      // Fetch startsnap details
      const { data: projectData, error: projectError } = await supabase
        .from('startsnaps')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      setStartsnap(projectData);

      // Fetch creator profile
      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', projectData.user_id)
        .single();

      if (creatorError && creatorError.code !== 'PGRST116') {
        console.error('Error fetching creator:', creatorError);
      } else {
        setCreator(creatorData);
      }

      // Fetch vibe logs
      const { data: vibeLogsData, error: vibeLogsError } = await supabase
        .from('vibelogs')
        .select('*')
        .eq('startsnap_id', id)
        .order('created_at', { ascending: false });

      if (vibeLogsError) throw vibeLogsError;

      setVibeLogEntries(vibeLogsData || []);

      // Fetch feedback with profiles for usernames
      fetchFeedbacks();

    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Fetches feedback entries for the current startsnap with profile usernames and replies
   * @async
   * @sideEffects Updates state with fetched feedback entries and their replies
   */
  const fetchFeedbacks = async () => {
    try {
      // Get all feedbacks for this startsnap
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('startsnap_id', id)
        .order('created_at', { ascending: true });

      if (feedbackError) throw feedbackError;

      // For each feedback, get the username from profiles and its replies
      if (feedbackData && feedbackData.length > 0) {
        const feedbacksWithProfilesAndReplies = await Promise.all(
          feedbackData.map(async (feedback) => {
            // Get profile for the feedback author
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username')
              .eq('user_id', feedback.user_id)
              .single();

            // Get replies for this feedback
            const { data: repliesData, error: repliesError } = await supabase
              .from('feedback_replies')
              .select('*')
              .eq('parent_feedback_id', feedback.id)
              .order('created_at', { ascending: false });

            if (repliesError) {
              console.error('Error fetching replies:', repliesError);
              return {
                ...feedback,
                profile: profileData || { username: 'Anonymous' },
                replies: []
              };
            }

            // For each reply, get the username from profiles
            const repliesWithProfiles = await Promise.all(
              (repliesData || []).map(async (reply) => {
                const { data: replyProfileData } = await supabase
                  .from('profiles')
                  .select('username')
                  .eq('user_id', reply.user_id)
                  .single();

                return {
                  ...reply,
                  profile: replyProfileData || { username: 'Anonymous' }
                };
              })
            );

            return {
              ...feedback,
              profile: profileData || { username: 'Anonymous' },
              replies: repliesWithProfiles || []
            };
          })
        );

        setFeedbackEntries(feedbacksWithProfilesAndReplies);
      } else {
        setFeedbackEntries([]);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  /**
   * @description Opens the feedback modal for adding a new feedback
   * @sideEffects Sets state to open feedback modal in add mode
   */
  const handleOpenFeedbackModal = () => {
    setEditingFeedback(null);
    setFeedbackContentForModal("");
    setIsFeedbackModalOpen(true);
  };

  /**
   * @description Opens the feedback modal for editing an existing feedback
   * @param {FeedbackEntry} feedback - The feedback entry to edit
   * @sideEffects Sets state to open feedback modal in edit mode with existing content
   */
  const handleEditFeedback = (feedback: FeedbackEntry) => {
    setEditingFeedback(feedback);
    setFeedbackContentForModal(feedback.content);
    setIsFeedbackModalOpen(true);
  };

  /**
   * @description Handles submission of a new feedback
   * @async
   * @param {Object} data - Form data containing feedback content
   * @param {string} data.content - The feedback content
   * @sideEffects Inserts new feedback entry into Supabase and refreshes the list
   */
  const handleFeedbackSubmit = async (data: { content: string }) => {
    if (!currentUser) {
      alert('You need to be logged in to submit feedback.');
      return;
    }

    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert({
          startsnap_id: id,
          user_id: currentUser.id,
          content: data.content
        });

      if (error) throw error;

      // Refresh feedbacks list
      await fetchFeedbacks();
      setIsFeedbackModalOpen(false);
      setFeedbackContent("");
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  /**
   * @description Handles updating an existing feedback
   * @async
   * @param {Object} data - Form data containing updated feedback content
   * @param {string} data.content - The updated feedback content
   * @sideEffects Updates feedback entry in Supabase and refreshes the list
   */
  const handleUpdateFeedback = async (data: { content: string }) => {
    if (!editingFeedback || !currentUser) return;

    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({
          content: data.content,
          updated_at: new Date()
        })
        .eq('id', editingFeedback.id);

      if (error) throw error;

      // Refresh feedbacks
      await fetchFeedbacks();
      setIsFeedbackModalOpen(false);
      setEditingFeedback(null);
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Failed to update feedback. Please try again.');
    }
  };

  /**
   * @description Handles deletion of a feedback entry
   * @async
   * @param {string} feedbackId - ID of the feedback entry to delete
   * @sideEffects Deletes feedback entry from Supabase and refreshes the list
   */
  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;

      // Refresh feedbacks
      await fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback. Please try again.');
    }
  };

  /**
   * @description Handles submission of a reply to a feedback
   * @async
   * @param {string} parentFeedbackId - ID of the parent feedback being replied to
   * @sideEffects Inserts new reply into Supabase and refreshes the feedback list
   */
  const handleReplySubmit = async () => {
    if (!currentUser || !replyingToFeedbackId) {
      setReplyError('You need to be logged in to reply.');
      return;
    }

    if (!replyContent.trim()) {
      setReplyError('Please enter a reply.');
      return;
    }

    setReplySubmitting(true);
    setReplyError(null);

    try {
      const { error } = await supabase
        .from('feedback_replies')
        .insert({
          parent_feedback_id: replyingToFeedbackId,
          user_id: currentUser.id,
          content: replyContent
        });

      if (error) throw error;

      // Refresh feedbacks to include the new reply
      await fetchFeedbacks();
      setReplyContent('');
      setReplyingToFeedbackId(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
      setReplyError('Failed to submit reply. Please try again.');
    } finally {
      setReplySubmitting(false);
    }
  };

  /**
   * @description Sets up editing for a reply
   * @param {FeedbackReply} reply - The reply to edit
   * @sideEffects Updates state to edit the selected reply
   */
  const handleEditReply = (reply: FeedbackReply) => {
    setEditingReply(reply);
    setReplyingToFeedbackId(reply.parent_feedback_id);
    setReplyContent(reply.content);
  };

  /**
   * @description Updates an existing reply
   * @async
   * @sideEffects Updates the reply in Supabase and refreshes the feedback list
   */
  const handleUpdateReply = async () => {
    if (!currentUser || !editingReply) {
      return;
    }

    if (!replyContent.trim()) {
      setReplyError('Please enter a reply.');
      return;
    }

    setReplySubmitting(true);
    setReplyError(null);

    try {
      const { error } = await supabase
        .from('feedback_replies')
        .update({
          content: replyContent,
          updated_at: new Date()
        })
        .eq('id', editingReply.id);

      if (error) throw error;

      // Refresh feedbacks
      await fetchFeedbacks();
      setReplyContent('');
      setReplyingToFeedbackId(null);
      setEditingReply(null);
    } catch (error) {
      console.error('Error updating reply:', error);
      setReplyError('Failed to update reply. Please try again.');
    } finally {
      setReplySubmitting(false);
    }
  };

  /**
   * @description Handles deletion of a reply
   * @async
   * @param {string} replyId - ID of the reply to delete
   * @sideEffects Deletes the reply from Supabase and refreshes the feedback list
   */
  const handleDeleteReply = async (replyId: string) => {
    if (!window.confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('feedback_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;

      // Refresh feedbacks
      await fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply. Please try again.');
    }
  };

  /**
   * @description Cancels the current reply action
   * @sideEffects Resets reply state variables
   */
  const handleCancelReply = () => {
    setReplyingToFeedbackId(null);
    setReplyContent('');
    setEditingReply(null);
    setReplyError(null);
  };

  /**
   * @description Handles submission of a new Vibe Log entry
   * @async
   * @param {Object} data - Form data containing log_type, title, and content
   * @sideEffects Inserts new Vibe Log entry into Supabase and updates UI
   */
  const handleVibeLogSubmit = async (data: { log_type: string; title: string; content: string }) => {
    try {
      const { error } = await supabase
        .from('vibelogs')
        .insert({
          startsnap_id: id,
          log_type: data.log_type,
          title: data.title,
          content: data.content
        });

      if (error) throw error;

      // Refresh vibe log entries
      fetchProjectData();
      setIsVibeLogModalOpen(false);
    } catch (error) {
      console.error('Error adding vibe log entry:', error);
      alert('Failed to add vibe log entry. Please try again.');
    }
  };

  /**
   * @description Handles editing of an existing Vibe Log entry
   * @async
   * @param {Object} data - Form data containing updated log_type, title, and content
   * @sideEffects Updates Vibe Log entry in Supabase and refreshes the UI
   */
  const handleUpdateVibeLog = async (data: { log_type: string; title: string; content: string }) => {
    if (!editingVibeLog) return;

    try {
      const { error } = await supabase
        .from('vibelogs')
        .update({
          log_type: data.log_type,
          title: data.title,
          content: data.content,
          updated_at: new Date()
        })
        .eq('id', editingVibeLog.id);

      if (error) throw error;

      // Refresh vibe log entries
      fetchProjectData();
      setEditingVibeLog(null);
      setIsVibeLogModalOpen(false);
    } catch (error) {
      console.error('Error updating vibe log entry:', error);
      alert('Failed to update vibe log entry. Please try again.');
    }
  };

  /**
   * @description Sets up editing mode for a vibe log entry
   * @param {Object} entry - The vibe log entry to edit
   * @sideEffects Sets the editing state and opens the modal
   */
  const handleEditVibeLog = (entry: any) => {
    setEditingVibeLog(entry);
    setIsVibeLogModalOpen(true);
  };

  /**
   * @description Handles deletion of a vibe log entry
   * @async
   * @param {string} entryId - The ID of the vibe log entry to delete
   * @sideEffects Deletes the entry from Supabase and refreshes the UI
   */
  const handleDeleteVibeLog = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this vibe log entry? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vibelogs')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      // Refresh vibe log entries
      fetchProjectData();
    } catch (error) {
      console.error('Error deleting vibe log entry:', error);
      alert('Failed to delete vibe log entry. Please try again.');
    }
  };

  /**
   * @description Handles closing the vibe log modal
   * @sideEffects Resets modal state and editing state
   */
  const handleCloseVibeLogModal = () => {
    setIsVibeLogModalOpen(false);
    setEditingVibeLog(null);
  };

  /**
   * @description Handles closing the feedback modal
   * @sideEffects Resets feedback modal state and editing state
   */
  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setEditingFeedback(null);
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
        <p className="text-xl font-bold text-startsnap-ebony-clay">Project not found</p>
      </div>
    );
  }

  const categoryDisplay = getCategoryDisplay(startsnap.category);
  const creatorName = creator?.username || 'Anonymous';
  const creatorInitials = creatorName.substring(0, 2).toUpperCase();
  const isOwner = currentUser && currentUser.id === startsnap.user_id;

  return (
    <div className="flex flex-col w-full items-center gap-16 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      <Card className="max-w-4xl w-full bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
        <CardContent className="p-0">
          {/* Project Header Section - Category-colored header like cards */}
          <div className={`${categoryDisplay.bgColor} px-8 py-6 border-b-2 border-gray-800`}>
            <div className="flex justify-between items-start gap-6 mb-4">
              {/* Project Title - Hero element */}
              <h1 className={`${categoryDisplay.textColor} font-[var(--startsnap-semantic-heading-3-font-family)] font-black tracking-tight leading-tight flex-1 text-4xl lg:text-5xl`}>
                {startsnap.name}
              </h1>

              {/* Category Badge */}
              <Badge
                variant="outline"
                className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border ${categoryDisplay.borderColor} rounded-full px-4 py-2 font-['Space_Mono',Helvetica] font-normal shrink-0 text-sm`}
              >
                {categoryDisplay.name}
              </Badge>
            </div>

            {/* Status badges - now in header */}
            <div className="flex gap-3 flex-wrap">
              {/* Project type badge */}
              {startsnap.type === "live" ? (
                <Badge variant="outline" className="bg-startsnap-mountain-meadow text-white font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-green-700 px-3 py-1 flex items-center gap-1">
                  <span className="material-icons text-sm">rocket_launch</span>
                  Live Project
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-startsnap-corn text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-yellow-700 px-3 py-1 flex items-center gap-1">
                  <span className="material-icons text-sm">lightbulb</span>
                  Idea / Concept
                </Badge>
              )}

              {/* Hackathon badge */}
              {startsnap.is_hackathon_entry && (
                <Badge variant="outline" className="bg-startsnap-heliotrope text-white font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-purple-700 px-3 py-1 flex items-center gap-1">
                  <span className="material-icons text-xl">emoji_events</span>
                  Hackathon Entry
                </Badge>
              )}
            </div>
          </div>

          {/* Main Content Section - Clean and spacious */}
          <div className="px-8 pt-6 pb-8">
            {/* Project Links - updated for inline display */}
            {(startsnap.live_demo_url || startsnap.demo_video_url) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                <p className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg">
                  Project Links:
                </p>

                {startsnap.live_demo_url && (
                  <div className="flex items-center">
                    <span className="material-icons text-startsnap-oxford-blue mr-1.5">public</span>
                    <a href={startsnap.live_demo_url} target="_blank" rel="noopener noreferrer"
                      className="text-startsnap-persian-blue font-['Roboto',Helvetica] flex items-center hover:text-startsnap-french-rose transition-colors">
                      Live Demo
                      <span className="material-icons text-sm ml-1">open_in_new</span>
                    </a>
                  </div>
                )}
                {startsnap.demo_video_url && (
                  <div className="flex items-center">
                    <span className="material-icons text-startsnap-oxford-blue mr-1.5">videocam</span>
                    <a href={startsnap.demo_video_url} target="_blank" rel="noopener noreferrer"
                      className="text-startsnap-persian-blue font-['Roboto',Helvetica] flex items-center hover:text-startsnap-french-rose transition-colors">
                      Demo Video
                      <span className="material-icons text-sm ml-1">open_in_new</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Project Description - Hero treatment */}
            <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed leading-relaxed text-lg mb-6">
              {startsnap.description}
            </p>

            {/* Tags, Tools, Feedback  */}
            {(startsnap.tags?.length > 0 || startsnap.tools_used?.length > 0) && (
              <div className="space-y-6 py-6 mb-6">
                {startsnap.tags?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="material-icons text-startsnap-shuttle-gray text-xl">sell</span>
                    {startsnap.tags.map((tag: string, index: number) => (
                      <Badge key={`tag-${index}`} variant="outline" className="bg-startsnap-athens-gray text-startsnap-ebony-clay font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-gray-800 px-3 py-1">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {startsnap.tools_used?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="material-icons text-startsnap-shuttle-gray text-xl">construction</span>
                    {startsnap.tools_used.map((tool: string, index: number) => (
                      <Badge key={`tool-${index}`} variant="outline" className="bg-startsnap-french-pass text-startsnap-persian-blue font-['Space_Mono',Helvetica] text-sm rounded-full border border-solid border-blue-700 px-3 py-1">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Creator info - MOVED HERE, before action buttons */}
            {creator && (
              <div className="flex items-center pt-6 border-t border-gray-200/80 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12">
                    <UserAvatar
                      name={creator?.username || 'Anonymous'}
                      size={48}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay leading-tight">
                      {creator?.username || 'Anonymous'}
                    </p>
                    <p className="font-['Roboto',Helvetica] text-startsnap-shuttle-gray text-sm">
                      Launched: {formatDetailedDate(startsnap.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              {isOwner ? (
                <>
                  <Button
                    onClick={() => setIsVibeLogModalOpen(true)}
                    className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2"
                  >
                    <span className="material-icons text-xl">post_add</span>
                    Add Vibe Log Entry
                  </Button>
                  <Button className="startsnap-button bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2" asChild>
                    <Link to={`/edit/${startsnap.id}`}>
                      <span className="material-icons text-xl">edit</span>
                      Edit Project
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937] flex items-center gap-2">
                    <span className="material-icons text-xl">thumb_up</span>
                    Support Project
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Vibe Log Section */}
          <div className="border-b-2 border-gray-800 p-8">
            <div className="flex items-center mb-6">
              <h2 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8">
                Vibe Log
              </h2>
              <span className="ml-1 text-startsnap-corn text-2xl material-icons">
                insights
              </span>
            </div>

            {vibeLogEntries.length > 0 ? (
              vibeLogEntries.map((entry: any) => {
                const logType = entry.log_type || 'update';
                const iconData = getVibeLogDisplay(logType);

                return (
                  <div key={entry.id} className="mb-8 last:mb-0">
                    <div className="flex items-start">
                      <div
                        className={`p-2.5 ${iconData.iconBg} rounded-full border-2 border-solid ${iconData.iconBorder} ${iconData.iconColor} text-3xl flex items-center justify-center`}
                      >
                        <span className="material-icons text-3xl">{iconData.icon}</span>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                            {formatDetailedDate(entry.created_at)}
                          </p>

                          {isOwner && (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                                <MoreHorizontal className="h-4 w-4 text-startsnap-oxford-blue" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[160px]">
                                <DropdownMenuItem
                                  onClick={() => handleEditVibeLog(entry)}
                                  className="cursor-pointer flex items-center gap-2"
                                >
                                  <span className="material-icons text-sm">edit</span>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteVibeLog(entry.id)}
                                  className="cursor-pointer text-red-600 flex items-center gap-2"
                                >
                                  <span className="material-icons text-sm">delete</span>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mt-1">
                          {entry.title}
                        </h3>
                        <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6">
                          {entry.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="font-['Roboto',Helvetica] font-normal text-startsnap-pale-sky text-base leading-6">
                No vibe log entries yet. Check back soon for updates!
              </p>
            )}
          </div>

          {/* Community Feedback Section */}
          <div className="p-8">
            <div className="flex items-center mb-6">
              <h2 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-2xl leading-8">
                Community Feedback
              </h2>
              <span className="ml-1 text-startsnap-mountain-meadow text-2xl material-icons">
                groups
              </span>
            </div>

            {feedbackEntries.length > 0 ? (
              feedbackEntries.map((feedback, feedbackIndex) => (
                <React.Fragment key={feedback.id}>
                  <Card
                    className="shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a] bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start">
                        <div className="w-10 h-10 flex-shrink-0">
                          <UserAvatar
                            name={getAvatarName(null, feedback.profile?.username || 'Anonymous')}
                            size={40}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-base leading-6">
                                {feedback.profile?.username || 'Anonymous'}
                              </p>
                              <p className="ml-3 font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                                {formatDetailedDate(feedback.created_at)}
                              </p>
                            </div>

                            {currentUser && currentUser.id === feedback.user_id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                                  <MoreHorizontal className="h-4 w-4 text-startsnap-oxford-blue" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[160px]">
                                  <DropdownMenuItem
                                    onClick={() => handleEditFeedback(feedback)}
                                    className="cursor-pointer flex items-center gap-2"
                                  >
                                    <span className="material-icons text-sm">edit</span>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteFeedback(feedback.id)}
                                    className="cursor-pointer text-red-600 flex items-center gap-2"
                                  >
                                    <span className="material-icons text-sm">delete</span>
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6 mt-1">
                            {feedback.content}
                          </p>

                          {/* Reply button - stays with parent feedback */}
                          {currentUser && (
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  setReplyingToFeedbackId(feedback.id);
                                  setReplyContent('');
                                  setEditingReply(null);
                                }}
                                className="text-startsnap-persian-blue text-sm font-['Roboto',Helvetica] flex items-center hover:text-startsnap-french-rose transition-colors"
                              >
                                <span className="material-icons text-sm mr-1">reply</span>
                                Reply
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Replies and Reply Form Container - Indented */}
                  <div className="ml-8 lg:ml-12 mt-4 relative">
                    {/* Optional Connecting Line - adjust if reply form is always on top */}
                    {(replyingToFeedbackId === feedback.id || (feedback.replies && feedback.replies.length > 0)) && (
                         <div className="absolute left-[-20px] top-0 bottom-0 w-0.5 bg-gray-300 lg:left-[-28px]"></div>
                    )}

                    {/* Inline Reply form - MOVED TO TOP & Indented and Lightweight */}
                    {replyingToFeedbackId === feedback.id && currentUser && (
                      <div className={`pb-3 mb-3 ${feedback.replies && feedback.replies.length > 0 ? 'border-b border-gray-200' : ''}`}>
                        {/* Subtle background and border */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-8 h-8 flex-shrink-0">
                            <UserAvatar
                              name={getAvatarName(currentUser, currentUserProfile?.username)}
                              size={32}
                              className="w-full h-full"
                            />
                          </div>
                          <div className="flex-1">
                            <Textarea
                              placeholder={editingReply ? "Edit your reply..." : "Write your reply..."}
                              className="border-2 border-solid border-gray-300 rounded-lg p-2 min-h-[80px] font-['Roboto',Helvetica] text-startsnap-pale-sky text-sm mb-2 focus:border-startsnap-persian-blue bg-white"
                              value={replyContent}
                              onChange={(e) => {
                                setReplyContent(e.target.value);
                                setReplyError(null);
                              }}
                              disabled={replySubmitting}
                            />
                            {replyError && (
                              <p className="text-red-500 text-xs mb-2">{replyError}</p>
                            )}
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={handleCancelReply}
                                className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold text-sm rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937] py-1 px-3 h-auto"
                                disabled={replySubmitting}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={editingReply ? handleUpdateReply : handleReplySubmit}
                                className="startsnap-button bg-startsnap-persian-blue text-startsnap-white font-['Roboto',Helvetica] font-bold text-sm rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937] py-1 px-3 h-auto"
                                disabled={replySubmitting || !replyContent.trim()}
                              >
                                {replySubmitting ? (editingReply ? 'Updating...' : 'Replying...') : (editingReply ? 'Update Reply' : 'Reply')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies section - Lightweight */}
                    {feedback.replies && feedback.replies.length > 0 && (
                      <div className="space-y-3">
                        {feedback.replies.map((reply, replyIndex) => (
                          <div
                            key={reply.id}
                            // Removed top border from here as it's handled by space-y or the reply form separator
                            className={`pt-3 ${replyIndex > 0 ? 'mt-3 border-t border-gray-200' : '' }`}
                          >
                            <div className="flex items-start">
                              <div className="w-8 h-8 flex-shrink-0">
                                <UserAvatar
                                  name={getAvatarName(null, reply.profile?.username || 'Anonymous')}
                                  size={32}
                                  className="w-full h-full"
                                />
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-sm leading-5">
                                      {reply.profile?.username || 'Anonymous'}
                                    </p>
                                    <p className="ml-2 font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                                      {formatDetailedDate(reply.created_at)}
                                    </p>
                                  </div>

                                  {currentUser && currentUser.id === reply.user_id && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-100 data-[state=open]:bg-gray-100">
                                        <MoreHorizontal className="h-3 w-3 text-startsnap-oxford-blue" />
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="min-w-[140px]">
                                        <DropdownMenuItem
                                          onClick={() => handleEditReply(reply)}
                                          className="cursor-pointer flex items-center gap-2 text-sm"
                                        >
                                          <span className="material-icons text-xs">edit</span>
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteReply(reply.id)}
                                          className="cursor-pointer text-red-600 flex items-center gap-2 text-sm"
                                        >
                                          <span className="material-icons text-xs">delete</span>
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                                <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-sm leading-5 mt-1">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))
            ) : (
              // Sample feedback entries
              <>
                <Card
                  className="mb-6 shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a] bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start">
                      <div className="w-10 h-10">
                        <UserAvatar
                          name="AudioGeek_77"
                          size={40}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-base leading-6">
                            AudioGeek_77
                          </p>
                          <p className="ml-3 font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                            July 22, 2024 - 11:15 AM
                          </p>
                        </div>
                        <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6 mt-1">
                          Love the concept! The main oscillator section is a bit crowded. Maybe group the waveform selectors differently? The filter sounds amazing though!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className="mb-6 shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a] bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start">
                      <div className="w-10 h-10">
                        <UserAvatar
                          name="UX_Wizard"
                          size={40}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="font-['Roboto',Helvetica] font-semibold text-startsnap-oxford-blue text-base leading-6">
                            UX_Wizard
                          </p>
                          <p className="ml-3 font-['Inter',Helvetica] font-normal text-startsnap-pale-sky text-xs leading-4">
                            July 22, 2024 - 1:05 PM
                          </p>
                        </div>
                        <p className="font-['Roboto',Helvetica] font-normal text-startsnap-river-bed text-base leading-6 mt-1">
                          Great start! Consider adding tooltips for less common parameters. The color scheme is cool and retro. One minor bug: the LFO rate knob sometimes jumps values.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <div className="mt-8">
              <h3 className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-lg leading-7 mb-4">
                Leave Your Feedback
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex-shrink-0">
                  <UserAvatar
                    name={currentUser ? getAvatarName(currentUser, currentUserProfile?.username) : 'Anonymous'}
                    size={40}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder={currentUser ? "Share your thoughts, suggestions, or bug reports..." : "Please log in to leave feedback"}
                    className="border-2 border-solid border-gray-800 rounded-lg p-3.5 min-h-[120px] font-['Roboto',Helvetica] text-startsnap-pale-sky mb-2"
                    value={feedbackContent}
                    onChange={(e) => {
                      setFeedbackContent(e.target.value);
                      setSubmissionError(null);
                    }}
                    disabled={!currentUser || isSubmitting}
                  />
                  {submissionError && (
                    <p className="text-red-500 text-sm mb-2">{submissionError}</p>
                  )}
                  <Button
                    className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                    onClick={async () => {
                      if (!currentUser) {
                        setSubmissionError('You need to be logged in to submit feedback');
                        return;
                      }

                      if (!feedbackContent.trim()) {
                        setSubmissionError('Please enter some feedback');
                        return;
                      }

                      setIsSubmitting(true);
                      try {
                        await handleFeedbackSubmit({ content: feedbackContent });
                        setFeedbackContent('');
                        setSubmissionError(null);
                      } catch (error) {
                        setSubmissionError('Failed to submit feedback. Please try again.');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={!currentUser || !feedbackContent.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : (currentUser ? 'Submit Feedback' : 'Login to Submit Feedback')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddVibeLogModal
        isOpen={isVibeLogModalOpen}
        onClose={handleCloseVibeLogModal}
        onSubmit={editingVibeLog ? handleUpdateVibeLog : handleVibeLogSubmit}
        isEditMode={!!editingVibeLog}
        initialData={editingVibeLog}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={handleCloseFeedbackModal}
        onSubmit={editingFeedback ? handleUpdateFeedback : handleFeedbackSubmit}
        isEditMode={!!editingFeedback}
        initialContent={feedbackContentForModal}
      />
    </div>
  );
};