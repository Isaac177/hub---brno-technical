import { prisma } from "../lib/prisma";

export class CourseProgressService {
  async getProgressByEnrollmentId(enrollmentId: string) {
    try {
      return await prisma.courseProgress.findFirst({
        where: { enrollmentId },
        select: {
          id: true,
          enrollmentId: true,
          courseId: true,
          overallProgress: true,
          totalComponents: true,
          completedComponents: true,
          lastUpdated: true
        }
      });
    } catch (error) {
      console.error('Error getting course progress by enrollment ID:', error);
      return null;
    }
  }

  async getProgressByUserId(userId: string) {
    try {
      // Get course progress through enrollments
      const enrollments = await prisma.enrollment.findMany({
        where: { 
          OR: [
            { userEmail: userId },
            { userId: userId }
          ]
        },
        select: { id: true, courseId: true }
      });

      const enrollmentIds = enrollments.map(e => e.id);

      return await prisma.courseProgress.findMany({
        where: { 
          enrollmentId: { in: enrollmentIds }
        },
        include: {
          enrollment: {
            select: {
              courseId: true,
              userEmail: true,
              userId: true,
              status: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting course progress by user ID:', error);
      return [];
    }
  }

  async getProgressByCourseId(courseId: string) {
    try {
      // Get course progress through enrollments for a specific course
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        select: { id: true }
      });

      const enrollmentIds = enrollments.map(e => e.id);

      return await prisma.courseProgress.findMany({
        where: { 
          enrollmentId: { in: enrollmentIds }
        },
        include: {
          enrollment: {
            select: {
              courseId: true,
              userEmail: true,
              status: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting course progress by course ID:', error);
      return [];
    }
  }

  async getAverageProgressBySchool(schoolId: string) {
    try {
      // This would need to be filtered by school through course data
      // For now, return average of all progress
      const result = await prisma.courseProgress.aggregate({
        _avg: {
          overallProgress: true
        }
      });

      return result._avg.overallProgress || 0;
    } catch (error) {
      console.error('Error getting average progress by school:', error);
      return 0;
    }
  }

  async getProgressStats(enrollmentId?: string) {
    try {
      const where = enrollmentId ? { enrollmentId } : {};
      
      const totalProgress = await prisma.courseProgress.findMany({ 
        where,
        select: { overallProgress: true }
      });

      if (totalProgress.length === 0) {
        return {
          averageProgress: 0,
          totalEntries: 0,
          completedCourses: 0
        };
      }

      const averageProgress = totalProgress.reduce((sum, p) => sum + (p.overallProgress || 0), 0) / totalProgress.length;
      const completedCourses = totalProgress.filter(p => (p.overallProgress || 0) >= 100).length;

      return {
        averageProgress: Math.round(averageProgress * 100) / 100,
        totalEntries: totalProgress.length,
        completedCourses
      };
    } catch (error) {
      console.error('Error getting progress stats:', error);
      return {
        averageProgress: 0,
        totalEntries: 0,
        completedCourses: 0
      };
    }
  }
}