/**
 * src/components/ui/feedback-replies.tsx
 * @description Component for displaying replies to a feedback item with proper indentation and styling
 */

import React from 'react';
import { UserAvatar } from './user-avatar';
import { Button } from './button';
import { Textarea } from './textarea';
import { formatDetailedDate } from '../../lib/utils';

interface FeedbackReply {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: { username: string };
}

interface FeedbackRepliesProps {
  replies: FeedbackReply[];
  currentUserId?: string;
  replyingToFeedbackId: string | null;
  replyContent: string;
  parentFeedbackId: string;
  onReplyChange: (content: string) => void;
  onReplySubmit: () => void;
  onReplyCancel: () => void;
  onEditReply: (replyId: string) => void;
  onDeleteReply: (replyId: string) => void;
}

export const FeedbackReplies = ({
  replies,
  currentUserId,
  replyingToFeedbackId,
  replyContent,
  parentFeedbackId,
  onReplyChange,
  onReplySubmit,
  onReplyCancel,
  onEditReply,
  onDeleteReply
}: FeedbackRepliesProps): JSX.Element => {
  return (
    <div className="ml-8 lg:ml-12 mt-4 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gray-200">
      <div className="space-y-4">
        {replies.map((reply) => (
          <div key={reply.id} className="pl-6 relative">
            <div className="flex items-start gap-3">
              <UserAvatar
                name={reply.profile?.username || 'Anonymous'}
                size={32}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-startsnap-ebony-clay">
                    {reply.profile?.username || 'Anonymous'}
                  </span>
                  <span className="text-xs text-startsnap-pale-sky">
                    {formatDetailedDate(reply.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-startsnap-river-bed whitespace-pre-wrap">
                  {reply.content}
                </p>
                {currentUserId === reply.user_id && (
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditReply(reply.id)}
                      className="text-xs text-startsnap-pale-sky hover:text-startsnap-french-rose"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteReply(reply.id)}
                      className="text-xs text-startsnap-pale-sky hover:text-startsnap-french-rose"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {replyingToFeedbackId === parentFeedbackId && (
        <div className="pl-6 mt-4">
          <div className="flex items-start gap-3">
            <UserAvatar
              name="You"
              size={32}
            />
            <div className="flex-1">
              <Textarea
                value={replyContent}
                onChange={(e) => onReplyChange(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px] text-sm"
              />
              <div className="mt-2 flex items-center gap-2">
                <Button
                  onClick={onReplySubmit}
                  className="startsnap-button bg-startsnap-french-rose text-startsnap-white text-sm"
                >
                  Post Reply
                </Button>
                <Button
                  variant="ghost"
                  onClick={onReplyCancel}
                  className="text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};