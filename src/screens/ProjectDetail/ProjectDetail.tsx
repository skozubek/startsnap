/**
 * src/screens/ProjectDetail/ProjectDetail.tsx
 * @description Component for displaying detailed view of a project including description, vibe logs, and community feedback
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { UserAvatar, getAvatarName } from "../../components/ui/user-avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { supabase } from "../../lib/supabase";
import { getCategoryDisplay, getVibeLogDisplay } from "../../config/categories";
import { formatDetailedDate } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { VibeLogEntry } from "../../components/ui/vibe-log-entry";
import { AddVibeLogModal } from "../../components/ui/add-vibe-log-modal";
import { FeedbackModal } from "../../components/ui/FeedbackModal";
import { MoreHorizontal, Edit, Trash2, MessageCircle } from "lucide-react";

/**
 * @description Interface for profile data with username
 */
interface Profile {
  username: string;
}

/**
 * @description Interface for project detail data
 */
interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  created_at: string;
  user_id: string;
  live_demo_url?: string;
  demo_video_url?: string;
  tools_used: string[];
  tags: string[];
  is_hackathon_entry: boolean;
  feedback_tags: string[];
}

/**
 * @description Interface for feedback data
 */
interface Feedback {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  replies?: Reply[];
  profiles?: {
    username: string;
  };
}

/**
 * @description Interface for reply data
 */
interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
  };
}

/**
 * @description Page component for viewing detailed project information and interactions
 * @returns {JSX.Element} ProjectDetail page with project info, vibe logs, and feedback
 */
export const ProjectDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [vibeLogs, setVibeLogs] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [newFeedback, setNewFeedback] = useState("");
  const [isVibeLogModalOpen, setIsVibeLogModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [editingFeedbackContent, setEditingFeedbackContent] = useState("");
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState("");
  const [newReply, setNewReply] = useState("");
  const [replyingToFeedbackId, setReplyingToFeedbackId] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: Profile }>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  /**
   * @description Fetches project details, vibe logs, feedback, and profiles
   * @async
   * @sideEffects Updates state with fetched data
   */
  const fetchProjectDetails = async () => {
    try {
      if (!id) return;

      setLoading(true);

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from("startsnaps")
        .select("*")
        .eq("id", id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Check if user is the owner
      setIsOwner(user && projectData.user_id === user.id);

      // Fetch creator profile
      const { data: creatorData, error: creatorError } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", projectData.user_id)
        .single();

      if (creatorError && creatorError.code !== "PGRST116") throw creatorError;
      setCreatorProfile(creatorData);

      // Fetch vibe logs
      const { data: vibeLogsData, error: vibeLogsError } = await supabase
        .from("vibelogs")
        .select("*")
        .eq("startsnap_id", id)
        .order("created_at", { ascending: false });

      if (vibeLogsError) throw vibeLogsError;
      setVibeLogs(vibeLogsData || []);

      // Fetch feedbacks and replies
      await fetchFeedbacksAndReplies();
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Fetches feedbacks and their replies with profile data
   * @async
   * @sideEffects Updates state with feedbacks and user profiles
   */
  const fetchFeedbacksAndReplies = async () => {
    try {
      if (!id) return;

      // Fetch feedbacks with creator profiles
      const { data: feedbacksData, error: feedbacksError } = await supabase
        .from("feedbacks")
        .select(`
          *,
          profiles: user_id (username)
        `)
        .eq("startsnap_id", id)
        .order("created_at", { ascending: false });

      if (feedbacksError) throw feedbacksError;

      // Fetch replies for each feedback
      const feedbacksWithReplies: Feedback[] = await Promise.all(
        (feedbacksData || []).map(async (feedback) => {
          const { data: repliesData, error: repliesError } = await supabase
            .from("feedback_replies")
            .select(`
              *,
              profiles: user_id (username)
            `)
            .eq("parent_feedback_id", feedback.id)
            .order("created_at", { ascending: true });

          if (repliesError) throw repliesError;

          return {
            ...feedback,
            replies: repliesData || []
          };
        })
      );

      setFeedbacks(feedbacksWithReplies);

      // Collect all user IDs from feedbacks and replies
      const userIds = new Set<string>();
      feedbacksWithReplies.forEach(feedback => {
        userIds.add(feedback.user_id);
        feedback.replies?.forEach(reply => {
          userIds.add(reply.user_id);
        });
      });

      // Fetch profiles for all users
      if (userIds.size > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, username")
          .in("user_id", Array.from(userIds));

        if (profilesError) throw profilesError;

        const profilesMap: { [key: string]: Profile } = {};
        profilesData?.forEach(profile => {
          profilesMap[profile.user_id] = { username: profile.username };
        });

        setUserProfiles(profilesMap);
      }
    } catch (error) {
      console.error("Error fetching feedbacks and replies:", error);
    }
  };

  /**
   * @description Handles adding a new feedback
   * @async
   * @sideEffects Inserts new feedback into database and updates state
   */
  const handleAddFeedback = async () => {
    try {
      if (!user || !id || !newFeedback.trim()) return;

      const { data, error } = await supabase
        .from("feedbacks")
        .insert({
          startsnap_id: id,
          user_id: user.id,
          content: newFeedback.trim()
        })
        .select();

      if (error) throw error;

      // Fetch profiles and update state
      await fetchFeedbacksAndReplies();
      setNewFeedback("");
    } catch (error) {
      console.error("Error adding feedback:", error);
    }
  };

  /**
   * @description Handles editing a feedback
   * @async
   * @param {string} feedbackId - ID of the feedback to edit
   * @sideEffects Updates feedback in database and updates state
   */
  const handleEditFeedback = async (feedbackId: string) => {
    try {
      if (!user || !editingFeedbackContent.trim()) return;

      const { error } = await supabase
        .from("feedbacks")
        .update({ content: editingFeedbackContent.trim() })
        .eq("id", feedbackId)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchFeedbacksAndReplies();
      setEditingFeedbackId(null);
      setEditingFeedbackContent("");
    } catch (error) {
      console.error("Error editing feedback:", error);
    }
  };

  /**
   * @description Handles deleting a feedback
   * @async
   * @param {string} feedbackId - ID of the feedback to delete
   * @sideEffects Deletes feedback from database and updates state
   */
  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from("feedbacks")
        .delete()
        .eq("id", feedbackId)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchFeedbacksAndReplies();
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  /**
   * @description Handles adding a reply to a feedback
   * @async
   * @sideEffects Inserts new reply into database and updates state
   */
  const handleAddReply = async () => {
    try {
      if (!user || !replyingToFeedbackId || !newReply.trim()) return;

      const { error } = await supabase
        .from("feedback_replies")
        .insert({
          parent_feedback_id: replyingToFeedbackId,
          user_id: user.id,
          content: newReply.trim()
        });

      if (error) throw error;

      await fetchFeedbacksAndReplies();
      setNewReply("");
      setReplyingToFeedbackId(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  /**
   * @description Handles editing a reply
   * @async
   * @param {string} replyId - ID of the reply to edit
   * @sideEffects Updates reply in database and updates state
   */
  const handleEditReply = async (replyId: string) => {
    try {
      if (!user || !editingReplyContent.trim()) return;

      const { error } = await supabase
        .from("feedback_replies")
        .update({ content: editingReplyContent.trim() })
        .eq("id", replyId)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchFeedbacksAndReplies();
      setEditingReplyId(null);
      setEditingReplyContent("");
    } catch (error) {
      console.error("Error editing reply:", error);
    }
  };

  /**
   * @description Handles deleting a reply
   * @async
   * @param {string} replyId - ID of the reply to delete
   * @sideEffects Deletes reply from database and updates state
   */
  const handleDeleteReply = async (replyId: string) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from("feedback_replies")
        .delete()
        .eq("id", replyId)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchFeedbacksAndReplies();
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  /**
   * @description Toggles the reply form for a feedback
   * @param {string} feedbackId - ID of the feedback to reply to
   */
  const toggleReplyForm = (feedbackId: string) => {
    if (replyingToFeedbackId === feedbackId) {
      setReplyingToFeedbackId(null);
      setNewReply("");
    } else {
      setReplyingToFeedbackId(feedbackId);
      setNewReply("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Project not found!</p>
      </div>
    );
  }

  const categoryDisplay = getCategoryDisplay(project.category);

  return (
    <div className="flex flex-col w-full items-center py-8 px-4 bg-startsnap-candlelight">
      <div className="w-full max-w-4xl">
        {/* Project Header Section */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] leading-tight">
              {project.name}
            </h1>
            {isOwner && (
              <Button
                variant="outline"
                onClick={() => navigate(`/edit/${project.id}`)}
                className="startsnap-button bg-startsnap-white text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Edit Project
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Badge
              className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border-2 ${categoryDisplay.borderColor} px-2 py-1 text-sm font-semibold`}
            >
              {categoryDisplay.name}
            </Badge>
            <Badge
              className="bg-startsnap-athens-gray text-startsnap-ebony-clay border-2 border-gray-800 px-2 py-1 text-sm font-semibold"
            >
              {project.type === "live" ? "Live Project" : "Idea/Concept"}
            </Badge>
            {project.is_hackathon_entry && (
              <Badge
                className="bg-startsnap-wisp-pink text-startsnap-purple-heart border-2 border-purple-700 px-2 py-1 text-sm font-semibold"
              >
                Hackathon Entry
              </Badge>
            )}
          </div>

          {/* Creator info */}
          <div className="flex items-center gap-2 text-startsnap-pale-sky">
            <div className="w-8 h-8">
              <UserAvatar
                name={creatorProfile?.username || "Anonymous"}
                size={32}
                className="w-full h-full"
              />
            </div>
            <span className="font-medium">{creatorProfile?.username || "Anonymous"}</span>
            <span className="text-startsnap-gray-chateau">•</span>
            <span>{formatDetailedDate(project.created_at)}</span>
          </div>
        </div>

        {/* Project Content Sections */}
        <div className="flex flex-col gap-12">
          {/* About Section */}
          <section>
            <h2 className="text-3xl font-bold text-startsnap-ebony-clay mb-6 font-['Space_Grotesk',Helvetica]">
              About
            </h2>

            <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
              <CardContent className="p-6">
                <p className="whitespace-pre-wrap text-startsnap-oxford-blue font-['Roboto',Helvetica] leading-relaxed">
                  {project.description}
                </p>

                {/* Project Links */}
                {(project.live_demo_url || project.demo_video_url) && (
                  <div className="mt-6 space-y-3">
                    <h3 className="font-bold text-xl text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
                      Project Links
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {project.live_demo_url && (
                        <Button
                          className="startsnap-button bg-startsnap-persian-blue text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                          onClick={() => window.open(project.live_demo_url, "_blank")}
                        >
                          View Live Demo
                        </Button>
                      )}
                      {project.demo_video_url && (
                        <Button
                          className="startsnap-button bg-startsnap-mountain-meadow text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                          onClick={() => window.open(project.demo_video_url, "_blank")}
                        >
                          Watch Demo Video
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tools & Tech */}
                {project.tools_used && project.tools_used.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold text-xl text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] mb-2">
                      Tools & Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tools_used.map((tool, index) => (
                        <Badge
                          key={index}
                          className="bg-startsnap-blue-chalk text-startsnap-oxford-blue border border-startsnap-oxford-blue px-2 py-1 text-sm"
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold text-xl text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] mb-2">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="bg-startsnap-athens-gray text-startsnap-oxford-blue border border-startsnap-oxford-blue px-2 py-1 text-sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seeking Feedback On */}
                {project.feedback_tags && project.feedback_tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold text-xl text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica] mb-2">
                      Seeking Feedback On
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.feedback_tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="bg-startsnap-wisp-pink text-startsnap-french-rose border border-startsnap-french-rose px-2 py-1 text-sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Vibe Logs Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
                Vibe Logs
              </h2>
              {isOwner && (
                <Button
                  onClick={() => setIsVibeLogModalOpen(true)}
                  className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                >
                  Add Vibe Log
                </Button>
              )}
            </div>

            {vibeLogs.length === 0 ? (
              <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
                <CardContent className="p-6">
                  <p className="text-center text-startsnap-pale-sky font-['Roboto',Helvetica]">
                    No vibe logs have been posted yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {vibeLogs.map((log) => (
                  <VibeLogEntry
                    key={log.id}
                    vibeLog={log}
                    getVibeLogDisplay={getVibeLogDisplay}
                    formatDate={formatDetailedDate}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Community Feedback Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
                Community Feedback
              </h2>
              {user && (
                <Button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                >
                  Add Feedback
                </Button>
              )}
            </div>

            {/* Feedback List */}
            {feedbacks.length === 0 ? (
              <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
                <CardContent className="p-6">
                  <p className="text-center text-startsnap-pale-sky font-['Roboto',Helvetica]">
                    No feedback has been provided yet. Be the first to give feedback!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="space-y-4">
                    {/* Parent Feedback Card */}
                    <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
                      <CardContent className="p-6">
                        {/* Feedback User Info */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2 text-startsnap-pale-sky">
                            <div className="w-10 h-10">
                              <UserAvatar
                                name={feedback.profiles?.username || userProfiles[feedback.user_id]?.username || "User"}
                                size={40}
                                className="w-full h-full"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-startsnap-ebony-clay">
                                {feedback.profiles?.username || userProfiles[feedback.user_id]?.username || "User"}
                              </div>
                              <div className="text-sm">{formatDetailedDate(feedback.created_at)}</div>
                            </div>
                          </div>

                          {/* Edit/Delete options if user owns this feedback */}
                          {user && user.id === feedback.user_id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-transparent">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4 text-startsnap-pale-sky" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingFeedbackId(feedback.id);
                                    setEditingFeedbackContent(feedback.content);
                                  }}
                                  className="cursor-pointer flex items-center gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteFeedback(feedback.id)}
                                  className="cursor-pointer text-red-600 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        {/* Feedback Content */}
                        {editingFeedbackId === feedback.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editingFeedbackContent}
                              onChange={(e) => setEditingFeedbackContent(e.target.value)}
                              className="border-2 border-solid border-gray-800 rounded-lg p-3 min-h-[100px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingFeedbackId(null);
                                  setEditingFeedbackContent("");
                                }}
                                className="bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937]"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleEditFeedback(feedback.id)}
                                className="bg-startsnap-mountain-meadow text-startsnap-white font-['Roboto',Helvetica] rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937]"
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-startsnap-ebony-clay font-['Roboto',Helvetica] leading-relaxed">
                              {feedback.content}
                            </p>
                            
                            {/* Reply button with message icon and count */}
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => toggleReplyForm(feedback.id)}
                                className="flex items-center gap-1.5 text-startsnap-persian-blue hover:text-startsnap-persian-blue-dark transition-colors"
                                aria-label={`Reply to feedback. ${feedback.replies?.length || 0} existing replies.`}
                              >
                                <MessageCircle size={20} />
                                <span className="font-medium">
                                  {feedback.replies?.length || 0}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Replies Container - Indented and with subtle styling */}
                    {(feedback.replies && feedback.replies.length > 0 || replyingToFeedbackId === feedback.id) && (
                      <div className="ml-8 lg:ml-12 mt-4 pl-4 border-l-2 border-gray-300">
                        {/* Existing Replies */}
                        {feedback.replies && feedback.replies.map((reply, replyIndex) => (
                          <div 
                            key={reply.id} 
                            className={`${replyIndex > 0 ? 'border-t border-gray-200 pt-3 mt-3' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 text-startsnap-pale-sky">
                                <div className="w-8 h-8">
                                  <UserAvatar
                                    name={reply.profiles?.username || userProfiles[reply.user_id]?.username || "User"}
                                    size={32}
                                    className="w-full h-full"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-startsnap-ebony-clay text-sm">
                                    {reply.profiles?.username || userProfiles[reply.user_id]?.username || "User"}
                                  </div>
                                  <div className="text-xs">{formatDetailedDate(reply.created_at)}</div>
                                </div>
                              </div>

                              {/* Edit/Delete options if user owns this reply */}
                              {user && user.id === reply.user_id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-transparent">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4 text-startsnap-pale-sky" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[160px]">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingReplyId(reply.id);
                                        setEditingReplyContent(reply.content);
                                      }}
                                      className="cursor-pointer flex items-center gap-2"
                                    >
                                      <Edit className="h-4 w-4" />
                                      <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteReply(reply.id)}
                                      className="cursor-pointer text-red-600 flex items-center gap-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>

                            {/* Reply Content */}
                            {editingReplyId === reply.id ? (
                              <div className="space-y-3">
                                <Textarea
                                  value={editingReplyContent}
                                  onChange={(e) => setEditingReplyContent(e.target.value)}
                                  className="border-2 border-solid border-gray-800 rounded-lg p-3 min-h-[80px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingReplyId(null);
                                      setEditingReplyContent("");
                                    }}
                                    className="bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] text-sm rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937]"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleEditReply(reply.id)}
                                    className="bg-startsnap-mountain-meadow text-startsnap-white font-['Roboto',Helvetica] text-sm rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937]"
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-startsnap-ebony-clay font-['Roboto',Helvetica] leading-relaxed">
                                {reply.content}
                              </p>
                            )}
                          </div>
                        ))}

                        {/* Reply Form - only shown when replying to this feedback */}
                        {replyingToFeedbackId === feedback.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 flex-shrink-0">
                                <UserAvatar
                                  name={getAvatarName(user, userProfiles[user?.id]?.username)}
                                  size={32}
                                  className="w-full h-full"
                                />
                              </div>
                              <div className="flex-1 space-y-3">
                                <Textarea
                                  value={newReply}
                                  onChange={(e) => setNewReply(e.target.value)}
                                  placeholder="Write your reply..."
                                  className="border-2 border-solid border-gray-800 rounded-lg p-3 w-full min-h-[80px] font-['Roboto',Helvetica] text-startsnap-pale-sky"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setReplyingToFeedbackId(null);
                                      setNewReply("");
                                    }}
                                    className="bg-startsnap-mischka text-startsnap-ebony-clay font-['Roboto',Helvetica] text-sm rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937]"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleAddReply}
                                    disabled={!newReply.trim()}
                                    className="bg-startsnap-mountain-meadow text-startsnap-white font-['Roboto',Helvetica] text-sm rounded-lg border-2 border-solid border-gray-800 shadow-[2px_2px_0px_#1f2937] disabled:opacity-50"
                                  >
                                    Submit Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Separator between feedback threads */}
                    <Separator className="my-6 border-gray-200" />
                  </div>
                ))}
              </div>
            )}

            {/* Login prompt for non-authenticated users */}
            {!user && (
              <div className="mt-6 text-center">
                <p className="text-startsnap-pale-sky mb-4 font-['Roboto',Helvetica]">
                  Sign in to join the conversation and provide feedback!
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Add Vibe Log Modal */}
      {isVibeLogModalOpen && (
        <AddVibeLogModal
          isOpen={isVibeLogModalOpen}
          onClose={() => setIsVibeLogModalOpen(false)}
          projectId={project.id}
          onSuccess={fetchProjectDetails}
        />
      )}

      {/* Add Feedback Modal */}
      {isFeedbackModalOpen && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          projectId={project.id}
          onSuccess={fetchFeedbacksAndReplies}
        />
      )}
    </div>
  );
};