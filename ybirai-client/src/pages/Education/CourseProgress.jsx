import React from 'react';
import { useParams } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../hooks/useProgress';
import { useTranslation } from 'react-i18next';
import {
  ProgressHeader,
  OverallProgressCard,
  VideoProgressCard,
  QuizProgressCard,
  LoadingState,
  ErrorState,
  NoDataState
} from './progress-components';

const CourseProgress = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { data: progressData, isLoading, error } = useProgress(courseId, user?.email);
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return t('course.progress.noDate');
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  if (!progressData) {
    return <NoDataState />;
  }

  const overallProgress = progressData.overallProgress || 0;
  const completedComponents = progressData.completedComponents || 0;
  const totalComponents = progressData.totalComponents || 0;
  const videoProgress = progressData.componentProgress?.videos?.byId || {};
  const quizProgress = progressData.componentProgress?.quizzes?.byId || {};

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      <ProgressHeader />

      <OverallProgressCard
        overallProgress={overallProgress}
        completedComponents={completedComponents}
        totalComponents={totalComponents}
        videoProgress={videoProgress}
        quizProgress={quizProgress}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <VideoProgressCard
          videoProgress={videoProgress}
          formatDate={formatDate}
        />

        <QuizProgressCard
          quizProgress={quizProgress}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default CourseProgress;