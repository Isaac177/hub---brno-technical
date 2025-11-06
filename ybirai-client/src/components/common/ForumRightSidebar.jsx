import React from 'react';
import { usePostStats } from '../../hooks/usePosts';
import { Card } from '../ui/card';
import {
  MessageSquare,
  TrendingUp,
  Users,
  Eye,
  ThumbsUp,
  Clock,
  Tag,
  Bookmark
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ru, kk } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

const ForumRightSidebar = () => {
  const { data } = usePostStats();
  const stats = data;
  const { t } = useTranslation();
  const { currentLanguage, displayLanguage } = useLanguage();

  const getLocale = () => {
    switch (currentLanguage) {
      case 'kk':
        return ru;
      case 'ru':
        return ru;
      default:
        return enUS;
    }
  };

  if (!stats) return null;

  const topPosts = stats.topPosts || {};
  const overview = stats.overview || {};
  const recentActivity = stats.recentActivity || [];

  return (
    <div className="w-full lg:w-80 space-y-6">
      <Card className="p-4 bg-background">
        <h3 className="text-lg font-semibold mb-4 text-primary">{t('forum.sidebar.overview.title')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{t('forum.sidebar.overview.totalDiscussions')}</span>
            </div>
            <span className="font-medium text-primary">{overview.postsByType?.DISCUSSION || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{t('forum.sidebar.overview.totalLikes')}</span>
            </div>
            <span className="font-medium text-primary">{overview.totalLikes || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{t('forum.sidebar.overview.totalViews')}</span>
            </div>
            <span className="font-medium text-primary">{overview.totalViews || 0}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-background">
        <h3 className="text-lg font-semibold mb-4 text-primary">{t('forum.sidebar.categories.title')}</h3>
        <div className="space-y-3">
          {overview.postsByCategory?.slice(0, 5).map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{category.category}</span>
              </div>
              <span className="text-sm font-medium text-primary">{category.count} {t('forum.sidebar.categories.posts')}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-background">
        <h3 className="text-lg font-semibold mb-4 text-primary">{t('forum.sidebar.trending.title')}</h3>
        <div className="space-y-4">
          {topPosts.mostViewed?.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              to={`/${displayLanguage}/forum?post=${post.slug}`}
              className="block group"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-primary group-hover:text-primary/80 line-clamp-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {post._count.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> {post._count.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> {post._count.likes}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-background">
        <h3 className="text-lg font-semibold mb-4 text-primary">{t('forum.sidebar.activity.title')}</h3>
        <div className="space-y-4">
          {recentActivity?.slice(0, 5).map((activity) => (
            <Link
              key={activity.id}
              to={`/${displayLanguage}/forum?post=${activity.postSlug}`}
              className="block group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {activity.type === 'LIKE' ? (
                    <ThumbsUp className="w-4 h-4 text-primary" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-primary group-hover:text-primary/80 line-clamp-2">
                    <span className="font-medium">{activity.authorName || t('forum.sidebar.activity.anonymous')}</span>
                    {' '}
                    {activity.type === 'LIKE'
                      ? t('forum.sidebar.activity.liked')
                      : t('forum.sidebar.activity.commentedOn')
                    }
                    {' '}
                    {activity.postTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: getLocale()
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ForumRightSidebar;
