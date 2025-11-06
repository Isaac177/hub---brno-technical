import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';
import { useState, useRef, useCallback, useEffect } from 'react';

export const useCourseProgress = (course) => {
  const queryClient = useQueryClient();
  const [isUpdatingVideo, setIsUpdatingVideo] = useState(false);
  const [isUpdatingQuiz, setIsUpdatingQuiz] = useState(false);
  const updateTimeoutRef = useRef(null);
  const lastUpdateRef = useRef(null);
  const processingRef = useRef(false);

  if (!course?.id || !course?.syllabus) {
    return {
      updateVideoProgress: () => Promise.resolve(null),
      updateQuizProgress: () => Promise.resolve(null),
      isUpdatingVideo: false,
      isUpdatingQuiz: false,
      videoProgressError: null,
      quizProgressError: null
    };
  }

  const formatVideoProgress = ({
    courseId,
    enrollmentId,
    topicId,
    userEmail,
    progressData,
    componentProgress,
  }) => {
    if (!course?.syllabus) {
      return null;
    }

    const currentProgress = componentProgress || {
      videos: { total: 0, completed: 0, byId: {} },
      quizzes: { total: 0, completed: 0, byId: {} }
    };

    const totalVideos = course.syllabus.reduce((acc, section) =>
      acc + section.topics.length, 0);
    const totalQuizzes = course.quizzes?.length || 0;

    const updatedVideoProgress = {
      ...currentProgress.videos,
      total: totalVideos,
      byId: {
        ...currentProgress.videos.byId,
        [topicId]: {
          id: topicId,
          progress: progressData.progress,
          lastUpdated: progressData.lastUpdated,
          duration: progressData.duration,
          currentTime: progressData.currentTime,
          completed: progressData.progress >= 50,
          milestone: progressData.milestone
        }
      }
    };

    const completedVideos = Object.values(updatedVideoProgress.byId)
      .filter(video => video.progress >= 50).length;

    const completedQuizzes = Object.values(currentProgress.quizzes?.byId || {})
      .filter(quiz => quiz.completed).length;

    return {
      type: 'videoProgress',
      courseId,
      enrollmentId,
      topicId,
      userEmail,
      value: progressData.progress,
      componentProgress: {
        videos: {
          ...updatedVideoProgress,
          completed: completedVideos
        },
        quizzes: currentProgress.quizzes || {
          total: totalQuizzes,
          completed: completedQuizzes,
          byId: {}
        }
      },
      topicsProgress: {
        [topicId]: {
          videoProgress: progressData.progress,
          lastUpdated: progressData.lastUpdated
        }
      },
      totalComponents: totalVideos + totalQuizzes,
      completedComponents: completedVideos + completedQuizzes,
      timestamp: new Date().toISOString()
    };
  };

  const videoProgressMutation = useMutation({
    mutationFn: async (progressData) => {
      if (isUpdatingVideo) {
        return null;
      }

      setIsUpdatingVideo(true);

      try {
        const formattedData = formatVideoProgress(progressData);
        if (!formattedData) {
          return null;
        }

        const response = await apiService.student.post('/progress/video', formattedData);

        queryClient.setQueryData(['courseProgress', course.id], (old) => ({
          ...old,
          ...(response.data || {})
        }));

        return response.data || {};
      } catch (error) {
        throw error;
      } finally {
        setIsUpdatingVideo(false);
      }
    }
  });

  const updateVideoProgress = useCallback((progressData) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      videoProgressMutation.mutate(progressData);
    }, 1000);
  }, [videoProgressMutation]);

  const formatQuizProgress = ({
    courseId,
    enrollmentId,
    quizId,
    topicId,
    userEmail,
    score,
    totalPossibleScore,
    passed,
    componentProgress,
  }) => {
    const updateKey = `${quizId}-${score}`;
    if (lastUpdateRef.current === updateKey) {
      return null;
    }
    lastUpdateRef.current = updateKey;

    if (!courseId || !enrollmentId || !userEmail) {
      return null;
    }

    const currentProgress = componentProgress || {
      videos: { total: 0, completed: 0, byId: {} },
      quizzes: { total: 0, completed: 0, byId: {} }
    };

    const totalVideos = course.syllabus.reduce((acc, section) =>
      acc + section.topics.length, 0);
    const totalQuizzes = course.quizzes?.length || 0;

    const updatedQuizProgress = {
      ...currentProgress.quizzes,
      total: totalQuizzes,
      byId: {
        ...currentProgress.quizzes.byId,
        [quizId]: {
          id: quizId,
          score,
          totalPossibleScore,
          completed: passed,
          lastUpdated: new Date().toISOString()
        }
      }
    };

    return {
      type: 'quizProgress',
      courseId,
      enrollmentId,
      userEmail,
      componentProgress: {
        videos: currentProgress.videos,
        quizzes: updatedQuizProgress
      },
      topicsProgress: {
        [topicId]: {
          quizProgress: (score / totalPossibleScore) * 100,
          lastUpdated: new Date().toISOString()
        }
      },
      totalComponents: totalVideos + totalQuizzes,
      timestamp: new Date().toISOString()
    };
  };

  const quizProgressMutation = useMutation({
    mutationFn: async (progressData) => {
      if (processingRef.current) {
        return null;
      }

      const updateKey = `${progressData.quizId}-${progressData.score}`;
      if (lastUpdateRef.current === updateKey) {
        return null;
      }

      try {
        processingRef.current = true;
        lastUpdateRef.current = updateKey;

        const formattedData = formatQuizProgress(progressData);
        if (!formattedData) return null;

        const response = await apiService.student.post('/progress/quiz', formattedData);
        return response.data;
      } finally {
        processingRef.current = false;
      }
    },
    retry: false,
    onError: () => {
      processingRef.current = false;
    }
  });

  const updateQuizProgress = useCallback((progressData) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    if (processingRef.current || !progressData?.quizId) {
      return Promise.resolve(null);
    }

    return quizProgressMutation.mutateAsync(progressData);
  }, [quizProgressMutation]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      processingRef.current = false;
    };
  }, []);

  return {
    updateVideoProgress,
    updateQuizProgress,
    isUpdatingVideo: videoProgressMutation.isLoading,
    isUpdatingQuiz: quizProgressMutation.isLoading,
    videoProgressError: videoProgressMutation.error,
    quizProgressError: quizProgressMutation.error
  };
};