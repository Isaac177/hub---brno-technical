import React from 'react';
import { CheckCircle2, Target, Clock, BookOpen, Award, TrendingUp } from "lucide-react";
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { useTranslation } from 'react-i18next';

const ProgressMetrics = ({ progress }) => {
  const { t } = useTranslation();
  const {
    overallProgress,
    componentProgress,
    totalComponents,
    completedComponents
  } = progress || {};

  const roundedProgress = Math.round(overallProgress || 0);

  const videoProgress = Math.round(
    (componentProgress?.videos?.completed / componentProgress?.videos?.total) * 100 || 0
  );

  const quizProgress = Math.round(
    (componentProgress?.quizzes?.completed / componentProgress?.quizzes?.total) * 100 || 0
  );

  const getProgressColor = (progress) => {
    if (progress >= 80) return "from-green-500 to-emerald-500";
    if (progress >= 50) return "from-blue-500 to-indigo-500";
    if (progress >= 25) return "from-yellow-500 to-orange-500";
    return "from-gray-500 to-slate-500";
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 p-6 border border-blue-100 dark:border-slate-600">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -mr-16 -mt-16"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">{t('courseProgress.overall.title')}</h3>
            </div>
            <Badge
              variant={roundedProgress >= 100 ? "success" : "outline"}
              className={`${roundedProgress >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : ''} px-3 py-1 font-semibold`}
            >
              {roundedProgress}%
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={roundedProgress} className="h-3 bg-white dark:bg-slate-600" />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t('courseProgress.overall.description', {
                completed: completedComponents || 0,
                total: totalComponents || 0
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Component Progress Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Video Progress */}
        <div className="group relative overflow-hidden rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-300">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{t('courseProgress.videos.title')}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{t('courseProgress.videos.completed')}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {componentProgress?.videos?.completed || 0}/{componentProgress?.videos?.total || 0}
                </span>
              </div>
              <div className="relative">
                <Progress value={videoProgress} className="h-2" />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r ${getProgressColor(videoProgress)} transition-all duration-500`}
                  style={{ width: `${videoProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Progress */}
        <div className="group relative overflow-hidden rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg transition-all duration-300">
                <Award className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{t('courseProgress.quizzes.title')}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{t('courseProgress.quizzes.completed')}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {componentProgress?.quizzes?.completed || 0}/{componentProgress?.quizzes?.total || 0}
                </span>
              </div>
              <div className="relative">
                <Progress value={quizProgress} className="h-2" />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r ${getProgressColor(quizProgress)} transition-all duration-500`}
                  style={{ width: `${quizProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-full border border-slate-200 dark:border-slate-600">
          <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t('courseProgress.summary.totalTasks', {
              completed: completedComponents || 0,
              total: totalComponents || 0
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

const CourseRequirements = ({ requirements }) => {
  const { t } = useTranslation();

  if (!requirements?.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200">{t('courseProgress.requirements.title')}</h4>
      </div>
      <div className="space-y-3">
        {requirements.map((req, index) => (
          <div key={index} className="group flex items-start gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-slate-700/50 border border-green-100 dark:border-slate-600 hover:bg-green-50 dark:hover:bg-slate-700 transition-all duration-200">
            <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-200">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{req}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LearningObjectives = ({ objectives }) => {
  const { t } = useTranslation();

  if (!objectives?.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200">{t('courseProgress.objectives.title')}</h4>
      </div>
      <div className="space-y-3">
        {objectives.map((obj, index) => (
          <div key={index} className="group flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-slate-700/50 border border-blue-100 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-200">
            <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-200">
              <Target className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{obj}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CourseProgress = ({ progress, requirements, learningObjectives }) => {
  const { t } = useTranslation();

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90 sticky top-6">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t('courseProgress.title')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              {t('courseProgress.lastUpdated')}: {progress?.lastUpdated ? new Date(progress.lastUpdated).toLocaleString() : t('courseProgress.never')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          <ProgressMetrics progress={progress} />
          <CourseRequirements requirements={requirements} />
          <LearningObjectives objectives={learningObjectives} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseProgress;