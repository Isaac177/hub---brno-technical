import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface VideoProgress {
  id: string;
  progress: number;
  lastUpdated: string;
  duration: number;
  currentTime: number;
  completed: boolean;
  milestone: string;
}

export interface QuizProgress {
  id: string;
  score: number;
  totalPossibleScore: number;
  completed: boolean;
  lastUpdated: string;
}

export interface ComponentProgress {
  videos: {
    total: number;
    completed: number;
    byId: Record<string, VideoProgress>;
  };
  quizzes: {
    total: number;
    completed: number;
    byId: Record<string, QuizProgress>;
  };
}

export interface TopicsProgress {
  [topicId: string]: {
    videoProgress?: number;
    quizProgress?: number;
    lastUpdated: string;
  };
}

export interface ProgressUpdate {
  type: 'videoProgress' | 'quizProgress';
  courseId: string;
  enrollmentId: string;
  userEmail: string;
  value: number;
  componentProgress: ComponentProgress;
  topicsProgress: TopicsProgress;
  totalComponents: number;
  completedComponents: number;
  overallProgress: number;
}

const calculateOverallProgress = (componentProgress: ComponentProgress): number => {
  const { videos, quizzes } = componentProgress;
  
  // Calculate video completion percentage
  const videoProgress = videos.total > 0 
    ? (videos.completed / videos.total) * 100 
    : 0;
  
  // Calculate quiz completion percentage
  const quizProgress = quizzes.total > 0 
    ? (quizzes.completed / quizzes.total) * 100 
    : 0;
  
  // Overall progress is the average of video and quiz progress
  const totalTypes = (videos.total > 0 ? 1 : 0) + (quizzes.total > 0 ? 1 : 0);
  return totalTypes > 0 ? (videoProgress + quizProgress) / totalTypes : 0;
};

export const getProgress = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(401).json({ 
        error: 'Unauthorized - User email not found',
        details: { courseId, userEmail }
      });
    }

    console.log('Fetching progress:', JSON.stringify({
      courseId,
      userEmail,
      timestamp: new Date().toISOString()
    }, null, 2));

    const progressData = await prisma.courseProgress.findFirst({
      where: {
        courseId,
        userEmail: userEmail as string
      }
    });

    if (!progressData) {
      const defaultProgress = {
        courseId,
        userEmail,
        components: {},
        componentProgress: {
          videos: { total: 0, completed: 0 },
          quizzes: { total: 0, completed: 0 }
        },
        totalComponents: 0,
        completedComponents: 0,
        overallProgress: 0,
        topicsProgress: {},
        timestamp: new Date().toISOString()
      };

      return res.json(defaultProgress);
    }

    return res.json({
      ...progressData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const progressUpdate: Omit<ProgressUpdate, 'overallProgress'> = req.body;
    const { 
      type, 
      courseId, 
      enrollmentId, 
      userEmail,
      componentProgress,
      topicsProgress
    } = progressUpdate;

    // Log incoming request
    console.log('Incoming progress update request:', JSON.stringify({
      type,
      courseId,
      enrollmentId,
      userEmail,
      componentProgress,
      topicsProgress,
      timestamp: new Date().toISOString()
    }, null, 2));

    if (!courseId || !enrollmentId || !userEmail) {
      console.log('Missing required fields:', JSON.stringify({
        hasCourseId: !!courseId,
        hasEnrollmentId: !!enrollmentId,
        hasUserEmail: !!userEmail
      }, null, 2));
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          hasCourseId: !!courseId,
          hasEnrollmentId: !!enrollmentId,
          hasUserEmail: !!userEmail
        }
      });
    }

    const existingProgress = await prisma.courseProgress.findUnique({
      where: {
        enrollmentId_courseId: {
          enrollmentId,
          courseId
        }
      }
    });

    console.log('Existing progress found:', JSON.stringify(existingProgress, null, 2));

    const existingComponentProgress = existingProgress?.componentProgress as unknown as ComponentProgress || {
      videos: { total: 0, completed: 0, byId: {} },
      quizzes: { total: 0, completed: 0, byId: {} }
    };

    // Handle quiz progress update
    if (type === 'quizProgress') {
      const quizId = Object.keys(componentProgress.quizzes.byId)[0];
      const existingQuiz = existingComponentProgress.quizzes.byId[quizId];
      const newQuiz = componentProgress.quizzes.byId[quizId];

      console.log('Quiz progress comparison:', JSON.stringify({
        quizId,
        existingScore: existingQuiz?.score,
        newScore: newQuiz.score,
        isExistingQuiz: !!existingQuiz
      }, null, 2));

      if (existingQuiz) {
        // If quiz exists, only update if new score is higher
        if (newQuiz.score > (existingQuiz.score || 0)) {
          console.log('Updating existing quiz with higher score');
          existingComponentProgress.quizzes.byId[quizId] = {
            id: quizId,
            score: newQuiz.score,
            totalPossibleScore: newQuiz.totalPossibleScore,
            completed: newQuiz.completed,
            lastUpdated: newQuiz.lastUpdated
          } as QuizProgress;
        } else {
          console.log('Skipping update - new score is not higher than existing score');
          return res.json({
            success: true,
            data: existingProgress
          });
        }
      } else {
        // New quiz completion
        existingComponentProgress.quizzes.byId[quizId] = {
          id: quizId,
          score: newQuiz.score,
          totalPossibleScore: newQuiz.totalPossibleScore,
          completed: newQuiz.completed,
          lastUpdated: newQuiz.lastUpdated
        } as QuizProgress;
      }

      // Calculate completed quizzes
      const completedQuizzes = Object.values(existingComponentProgress.quizzes.byId)
        .filter(quiz => quiz.completed).length;

      existingComponentProgress.quizzes.completed = completedQuizzes;

      // Calculate overall progress
      const overallProgress = calculateOverallProgress(existingComponentProgress);

      const updatedProgress = await prisma.courseProgress.upsert({
        where: {
          enrollmentId_courseId: {
            enrollmentId,
            courseId
          }
        },
        create: {
          courseId,
          enrollmentId,
          userEmail,
          components: {},
          componentProgress: existingComponentProgress as unknown as Prisma.InputJsonObject,
          topicsProgress: topicsProgress as Prisma.InputJsonObject,
          totalComponents: componentProgress.quizzes.total + componentProgress.videos.total,
          completedComponents: completedQuizzes + existingComponentProgress.videos.completed,
          overallProgress
        },
        update: {
          componentProgress: existingComponentProgress as unknown as Prisma.InputJsonObject,
          topicsProgress: {
            ...(existingProgress?.topicsProgress as Record<string, unknown> || {}),
            ...topicsProgress
          } as Prisma.InputJsonObject,
          completedComponents: completedQuizzes + existingComponentProgress.videos.completed,
          overallProgress,
          lastUpdated: new Date()
        }
      });

      console.log('Final progress update:', JSON.stringify({
        success: true,
        data: updatedProgress
      }, null, 2));

      return res.json({
        success: true,
        data: updatedProgress
      });
    }

    // Check if we're updating an existing video component
    if (type === 'videoProgress') {
      const videoId = Object.keys(componentProgress.videos.byId)[0];
      const existingVideo = existingComponentProgress.videos.byId[videoId];
      const newVideo = componentProgress.videos.byId[videoId];

      console.log('Video progress comparison:', JSON.stringify({
        videoId,
        existingProgress: existingVideo?.progress,
        newProgress: newVideo.progress,
        isExistingVideo: !!existingVideo
      }, null, 2));

      if (existingVideo) {
        // If video exists, only update progress if new progress is higher
        if (newVideo.progress > existingVideo.progress) {
          console.log('Updating existing video with higher progress');
          
          existingComponentProgress.videos.byId[videoId] = {
            ...existingVideo,
            progress: newVideo.progress,
            currentTime: newVideo.currentTime,
            lastUpdated: newVideo.lastUpdated,
            completed: newVideo.progress >= 90
          };

          // Update topics progress
          const mergedTopicsProgress: Prisma.JsonObject = {
            ...existingProgress?.topicsProgress as TopicsProgress,
            [videoId]: {
              videoProgress: newVideo.progress,
              lastUpdated: newVideo.lastUpdated
            }
          };

          // Only update the progress record with new times
          const updatedProgress = await prisma.courseProgress.update({
            where: {
              enrollmentId_courseId: {
                enrollmentId,
                courseId
              }
            },
            data: {
              componentProgress: existingComponentProgress as unknown as Prisma.InputJsonObject,
              topicsProgress: mergedTopicsProgress as Prisma.InputJsonObject,
              lastUpdated: new Date()
            }
          });

          console.log('Progress updated successfully:', JSON.stringify(updatedProgress, null, 2));
          return res.json({
            success: true,
            data: updatedProgress
          });
        } else {
          console.log('Skipping update - new progress is not higher than existing progress');
          return res.json({
            success: true,
            data: existingProgress
          });
        }
      }
    }

    console.log('Creating new progress record or handling quiz update');

    // If we reach here, we're either:
    // 1. Adding a new component
    // 2. Updating a quiz
    // 3. First time creating the progress record
    const mergedComponentProgress: Prisma.JsonObject | any = {
      videos: {
        ...existingComponentProgress.videos,
        total: componentProgress.videos?.total || existingComponentProgress.videos?.total || 0,
        completed: componentProgress.videos?.completed || existingComponentProgress.videos?.completed || 0,
        byId: {
          ...existingComponentProgress.videos?.byId,
          ...(componentProgress.videos?.byId || {})
        }
      },
      quizzes: {
        ...existingComponentProgress.quizzes,
        total: componentProgress.quizzes?.total || existingComponentProgress.quizzes?.total || 0,
        completed: componentProgress.quizzes?.completed || existingComponentProgress.quizzes?.completed || 0,
        byId: {
          ...existingComponentProgress.quizzes?.byId,
          ...(componentProgress.quizzes?.byId || {})
        }
      }
    };

    console.log('Merged component progress:', JSON.stringify(mergedComponentProgress, null, 2));

    const existingTopicsProgress = existingProgress?.topicsProgress as TopicsProgress || {};
    const mergedTopicsProgress: Prisma.JsonObject = {
      ...existingTopicsProgress,
      ...topicsProgress
    };

    // Calculate overall progress
    const overallProgress = calculateOverallProgress(mergedComponentProgress as unknown as ComponentProgress);

    console.log('Calculated overall progress:', overallProgress);

    const updatedProgress = await prisma.courseProgress.upsert({
      where: {
        enrollmentId_courseId: {
          enrollmentId,
          courseId
        }
      },
      create: {
        courseId,
        enrollmentId,
        userEmail,
        components: {},
        componentProgress: mergedComponentProgress as Prisma.InputJsonObject,
        topicsProgress: mergedTopicsProgress as Prisma.InputJsonObject,
        totalComponents: mergedComponentProgress.videos.total + (mergedComponentProgress.quizzes?.total || 0),
        completedComponents: mergedComponentProgress.videos.completed + (mergedComponentProgress.quizzes?.completed || 0),
        overallProgress
      },
      update: {
        componentProgress: mergedComponentProgress as Prisma.InputJsonObject,
        topicsProgress: mergedTopicsProgress as Prisma.InputJsonObject,
        totalComponents: mergedComponentProgress.videos.total + (mergedComponentProgress.quizzes?.total || 0),
        completedComponents: mergedComponentProgress.videos.completed + (mergedComponentProgress.quizzes?.completed || 0),
        overallProgress,
        lastUpdated: new Date()
      }
    });

    console.log('Final progress update:', JSON.stringify({
      success: true,
      data: updatedProgress
    }, null, 2));

    // Update enrollment status if needed
    if (type === 'videoProgress' && overallProgress >= 100) {
      console.log('Updating enrollment status to completed');
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { 
          progress: overallProgress,
          completedAt: new Date(),
          status: 'COMPLETED'
        }
      });
    }

    return res.json({
      success: true,
      data: updatedProgress
    });

  } catch (error) {
    console.error('Error updating progress:', JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, null, 2));
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};