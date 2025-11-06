import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePostStats } from '../../hooks/usePosts';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from "../../components/ui/button";
import { Download, Eye, MessageSquare, ThumbsUp } from "lucide-react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export default function BlogDashboard() {
  const { t } = useTranslation();
  const { data, isLoading } = usePostStats();

  const stats = data;

  if (isLoading || !stats) {
    return <div className="flex items-center justify-center min-h-screen">
      <LoaderCircle className="animate-spin w-8 h-8 text-blue-500" />
    </div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('blogDashboard.title')}</h2>
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('blogDashboard.download')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('blogDashboard.stats.totalPosts')}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalPosts}</div>
            <div className="text-xs text-muted-foreground">
              +{stats.trends[stats.trends.length - 1].newPosts} {t('blogDashboard.stats.thisMonth')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('blogDashboard.stats.totalComments')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalComments}</div>
            <div className="text-xs text-muted-foreground">
              +{stats.trends[stats.trends.length - 1].newComments} {t('blogDashboard.stats.thisMonth')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('blogDashboard.stats.totalLikes')}</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalLikes}</div>
            <div className="text-xs text-muted-foreground">
              +{stats.trends[stats.trends.length - 1].newLikes} {t('blogDashboard.stats.thisMonth')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('blogDashboard.stats.totalViews')}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalViews}</div>
            <div className="text-xs text-muted-foreground">
              +{stats.trends[stats.trends.length - 1].newViews} {t('blogDashboard.stats.thisMonth')}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('blogDashboard.charts.engagementOverview')}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('default', { month: 'short' })}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="newPosts" name={t('blogDashboard.charts.metrics.posts')} stroke="#8884d8" />
                <Line type="monotone" dataKey="newComments" name={t('blogDashboard.charts.metrics.comments')} stroke="#82ca9d" />
                <Line type="monotone" dataKey="newLikes" name={t('blogDashboard.charts.metrics.likes')} stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('blogDashboard.topPosts.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats.topPosts.mostViewed.slice(0, 5).map((post) => (
                <div className="flex items-center" key={post.id}>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{post.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {post._count.views} {t('blogDashboard.topPosts.stats.views')} • {post._count.comments} {t('blogDashboard.topPosts.stats.comments')}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">{post._count.likes} {t('blogDashboard.topPosts.stats.likes')}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('blogDashboard.categories.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.overview.postsByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('blogDashboard.activity.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div className="flex items-center" key={activity.id}>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.authorName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`blogDashboard.activity.actions.${activity.type === 'COMMENT' ? 'commented' : 'liked'}`)} {activity.postTitle}
                    </p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('blogDashboard.status.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {Object.entries(stats.overview.postsByStatus).map(([status, count]) => (
                <div className="flex items-center" key={status}>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none capitalize">
                      {t(`blogDashboard.status.${status.toLowerCase()}`)}
                    </p>
                  </div>
                  <div className="ml-auto">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
