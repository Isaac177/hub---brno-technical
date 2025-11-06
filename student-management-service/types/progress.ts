import { Prisma } from '@prisma/client';

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
