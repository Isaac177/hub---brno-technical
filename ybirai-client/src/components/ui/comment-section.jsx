import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import Comment from './comment';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment, useToggleCommentLike } from '../../hooks/useComments';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from './confirm-dialog';

const CommentSection = ({ postId, initialComments = [] }) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editComment, setEditComment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');

  const { data: commentsData, isLoading } = useComments(postId);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const toggleLikeMutation = useToggleCommentLike();

  const organizeComments = (flatComments) => {
    const commentMap = new Map();
    const rootComments = [];

    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parentId) {
        const parentComment = commentMap.get(comment.parentId);
        if (parentComment) {
          parentComment.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const [comments, setComments] = useState(() => organizeComments(initialComments));

  useEffect(() => {
    if (commentsData?.data) {
      setComments(organizeComments(commentsData.data));
    }
  }, [commentsData]);

  const checkAuth = () => {
    if (!userEmail) {
      navigate('/login', { state: { from: location.pathname } });
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    if (!newComment.trim()) return;

    const commentData = {
      content: newComment,
      postId,
      parentId: replyTo?.id
    };

    createCommentMutation.mutate(commentData, {
      onSuccess: () => {
        setNewComment('');
        setReplyTo(null);
      }
    });
  };

  const handleReply = (comment) => {
    if (!checkAuth()) return;
    setReplyTo(comment);
    setEditComment(null);
  };

  const handleEdit = (comment) => {
    if (!checkAuth()) return;
    setEditComment(comment);
    setNewComment(comment.content);
    setReplyTo(null);
  };

  const handleCancelEdit = () => {
    setEditComment(null);
    setNewComment('');
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    if (!newComment.trim()) return;

    updateCommentMutation.mutate(
      { id: editComment.id, content: newComment },
      {
        onSuccess: () => {
          setEditComment(null);
          setNewComment('');
        }
      }
    );
  };

  const handleDelete = (comment) => {
    if (!checkAuth()) return;
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (commentToDelete) {
      await deleteCommentMutation.mutateAsync(commentToDelete.id);
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleLike = (comment) => {
    if (!checkAuth()) return;

    const updateLikes = (comments) => {
      return comments.map(c => {
        if (c.id === comment.id) {
          const currentLikes = c.likes || [];
          const isCurrentlyLiked = currentLikes.some(like => like.userId === userId);
          const newLikes = isCurrentlyLiked
            ? currentLikes.filter(like => like.userId !== userId)
            : [...currentLikes, { userId, commentId: c.id }];

          return {
            ...c,
            likes: newLikes,
            _count: {
              ...c._count,
              likes: isCurrentlyLiked ? ((c._count?.likes || 0) - 1) : ((c._count?.likes || 0) + 1)
            }
          };
        }
        if (c.replies?.length > 0) {
          return { ...c, replies: updateLikes(c.replies) };
        }
        return c;
      });
    };

    setComments(prevComments => updateLikes([...prevComments]));

    toggleLikeMutation.mutate(comment.id, {
      onError: () => {
        setComments(prevComments => updateLikes([...prevComments]));
      }
    });
  };

  return (
    <div className="space-y-6">
      {userEmail ? (
        <form onSubmit={editComment ? handleUpdate : handleSubmit} className="space-y-4">
          {replyTo && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              Replying to {!replyTo.authorName || replyTo.authorName.trim() === '' ? 'Anonymous' : replyTo.authorName}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </Button>
            </div>
          )}
          {editComment && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              Editing comment
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </div>
          )}
          <Textarea
            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            type="submit"
            disabled={!newComment.trim() || createCommentMutation.isPending || updateCommentMutation.isPending}
          >
            {(createCommentMutation.isPending || updateCommentMutation.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editComment ? 'Updating...' : replyTo ? 'Replying...' : 'Posting...'}
              </>
            ) : (
              editComment ? 'Update' : replyTo ? 'Reply' : 'Post Comment'
            )}
          </Button>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-2">Please log in to comment</p>
          <Button onClick={() => navigate('/login', { state: { from: location.pathname } })}>
            Log in
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onLike={handleLike}
              currentUserId={userId}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={confirmDelete}
        isLoading={deleteCommentMutation.isPending}
      />
    </div>
  );
};

export default CommentSection;
