import { prisma } from "../lib/prisma";

export class EnrollmentService {
  async getAllEnrollments() {
    try {
      console.log('Getting all enrollments for statistics collection');
      
      return await prisma.enrollment.findMany({
        select: {
          id: true,
          courseId: true,
          userEmail: true,
          userId: true,
          status: true,
          progress: true,
          enrolledAt: true,
          updatedAt: true,
          completedAt: true,
          certificate: true
        }
      });
    } catch (error) {
      console.error('Error getting all enrollments:', error);
      return [];
    }
  }

  async getEnrollmentsBySchoolId(schoolId: string) {
    try {
      console.log(`Getting enrollments for school: ${schoolId}`);
      
      // Get all enrollments and filter by schoolId from course data
      // Since we don't have direct schoolId in enrollment table, 
      // we need to fetch course data to check schoolId
      const enrollments = await prisma.enrollment.findMany({
        select: {
          id: true,
          courseId: true,
          userEmail: true,
          userId: true,
          status: true,
          progress: true,
          enrolledAt: true,
          updatedAt: true,
          completedAt: true
        }
      });

      // Filter enrollments by schoolId through course service
      // Note: This would typically require calling the course service to get course details
      // For now, we'll return all enrollments and let the consumer handle filtering
      return enrollments.map(enrollment => ({
        ...enrollment,
        userId: enrollment.userEmail // Map userEmail to userId for consistency
      }));
    } catch (error) {
      console.error('Error getting enrollments by school ID:', error);
      return [];
    }
  }

  async getEnrollmentById(enrollmentId: string) {
    try {
      return await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          payments: true,
          certificate: true,
          refunds: true,
          courseProgress: true
        }
      });
    } catch (error) {
      console.error('Error getting enrollment by ID:', error);
      return null;
    }
  }

  async getEnrollmentsByUserId(userId: string) {
    try {
      return await prisma.enrollment.findMany({
        where: { 
          OR: [
            { userEmail: userId },
            { userId: userId }
          ]
        },
        include: {
          courseProgress: true,
          certificate: true,
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              createdAt: true,
              paymentMethod: true,
              transactionReference: true
            }
          },
          quizProgress: true
        },
        orderBy: {
          enrolledAt: 'desc'
        }
      });
    } catch (error) {
      console.error('Error getting enrollments by user ID:', error);
      return [];
    }
  }

  async getEnrollmentsByStatus(status: string) {
    try {
      return await prisma.enrollment.findMany({
        where: { status: status as any },
        include: {
          courseProgress: true
        }
      });
    } catch (error) {
      console.error('Error getting enrollments by status:', error);
      return [];
    }
  }

  async getUserEnrollmentStats(userId: string) {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { 
          OR: [
            { userEmail: userId },
            { userId: userId }
          ]
        },
        select: {
          status: true,
          progress: true,
          completedAt: true,
          certificate: {
            select: {
              id: true
            }
          }
        }
      });

      const stats = {
        total: enrollments.length,
        active: enrollments.filter(e => e.status === 'ACTIVE').length,
        completed: enrollments.filter(e => e.status === 'COMPLETED').length,
        dropped: enrollments.filter(e => e.status === 'DROPPED').length,
        onHold: enrollments.filter(e => e.status === 'ON_HOLD').length,
        certificates: enrollments.filter(e => e.certificate).length,
        averageProgress: enrollments.length > 0 
          ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length 
          : 0
      };

      return stats;
    } catch (error) {
      console.error('Error getting user enrollment stats:', error);
      return {
        total: 0,
        active: 0,
        completed: 0,
        dropped: 0,
        onHold: 0,
        certificates: 0,
        averageProgress: 0
      };
    }
  }
}