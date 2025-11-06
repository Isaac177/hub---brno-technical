import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../utils/apiService';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useEffect } from 'react';
import { PROGRESS_EVENTS } from '../socket/events/eventTypes';

export const useProgress = (courseId, userEmail, language = 'en') => {
  const queryClient = useQueryClient();
  const { socket } = useWebSocket();

  const query = useQuery({
    queryKey: ['progress', courseId, userEmail, language],
    queryFn: async () => {
      if (!courseId || !userEmail) {
        throw new Error('Missing required parameters');
      }

      try {
        console.log('[useProgress] Fetching progress for:', { courseId, userEmail, language });

        const result = await apiService.student.get(
          `/course-progress/${courseId}?userEmail=${userEmail}`,
          {
            headers: { 'Accept-Language': language }
          }
        );

        console.log('[useProgress] Progress data received - Summary:', {
          courseId: result.courseId,
          userEmail: result.userEmail,
          overallProgress: result.overallProgress,
          topicsProgressCount: Object.keys(result.topicsProgress || {}).length,
          topicsWithProgress: Object.keys(result.topicsProgress || {}),
          videoProgressDetails: Object.entries(result.topicsProgress || {}).map(([topicId, data]) => ({
            topicId,
            videoProgress: data.videoProgress,
            canAccessQuiz: data.videoProgress >= 50
          }))
        });

        return result;
      } catch (error) {
        console.error('[useProgress] Error fetching progress:', error);
        throw error;
      }
    },
    enabled: !!courseId && !!userEmail,
    retry: 2
  });

  useEffect(() => {
    if (!socket || !courseId || !userEmail) return;

    const handleProgressUpdate = (data) => {
      if (data.courseId === courseId && data.userEmail === userEmail) {
        console.log('Received progress update, invalidating query:', {
          courseId,
          userEmail,
          timestamp: new Date().toISOString()
        });
        queryClient.invalidateQueries(['progress', courseId, userEmail, language]);
      }
    };

    socket.on(PROGRESS_EVENTS.RECEIVE.UPDATE, handleProgressUpdate);
    socket.on(PROGRESS_EVENTS.RECEIVE.BROADCAST, handleProgressUpdate);
    socket.on(PROGRESS_EVENTS.RECEIVE.SYNC, handleProgressUpdate);

    return () => {
      socket.off(PROGRESS_EVENTS.RECEIVE.UPDATE, handleProgressUpdate);
      socket.off(PROGRESS_EVENTS.RECEIVE.BROADCAST, handleProgressUpdate);
      socket.off(PROGRESS_EVENTS.RECEIVE.SYNC, handleProgressUpdate);
    };
  }, [socket, courseId, userEmail, queryClient, language]);

  return query;
};

export const progressKeys = {
  all: ['progress'],
  detail: (courseId, userEmail, language = 'en') => ['progress', courseId, userEmail, language],
};