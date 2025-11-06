// types.ts
interface VideoComponent {
  total: number;
  completed: number;
}

interface QuizComponent {
  total: number;
  completed: number;
}

interface ComponentProgress {
  videos: VideoComponent;
  quizzes: QuizComponent;
}

interface TopicProgress {
  videoProgress?: number;
  quizCompleted?: boolean;
  lastUpdated: string;
}

interface TopicsProgressMap {
  [topicId: string]: TopicProgress;
}

interface BaseProgressData {
  courseId: string;
  enrollmentId: string;
  timestamp: string;
  userEmail: string; // Make userEmail required
  componentProgress?: ComponentProgress;
  totalComponents?: number;
  completedComponents?: number;
  overallProgress?: number;
}

interface VideoProgressData extends BaseProgressData {
  type: 'videoProgress';
  topicId: string;
  value: number;
}

export interface CourseProgressData extends BaseProgressData {
  type: 'courseProgress';
  componentProgress: ComponentProgress;
  totalComponents: number;
  completedComponents: number;
  overallProgress: number;
  topicsProgress: TopicsProgressMap;
}

type ProgressData = VideoProgressData | CourseProgressData;


const calculateComponentProgress = (
  existingProgress: TopicsProgressMap,
  newTopicProgress?: { topicId: string; progress: TopicProgress }
): ComponentProgress => {
  const topicsProgress = newTopicProgress 
    ? { ...existingProgress, [newTopicProgress.topicId]: newTopicProgress.progress }
    : existingProgress;

  const videos = {
    total: Object.keys(topicsProgress).length,
    completed: Object.values(topicsProgress).filter(
      topic => topic.videoProgress && topic.videoProgress >= 50
    ).length
  };

  const quizzes = {
    total: Object.keys(topicsProgress).length,
    completed: Object.values(topicsProgress).filter(
      topic => topic.quizCompleted
    ).length
  };

  return { videos, quizzes };
};

const calculateOverallProgress = (componentProgress: ComponentProgress): number => {
  const totalComponents = 
    componentProgress.videos.total + 
    componentProgress.quizzes.total;

  const completedComponents = 
    componentProgress.videos.completed + 
    componentProgress.quizzes.completed;

  return totalComponents > 0 
    ? Math.round((completedComponents / totalComponents) * 100) 
    : 0;
};

import { Socket } from 'socket.io';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const validateProgressData = (data: ProgressData): string[] => {
  const errors: string[] = [];

  if (!data.courseId) errors.push('Missing courseId');
  if (!data.enrollmentId) errors.push('Missing enrollmentId');
  if (!data.timestamp) errors.push('Missing timestamp');
  if (!data.userEmail) errors.push('Missing userEmail');

  if (data.type === 'videoProgress') {
    if (!data.topicId) errors.push('Missing topicId');
    if (typeof data.value !== 'number') errors.push('Invalid video progress value');
  }

  if (data.type === 'courseProgress') {
    if (!data.componentProgress) errors.push('Missing componentProgress');
    if (typeof data.totalComponents !== 'number') errors.push('Invalid totalComponents');
    if (typeof data.completedComponents !== 'number') errors.push('Invalid completedComponents');
    if (typeof data.overallProgress !== 'number') errors.push('Invalid overallProgress');
    if (!data.topicsProgress) errors.push('Missing topicsProgress');
  }

  return errors;
};

export const handleProgressUpdate = (socket: Socket): void => {
  const { userId, email } = socket.handshake.auth;

  console.log('🔌 Setting up progress handler:', {
    socketId: socket.id,
    userId,
    email,
    timestamp: new Date().toISOString()
  });

  const updateProgress = async (
    data: ProgressData,
    callback: (response: { success?: boolean; error?: string; details?: any }) => void
  ): Promise<void> => {
    try {
      const validationErrors = validateProgressData(data);
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        callback({ error: 'Validation failed', details: validationErrors });
        return;
      }

      const existingProgress = await prisma.courseProgress.findUnique({
        where: {
          enrollmentId_courseId: {
            enrollmentId: data.enrollmentId,
            courseId: data.courseId,
          },
        },
      });

      if (data.type === 'videoProgress') {
        const { topicId, value } = data;
        const existingTopicsProgress: TopicsProgressMap = 
          (existingProgress?.topicsProgress as any) || {};

        const componentProgress = calculateComponentProgress(
          existingTopicsProgress,
          {
            topicId,
            progress: {
              videoProgress: value,
              lastUpdated: data.timestamp
            }
          }
        );

        const overallProgress = calculateOverallProgress(componentProgress);

        const result = await prisma.courseProgress.upsert({
          where: {
            enrollmentId_courseId: {
              enrollmentId: data.enrollmentId,
              courseId: data.courseId,
            },
          },
          create: {
            enrollmentId: data.enrollmentId,
            courseId: data.courseId,
            userEmail: data.userEmail,
            topicsProgress: {
              [topicId]: {
                videoProgress: value,
                lastUpdated: data.timestamp
              }
            } as Prisma.JsonObject,
            componentProgress: componentProgress as unknown as Prisma.JsonObject,
            totalComponents: componentProgress.videos.total + componentProgress.quizzes.total,
            completedComponents: componentProgress.videos.completed + componentProgress.quizzes.completed,
            overallProgress,
            lastUpdated: new Date(data.timestamp)
          },
          update: {
            userEmail: data.userEmail,
            topicsProgress: {
              ...existingTopicsProgress,
              [topicId]: {
                ...existingTopicsProgress[topicId],
                videoProgress: value,
                lastUpdated: data.timestamp
              }
            } as Prisma.JsonObject,
            componentProgress: componentProgress as unknown as Prisma.JsonObject,
            totalComponents: componentProgress.videos.total + componentProgress.quizzes.total,
            completedComponents: componentProgress.videos.completed + componentProgress.quizzes.completed,
            overallProgress,
            lastUpdated: new Date(data.timestamp)
          },
        });

        console.log('✅ Video progress updated:', {
          userEmail: data.userEmail,
          topicId,
          value,
          result
        });
        
        callback({ success: true });

        socket.broadcast.emit('progressBroadcast', {
          type: 'videoProgress',
          courseId: data.courseId,
          enrollmentId: data.enrollmentId,
          userEmail: data.userEmail,
          topicId,
          value,
          timestamp: data.timestamp
        });
      }

      if (data.type === 'courseProgress') {
        const result = await prisma.courseProgress.upsert({
          where: {
            enrollmentId_courseId: {
              enrollmentId: data.enrollmentId,
              courseId: data.courseId,
            },
          },
          create: {
            enrollmentId: data.enrollmentId,
            courseId: data.courseId,
            userEmail: data.userEmail,
            componentProgress: data.componentProgress as unknown as Prisma.JsonObject,
            topicsProgress: data.topicsProgress as unknown as Prisma.JsonObject,
            totalComponents: data.totalComponents,
            completedComponents: data.completedComponents,
            overallProgress: data.overallProgress,
            lastUpdated: new Date(data.timestamp)
          },
          update: {
            userEmail: data.userEmail,
            componentProgress: data.componentProgress as unknown as Prisma.JsonObject,
            topicsProgress: data.topicsProgress as unknown as Prisma.JsonObject,
            totalComponents: data.totalComponents,
            completedComponents: data.completedComponents,
            overallProgress: data.overallProgress,
            lastUpdated: new Date(data.timestamp)
          },
        });

        console.log('✅ Course progress updated:', {
          userEmail: data.userEmail,
          courseId: data.courseId,
          result
        });
        
        callback({ success: true });
      }
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      callback({ error: 'Database error', details: error });
    }
  };

  socket.on('updateProgress', updateProgress);

  socket.on('requestProgress', async (data: { courseId: string; enrollmentId: string; userEmail: string }) => {
    try {
      const progress = await prisma.courseProgress.findUnique({
        where: {
          enrollmentId_courseId: {
            enrollmentId: data.enrollmentId,
            courseId: data.courseId,
          },
        },
      });

      socket.emit('progressSync', progress || {
        courseId: data.courseId,
        enrollmentId: data.enrollmentId,
        userEmail: data.userEmail,
        componentProgress: {
          videos: { total: 0, completed: 0 },
          quizzes: { total: 0, completed: 0 }
        },
        topicsProgress: {},
        totalComponents: 0,
        completedComponents: 0,
        overallProgress: 0,
      });
    } catch (error) {
      console.error('❌ Error fetching progress:', error);
    }
  });
};