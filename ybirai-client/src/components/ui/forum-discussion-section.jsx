import React, { useState } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import ForumDiscussion from './forum-discussion';
import { Loader } from './loader';
import { useCreateComment, useToggleCommentLike } from '../../hooks/useComments';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader as LoaderIcon } from 'lucide-react';

const ForumDiscussionSection = ({ postId, currentUserId, initialComments = [] }) => {
  const [replyTo, setReplyTo] = useState(null);
  const [content, setContent] = useState('');

  const queryClient = useQueryClient();
  const { mutate: createComment, isLoading: isSubmitting } = useCreateComment();
  const { mutate: toggleLike } = useToggleCommentLike();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      toast.error('Please log in to post a discussion');
      return;
    }

    const optimisticComment = {
      id: Date.now().toString(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      user: {
        name: localStorage.getItem('userName'),
        avatar: localStorage.getItem('userAvatar'),
      },
      userId: localStorage.getItem('userId'),
      postId,
      parentId: replyTo?.id,
      likes: [],
      replies: [],
      isOptimistic: true,
    };

    createComment(
      {
        content: content.trim(),
        postId,
        parentId: replyTo?.id,
      },
      {
        onMutate: async () => {
          await queryClient.cancelQueries(['post', postId]);
          const previousPost = queryClient.getQueryData(['post', postId]);

          queryClient.setQueryData(['post', postId], old => ({
            ...old,
            comments: replyTo
              ? old.comments.map(comment => 
                  comment.id === replyTo.id
                    ? { ...comment, replies: [...comment.replies, optimisticComment] }
                    : comment
                )
              : [optimisticComment, ...old.comments],
            stats: {
              ...old.stats,
              totalComments: old.stats.totalComments + 1,
              commentsWithReplies: old.stats.commentsWithReplies + 1,
            },
          }));

          return { previousPost };
        },
        onError: (err, variables, context) => {
          if (context?.previousPost) {
            queryClient.setQueryData(['post', postId], context.previousPost);
          }
          toast.error('Failed to post discussion');
        },
        onSuccess: () => {
          setContent('');
          setReplyTo(null);
          toast.success('Discussion posted successfully');
        },
      }
    );
  };

  const renderDiscussionThread = (comment, depth = 0) => {
    return (
      <div key={comment.id} className="space-y-3">
        <ForumDiscussion
          discussion={comment}
          onReply={setReplyTo}
          onLike={() => toggleLike(comment.id)}
          depth={depth}
          isChild={depth > 0}
          currentUserId={currentUserId}
        />
        {comment.replies?.map(reply => renderDiscussionThread(reply, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder={replyTo ? `Reply to ${replyTo.user?.name}...` : "Start a discussion..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex items-center justify-between">
          {replyTo && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setReplyTo(null)}
            >
              Cancel Reply
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
            className="relative"
          >
            {isSubmitting ? (
              <>
                <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                <span>Posting...</span>
              </>
            ) : (
              'Post Discussion'
            )}
          </Button>
        </div>
      </form>

      {initialComments?.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No discussions yet. Be the first to start a discussion!
        </p>
      ) : (
        <div className="space-y-6">
          {initialComments?.map(comment => renderDiscussionThread(comment))}
        </div>
      )}
    </div>
  );
};

export default ForumDiscussionSection;
