import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePost, usePostBySlug, useTogglePostLike } from '../../hooks/usePosts';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import NewsHead from './NewsHead';
import CommentSection from '../../components/ui/comment-section';
import ErrorBoundary from '../../components/ui/error-boundary';
import { useTranslation } from 'react-i18next';
import {
  ThumbsUp,
  MessageSquare,
  Eye
} from 'lucide-react';
import {
  FacebookShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  WhatsappIcon,
  LinkedinIcon,
} from 'react-share';
import { toast } from 'sonner';
import { apiService } from '../../utils/apiService';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

const NewsArticle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [showComments, setShowComments] = useState(false);
  const userId = localStorage.getItem('userId');

  const { data: postData, isLoading, error, refetch } = usePostBySlug(slug);
  const toggleLikeMutation = useTogglePostLike();

  useEffect(() => {
    if (slug && postData?.id) {
      const trackView = async () => {
        try {
          const userEmail = localStorage.getItem('userEmail');

          if (!userEmail) {
            console.log('User not authenticated, skipping view tracking');
            return;
          }

          await apiService.student.post(
            `/posts/${postData.id}/view`,
            null,
            {
              headers: {
                'user-email': userEmail,
              },
            }
          );
        } catch (error) {
          console.error('Error tracking view:', error);
        }
      };
      trackView();
    }
  }, [slug, postData?.id]);

  useEffect(() => {
    if (slug) {
      refetch();
    }
  }, [slug, refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600">{t('news.error.loadingArticle')}</h2>
        <p className="text-gray-600 mt-2">{error.message}</p>
        <Button
          onClick={() => navigate(`/${i18n.language}/news`)}
          className="mt-4"
        >
          {t('news.error.goBack')}
        </Button>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-600">{t('news.error.postNotFound')}</h2>
        <Button
          onClick={() => navigate(`/${i18n.language}/news`)}
          className="mt-4"
        >
          {t('news.error.goBack')}
        </Button>
      </div>
    );
  }

  const post = postData;
  const isLiked = post.likes?.some(like => like.userId === userId);
  const shareUrl = window.location.href;
  const title = post.title;

  const handleLike = async () => {
    toggleLikeMutation.mutate(post.id);
  };

  return (
    <>
      <NewsHead
        title="Новости"
        description="Актуальная информация про обучение в IT-сфере. Рассказываем про тренды в IT, рейтинги языков программирования, советы и рекомендации по выбору IT-профессий и многое другое."
        image="/newsStudents.png"
        post={post}
      />
      <div className="bg-background my-24">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Badge variant="secondary" className="text-sm">
                {post.type}
              </Badge>
              {post.category && (
                <Badge variant="outline" className="text-sm">
                  {post.category.name}
                </Badge>
              )}
              <time className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString('ru-KZ', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </time>
            </div>
            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
            <div className="flex items-center gap-6 text-gray-600">
              {/* <div className="flex items-center gap-2">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{post.authorName}</p>
                  {post.category && (
                    <p className="text-sm text-gray-500">{post.category.name}</p>
                  )}
                </div>
              </div> */}
            </div>
          </div>

          {post.imageUrl && (
            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="container mx-auto px-4 py-8 max-w-4xl"
        >
          <div className="mt-8 prose prose-lg max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="text-gray-700 dark:text-gray-300"
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${isLiked ? 'text-red-600' : 'text-gray-600'
                  } transition-all duration-200 hover:scale-110 active:scale-95`}
                onClick={handleLike}
                disabled={toggleLikeMutation.isPending}
              >
                <ThumbsUp className={isLiked ? 'fill-current' : ''} />
                <span>{post._count?.likes || 0}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-600"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare />
                <span>{post._count?.comments || 0}</span>
              </Button>

              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="h-5 w-5" />
                <span>{post._count?.views || 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <FacebookShareButton url={shareUrl} quote={title}>
                <FacebookIcon size={32} round title={t('news.shareButtons.share')} />
              </FacebookShareButton>

              <TwitterShareButton url={shareUrl} title={title}>
                <TwitterIcon size={32} round title={t('news.shareButtons.share')} />
              </TwitterShareButton>

              <TelegramShareButton url={shareUrl} title={title}>
                <TelegramIcon size={32} round title={t('news.shareButtons.share')} />
              </TelegramShareButton>

              <WhatsappShareButton url={shareUrl} title={title}>
                <WhatsappIcon size={32} round title={t('news.shareButtons.share')} />
              </WhatsappShareButton>

              <LinkedinShareButton url={shareUrl} title={title}>
                <LinkedinIcon size={32} round title={t('news.shareButtons.share')} />
              </LinkedinShareButton>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <h3 className="text-lg font-semibold mb-2 w-full">{t('news.post.tags')}:</h3>
            {Array.isArray(post.tags) && post.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-sm cursor-pointer hover:bg-secondary/80"
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          {showComments && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">{t('news.comments.title')}</h2>
              <ErrorBoundary>
                <CommentSection postId={post.id} initialComments={post?.comments || []} />
              </ErrorBoundary>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default NewsArticle;
