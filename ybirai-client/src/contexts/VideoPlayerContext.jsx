import React, { createContext, useContext, useState, useCallback } from 'react';

const VideoPlayerContext = createContext();

export const VideoPlayerProvider = ({ children, courseId: contextCourseId, enrollmentId: contextEnrollmentId }) => {
  const [currentTopic, setCurrentTopic] = useState(null);
  const [topicProgress, setTopicProgress] = useState({});
  const [requiredWatchPercentage] = useState(50);

  const safeSetCurrentTopic = useCallback((topic, courseId, enrollmentId) => {
    if (!topic) {
      setCurrentTopic(null);
      return;
    }

    const effectiveCourseId = courseId || contextCourseId;
    const effectiveEnrollmentId = enrollmentId || contextEnrollmentId;

    if (!effectiveCourseId || !effectiveEnrollmentId) {
      setCurrentTopic(null);
      return;
    }

    const updatedTopic = {
      ...topic,
      courseId: effectiveCourseId,
      enrollmentId: effectiveEnrollmentId
    };

    setCurrentTopic(updatedTopic);
  }, [contextCourseId, contextEnrollmentId]);

  const getFirstVideoTopic = useCallback((course) => {
    if (!course?.syllabus) return null;

    return course.syllabus
      .flatMap(section => section.topics || [])
      .find(topic => topic.videoUrl);
  }, []);

  const updateProgress = useCallback((topicId, progress) => {
    setTopicProgress(prev => ({
      ...prev,
      [topicId]: {
        progress,
        lastUpdated: new Date().toISOString()
      }
    }));
  }, []);

  const getTopicProgress = useCallback((topicId) => {
    return topicProgress[topicId] || { progress: 0 };
  }, [topicProgress]);

  const value = {
    currentTopic,
    setCurrentTopic: safeSetCurrentTopic,
    safeSetCurrentTopic,
    updateProgress,
    getTopicProgress,
    requiredWatchPercentage,
    getFirstVideoTopic
  };

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = () => {
  const context = useContext(VideoPlayerContext);

  if (!context) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
};

export default VideoPlayerProvider;
