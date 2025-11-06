import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Loader } from '../../components/ui/loader';
import { usePostBySlug, useTogglePostLike } from '../../hooks/usePosts';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories } from '../../hooks/useCategories';
import ForumDiscussionSection from '../../components/ui/forum-discussion-section';
import { MessageSquare, ThumbsUp, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  FacebookShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  WhatsappIcon,
} from 'react-share';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import { formatDate } from '../../utils/formateData';

const ForumPost = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const postSlug = searchParams.get('post');
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = 5;

  const { data: post, isLoading } = usePostBySlug(postSlug, { page, limit, language: currentLanguage });
  const { data: categories } = useCategories();
  const currentUserId = localStorage.getItem('userId');
  const userEmail = localStorage.getItem('userEmail');
  const { mutate: toggleLike } = useTogglePostLike();
  const queryClient = useQueryClient();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  console.log('post', JSON.stringify(post, null, 2));

  const handleLike = () => {
    if (!userEmail) {
      toast.error(t('forum.post.loginToLike'));
      return;
    }

    const isLiked = post?.likes?.some(like => like.userId === currentUserId);

    toggleLike(post?.id, {
      onMutate: async () => {
        await queryClient.cancelQueries(['post', postSlug]);
        const previousPost = queryClient.getQueryData(['post', postSlug]);

        queryClient.setQueryData(['post', postSlug], old => ({
          ...old,
          likes: isLiked
            ? old.likes.filter(like => like.userId !== currentUserId)
            : [...old.likes, { userId: currentUserId }],
          stats: {
            ...old.stats,
            totalLikes: old.stats.totalLikes + (isLiked ? -1 : 1),
          },
        }));

        return { previousPost };
      },
      onError: (err, variables, context) => {
        if (context?.previousPost) {
          queryClient.setQueryData(['post', postSlug], context.previousPost);
        }
        toast.error(t('forum.errors.likeFailed'));
      },
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ post: postSlug, page: newPage.toString() });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader size={32} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('forum.post.notFound')}</p>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/forum?post=${postSlug}`;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <article className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{post?.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName || t('forum.post.anonymous')}&background=random`}
                  alt={post.authorName || t('forum.post.anonymous')}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${post.authorName || t('forum.post.anonymous')}&background=random`;
                  }}
                />
                <div>
                  <h4 className="font-medium text-primary">{post.authorName || t('forum.post.anonymous')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(post.createdAt, currentLanguage)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <FacebookShareButton url={shareUrl}>
              <FacebookIcon size={32} round title={t('forum.actions.share')} />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl}>
              <TwitterIcon size={32} round title={t('forum.actions.share')} />
            </TwitterShareButton>
            <TelegramShareButton url={shareUrl}>
              <TelegramIcon size={32} round title={t('forum.actions.share')} />
            </TelegramShareButton>
            <WhatsappShareButton url={shareUrl}>
              <WhatsappIcon size={32} round title={t('forum.actions.share')} />
            </WhatsappShareButton>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {post?.category && (
            <Badge variant="secondary">
              {categories?.find(cat => cat.id === post?.categoryId)?.name}
            </Badge>
          )}
          {post?.tags?.map(tag => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          {post?.content}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1",
              post?.likes?.some(like => like.userId === currentUserId) && "text-primary"
            )}
            onClick={handleLike}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{post?.likes?.length || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post?.comments?.length || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="h-4 w-4" />
            <span>{t('forum.actions.share')}</span>
          </Button>
        </div>
      </article>

      <div className="pt-8 border-t">
        <h2 className="text-xl font-semibold mb-6">{t('forum.post.discussions')}</h2>
        <ForumDiscussionSection
          postId={post?.id}
          currentUserId={currentUserId}
          initialComments={post?.data?.comments || []}
        />

        {post?.meta?.totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(page - 1)} />
                </PaginationItem>
              )}

              {[...Array(Math.min(5, post.meta.totalPages))].map((_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={page === pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {post.meta.totalPages > 5 && page < post.meta.totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {page < post.meta.totalPages && (
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(page + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {isShareModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Share Post</h2>
              <div className="flex justify-center gap-4">
                <FacebookShareButton url={window.location.href}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton url={window.location.href}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <TelegramShareButton url={window.location.href}>
                  <TelegramIcon size={32} round />
                </TelegramShareButton>
                <WhatsappShareButton url={window.location.href}>
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setIsShareModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPost;
