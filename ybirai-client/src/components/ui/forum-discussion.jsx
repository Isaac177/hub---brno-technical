import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { ThumbsUp, MessageSquare, MoreVertical, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getInitials } from '../../utils/getInitials';

const ForumDiscussion = ({
  discussion: comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onShare,
  isChild = false,
  depth = 0,
  currentUserId,
}) => {
  const maxDepth = 5;
  const currentDepth = Math.min(depth, maxDepth);
  const marginLeft = currentDepth * 16;
  
  const isLiked = comment.likes?.some(like => like.userId === currentUserId) || false;
  const likesCount = comment.likes?.length || 0;
  const repliesCount = comment.replies?.length || 0;

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ru-KZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fontSize = Math.max(14 - depth, 12);
  
  return (
    <div 
      className={cn(
        'flex gap-4 relative',
        isChild && 'mt-3 before:absolute before:left-[-8px] before:top-0 before:bottom-0 before:w-0.5 before:bg-border/50'
      )}
      style={{ marginLeft: isChild ? marginLeft : 0 }}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.user?.avatar} alt={comment.user?.name} />
        <AvatarFallback>{getInitials(comment.user?.name)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2" style={{ fontSize: `${fontSize}px` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{comment.user?.name}</span>
            <span className="text-muted-foreground text-sm">•</span>
            <span className="text-muted-foreground text-sm">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => onReply(comment)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            {currentUserId === comment.user?.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(comment)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(comment)}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="text-sm space-y-2">
          <p className="leading-relaxed">{comment.content}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1 h-8 px-2",
              isLiked && "text-primary"
            )}
            onClick={() => onLike(comment)}
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm">{likesCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 h-8 px-2"
            onClick={() => onShare(comment)}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-sm">{repliesCount}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForumDiscussion;
