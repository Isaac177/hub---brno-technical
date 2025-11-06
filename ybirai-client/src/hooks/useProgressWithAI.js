import { useEffect, useRef } from 'react';
import { useProgress } from './useProgress';
import { useWebSocket } from '../contexts/WebSocketContext';
import { PROGRESS_EVENTS } from '../socket/events/eventTypes';

export const useProgressWithAI = (courseId, userEmail, language = 'en', onProgressMilestone = null) => {
  const progressQuery = useProgress(courseId, userEmail, language);
  const { socket } = useWebSocket();
  const previousProgressRef = useRef(null);

  useEffect(() => {
    if (!socket || !courseId || !userEmail || !onProgressMilestone) return;

    const handleProgressUpdate = (data) => {
      if (data.courseId !== courseId || data.userEmail !== userEmail) return;

      console.log('Progress update received for AI analysis:', data);

      // Check for significant milestones that should trigger AI analysis
      const triggerEvents = [];

      // Video completion milestone (>=95% progress)
      if (data.topicsProgress) {
        Object.entries(data.topicsProgress).forEach(([topicId, progress]) => {
          const previousProgress = previousProgressRef.current?.topicsProgress?.[topicId];
          const currentVideoProgress = progress.videoProgress || 0;
          const previousVideoProgress = previousProgress?.videoProgress || 0;

          // Video completion trigger (crossed 95% threshold)
          if (currentVideoProgress >= 95 && previousVideoProgress < 95) {
            triggerEvents.push({
              type: 'video_completion',
              topicId,
              videoProgress: currentVideoProgress,
              timestamp: new Date().toISOString()
            });
          }

          // Video halfway milestone (crossed 50% threshold)
          if (currentVideoProgress >= 50 && previousVideoProgress < 50) {
            triggerEvents.push({
              type: 'video_halfway',
              topicId,
              videoProgress: currentVideoProgress,
              timestamp: new Date().toISOString()
            });
          }
        });
      }

      // Overall course progress milestones
      const currentOverallProgress = data.overallProgress || 0;
      const previousOverallProgress = previousProgressRef.current?.overallProgress || 0;

      // Course completion milestones (25%, 50%, 75%, 100%)
      const milestones = [25, 50, 75, 100];
      milestones.forEach(milestone => {
        if (currentOverallProgress >= milestone && previousOverallProgress < milestone) {
          triggerEvents.push({
            type: 'course_milestone',
            milestone,
            overallProgress: currentOverallProgress,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Component completion milestones
      const currentCompletedComponents = data.completedComponents || 0;
      const previousCompletedComponents = previousProgressRef.current?.completedComponents || 0;

      if (currentCompletedComponents > previousCompletedComponents) {
        triggerEvents.push({
          type: 'component_completion',
          completedComponents: currentCompletedComponents,
          totalComponents: data.totalComponents || 0,
          timestamp: new Date().toISOString()
        });
      }

      // Store current progress for next comparison
      previousProgressRef.current = data;

      // Trigger AI analysis for each significant event
      triggerEvents.forEach(event => {
        console.log('Triggering AI analysis for progress event:', event);
        onProgressMilestone(event, data);
      });
    };

    socket.on(PROGRESS_EVENTS.RECEIVE.UPDATE, handleProgressUpdate);
    socket.on(PROGRESS_EVENTS.RECEIVE.BROADCAST, handleProgressUpdate);
    socket.on(PROGRESS_EVENTS.RECEIVE.SYNC, handleProgressUpdate);

    return () => {
      socket.off(PROGRESS_EVENTS.RECEIVE.UPDATE, handleProgressUpdate);
      socket.off(PROGRESS_EVENTS.RECEIVE.BROADCAST, handleProgressUpdate);
      socket.off(PROGRESS_EVENTS.RECEIVE.SYNC, handleProgressUpdate);
    };
  }, [socket, courseId, userEmail, onProgressMilestone]);

  // Update the reference when progress data changes
  useEffect(() => {
    if (progressQuery.data && !progressQuery.isLoading) {
      if (!previousProgressRef.current) {
        // Initialize the reference on first load (don't trigger events)
        previousProgressRef.current = progressQuery.data;
      }
    }
  }, [progressQuery.data, progressQuery.isLoading]);

  return progressQuery;
};