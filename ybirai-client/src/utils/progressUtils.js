export const formatProgressUpdate = ({
    courseId,
    enrollmentId,
    topicId,
    userEmail,
    progressData,
    componentProgress,
    topicsProgress,
    totalComponents,
    completedComponents,
    overallProgress
  }) => {
    const progressUpdate = {
      type: 'videoProgress',
      courseId,
      enrollmentId,
      topicId,
      userEmail,
      value: progressData.progress,
      componentProgress,
      topicsProgress,
      totalComponents,
      completedComponents,
      overallProgress,
      timestamp: new Date().toISOString()
    };
  
    console.log('Video Progress Update:', JSON.stringify(progressUpdate, null, 2));
    return progressUpdate;
  };