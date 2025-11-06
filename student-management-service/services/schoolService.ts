import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import MessageQueueService from "./messageQueue";
import { UserDataResponseConsumer } from "./events/consumers/userDataResponseConsumer";

interface GetSchoolStudentsParams {
  schoolId: string;
  page: number;
  limit: number;
  status?: EnrollmentStatus;
  messageQueue: MessageQueueService;
}

interface SchoolStudent {
  id: string;
  courseId: string;
  userEmail: string | null;
  status: EnrollmentStatus;
  progress: number;
  amount: any;
  currency: string | null;
  enrolledAt: Date;
  updatedAt: Date;
  completedComponents: number;
  totalComponents: number;
  componentProgress: any;
  topicsProgress: any;
  lastProgressUpdate: Date | null;
  certificate: any;
  paymentStatus: string;
  schoolId: string | undefined;
  user: {
    email: string;
    name: string;
    firstName: string;
    lastName: string;
  };
}

interface GetSchoolStudentsResult {
  students: SchoolStudent[];
  totalCount: number;
}

export class SchoolService {
  async getSchoolStudents(params: GetSchoolStudentsParams): Promise<GetSchoolStudentsResult> {
    const { schoolId, page, limit, status, messageQueue } = params;
    const skip = (page - 1) * limit;

    // Get enrollments for the school via RevenueShare
    const enrollmentsWithRevenue = await prisma.enrollment.findMany({
      where: {
        payments: {
          some: {
            revenueShare: {
              schoolId: schoolId
            }
          }
        },
        ...(status && { status })
      },
      include: {
        payments: {
          include: {
            revenueShare: true
          }
        },
        certificate: true,
        refunds: true,
        courseProgress: {
          select: {
            overallProgress: true,
            completedComponents: true,
            totalComponents: true,
            componentProgress: true,
            topicsProgress: true,
            lastUpdated: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.enrollment.count({
      where: {
        payments: {
          some: {
            revenueShare: {
              schoolId: schoolId
            }
          }
        },
        ...(status && { status })
      }
    });

    // Get unique user emails, filtering out null values
    const userEmails = [...new Set(enrollmentsWithRevenue.map(e => e.userEmail).filter((email): email is string => email !== null))];

    // Get user data via RMQ
    const userMap = await this.fetchUserDataViaRMQ(userEmails, messageQueue);

    // Enrich enrollments with available data
    const students: SchoolStudent[] = enrollmentsWithRevenue.map(enrollment => ({
      id: enrollment.id,
      courseId: enrollment.courseId,
      userEmail: enrollment.userEmail,
      status: enrollment.status,
      progress: enrollment.courseProgress?.[0]?.overallProgress ?? enrollment.progress ?? 0,
      amount: enrollment.amount,
      currency: enrollment.currency,
      enrolledAt: enrollment.enrolledAt,
      updatedAt: enrollment.updatedAt,
      completedComponents: enrollment.courseProgress?.[0]?.completedComponents ?? 0,
      totalComponents: enrollment.courseProgress?.[0]?.totalComponents ?? 0,
      componentProgress: enrollment.courseProgress?.[0]?.componentProgress ?? {},
      topicsProgress: enrollment.courseProgress?.[0]?.topicsProgress ?? {},
      lastProgressUpdate: enrollment.courseProgress?.[0]?.lastUpdated ?? null,
      certificate: enrollment.certificate,
      paymentStatus: enrollment.payments?.[0]?.status || 'PENDING',
      schoolId: enrollment.payments?.[0]?.revenueShare?.schoolId,
      user: userMap.get(enrollment.userEmail || '') || {
        email: enrollment.userEmail || 'unknown',
        name: 'Loading...',
        firstName: 'Loading',
        lastName: '...'
      }
    }));

    return {
      students,
      totalCount
    };
  }

  private async fetchUserDataViaRMQ(userEmails: string[], messageQueue: MessageQueueService): Promise<Map<string, any>> {
    return new Promise(async (resolve) => {
      if (userEmails.length === 0) {
        resolve(new Map());
        return;
      }

      const requestId = `school-students-${Date.now()}`;

      try {
        // Send request to user service via RMQ
        await messageQueue.publishUserDataRequest({
          requestId,
          userEmails,
          requesterService: 'student-management'
        });

        // Wait for response (with timeout)
        const timeout = 5000; // 5 seconds
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
          const cachedResponse = UserDataResponseConsumer.getUserDataFromCache(requestId);
          
          if (cachedResponse) {
            console.log(`✅ Received user data response for requestId: ${requestId}`);
            
            if (cachedResponse.success && cachedResponse.userData) {
              const userMap = new Map();
              cachedResponse.userData.forEach((user: any) => {
                userMap.set(user.email, user);
              });
              
              // Clean up cache
              UserDataResponseConsumer.removeFromCache(requestId);
              resolve(userMap);
              return;
            } else {
              console.log(`❌ User data request failed: ${cachedResponse.error}`);
              UserDataResponseConsumer.removeFromCache(requestId);
              resolve(new Map());
              return;
            }
          }
          
          // Wait 100ms before checking again
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`⏰ Timeout waiting for user data response for requestId: ${requestId}`);
        resolve(new Map());
        
      } catch (error) {
        console.error('Error fetching user data via RMQ:', error);
        resolve(new Map());
      }
    });
  }
}