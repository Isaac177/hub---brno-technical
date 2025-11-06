import { PROGRESS_EVENTS } from './eventTypes';

export const createProgressBroadcastHandlers = (socket, user, callbacks = {}) => {
  const handleProgressBroadcast = (data) => {
    console.log('📢 Received progress broadcast:', JSON.stringify({
      courseId: data.courseId,
      progress: data.overallProgress,
      source: data.source,
      userEmail: data.userEmail,
      timestamp: new Date().toISOString()
    }, null, 2));

    if (data.userEmail === user.email) {
      console.log('📢 Ignoring broadcast from self');
      return;
    }

    callbacks.onProgressBroadcast?.(data);
  };

  const handleProgressSync = (data) => {
    console.log('🔄 Received progress sync:', JSON.stringify({
      courseId: data.courseId,
      progress: data.overallProgress,
      source: data.source,
      userEmail: data.userEmail,
      timestamp: new Date().toISOString()
    }, null, 2));
    callbacks.onProgressSync?.(data);
  };

  // Setup event listeners
  console.log('🎧 Setting up broadcast listeners:', JSON.stringify({
    events: [PROGRESS_EVENTS.RECEIVE.BROADCAST, PROGRESS_EVENTS.RECEIVE.SYNC],
    userEmail: user?.email,
    socketId: socket?.id,
    timestamp: new Date().toISOString()
  }, null, 2));

  socket.on(PROGRESS_EVENTS.RECEIVE.BROADCAST, handleProgressBroadcast);
  socket.on(PROGRESS_EVENTS.RECEIVE.SYNC, handleProgressSync);

  // Return cleanup function
  return () => {
    console.log('🧹 Cleaning up broadcast listeners:', JSON.stringify({
      events: [PROGRESS_EVENTS.RECEIVE.BROADCAST, PROGRESS_EVENTS.RECEIVE.SYNC],
      userEmail: user?.email,
      socketId: socket?.id,
      timestamp: new Date().toISOString()
    }, null, 2));

    socket.off(PROGRESS_EVENTS.RECEIVE.BROADCAST, handleProgressBroadcast);
    socket.off(PROGRESS_EVENTS.RECEIVE.SYNC, handleProgressSync);
  };
};

export const createProgressBroadcastEmitters = (socket, user) => {
  const broadcastProgress = (data) => {
    if (!data.courseId || !data.enrollmentId) {
      console.error('Missing required fields for progress broadcast', JSON.stringify({
        hasCourseId: !!data.courseId,
        hasEnrollmentId: !!data.enrollmentId,
        timestamp: new Date().toISOString()
      }, null, 2));
      return;
    }

    const broadcastData = {
      type: 'courseProgress',
      ...data,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    };

    socket.emit(PROGRESS_EVENTS.SEND.BROADCAST, broadcastData, (response) => {
      if (response?.error) {
        console.error('❌ Broadcast error:', JSON.stringify({
          error: response.error,
          details: response.details,
          timestamp: new Date().toISOString()
        }, null, 2));
      } else {
        console.log('✅ Broadcast acknowledged:', JSON.stringify({
          courseId: broadcastData.courseId,
          progress: broadcastData.overallProgress,
          timestamp: new Date().toISOString()
        }, null, 2));
      }
    });
  };

  const requestProgressSync = (courseId) => {
    if (!courseId) {
      console.error('Missing courseId for progress sync request');
      return;
    }

    console.log('🔄 Requesting progress sync:', JSON.stringify({
      courseId,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    socket.emit(PROGRESS_EVENTS.SEND.REQUEST_SYNC, { 
      type: 'syncRequest',
      courseId,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    }, (response) => {
      if (response?.error) {
        console.error('❌ Sync request error:', JSON.stringify({
          error: response.error,
          details: response.details,
          timestamp: new Date().toISOString()
        }, null, 2));
      } else {
        console.log('✅ Sync request acknowledged:', JSON.stringify({
          courseId,
          timestamp: new Date().toISOString()
        }, null, 2));
      }
    });
  };

  return {
    broadcastProgress,
    requestProgressSync
  };
};
