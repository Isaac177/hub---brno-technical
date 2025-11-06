import { Request, Response, NextFunction } from "express";
import { EnrollmentStatus, PaymentStatus, Prisma } from "@prisma/client";
import { NotFoundError, BadRequestError } from "../utils/errors";
import axios, { AxiosResponse } from 'axios';
import { findCourseById } from "../utils/findCourseById";
import { prisma } from "../lib/prisma";

const userServiceUrl = process.env.USER_SERVICE_URL || 'https://user.ybyraihub.kz/api';

interface User {
  email: string;
  firstName: string;
  lastName: string;
  schoolId: string;
  role: string;
}

export const createEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      courseId,
      userEmail,
      language = 'ru',
      paymentDetails
    } = req.body;

    if (!courseId || !userEmail) {
      throw new BadRequestError('Course ID and user email are required');
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        courseId,
        userEmail,
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "User is already enrolled in this course",
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        userEmail,
        status: EnrollmentStatus.ON_HOLD,
        progress: 0,
        amount: paymentDetails?.amount || 0,
        currency: paymentDetails?.currency || 'KZT',
      },
      include: {
        payments: true,
        certificate: true,
        refunds: true,
        courseProgress: true
      }
    });

    // Prepare and send achievement message
    const achievementMessage = {
      type: 'COURSE_ENROLLMENT',
      data: {
        user_id: userEmail,
        course_id: courseId,
        type: 'enrollment',
        earned_at: new Date().toISOString(),
        completed_at: null,
        score: 0,
        metadata: {
          enrollmentId: enrollment.id,
          status: enrollment.status,
          language
        }
      }
    };

    await req.app.messageQueue.publishUserAchievement(achievementMessage);

    return res.status(201).json({
      status: "success",
      statusCode: 201,
      enrollment
    });

  } catch (error) {
    console.error("Error in createEnrollment:", error);
    next(error);
  }
};

export const listEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!req.query.schoolIds) {
      return res.status(400).json({
        error: 'schoolIds is required'
      });
    }

    // Convert ParsedQs to string array
    const schoolIdList: string[] = Array.isArray(req.query.schoolIds)
      ? req.query.schoolIds.map(id => String(id))
      : req.query.schoolIds.toString().split(',').map(id => id.trim());

    try {
      // Get total count for pagination
      const totalCount = await prisma.enrollment.count({
        where: {
          userEmail: {
            in: schoolIdList
          },
          ...(status && { status: status as EnrollmentStatus })
        }
      });

      // Get enrollments with all related data
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userEmail: {
            in: schoolIdList
          },
          ...(status && { status: status as EnrollmentStatus })
        },
        select: {
          id: true,
          courseId: true,
          userEmail: true,
          status: true,
          progress: true,
          amount: true,
          currency: true,
          enrolledAt: true,
          updatedAt: true,
          certificate: true,
          payments: {
            include: {
              revenueShare: true
            }
          },
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

      // Get unique user emails from enrollments
      const userEmails = [...new Set(enrollments.map(e => e.userEmail))];

      // Fetch user details for all emails at once
      const userPromises = userEmails.map(email =>
        axios.get(`${userServiceUrl}/user/byEmail/${email}`)
          .catch(err => {
            console.error(`Failed to fetch user for email ${email}:`, err);
            return null;
          })
      );

      const userResponses = await Promise.all(userPromises);
      const userMap = new Map(
        userResponses
          .filter(response => response && response.data)
          .map(response => [response!.data.email, response!.data])
      );

      // Fetch course details and combine all data
      const enrichedEnrollments = await Promise.all(
        enrollments.map(async (enrollment) => {
          try {
            // Get course details
            const courseResponse = await findCourseById(enrollment.courseId);
            const course = courseResponse.data;

            // Get user details from map
            const user = userMap.get(enrollment.userEmail);

            return {
              ...enrollment,
              course: course ? {
                id: course.id,
                title: course.title,
                description: course.description,
                level: course.level,
                duration: course.duration,
                price: course.price,
                language: course.language,
                imageUrl: course.imageUrl,
                schoolId: course.schoolId
              } : null,
              user: user ? {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                role: user.role,
                schoolId: user.schoolId
              } : null,
              paymentStatus: enrollment.payments?.[0]?.status || 'PENDING',
              totalAmount: enrollment.amount,
              currency: enrollment.currency || 'KZT',
              progress: enrollment.courseProgress?.[0]?.overallProgress ?? enrollment.progress ?? 0,
              completedComponents: enrollment.courseProgress?.[0]?.completedComponents ?? 0,
              totalComponents: enrollment.courseProgress?.[0]?.totalComponents ?? 0,
              componentProgress: enrollment.courseProgress?.[0]?.componentProgress ?? {},
              topicsProgress: enrollment.courseProgress?.[0]?.topicsProgress ?? {},
              lastProgressUpdate: enrollment.courseProgress?.[0]?.lastUpdated
            };
          } catch (error) {
            console.error(`Error enriching enrollment ${enrollment.id}:`, error);
            return {
              ...enrollment,
              course: null,
              user: null,
              error: 'Could not fetch complete details'
            };
          }
        })
      );

      res.status(200).json({
        success: true,
        data: enrichedEnrollments,
        meta: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch enrollments',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getEnrollmentsByUserEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userEmail = req.query.userEmail as string;

    if (!userEmail) {
      throw new BadRequestError('User email is required');
    }

    // Add database connection check
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error('[DEBUG] Database connection error:', {
        error: dbError instanceof Error ? dbError.message : dbError,
        userEmail
      });
      return res.status(503).json({
        success: false,
        error: 'Database connection unavailable',
        message: 'Please try again later'
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userEmail: userEmail
      },
      select: {
        id: true,
        courseId: true,
        status: true,
        progress: true,
        certificate: true,
        payments: {
          include: {
            revenueShare: true
          }
        },
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
      }
    });

    // Map the enrollments to include course progress
    const enrichedEnrollments = enrollments.map(enrollment => ({
      ...enrollment,
      progress: enrollment.courseProgress?.[0]?.overallProgress ?? enrollment.progress ?? 0,
      completedComponents: enrollment.courseProgress?.[0]?.completedComponents ?? 0,
      totalComponents: enrollment.courseProgress?.[0]?.totalComponents ?? 0,
      componentProgress: enrollment.courseProgress?.[0]?.componentProgress ?? {},
      topicsProgress: enrollment.courseProgress?.[0]?.topicsProgress ?? {},
      lastProgressUpdate: enrollment.courseProgress?.[0]?.lastUpdated
    }));

    res.status(200).json({
      success: true,
      data: enrichedEnrollments
    });
  } catch (error) {
    console.error("[DEBUG] getEnrollmentsByUserEmail - Error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userEmail: req.query.userEmail
    });

    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('TLS')) {
      return res.status(503).json({
        success: false,
        error: 'Database connection issue',
        message: 'Please check database configuration'
      });
    }

    next(error);
  }
};

export const getEnrollmentDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        payments: true,
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
      }
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    const course = await findCourseById(enrollment.courseId);

    let user: User | null = null;
    if (enrollment.userEmail) {
      try {
        const userResponse: AxiosResponse<User> = await axios.get(`${userServiceUrl}/user/byEmail/${enrollment.userEmail}`);
        user = userResponse.data;
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    }

    const enrichedEnrollment = {
      ...enrollment,
      progress: enrollment.courseProgress?.[0]?.overallProgress ?? enrollment.progress ?? 0,
      completedComponents: enrollment.courseProgress?.[0]?.completedComponents ?? 0,
      totalComponents: enrollment.courseProgress?.[0]?.totalComponents ?? 0,
      componentProgress: enrollment.courseProgress?.[0]?.componentProgress ?? {},
      topicsProgress: enrollment.courseProgress?.[0]?.topicsProgress ?? {},
      lastProgressUpdate: enrollment.courseProgress?.[0]?.lastUpdated,
      courseTitle: course?.title,
      courseLevel: course?.level,
      courseDuration: course?.duration,
      studentName: user ? `${user.firstName} ${user.lastName}`.trim() : null,
      studentEmail: enrollment.userEmail
    };

    res.status(200).json({
      success: true,
      data: enrichedEnrollment
    });
  } catch (error) {
    next(error);
  }
};

export const updateEnrollmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body);
  try {
    //const { id } = req.params;
    const { status, progress, id } = req.body;

    if (!["ACTIVE", "COMPLETED", "DROPPED", "ON_HOLD"].includes(status)) {
      throw new BadRequestError(req.t("enrollment.invalidStatus"));
    }

    const enrollment = await prisma.enrollment.findUnique({ where: { id } });

    if (!enrollment) {
      throw new NotFoundError(req.t("enrollment.enrollment"));
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        status,
        progress: progress !== undefined ? progress : enrollment.progress,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    res.status(200).json({
      message: req.t("enrollment.updateSuccess"),
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    next(error);
  }
};

async function processPayment(paymentDetails: any) {
  return { id: "mock-transaction-id" };
}

async function initializeProgressTracking(enrollmentId: string) {
  // Implement progress tracking initialization
}

async function sendConfirmationEmail(email: string, courseTitle: string) {
  // Implement email sending logic
}

export const checkEnrollmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = req.query.courseId as string;
    const userEmail = req.query.userEmail as string;

    console.log("incoming request", { userEmail, courseId }); // Better logging

    if (!courseId) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Course ID is required",
      });
    }

    try {
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          userEmail,
          courseId,
          status: "ACTIVE",
        },
      });

      if (!existingEnrollment) {
        return res.status(200).json({
          isEnrolled: false,
          enrollmentDetails: null,
        });
      }

      return res.status(200).json({
        isEnrolled: true,
        enrollmentDetails: {
          status: existingEnrollment.status,
          enrolledAt: existingEnrollment.enrolledAt,
          progress: existingEnrollment.progress,
        },
      });
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      res.status(500).json({
        error: 'Failed to check enrollment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error("Error in checkEnrollmentStatus:", error);
    next(error);
  }
};

export const getEnrollmentsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { schoolId } = req.query;

    const whereClause: Prisma.EnrollmentWhereInput = {
      userEmail: userId,
      status: EnrollmentStatus.ACTIVE,
      ...(schoolId && { OR: [{ userEmail: { in: [userId] } }] })
    };

    const enrollments = await prisma.enrollment.findMany({
      where: whereClause
    });

    if (!enrollments.length) {
      console.log('No enrollments found for:', { userId, schoolId });
    }

    return res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

export const activateEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('[activateEnrollment] Starting activation request:', {
    enrollmentId: req.params.enrollmentId,
    method: req.method,
    headers: req.headers,
    user: req.user
  });

  try {
    const { enrollmentId } = req.params;

    console.log('[activateEnrollment] Finding enrollment:', { enrollmentId });
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      console.log('[activateEnrollment] Enrollment not found:', { enrollmentId });
      throw new NotFoundError('Enrollment not found');
    }

    console.log('[activateEnrollment] Found enrollment:', {
      enrollmentId,
      currentStatus: enrollment.status
    });

    if (enrollment.status !== 'ON_HOLD') {
      console.log('[activateEnrollment] Invalid status:', {
        enrollmentId,
        currentStatus: enrollment.status
      });
      throw new BadRequestError('Enrollment is not in ON_HOLD status');
    }

    console.log('[activateEnrollment] Updating enrollment status:', {
      enrollmentId,
      newStatus: EnrollmentStatus.ACTIVE
    });

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: EnrollmentStatus.ACTIVE,
        updatedAt: new Date()
      },
    });

    console.log('[activateEnrollment] Successfully updated enrollment:', {
      enrollmentId,
      newStatus: updatedEnrollment.status
    });

    res.status(200).json({
      success: true,
      data: updatedEnrollment
    });
  } catch (error: any) {
    console.error('[activateEnrollment] Error:', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

export const getEnrollmentsByBatchCourseIds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseIds } = req.body;

    if (!courseIds || !Array.isArray(courseIds)) {
      throw new BadRequestError('Course IDs array is required');
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: {
          in: courseIds
        }
      },
      include: {
        payments: true,
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
      }
    });

    const userEmails = [...new Set(enrollments.map(enrollment => enrollment.userEmail))];

    try {
      const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080/api'
        : process.env.USER_SERVICE_URL;

      const userPromises = userEmails.map(async (email: string | null) => {
        try {

          if (!email) return null;

          const requestUrl = `${baseUrl}/user/byEmail/${encodeURIComponent(email)}`;
          const response = await axios.get(requestUrl);
          return response.data;
        } catch (error: any) {
          if (error.response) {
            console.warn('Error response:', error.response.data);
          }
          return null;
        }
      });

      const users = (await Promise.all(userPromises)).filter(user => user !== null);

      const userMap = new Map(users.map(user => [user.email, user]));

      const enrichedEnrollments = enrollments.map(enrollment => ({
        ...enrollment,
        user: userMap.get(enrollment.userEmail) || null,
        progress: enrollment.courseProgress?.[0]?.overallProgress ?? enrollment.progress ?? 0,
        completedComponents: enrollment.courseProgress?.[0]?.completedComponents ?? 0,
        totalComponents: enrollment.courseProgress?.[0]?.totalComponents ?? 0,
        componentProgress: enrollment.courseProgress?.[0]?.componentProgress ?? {},
        topicsProgress: enrollment.courseProgress?.[0]?.topicsProgress ?? {},
        lastProgressUpdate: enrollment.courseProgress?.[0]?.lastUpdated
      }));

      return res.status(200).json({
        success: true,
        enrollments: enrichedEnrollments
      });
    } catch (error: any) {

      const enrollmentsWithoutUserData = enrollments.map(enrollment => ({
        ...enrollment,
        user: null,
        progress: enrollment.courseProgress?.[0]?.overallProgress ?? enrollment.progress ?? 0,
        completedComponents: enrollment.courseProgress?.[0]?.completedComponents ?? 0,
        totalComponents: enrollment.courseProgress?.[0]?.totalComponents ?? 0,
        componentProgress: enrollment.courseProgress?.[0]?.componentProgress ?? {},
        topicsProgress: enrollment.courseProgress?.[0]?.topicsProgress ?? {},
        lastProgressUpdate: enrollment.courseProgress?.[0]?.lastUpdated
      }));
      return res.status(200).json({
        success: true,
        enrollments: enrollmentsWithoutUserData,
        warning: 'User data unavailable'
      });
    }
  } catch (error) {
    console.error('[getEnrollmentsByBatchCourseIds] Error processing request:', error);
    next(error);
  }
};

export const getEnrollmentsByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      throw new BadRequestError('Course ID is required');
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: courseId
      },
      include: {
        payments: true,
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
      }
    });

    const userEmails = [...new Set(enrollments.map(enrollment => enrollment.userEmail))];

    try {
      const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080/api'
        : process.env.USER_SERVICE_URL;

      const userPromises = userEmails.map(async (email: string | null) => {
        try {
          if (!email) return null;
          const requestUrl = `${baseUrl}/user/byEmail/${encodeURIComponent(email)}`;
          console.log('[getEnrollmentsByCourseId] Fetching user data from:', requestUrl);
          const response = await axios.get(requestUrl);
          console.log('[getEnrollmentsByCourseId] User data received:', response.data);
          return response.data;
        } catch (error: any) {
          console.warn('[getEnrollmentsByCourseId] Error fetching user data:', error.message);
          return null;
        }
      });

      const users = (await Promise.all(userPromises)).filter(user => user !== null);
      const userMap = new Map(users.map(user => [user.email, user]));

      const enrichedEnrollments = enrollments.map(enrollment => {
        const user = userMap.get(enrollment.userEmail);
        return {
          ...enrollment,
          user: user ? {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name,
            role: user.role
          } : null,
          progress: enrollment.courseProgress?.[0]?.overallProgress ?? enrollment.progress ?? 0,
          completedComponents: enrollment.courseProgress?.[0]?.completedComponents ?? 0,
          totalComponents: enrollment.courseProgress?.[0]?.totalComponents ?? 0,
          componentProgress: enrollment.courseProgress?.[0]?.componentProgress ?? {},
          topicsProgress: enrollment.courseProgress?.[0]?.topicsProgress ?? {},
          lastProgressUpdate: enrollment.courseProgress?.[0]?.lastUpdated
        };
      });

      console.log('[getEnrollmentsByCourseId] Enriched enrollments:', enrichedEnrollments);

      return res.status(200).json({
        success: true,
        enrollments: enrichedEnrollments
      });
    } catch (error) {
      console.error('[getEnrollmentsByCourseId] Error enriching enrollments:', error);
      // Return enrollments without user data if user service is unavailable
      const enrollmentsWithoutUserData = enrollments.map(enrollment => ({
        ...enrollment,
        user: null,
        progress: enrollment.courseProgress?.[0]?.overallProgress ?? enrollment.progress ?? 0,
        completedComponents: enrollment.courseProgress?.[0]?.completedComponents ?? 0,
        totalComponents: enrollment.courseProgress?.[0]?.totalComponents ?? 0,
        componentProgress: enrollment.courseProgress?.[0]?.componentProgress ?? {},
        topicsProgress: enrollment.courseProgress?.[0]?.topicsProgress ?? {},
        lastProgressUpdate: enrollment.courseProgress?.[0]?.lastUpdated
      }));
      return res.status(200).json({
        success: true,
        enrollments: enrollmentsWithoutUserData,
        warning: 'User data unavailable'
      });
    }
  } catch (error) {
    console.error('[getEnrollmentsByCourseId] Error:', error);
    next(error);
  }
};

