// Progress-related socket events
export const PROGRESS_EVENTS = {
  SEND: {
    UPDATE: 'updateProgress',
    BROADCAST: 'broadcastProgress',
    REQUEST: 'requestProgress'
  },
  RECEIVE: {
    UPDATE: 'courseProgress',
    BROADCAST: 'progressBroadcast',
    SYNC: 'progressSync'
  }
};

// Progress event handlers
export const createProgressEventHandlers = (socket, user, callbacks = {}) => {
  const handleProgressUpdate = (data) => {
    console.log('✅ Received progress update:', JSON.stringify({
      courseId: data.courseId,
      progress: data.overallProgress,
      timestamp: new Date().toISOString()
    }, null, 2));
    callbacks.onProgressUpdate?.(data);
  };

  const handleProgressBroadcast = (data) => {
    console.log('📢 Received progress broadcast:', JSON.stringify({
      courseId: data.courseId,
      progress: data.overallProgress,
      timestamp: new Date().toISOString()
    }, null, 2));
    callbacks.onProgressBroadcast?.(data);
  };

  const handleProgressSync = (data) => {
    console.log('🔄 Received progress sync:', JSON.stringify({
      courseId: data.courseId,
      progress: data.overallProgress,
      timestamp: new Date().toISOString()
    }, null, 2));
    callbacks.onProgressSync?.(data);
  };

  // Setup event listeners
  socket.on(PROGRESS_EVENTS.RECEIVE.UPDATE, handleProgressUpdate);
  socket.on(PROGRESS_EVENTS.RECEIVE.BROADCAST, handleProgressBroadcast);
  socket.on(PROGRESS_EVENTS.RECEIVE.SYNC, handleProgressSync);

  // Return cleanup function
  return () => {
    socket.off(PROGRESS_EVENTS.RECEIVE.UPDATE, handleProgressUpdate);
    socket.off(PROGRESS_EVENTS.RECEIVE.BROADCAST, handleProgressBroadcast);
    socket.off(PROGRESS_EVENTS.RECEIVE.SYNC, handleProgressSync);
  };
};

// Progress event emitters
export const createProgressEmitters = (socket, user) => {
  const sendProgressUpdate = (data) => {
    if (!data.courseId || !data.enrollmentId) {
      console.error('Missing required fields for progress update', JSON.stringify(data, null, 2));
      return;
    }

    const progressData = {
      ...data,
      userEmail: user?.email,
      componentProgress: data.componentProgress || {
        videos: { total: 0, completed: 0 },
        quizzes: { total: 0, completed: 0 }
      },
      totalComponents: data.totalComponents || 0,
      completedComponents: data.completedComponents || 0,
      overallProgress: data.overallProgress || 0,
      topicsProgress: data.topicsProgress || {},
      timestamp: new Date().toISOString()
    };

    console.log('📤 Emitting progress update:', JSON.stringify(progressData, null, 2));
    socket.emit(PROGRESS_EVENTS.SEND.UPDATE, progressData, (response) => {
      if (response?.error) {
        console.error('❌ Server reported error:', response.error);
      } else {
        console.log('✅ Server acknowledged progress update:', response);
      }
    });
  };

  const broadcastProgress = (data) => {
    console.log('📢 Broadcasting progress:', JSON.stringify(data, null, 2));
    socket.emit(PROGRESS_EVENTS.SEND.BROADCAST, data);
  };

  const requestProgressSync = (courseId) => {
    console.log('🔄 Requesting progress sync:', JSON.stringify({ courseId }, null, 2));
    socket.emit(PROGRESS_EVENTS.SEND.REQUEST, { courseId });
  };

  return {
    sendProgressUpdate,
    broadcastProgress,
    requestProgressSync
  };
};
