// contexts/CourseProgressContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CourseProgressContext = createContext();

const initialProgressState = {
  componentProgress: {
    videos: {
      byId: {},
      total: 0,
      completed: 0
    },
    quizzes: {
      byId: {},
      total: 0,
      completed: 0
    }
  },
  totalComponents: 0,
  completedComponents: 0,
  overallProgress: 0,
  topicsProgress: {},
  isLoading: true,
  initialProgressLoaded: false
};

export const useCourseProgress = () => {
  const context = useContext(CourseProgressContext);
  if (!context) {
    throw new Error('useCourseProgress must be used within a CourseProgressProvider');
  }
  return context;
};

export const CourseProgressProvider = ({ children, course, enrollmentId }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(initialProgressState);

  // Initialize course components from syllabus and quizzes
  const initializeCourseComponents = useCallback(() => {
    console.log('Initializing course components with:', JSON.stringify({
      courseId: course?.id,
      hasSyllabus: !!course?.syllabus,
      hasQuizzes: !!course?.quizzes,
      enrollmentId
    }, null, 2));

    if (!course?.syllabus || !course?.quizzes) {
      console.warn('Missing required course data:', {
        hasSyllabus: !!course?.syllabus,
        hasQuizzes: !!course?.quizzes
      });
      return null;
    }

    // Initialize videos from syllabus
    const videoComponents = { byId: {}, total: 0, completed: 0 };
    course.syllabus.forEach(section => {
      section.topics?.forEach(topic => {
        if (topic.videoUrl) {
          videoComponents.byId[topic.id] = {
            id: topic.id,
            sectionId: section.id,
            title: topic.title,
            duration: topic.duration,
            progress: 0,
            completed: false,
            lastUpdated: null
          };
          videoComponents.total++;
        }
      });
    });

    // Initialize quizzes
    const quizComponents = { byId: {}, total: 0, completed: 0 };
    course.quizzes.forEach(quiz => {
      quizComponents.byId[quiz.id] = {
        id: quiz.id,
        topicId: quiz.topicId,
        title: quiz.title,
        score: 0,
        completed: false,
        lastUpdated: null
      };
      quizComponents.total++;
    });

    const initialState = {
      componentProgress: {
        videos: videoComponents,
        quizzes: quizComponents
      },
      totalComponents: videoComponents.total + quizComponents.total,
      completedComponents: 0,
      overallProgress: 0,
      topicsProgress: {},
      isLoading: false,
      initialProgressLoaded: true
    };

    console.log('Initialized course progress state:', JSON.stringify(initialState, null, 2));
    return initialState;
  }, [course, enrollmentId]);

  useEffect(() => {
    const initialState = initializeCourseComponents();
    if (initialState) {
      setProgress(initialState);
    }
  }, [initializeCourseComponents]);

  const updateProgress = useCallback((newProgress) => {
    console.log('Updating course progress with:', JSON.stringify(newProgress, null, 2));
    setProgress(prev => ({
      ...prev,
      ...newProgress,
      initialProgressLoaded: true,
      isLoading: false
    }));
  }, []);

  const value = {
    progress,
    setProgress: updateProgress,
    initializeCourseComponents,
    courseId: course?.id,
    enrollmentId,
    isLoading: progress.isLoading,
    initialProgressLoaded: progress.initialProgressLoaded
  };

  return (
    <CourseProgressContext.Provider value={value}>
      {children}
    </CourseProgressContext.Provider>
  );
};

export default CourseProgressProvider;