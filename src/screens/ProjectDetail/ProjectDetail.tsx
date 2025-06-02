/**
 * src/screens/ProjectDetail/ProjectDetail.tsx
 * @description Component for displaying detailed project information and interactions
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { supabase } from "../../lib/supabase";
import { MoreHorizontal, MessageCircle } from "lucide-react";
import { FaGithub, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { getCategoryDisplay, getVibeLogDisplay } from "../../config/categories";
import { formatDetailedDate } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { UserAvatar, getAvatarName } from "../../components/ui/user-avatar";
import { VibeLogEntry } from "../../components/ui/vibe-log-entry";
import { AddVibeLogModal } from "../../components/ui/add-vibe-log-modal";
import { FeedbackModal } from "../../components/ui/FeedbackModal";

/**
 * @description Component for displaying detailed project information
 * @returns {JSX.Element} Project detail page with project info and interactions
 */
export const ProjectDetail = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [vibeLogs, setVibeLogs] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isVibeLogModalOpen, setIsVibeLogModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [editingFeedbackContent, setEditingFeedbackContent] = useState("");
  const [replyingToFeedbackId, setReplyingToFeedbackId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('startsnaps')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      setProject(projectData);

      // Fetch creator profile
      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', projectData.user_id)
        .single();

      if (creatorError) throw creatorError;

      setCreator(creatorData);

      // Fetch vibe logs
      const { data: vibeLogsData, error: vibeLogsError } = await supabase
        .from('vibelogs')
        .select('*')
        .eq('startsnap_id', id)
        .order('created_at', { ascending: false });

      if (vibeLogsError) throw vibeLogsError;

      setVibeLogs(vibeLogsData || []);

      // Fetch feedbacks with replies
      const { data: feedbacksData, error: feedbacksError } = await supabase
        .from('feedbacks')
        .select(`
          *,
          profiles!feedbacks_user_id_fkey(username),
          replies:feedback_replies(
            *,
            profiles!feedback_replies_user_id_fkey(username)
          )
        `)
        .eq('startsnap_id', id)
        .order('created_at', { ascending: false });

      if (feedbacksError) throw feedbacksError;

      setFeedbacks(feedbacksData || []);
    } catch (error) {
      console.error('Error fetching project details:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFeedback = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({ content: editingFeedbackContent })
        .eq('id', feedbackId);

      if (error) throw error;

      setEditingFeedbackId(null);
      setEditingFeedbackContent("");
      fetchProjectDetails();
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;

      fetchProjectDetails();
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyingToFeedbackId || !replyContent.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('feedback_replies')
        .insert({
          parent_feedback_id: replyingToFeedbackId,
          user_id: user.id,
          content: replyContent
        });

      if (error) throw error;

      setReplyingToFeedbackId(null);
      setReplyContent("");
      fetchProjectDetails();
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      const { error } = await supabase
        .from('feedback_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;

      fetchProjectDetails();
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Loading project details...</p>
      </div>
    );
  }

  if (!project || !creator) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-startsnap-candlelight">
        <p className="text-xl font-bold text-startsnap-ebony-clay">Project not found</p>
      </div>
    );
  }

  const isOwner = user?.id === project.user_id;
  const categoryDisplay = getCategoryDisplay(project.category);

  return (
    <div className="flex flex-col w-full items-center gap-8 pt-8 pb-24 px-8 bg-startsnap-candlelight">
      {/* Project Header */}
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
            {project.name}
          </h1>
          {isOwner && (
            <Button
              onClick={() => navigate(`/edit/${project.id}`)}
              className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
            >
              Edit Project
            </Button>
          )}
        </div>

        {/* Project Info Card */}
        <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Creator Info */}
              <div className="flex flex-col items-center min-w-[250px]">
                <div className="w-24 h-24">
                  <UserAvatar
                    name={getAvatarName({ id: project.user_id }, creator.username)}
                    size={96}
                    className="w-full h-full"
                  />
                </div>
                <h3 className="mt-4 text-xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
                  {creator.username}
                </h3>

                {/* Social Links */}
                <div className="flex gap-4 mt-4">
                  {creator.github_url && (
                    <a
                      href={creator.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-startsnap-ebony-clay hover:text-startsnap-french-rose transition-colors"
                      aria-label="GitHub Profile"
                    >
                      <FaGithub size={24} />
                    </a>
                  )}
                  {creator.twitter_url && (
                    <a
                      href={creator.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-startsnap-ebony-clay hover:text-startsnap-french-rose transition-colors"
                      aria-label="Twitter Profile"
                    >
                      <FaXTwitter size={24} />
                    </a>
                  )}
                  {creator.linkedin_url && (
                    <a
                      href={creator.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-startsnap-ebony-clay hover:text-startsnap-french-rose transition-colors"
                      aria-label="LinkedIn Profile"
                    >
                      <FaLinkedinIn size={24} />
                    </a>
                  )}
                </div>
              </div>

              {/* Project Details */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    className={`${categoryDisplay.bgColor} ${categoryDisplay.textColor} border-2 border-solid ${categoryDisplay.borderColor}`}
                  >
                    {categoryDisplay.name}
                  </Badge>
                  {project.is_hackathon_entry && (
                    <Badge className="bg-startsnap-wisp-pink text-startsnap-french-rose border-2 border-solid border-startsnap-french-rose">
                      Hackathon Entry
                    </Badge>
                  )}
                </div>

                <p className="text-startsnap-pale-sky mb-6 font-['Roboto',Helvetica]">
                  {project.description}
                </p>

                {project.tools_used && project.tools_used.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-startsnap-ebony-clay mb-2 font-['Space_Grotesk',Helvetica]">
                      Tools Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tools_used.map((tool: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-startsnap-athens-gray text-startsnap-pale-sky border-2 border-solid border-gray-800"
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-startsnap-ebony-clay mb-2 font-['Space_Grotesk',Helvetica]">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-startsnap-athens-gray text-startsnap-pale-sky border-2 border-solid border-gray-800"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {project.feedback_tags && project.feedback_tags.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-startsnap-ebony-clay mb-2 font-['Space_Grotesk',Helvetica]">
                      Looking for Feedback On
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.feedback_tags.map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-startsnap-athens-gray text-startsnap-pale-sky border-2 border-solid border-gray-800"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Links */}
        {(project.live_demo_url || project.demo_video_url) && (
          <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] mb-8">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-startsnap-ebony-clay mb-4 font-['Space_Grotesk',Helvetica]">
                Project Links
              </h3>
              <div className="flex flex-col gap-4">
                {project.live_demo_url && (
                  <a
                    href={project.live_demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-startsnap-persian-blue hover:text-startsnap-french-rose transition-colors font-['Roboto',Helvetica]"
                  >
                    <span className="material-icons">launch</span>
                    Live Demo
                  </a>
                )}
                {project.demo_video_url && (
                  <a
                    href={project.demo_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-startsnap-persian-blue hover:text-startsnap-french-rose transition-colors font-['Roboto',Helvetica]"
                  >
                    <span className="material-icons">play_circle</span>
                    Demo Video
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vibe Log Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
              Vibe Log
            </h3>
            {isOwner && (
              <Button
                onClick={() => setIsVibeLogModalOpen(true)}
                className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Add Vibe Log
              </Button>
            )}
          </div>

          {vibeLogs.length > 0 ? (
            <div className="space-y-4">
              {vibeLogs.map((log) => (
                <VibeLogEntry
                  key={log.id}
                  log={log}
                  isOwner={isOwner}
                  onDelete={async () => {
                    if (window.confirm('Are you sure you want to delete this vibe log?')) {
                      try {
                        const { error } = await supabase
                          .from('vibelogs')
                          .delete()
                          .eq('id', log.id);

                        if (error) throw error;

                        fetchProjectDetails();
                      } catch (error) {
                        console.error('Error deleting vibe log:', error);
                      }
                    }
                  }}
                  getVibeLogDisplay={getVibeLogDisplay}
                  formatDetailedDate={formatDetailedDate}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] p-8">
              <p className="text-center text-startsnap-pale-sky font-['Roboto',Helvetica]">
                No vibe logs yet
              </p>
            </Card>
          )}
        </div>

        {/* Community Feedback Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
              Community Feedback
            </h3>
            {user && !isOwner && (
              <Button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="startsnap-button bg-startsnap-french-rose text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
              >
                Give Feedback
              </Button>
            )}
          </div>

          {feedbacks.length > 0 ? (
            <div className="space-y-6">
              {feedbacks.map((feedback) => (
                <div key={feedback.id}>
                  {/* Parent Feedback Card */}
                  <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <UserAvatar
                            name={getAvatarName({ id: feedback.user_id }, feedback.profiles?.username)}
                            size={40}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
                                {feedback.profiles?.username}
                              </span>
                              <span className="text-sm text-startsnap-pale-sky font-['Roboto',Helvetica]">
                                {formatDetailedDate(feedback.created_at)}
                              </span>
                            </div>
                            {editingFeedbackId === feedback.id ? (
                              <div className="mt-2">
                                <Textarea
                                  value={editingFeedbackContent}
                                  onChange={(e) => setEditingFeedbackContent(e.target.value)}
                                  className="mb-2"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleEditFeedback(feedback.id)}
                                    className="startsnap-button bg-startsnap-mountain-meadow text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setEditingFeedbackId(null);
                                      setEditingFeedbackContent("");
                                    }}
                                    variant="outline"
                                    className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-2 text-startsnap-ebony-clay font-['Roboto',Helvetica]">
                                {feedback.content}
                              </p>
                            )}
                          </div>
                        </div>

                        {user?.id === feedback.user_id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-startsnap-mischka/50"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingFeedbackId(feedback.id);
                                  setEditingFeedbackContent(feedback.content);
                                }}
                                className="cursor-pointer hover:bg-startsnap-mischka/50"
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteFeedback(feedback.id)}
                                className="cursor-pointer text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {/* Reply Button */}
                      {user && (
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() => setReplyingToFeedbackId(feedback.id)}
                            className="flex items-center gap-2 text-startsnap-pale-sky hover:text-startsnap-french-rose transition-colors"
                            aria-label={`Reply to feedback (${feedback.replies?.length || 0} replies)`}
                          >
                            <MessageCircle size={20} />
                            <span>{feedback.replies?.length || 0}</span>
                          </button>
                        </div>
                      )}

                      {/* Reply Form */}
                      {replyingToFeedbackId === feedback.id && (
                        <div className="mt-4">
                          <Textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write your reply..."
                            className="mb-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSubmitReply}
                              className="startsnap-button bg-startsnap-mountain-meadow text-startsnap-white font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                            >
                              Submit Reply
                            </Button>
                            <Button
                              onClick={() => {
                                setReplyingToFeedbackId(null);
                                setReplyContent("");
                              }}
                              variant="outline"
                              className="startsnap-button bg-gray-200 text-startsnap-ebony-clay font-['Roboto',Helvetica] font-bold rounded-lg border-2 border-solid border-gray-800 shadow-[3px_3px_0px_#1f2937]"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {feedback.replies && feedback.replies.length > 0 && (
                        <div className="mt-4 pl-12 space-y-4">
                          {feedback.replies.map((reply: any) => (
                            <div key={reply.id} className="flex items-start gap-4">
                              <UserAvatar
                                name={getAvatarName({ id: reply.user_id }, reply.profiles?.username)}
                                size={32}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-startsnap-ebony-clay font-['Space_Grotesk',Helvetica]">
                                    {reply.profiles?.username}
                                  </span>
                                  <span className="text-sm text-startsnap-pale-sky font-['Roboto',Helvetica]">
                                    {formatDetailedDate(reply.created_at)}
                                  </span>
                                </div>
                                <p className="mt-1 text-startsnap-ebony-clay font-['Roboto',Helvetica]">
                                  {reply.content}
                                </p>
                              </div>

                              {user?.id === reply.user_id && (
                                <Button
                                  variant="ghost"
                                  onClick={() => handleDeleteReply(reply.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                >
                                  <span className="material-icons text-sm">delete</span>
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Separator className="my-6" />
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-startsnap-white rounded-xl overflow-hidden border-[3px] border-solid border-gray-800 shadow-[5px_5px_0px_#1f2937] p-8">
              <p className="text-center text-startsnap-pale-sky font-['Roboto',Helvetica]">
                No feedback yet
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddVibeLogModal
        isOpen={isVibeLogModalOpen}
        onClose={() => setIsVibeLogModalOpen(false)}
        onSubmit={async (formData) => {
          try {
            const { error } = await supabase
              .from('vibelogs')
              .insert({
                startsnap_id: project.id,
                log_type: formData.type,
                title: formData.title,
                content: formData.content
              });

            if (error) throw error;

            setIsVibeLogModalOpen(false);
            fetchProjectDetails();
          } catch (error) {
            console.error('Error adding vibe log:', error);
          }
        }}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={async (content) => {
          try {
            const { error } = await supabase
              .from('feedbacks')
              .insert({
                startsnap_id: project.id,
                user_id: user?.id,
                content
              });

            if (error) throw error;

            setIsFeedbackModalOpen(false);
            fetchProjectDetails();
          } catch (error) {
            console.error('Error adding feedback:', error);
          }
        }}
      />
    </div>
  );
};