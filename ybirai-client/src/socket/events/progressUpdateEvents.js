import { PROGRESS_EVENTS } from './eventTypes';

export const createProgressUpdateEmitters = (socket, user) => {
  const sendProgressUpdate = (data) => {
    if (!data.courseId || !data.enrollmentId || !data.userEmail) {
      console.error('Progress Event - Validation Failed:', {
        hasCourseId: !!data.courseId,
        hasEnrollmentId: !!data.enrollmentId,
        hasUserEmail: !!data.userEmail,
        source: 'progressUpdateEvents'
      });
      return;
    }

    const progressData = {
      type: data.type,
      courseId: data.courseId,
      enrollmentId: data.enrollmentId,
      topicId: data.topicId,
      userEmail: data.userEmail,
      value: data.value,
      componentProgress: data.componentProgress,
      topicsProgress: data.topicsProgress,
      totalComponents: data.totalComponents,
      completedComponents: data.completedComponents,
      overallProgress: data.overallProgress,
      sourceId: socket.id,
      timestamp: new Date().toISOString()
    };

    console.log('Progress Event - Sending Update:', {
      eventType: PROGRESS_EVENTS.SEND.UPDATE,
      data: progressData,
      source: 'progressUpdateEvents'
    });

    socket.emit(PROGRESS_EVENTS.SEND.UPDATE, progressData, (response) => {
      if (response?.error) {
        console.error('Progress Event - Update Failed:', {
          error: response.error,
          details: response.details,
          source: 'progressUpdateEvents'
        });
      } else {
        console.log('Progress Event - Server Acknowledged:', {
          courseId: progressData.courseId,
          type: progressData.type,
          topicId: progressData.topicId,
          userEmail: progressData.userEmail
        });
      }
    });
  };

  const requestProgressSync = (courseId, enrollmentId) => {
    if (!courseId || !enrollmentId || !user?.email) {
      console.error('Progress Event - Sync Request Failed: Missing required data');
      return;
    }

    socket.emit(PROGRESS_EVENTS.SEND.REQUEST_SYNC, {
      courseId,
      enrollmentId,
      userEmail: user.email,
      timestamp: new Date().toISOString()
    });
  };

  return {
    sendProgressUpdate,
    requestProgressSync
  };
};

export const createProgressUpdateHandlers = (socket, user, callbacks = {}) => {
  const handleProgressUpdate = (data) => {
    // Only process updates from server, not our own acknowledgments
    if (data.sourceId !== socket.id) {
      console.log('📥 Progress Event - Received Update:', JSON.stringify({
        type: data.type,
        courseId: data.courseId,
        componentProgress: data.componentProgress,
        value: data.value,
        source: 'progressUpdateEvents',
        timestamp: new Date().toISOString()
      }, null, 2));

      callbacks.onProgressUpdate?.(data);
    }
  };

  const handleProgressBroadcast = (data) => {
    if (data.sourceId !== socket.id) {
      console.log('📢 Progress Event - Received Broadcast:', JSON.stringify({
        courseId: data.courseId,
        type: data.type,
        componentProgress: data.componentProgress,
        source: 'progressUpdateEvents',
        timestamp: new Date().toISOString()
      }, null, 2));

      callbacks.onProgressBroadcast?.(data);
    }
  };

  const handleProgressSync = (data) => {
    console.log('🔄 Progress Event - Received Sync:', JSON.stringify({
      courseId: data.courseId,
      componentProgress: data.componentProgress,
      source: 'progressUpdateEvents',
      timestamp: new Date().toISOString()
    }, null, 2));

    callbacks.onProgressSync?.(data);
  };

  console.log('🎯 Progress Event - Setting Up Listeners:', JSON.stringify({
    events: [
      PROGRESS_EVENTS.RECEIVE.UPDATE,
      PROGRESS_EVENTS.RECEIVE.BROADCAST,
      PROGRESS_EVENTS.RECEIVE.SYNC
    ],
    userEmail: user?.email,
    source: 'progressUpdateEvents',
    timestamp: new Date().toISOString()
  }, null, 2));

  socket.on(PROGRESS_EVENTS.RECEIVE.UPDATE, handleProgressUpdate);
  socket.on(PROGRESS_EVENTS.RECEIVE.BROADCAST, handleProgressBroadcast);
  socket.on(PROGRESS_EVENTS.RECEIVE.SYNC, handleProgressSync);

  return () => {
    console.log('🧹 Progress Event - Cleaning Up Listeners:', JSON.stringify({
      events: [
        PROGRESS_EVENTS.RECEIVE.UPDATE,
        PROGRESS_EVENTS.RECEIVE.BROADCAST,
        PROGRESS_EVENTS.RECEIVE.SYNC
      ],
      userEmail: user?.email,
      source: 'progressUpdateEvents',
      timestamp: new Date().toISOString()
    }, null, 2));

    socket.off(PROGRESS_EVENTS.RECEIVE.UPDATE, handleProgressUpdate);
    socket.off(PROGRESS_EVENTS.RECEIVE.BROADCAST, handleProgressBroadcast);
    socket.off(PROGRESS_EVENTS.RECEIVE.SYNC, handleProgressSync);
  };
};