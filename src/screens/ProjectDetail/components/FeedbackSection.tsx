/**
 * src/screens/ProjectDetail/components/FeedbackSection.tsx
 * @description Component for displaying and managing community feedback and replies for a StartSnap project.
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { formatDetailedDate } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Textarea } from '../../../components/ui/textarea';
import { UserAvatar, getAvatarName } from '../../../components/ui/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { MoreHorizontal, MessageSquare, Edit, Trash2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { UserProfileData } from '../../../types/user';
import type { FeedbackEntry, FeedbackReply } from '../../../types/feedback'; // Import feedback types
import { Link } from 'react-router-dom';
import { toast } from "sonner";
import { ConfirmationDialog } from "../../../components/ui/confirmation-dialog";

/**
 * @description Props for the FeedbackSection component.
 * @param startsnapId - The ID of the current StartSnap project.
 * @param initialFeedbackEntries - The initial list of feedback entries.
 * @param currentUser - The currently authenticated Supabase user object, or null.
 * @param currentUserProfile - The profile of the current user (username), or null.
 * @param onFeedbackChange - Callback to refresh feedback data in the parent component.
 */
interface FeedbackSectionProps {
  startsnapId: string;
  initialFeedbackEntries: FeedbackEntry[];
  currentUser: User | null;
  currentUserProfile: Pick<UserProfileData, 'username'> | null; // Use Pick<UserProfileData, 'username'>
  onFeedbackChange: () => Promise<void>;
}

/**
 * @description Section component for managing and displaying community feedback.
 * @param {FeedbackSectionProps} props - The props for the component.
 * @returns {JSX.Element} The Feedback section.
 */
export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  startsnapId,
  initialFeedbackEntries,
  currentUser,
  currentUserProfile,
  onFeedbackChange,
}) => {
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>(initialFeedbackEntries);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingFeedback, setEditingFeedback] = useState<FeedbackEntry | null>(null);
  const [inlineEditFeedbackContent, setInlineEditFeedbackContent] = useState('');

  const [replyingToFeedbackId, setReplyingToFeedbackId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingReply, setEditingReply] = useState<FeedbackReply | null>(null);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Confirmation dialog states
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [isDeletingFeedback, setIsDeletingFeedback] = useState(false);
  const [isDeletingReply, setIsDeletingReply] = useState(false);

  useEffect(() => {
    setFeedbackEntries(initialFeedbackEntries);
  }, [initialFeedbackEntries]);

  /**
   * @description Handles submission of new feedback.
   * @async
   * @param data - Object containing the feedback content.
   * @sideEffects Makes a Supabase insert call, then calls onFeedbackChange.
   */
  const handleFeedbackSubmit = async (data: { content: string }) => {
    if (!currentUser) {
      toast.error('Authentication Required', {
        description: 'You need to be logged in to submit feedback.'
      });
      return;
    }
    if (!startsnapId) return;

    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert({
          startsnap_id: startsnapId,
          user_id: currentUser.id,
          content: data.content,
        });
      if (error) throw error;
      toast.success('Feedback Submitted!', {
        description: 'Thank you for your feedback on this project.'
      });
      await onFeedbackChange();
      setFeedbackContent(''); // Clear main submission form
      setSubmissionError(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmissionError('Failed to submit feedback. Please try again.');
      toast.error('Submission Failed', {
        description: 'Failed to submit feedback. Please try again.'
      });
      // Re-throw to allow caller to handle UI updates if needed
      throw error;
    }
  };

  /**
   * @description Initiates editing of a feedback entry.
   * @param {FeedbackEntry} feedback - The feedback entry to edit.
   */
  const handleEditFeedback = (feedback: FeedbackEntry) => {
    setEditingFeedback(feedback);
    setInlineEditFeedbackContent(feedback.content);
    // Close reply form if it was open for this feedback
    if (replyingToFeedbackId === feedback.id) {
        handleCancelReply();
    }
  };

  /**
   * @description Handles updating an existing feedback entry.
   * @async
   * @sideEffects Makes a Supabase update call, then calls onFeedbackChange.
   */
  const handleUpdateFeedback = async () => {
    if (!editingFeedback || !currentUser) return;
    if (!inlineEditFeedbackContent.trim()) {
      toast.error('Missing Content', {
        description: 'Feedback content cannot be empty.'
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({
          content: inlineEditFeedbackContent,
          updated_at: new Date(),
        })
        .eq('id', editingFeedback.id);
      if (error) throw error;
      toast.success('Feedback Updated!', {
        description: 'Your changes have been saved successfully.'
      });
      await onFeedbackChange();
      setEditingFeedback(null);
      setInlineEditFeedbackContent('');
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Update Failed', {
        description: 'Failed to update feedback. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * @description Shows confirmation dialog for feedback deletion
   * @param {string} feedbackId - The ID of the feedback to delete
   */
  const handleDeleteFeedback = (feedbackId: string) => {
    setDeletingFeedbackId(feedbackId);
  };

  /**
   * @description Confirms and executes feedback deletion
   * @async
   * @sideEffects Makes a Supabase delete call, then calls onFeedbackChange
   */
  const confirmDeleteFeedback = async () => {
    if (!deletingFeedbackId) return;

    setIsDeletingFeedback(true);
    try {
      // Also delete associated replies first (or set up cascade delete in DB)
      const { error: repliesError } = await supabase
          .from('feedback_replies')
          .delete()
          .eq('parent_feedback_id', deletingFeedbackId);
      if (repliesError) {
          console.error('Error deleting associated replies:', repliesError);
          // Decide if you want to proceed or alert user
      }

      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', deletingFeedbackId);
      if (error) throw error;

      toast.success('Feedback Deleted', {
        description: 'The feedback has been permanently removed.'
      });
      await onFeedbackChange();
      setDeletingFeedbackId(null);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Delete Failed', {
        description: 'Failed to delete feedback. Please try again.'
      });
    } finally {
      setIsDeletingFeedback(false);
    }
  };

  /**
   * @description Handles submission of a new reply to feedback.
   * @async
   * @sideEffects Makes a Supabase insert call, then calls onFeedbackChange.
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
          content: replyContent,
        });
      if (error) throw error;
      await onFeedbackChange();
      setReplyContent('');
      // Keep replyingToFeedbackId to show replies, or set to null to close form
      // For now, let's keep it open to see the new reply.
      // If you want to close the reply box after submission: setReplyingToFeedbackId(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
      setReplyError('Failed to submit reply. Please try again.');
    } finally {
      setReplySubmitting(false);
    }
  };

  /**
   * @description Initiates editing of a feedback reply.
   * @param {FeedbackReply} reply - The reply to edit.
   */
  const handleEditReply = (reply: FeedbackReply) => {
    setEditingFeedback(null); // Ensure main feedback edit is closed
    setEditingReply(reply);
    setReplyingToFeedbackId(reply.parent_feedback_id); // Keep reply area open
    setReplyContent(reply.content);
    setReplyError(null); // Clear any previous errors
  };

  /**
   * @description Cancels the current inline reply edit action.
   */
  const handleCancelEditReply = () => {
    setEditingReply(null);
    setReplyContent(''); // Clear content for safety, new reply form will re-init if opened
    setReplyError(null);
  };

  const handleUpdateReply = async () => {
    if (!currentUser || !editingReply) return;
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
          updated_at: new Date(),
        })
        .eq('id', editingReply.id);
      if (error) throw error;
      await onFeedbackChange(); // This should re-fetch and re-render
      setEditingReply(null); // Exit inline edit mode
      setReplyContent(''); // Clear the reply content to prevent showing old content in new reply form
    } catch (error) {
      console.error('Error updating reply:', error);
      setReplyError('Failed to update reply. Please try again.');
    } finally {
      setReplySubmitting(false);
    }
  };

  /**
   * @description Shows confirmation dialog for reply deletion
   * @param {string} replyId - The ID of the reply to delete
   */
  const handleDeleteReply = (replyId: string) => {
    setDeletingReplyId(replyId);
  };

  /**
   * @description Confirms and executes reply deletion
   * @async
   * @sideEffects Makes a Supabase delete call, then calls onFeedbackChange
   */
  const confirmDeleteReply = async () => {
    if (!deletingReplyId) return;

    setIsDeletingReply(true);
    try {
      const { error } = await supabase
        .from('feedback_replies')
        .delete()
        .eq('id', deletingReplyId);
      if (error) throw error;

      toast.success('Reply Deleted', {
        description: 'The reply has been permanently removed.'
      });
      await onFeedbackChange();
      setDeletingReplyId(null);
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Delete Failed', {
        description: 'Failed to delete reply. Please try again.'
      });
    } finally {
      setIsDeletingReply(false);
    }
  };

  /**
   * @description Cancels the current reply or edit reply action.
   */
  const handleCancelReply = () => {
    setReplyingToFeedbackId(null);
    setReplyContent('');
    setEditingReply(null);
    setReplyError(null);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center mb-4 md:mb-6">
        <h2 className="font-heading text-startsnap-ebony-clay text-2xl leading-8">
          Community Feedback
        </h2>
        <span className="ml-1 text-startsnap-mountain-meadow text-2xl material-icons">
          groups
        </span>
      </div>
      {feedbackEntries.length > 0 ? (
        feedbackEntries.map((feedback) => (
          <div key={feedback.id} className="mb-4 md:mb-6">
            {editingFeedback && editingFeedback.id === feedback.id ? (
              <Card className="startsnap-form-card">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      {/* FEEDBACK AVATAR LINK */}
                      {(feedback.profile?.username && feedback.profile.username !== 'Anonymous') ? (
                        <Link to={`/profiles/${feedback.profile.username}`} className="w-10 h-10 flex-shrink-0 hover:opacity-80 transition-opacity duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-full">
                          <UserAvatar
                            name={getAvatarName(null, feedback.profile.username)}
                            size={40}
                            className="w-full h-full"
                          />
                        </Link>
                      ) : (
                        <div className="w-10 h-10 flex-shrink-0">
                          <UserAvatar
                            name={getAvatarName(null, feedback.profile?.username || 'Anonymous')}
                            size={40}
                            className="w-full h-full"
                          />
                        </div>
                      )}
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-ui text-gray-900 text-base leading-6">
                            {feedback.profile?.username || 'Anonymous'}
                          </p>
                          <p className="font-body text-gray-500 text-xs leading-4">
                            {formatDetailedDate(feedback.created_at)} (Editing)
                          </p>
                        </div>
                      </div>
                    </div>
                    {currentUser && currentUser.id === feedback.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditFeedback(feedback)}
                            className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteFeedback(feedback.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <Textarea
                    placeholder="Edit your feedback..."
                    className="startsnap-form-textarea"
                    value={inlineEditFeedbackContent}
                    onChange={(e) => setInlineEditFeedbackContent(e.target.value)}
                  />
                  <div className="startsnap-form-actions">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingFeedback(null);
                        setInlineEditFeedbackContent('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleUpdateFeedback}
                      disabled={!inlineEditFeedbackContent.trim() || isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card
                className="bg-transparent border-0 shadow-none rounded-none p-0 md:bg-startsnap-white md:rounded-xl md:overflow-hidden md:border-2 md:border-solid md:border-gray-800 md:shadow-[3px_3px_0px_#1f2937]"
              >
                <CardContent className="p-0 md:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      {/* FEEDBACK AVATAR LINK */}
                      {(feedback.profile?.username && feedback.profile.username !== 'Anonymous') ? (
                        <Link to={`/profiles/${feedback.profile.username}`} className="w-10 h-10 flex-shrink-0 hover:opacity-80 transition-opacity duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-startsnap-french-rose rounded-full">
                          <UserAvatar
                            name={getAvatarName(null, feedback.profile.username)}
                            size={40}
                            className="w-full h-full"
                          />
                        </Link>
                      ) : (
                        <div className="w-10 h-10 flex-shrink-0">
                          <UserAvatar
                            name={getAvatarName(null, feedback.profile?.username || 'Anonymous')}
                            size={40}
                            className="w-full h-full"
                          />
                        </div>
                      )}
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-ui text-startsnap-oxford-blue text-base leading-6">
                            {feedback.profile?.username || 'Anonymous'}
                          </p>
                          <p className="font-body text-startsnap-pale-sky text-xs leading-4">
                            {formatDetailedDate(feedback.created_at)}{editingFeedback && editingFeedback.id === feedback.id ? ' (Editing)' : ''}
                          </p>
                        </div>
                        <p className="font-body text-startsnap-river-bed text-sm leading-5 mt-2">
                          {feedback.content}
                        </p>
                      </div>
                    </div>
                    {currentUser && currentUser.id === feedback.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditFeedback(feedback)}
                            className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteFeedback(feedback.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {currentUser && (
                    <div className="mt-3 flex">
                      <button
                        type="button"
                        onClick={() => {
                          if (editingFeedback && editingFeedback.id === feedback.id) return; // Don't allow reply if editing main feedback
                          if (replyingToFeedbackId === feedback.id) {
                            handleCancelReply();
                          } else {
                            setReplyingToFeedbackId(feedback.id);
                            setReplyContent('');
                            setEditingReply(null); // Ensure not in edit mode for a new reply
                          }
                        }}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-startsnap-french-rose cursor-pointer p-1 rounded-md hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-startsnap-french-rose"
                        aria-label={`Reply to feedback from ${feedback.profile?.username || 'Anonymous'}`}
                      >
                        <MessageSquare size={16} />
                        <span>{feedback.replies?.length || 0}</span>
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {replyingToFeedbackId === feedback.id && !editingFeedback && (
              <div className="ml-8 lg:ml-12 my-4 relative">
                <div className="absolute left-[-20px] top-0 bottom-0 w-0.5 bg-gray-300 lg:left-[-28px]"></div>

                {/* Form for ADDING a NEW reply - only show if not editing an existing reply inline */}
                {currentUser && !editingReply && (
                  <div className={`pb-3 mb-3 ${feedback.replies && feedback.replies.length > 0 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-start gap-3 p-0 bg-transparent md:p-3 md:bg-gray-50 md:rounded-lg md:border md:border-gray-200">
                      <div className="w-8 h-8 flex-shrink-0">
                        <UserAvatar
                          name={getAvatarName(currentUser, currentUserProfile?.username)}
                          size={32}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <Textarea
                          placeholder={'Write your reply...'} // Placeholder for new reply
                          className="startsnap-reply-textarea"
                          value={replyContent} // This replyContent is for the NEW reply
                          onChange={(e) => {
                            setReplyContent(e.target.value);
                            setReplyError(null);
                          }}
                          disabled={replySubmitting}
                        />
                        {replyError && (
                          <p className="text-red-500 text-sm mb-2">{replyError}</p>
                        )}
                        <div className="startsnap-form-actions">
                          <Button
                            variant="secondary"
                            onClick={handleCancelReply} // This closes the entire reply section
                            disabled={replySubmitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            onClick={handleReplySubmit} // Submits a NEW reply
                            disabled={replySubmitting || !replyContent.trim()}
                          >
                            {replySubmitting ? 'Replying...' : 'Reply'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* List of existing replies */}
                {feedback.replies && feedback.replies.length > 0 && (
                  <div className={`space-y-3 ${currentUser && !editingReply ? '' : 'pt-3'}`}> {/* Add padding-top if new reply form is hidden */}
                    {feedback.replies.map((reply, replyIndex) => (
                      // Check if THIS reply is being edited inline
                      editingReply && editingReply.id === reply.id ? (
                        <div key={reply.id} className={` ${replyIndex > 0 ? 'mt-3 border-t border-gray-200' : ''} pt-3`}>
                          <div className="flex items-start gap-3 p-0 bg-transparent md:p-3 md:bg-gray-100 md:rounded-lg md:border-2 md:border-gray-800"> {/* Edit form styling */}
                            {/* REPLY AVATAR/NAME LINK */}
                            {(reply.profile?.username && reply.profile.username !== 'Anonymous') ? (
                              <div className="flex items-start">
                                <Link to={`/profiles/${reply.profile.username}`} className="w-8 h-8 flex-shrink-0 group hover:text-startsnap-french-rose transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-startsnap-french-rose">
                                  <UserAvatar
                                    name={getAvatarName(null, reply.profile.username)}
                                    size={32}
                                    className="w-full h-full"
                                  />
                                </Link>
                                <div className="ml-3 flex-1">
                                  <div className="flex items-center">
                                    <div className="flex items-center">
                                      <p className="font-ui text-startsnap-oxford-blue text-sm leading-5 group-hover:text-startsnap-french-rose">
                                        {reply.profile.username}
                                      </p>
                                      <p className="ml-2 font-body text-startsnap-pale-sky text-xs leading-4 group-hover:text-startsnap-french-rose">
                                        {formatDetailedDate(reply.created_at)}
                                      </p>
                                    </div>
                                    {currentUser && currentUser.id === reply.user_id && (
                                      <div className="ml-auto">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                              <span className="sr-only">Open menu</span>
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              onClick={() => handleEditReply(reply)}
                                              className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                                            >
                                              <Edit className="mr-2 h-4 w-4" />
                                              Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => handleDeleteReply(reply.id)}
                                              className="text-red-600 hover:bg-red-50"
                                            >
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start">
                                <div className="w-8 h-8 flex-shrink-0">
                                  <UserAvatar
                                    name={getAvatarName(null, reply.profile?.username || 'Anonymous')}
                                    size={32}
                                    className="w-full h-full"
                                  />
                                </div>
                                <div className="ml-3 flex-1">
                                  <div className="flex items-center">
                                    <div className="flex items-center">
                                      <p className="font-ui text-startsnap-oxford-blue text-sm leading-5 group-hover:text-startsnap-french-rose">
                                        {reply.profile?.username || 'Anonymous'}
                                      </p>
                                      <p className="ml-2 font-body text-startsnap-pale-sky text-xs leading-4 group-hover:text-startsnap-french-rose">
                                        {formatDetailedDate(reply.created_at)}
                                      </p>
                                    </div>
                                    {currentUser && currentUser.id === reply.user_id && (
                                      <div className="ml-auto">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                              <span className="sr-only">Open menu</span>
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              onClick={() => handleEditReply(reply)}
                                              className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                                            >
                                              <Edit className="mr-2 h-4 w-4" />
                                              Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => handleDeleteReply(reply.id)}
                                              className="text-red-600 hover:bg-red-50"
                                            >
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="ml-3 flex-1"> {/* Ensure ml-3 if avatar is present */}
                              <Textarea
                                placeholder="Edit your reply..."
                                className="startsnap-reply-textarea"
                                value={replyContent} // Bound to the content of the reply being edited
                                onChange={(e) => {
                                  setReplyContent(e.target.value);
                                  setReplyError(null); // Clear error specific to this form
                                }}
                                disabled={replySubmitting}
                              />
                              {replyError && ( // Show specific reply error if any
                                <p className="text-red-500 text-sm mb-2">{replyError}</p>
                              )}
                              <div className="startsnap-form-actions mt-2">
                                <Button
                                  variant="secondary"
                                  onClick={handleCancelEditReply} // Cancel for INLINE EDIT
                                  disabled={replySubmitting}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="primary"
                                  onClick={handleUpdateReply} // Update for INLINE EDIT
                                  disabled={replySubmitting || !replyContent.trim()}
                                >
                                  {replySubmitting ? 'Updating...' : 'Update Reply'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Normal display of the reply
                        <div
                          key={reply.id}
                          className={`pt-3 ${replyIndex > 0 ? 'mt-3 border-t border-gray-200' : '' }`}
                        >
                          {/* REPLY AVATAR/NAME LINK */}
                          {(reply.profile?.username && reply.profile.username !== 'Anonymous') ? (
                            <div className="flex items-start">
                              <Link to={`/profiles/${reply.profile.username}`} className="w-8 h-8 flex-shrink-0 group hover:text-startsnap-french-rose transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-startsnap-french-rose">
                                <UserAvatar
                                  name={getAvatarName(null, reply.profile.username)}
                                  size={32}
                                  className="w-full h-full"
                                />
                              </Link>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center">
                                  <div className="flex items-center">
                                    <p className="font-ui text-startsnap-oxford-blue text-sm leading-5 group-hover:text-startsnap-french-rose">
                                      {reply.profile.username}
                                    </p>
                                    <p className="ml-2 font-body text-startsnap-pale-sky text-xs leading-4 group-hover:text-startsnap-french-rose">
                                      {formatDetailedDate(reply.created_at)}
                                    </p>
                                  </div>
                                  {currentUser && currentUser.id === reply.user_id && (
                                    <div className="ml-auto">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => handleEditReply(reply)}
                                            className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                                          >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleDeleteReply(reply.id)}
                                            className="text-red-600 hover:bg-red-50"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  )}
                                </div>
                                <p className="font-body text-startsnap-river-bed text-sm leading-5 mt-1 group-hover:text-startsnap-french-rose">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start">
                              <div className="w-8 h-8 flex-shrink-0">
                                <UserAvatar
                                  name={getAvatarName(null, reply.profile?.username || 'Anonymous')}
                                  size={32}
                                  className="w-full h-full"
                                />
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="flex items-center">
                                  <div className="flex items-center">
                                    <p className="font-ui text-startsnap-oxford-blue text-sm leading-5 group-hover:text-startsnap-french-rose">
                                      {reply.profile?.username || 'Anonymous'}
                                    </p>
                                    <p className="ml-2 font-body text-startsnap-pale-sky text-xs leading-4 group-hover:text-startsnap-french-rose">
                                      {formatDetailedDate(reply.created_at)}
                                    </p>
                                  </div>
                                  {currentUser && currentUser.id === reply.user_id && (
                                    <div className="ml-auto">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => handleEditReply(reply)}
                                            className="text-startsnap-oxford-blue hover:bg-startsnap-french-rose/10"
                                          >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleDeleteReply(reply.id)}
                                            className="text-red-600 hover:bg-red-50"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  )}
                                </div>
                                <p className="font-body text-startsnap-river-bed text-sm leading-5 mt-1 group-hover:text-startsnap-french-rose">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <>
          <p className="font-body text-startsnap-pale-sky text-base leading-6">
            No feedback yet. Be the first to share your thoughts!
          </p>
        </>
      )}

      <div className="mt-8">
        <h3 className="font-subheading text-gray-900 text-xl leading-7 mb-5">
          Leave Your Feedback
        </h3>
        <div className="bg-transparent p-0 md:bg-white md:rounded-lg md:p-6 md:border-2 md:border-gray-800 md:shadow-[3px_3px_0px_#1f2937]">
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
                placeholder={currentUser ? 'Share your thoughts, suggestions, or bug reports...' : 'Please log in to leave feedback'}
                className="startsnap-form-textarea"
                value={feedbackContent}
                onChange={(e) => {
                  setFeedbackContent(e.target.value);
                  setSubmissionError(null);
                }}
                disabled={!currentUser || isSubmitting}
              />
              {submissionError && (
                <p className="text-red-500 text-sm mb-3">{submissionError}</p>
              )}
              <div className="flex justify-end mt-3">
                <Button
                  variant="primary"
                  size="lg"
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
                      // feedbackContent is cleared within handleFeedbackSubmit on success
                    } catch (error) {
                      // submissionError is set within handleFeedbackSubmit on error
                      // No need to set it again here unless for a different message
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
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={deletingFeedbackId !== null}
        onClose={() => setDeletingFeedbackId(null)}
        onConfirm={confirmDeleteFeedback}
        title="Delete Feedback"
        description="Are you sure you want to delete this feedback? This action cannot be undone and will also delete all replies to this feedback."
        confirmText="Delete Feedback"
        isLoading={isDeletingFeedback}
        type="danger"
      />

      <ConfirmationDialog
        isOpen={deletingReplyId !== null}
        onClose={() => setDeletingReplyId(null)}
        onConfirm={confirmDeleteReply}
        title="Delete Reply"
        description="Are you sure you want to delete this reply? This action cannot be undone."
        confirmText="Delete Reply"
        isLoading={isDeletingReply}
        type="danger"
      />
    </div>
  );
};