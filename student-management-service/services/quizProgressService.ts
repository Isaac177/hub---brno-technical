import { prisma } from "../lib/prisma";

export class QuizProgressService {
  async getQuizProgressByEnrollmentId(enrollmentId: string) {
    try {
      return await prisma.quizProgress.findMany({
        where: { enrollmentId },
        select: {
          id: true,
          quizId: true,
          enrollmentId: true,
          attempts: true,
          bestScore: true,
          passed: true,
          lastAttemptAt: true
        }
      });
    } catch (error) {
      console.error('Error getting quiz progress by enrollment ID:', error);
      return [];
    }
  }

  async getQuizProgressByUserId(userId: string) {
    try {
      // Get quiz progress through enrollments
      const enrollments = await prisma.enrollment.findMany({
        where: { 
          OR: [
            { userEmail: userId },
            { userId: userId }
          ]
        },
        select: { id: true }
      });

      const enrollmentIds = enrollments.map(e => e.id);

      return await prisma.quizProgress.findMany({
        where: { 
          enrollmentId: { in: enrollmentIds }
        },
        include: {
          enrollment: {
            select: {
              courseId: true,
              userEmail: true,
              userId: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting quiz progress by user ID:', error);
      return [];
    }
  }

  async getQuizProgressByQuizId(quizId: string) {
    try {
      return await prisma.quizProgress.findMany({
        where: { quizId },
        include: {
          enrollment: {
            select: {
              courseId: true,
              userEmail: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting quiz progress by quiz ID:', error);
      return [];
    }
  }

  async getQuizCompletionStats(enrollmentId?: string) {
    try {
      const where = enrollmentId ? { enrollmentId } : {};
      
      const totalAttempts = await prisma.quizProgress.count({ where });
      const passedAttempts = await prisma.quizProgress.count({ 
        where: { ...where, passed: true }
      });
      
      const completionRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

      return {
        totalAttempts,
        passedAttempts,
        completionRate: Math.round(completionRate * 100) / 100
      };
    } catch (error) {
      console.error('Error getting quiz completion stats:', error);
      return {
        totalAttempts: 0,
        passedAttempts: 0,
        completionRate: 0
      };
    }
  }
}