import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { ThumbsUp, MessageSquare, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

const Comment = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isChild = false,
  depth = 0,
  currentUserId,
}) => {
  const maxDepth = 3;
  const currentDepth = Math.min(depth, maxDepth);
  
  const displayName = 'Anonymous';
  
  const isLiked = comment.likes?.some(like => like.userId === currentUserId) || false;
  const likesCount = comment.likes?.length || 0;

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ru-KZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className={cn(
      'flex gap-4 bg-background',
      isChild && 'ml-8 mt-4 relative before:absolute before:left-[-16px] before:top-0 before:bottom-0 before:w-0.5 before:border-l-1 before:border-l-gray-200'
    )}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user?.avatar} alt={displayName} />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="bg-background rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{displayName}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(comment)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(comment)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="text-gray-700 mt-2">{comment.content}</p>
          
          <div className="flex items-center gap-4 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-gray-600 group"
              onClick={() => onLike?.(comment)}
            >
              <ThumbsUp className={cn(
                "h-4 w-4 transition-all duration-200 group-hover:scale-110",
                isLiked && "fill-current text-red-600",
                "group-active:scale-95"
              )} />
              <span>{likesCount}</span>
            </Button>
            
            {currentDepth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-600"
                onClick={() => onReply?.(comment)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Reply</span>
              </Button>
            )}
            
            <span className="text-sm text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && currentDepth < maxDepth && (
          <div className="space-y-4">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onLike={onLike}
                isChild
                depth={currentDepth + 1}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
