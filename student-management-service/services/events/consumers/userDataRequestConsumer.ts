import { Channel, Message } from 'amqplib';
import { RabbitMQConnection } from '../rabbitmq';
import { EnrollmentService } from '../../enrollmentService';
import { QuizProgressService } from '../../quizProgressService';
import { CourseProgressService } from '../../courseProgressService';
import {
  UserDataRequestMessage,
  UserDataResponse,
  UserEnrollmentData,
  UserCourseProgress,
  UserQuizProgress,
  UserLearningStats,
  UserAchievements,
  UserActivitySummary,
  UserDataError
} from '../../../types/userDataTypes';

export class UserDataRequestConsumer {
  private enrollmentService: EnrollmentService;
  private quizProgressService: QuizProgressService;
  private courseProgressService: CourseProgressService;

  constructor() {
    this.enrollmentService = new EnrollmentService();
    this.quizProgressService = new QuizProgressService();
    this.courseProgressService = new CourseProgressService();
  }

  async setupConsumer() {
    console.log('🚀 Setting up UserDataRequestConsumer...');
    const connection = RabbitMQConnection.getInstance(
      process.env.RABBITMQ_URL || 'amqp://rabbitmq_user:rabbitmq_secure_password_2024@195.210.47.20:5672'
    );
    const channel = await connection.getChannel();

    // Declare exchange, queue, and binding
    await channel.assertExchange('user_events', 'topic', { durable: true });
    console.log('✅ Exchange "user_events" declared');
    
    await channel.assertQueue('user_data_request_queue_course', { durable: true });
    console.log('✅ Queue "user_data_request_queue_course" declared');
    
    await channel.bindQueue('user_data_request_queue_course', 'user_events', 'user.data.request');
    console.log('✅ Queue bound to exchange with routing key "user.data.request"');

    // Set up consumer
    channel.consume('user_data_request_queue_course', async (message: Message | null) => {
      console.log('📨 Received message in user_data_request_queue_course');
      if (message) {
        try {
          console.log('📋 Message content:', message.content.toString());
          await this.handleUserDataRequest(channel, message);
        } catch (error) {
          console.error('❌ Error processing user data request:', error);
          // Acknowledge the message to prevent infinite requeue
          channel.ack(message);
        }
      } else {
        console.log('⚠️ Received null message');
      }
    });

    console.log('🎯 User data request consumer is ready and listening for messages');
  }

  private async handleUserDataRequest(channel: Channel, message: Message) {
    try {
      const messageContent = JSON.parse(message.content.toString()) as UserDataRequestMessage;
      const { userId, eventType } = messageContent;

      console.log(`🎯 Processing user data request for userId: ${userId} with eventType: ${eventType}`);

      if (eventType === 'USER_DATA_REQUEST' && userId) {
        // Get comprehensive user data
        const userData = await this.getUserData(userId);

        // Check if user has any data
        if (userData.enrollments.length === 0) {
          const errorResponse: UserDataError = {
            userId,
            serviceType: 'STUDENT_MANAGEMENT_SERVICE',
            error: 'No enrollment data found for user',
            errorCode: 'NO_ENROLLMENTS',
            timestamp: new Date().toISOString()
          };

          await channel.publish(
            'user_events',
            'user.data.response.students',
            Buffer.from(JSON.stringify(errorResponse))
          );

          console.log(`⚠️ No enrollment data found for userId: ${userId}`);
          channel.ack(message);
          return;
        }

        // Prepare response data
        const responseData: UserDataResponse = {
          userId,
          serviceType: 'STUDENT_MANAGEMENT_SERVICE',
          timestamp: new Date().toISOString(),
          requestId: messageContent.requestId,
          learningStats: userData.learningStats,
          achievements: userData.achievements,
          enrollments: userData.enrollments,
          courseProgress: userData.courseProgress,
          quizProgress: userData.quizProgress,
          recentActivity: userData.recentActivity
        };

        // Publish response
        await channel.publish(
          'user_events',
          'user.data.response.students',
          Buffer.from(JSON.stringify(responseData))
        );

        console.log(`✅ Published comprehensive user data response for userId: ${userId}`, {
          totalEnrollments: userData.learningStats.totalEnrollments,
          activeEnrollments: userData.learningStats.activeEnrollments,
          completedEnrollments: userData.learningStats.completedEnrollments,
          averageProgress: userData.learningStats.averageProgress,
          totalQuizAttempts: userData.learningStats.totalQuizAttempts,
          certificates: userData.learningStats.totalCertificates
        });
      }

      channel.ack(message);
    } catch (error) {
      console.error('Error handling user data request:', error);
      channel.ack(message);
    }
  }

  private async getUserData(userId: string) {
    try {
      console.log(`📊 Fetching comprehensive data for user: ${userId}`);

      // Get all enrollments for the user
      const enrollments = await this.enrollmentService.getEnrollmentsByUserId(userId);
      console.log(`📚 Found ${enrollments.length} enrollments for user ${userId}`);

      // Get course progress data for all user enrollments
      const courseProgressData = await this.courseProgressService.getProgressByUserId(userId);
      console.log(`📈 Found ${courseProgressData.length} course progress records for user ${userId}`);

      // Get quiz progress data for all user enrollments
      const quizProgressData = await this.quizProgressService.getQuizProgressByUserId(userId);
      console.log(`🧪 Found ${quizProgressData.length} quiz progress records for user ${userId}`);

      // Calculate learning statistics
      const learningStats = this.calculateLearningStats(enrollments, courseProgressData, quizProgressData);

      // Calculate user achievements
      const achievements = this.calculateUserAchievements(enrollments, courseProgressData, quizProgressData);

      // Generate recent activity summary
      const recentActivity = this.generateRecentActivity(enrollments, courseProgressData, quizProgressData);

      // Format enrollment data with detailed information
      const formattedEnrollments: UserEnrollmentData[] = enrollments.map(enrollment => ({
        id: enrollment.id,
        userId: enrollment.userId,
        userEmail: enrollment.userEmail,
        courseId: enrollment.courseId,
        status: enrollment.status as any,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        updatedAt: enrollment.updatedAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        transactionId: enrollment.transactionId,
        amount: enrollment.amount ? Number(enrollment.amount) : null,
        currency: enrollment.currency,
        paymentStatus: enrollment.paymentStatus as any,
        certificate: enrollment.certificate ? {
          id: enrollment.certificate.id,
          issuedAt: enrollment.certificate.issuedAt,
          verificationCode: enrollment.certificate.verificationCode,
          pdfUrl: enrollment.certificate.pdfUrl
        } : null,
        payments: enrollment.payments?.map(payment => ({
          id: payment.id,
          amount: payment.amount ? Number(payment.amount) : null,
          currency: payment.currency,
          status: payment.status as any,
          createdAt: payment.createdAt,
          paymentMethod: payment.paymentMethod,
          transactionReference: payment.transactionReference || null
        })) || []
      }));

      // Format course progress data
      const formattedCourseProgress: UserCourseProgress[] = courseProgressData.map(progress => ({
        id: progress.id,
        enrollmentId: progress.enrollmentId,
        courseId: progress.courseId,
        userEmail: progress.userEmail,
        overallProgress: progress.overallProgress,
        totalComponents: progress.totalComponents,
        completedComponents: progress.completedComponents,
        components: progress.components,
        componentProgress: progress.componentProgress,
        topicsProgress: progress.topicsProgress,
        lastUpdated: progress.lastUpdated
      }));

      // Format quiz progress data
      const formattedQuizProgress: UserQuizProgress[] = quizProgressData.map(quiz => ({
        id: quiz.id,
        enrollmentId: quiz.enrollmentId,
        quizId: quiz.quizId,
        attempts: quiz.attempts,
        bestScore: quiz.bestScore,
        passed: quiz.passed,
        lastAttemptAt: quiz.lastAttemptAt
      }));

      return {
        learningStats,
        achievements,
        recentActivity,
        enrollments: formattedEnrollments,
        courseProgress: formattedCourseProgress,
        quizProgress: formattedQuizProgress
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return {
        learningStats: {
          totalEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
          droppedEnrollments: 0,
          onHoldEnrollments: 0,
          averageProgress: 0,
          totalQuizAttempts: 0,
          passedQuizzes: 0,
          failedQuizzes: 0,
          uniqueQuizzesTaken: 0,
          quizSuccessRate: 0,
          totalCertificates: 0,
          totalPayments: 0,
          totalAmountPaid: 0,
          averageScore: 0,
          learningStreak: 0,
          lastActivityDate: null
        },
        achievements: {
          firstEnrollment: null,
          firstCompletion: null,
          firstCertificate: null,
          fastestCompletion: null,
          bestQuizScore: null,
          streakRecord: null
        },
        recentActivity: [],
        enrollments: [],
        courseProgress: [],
        quizProgress: []
      };
    }
  }

  private calculateLearningStats(enrollments: any[], courseProgress: any[], quizProgress: any[]): UserLearningStats {
    const totalEnrollments = enrollments.length;
    
    // Count enrollments by status
    const enrollmentsByStatus = enrollments.reduce((acc, enrollment) => {
      const status = enrollment.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeEnrollments = enrollmentsByStatus['ACTIVE'] || 0;
    const completedEnrollments = enrollmentsByStatus['COMPLETED'] || 0;
    const droppedEnrollments = enrollmentsByStatus['DROPPED'] || 0;
    const onHoldEnrollments = enrollmentsByStatus['ON_HOLD'] || 0;

    // Calculate average progress from course progress data
    const validProgress = courseProgress.filter(progress => progress && progress.overallProgress !== null);
    const averageProgress = validProgress.length > 0 
      ? validProgress.reduce((sum, progress) => sum + progress.overallProgress, 0) / validProgress.length 
      : 0;

    // Calculate quiz statistics
    const totalQuizAttempts = quizProgress.reduce((sum, quiz) => sum + quiz.attempts, 0);
    const passedQuizzes = quizProgress.filter(quiz => quiz.passed).length;
    const failedQuizzes = quizProgress.filter(quiz => !quiz.passed && quiz.attempts > 0).length;
    const uniqueQuizzesTaken = new Set(quizProgress.map(quiz => quiz.quizId)).size;
    const quizSuccessRate = quizProgress.length > 0 ? (passedQuizzes / quizProgress.length) * 100 : 0;

    // Calculate quiz score average
    const validScores = quizProgress.filter(quiz => quiz.bestScore !== null);
    const averageScore = validScores.length > 0
      ? validScores.reduce((sum, quiz) => sum + quiz.bestScore, 0) / validScores.length
      : 0;

    // Count certificates
    const totalCertificates = enrollments.filter(enrollment => enrollment.certificate).length;

    // Calculate payment statistics
    const allPayments = enrollments.flatMap(enrollment => enrollment.payments || []);
    const totalPayments = allPayments.length;
    const totalAmountPaid = allPayments
      .filter(payment => payment.status === 'COMPLETED' && payment.amount)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    // Calculate learning activity and streak
    const activityDates = [
      ...enrollments.map(e => e.lastAccessedAt),
      ...courseProgress.map(p => p.lastUpdated),
      ...quizProgress.filter(q => q.lastAttemptAt).map(q => q.lastAttemptAt)
    ].filter(date => date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const lastActivityDate = activityDates.length > 0 ? activityDates[0] : null;
    const learningStreak = this.calculateLearningStreak(activityDates);

    return {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      droppedEnrollments,
      onHoldEnrollments,
      averageProgress: Math.round(averageProgress * 100) / 100,
      totalQuizAttempts,
      passedQuizzes,
      failedQuizzes,
      uniqueQuizzesTaken,
      quizSuccessRate: Math.round(quizSuccessRate * 100) / 100,
      totalCertificates,
      totalPayments,
      totalAmountPaid: Math.round(totalAmountPaid * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      learningStreak,
      lastActivityDate
    };
  }

  private calculateLearningStreak(activityDates: Date[]): number {
    if (activityDates.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const uniqueDays = new Set(
      activityDates.map(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);
    
    for (let i = 0; i < sortedDays.length; i++) {
      const dayTimestamp = sortedDays[i];
      const expectedTimestamp = currentDate.getTime() - (streak * 24 * 60 * 60 * 1000);
      
      if (dayTimestamp === expectedTimestamp) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateUserAchievements(enrollments: any[], courseProgress: any[], quizProgress: any[]): UserAchievements {
    // First enrollment
    const firstEnrollment = enrollments.length > 0 
      ? enrollments.sort((a, b) => a.enrolledAt.getTime() - b.enrolledAt.getTime())[0].enrolledAt
      : null;

    // First completion
    const completedEnrollments = enrollments.filter(e => e.completedAt);
    const firstCompletion = completedEnrollments.length > 0
      ? completedEnrollments.sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime())[0].completedAt
      : null;

    // First certificate
    const enrollmentsWithCerts = enrollments.filter(e => e.certificate);
    const firstCertificate = enrollmentsWithCerts.length > 0
      ? enrollmentsWithCerts.sort((a, b) => a.certificate.issuedAt.getTime() - b.certificate.issuedAt.getTime())[0].certificate.issuedAt
      : null;

    // Fastest completion
    let fastestCompletion = null;
    if (completedEnrollments.length > 0) {
      const completion = completedEnrollments.reduce((fastest, enrollment) => {
        const duration = enrollment.completedAt.getTime() - enrollment.enrolledAt.getTime();
        const days = duration / (1000 * 60 * 60 * 24);
        
        if (!fastest || days < fastest.duration) {
          return {
            courseId: enrollment.courseId,
            duration: days
          };
        }
        return fastest;
      }, null);
      
      fastestCompletion = completion;
    }

    // Best quiz score
    const bestQuiz = quizProgress.reduce((best, quiz) => {
      if (quiz.bestScore !== null && (!best || quiz.bestScore > best.score)) {
        return {
          quizId: quiz.quizId,
          score: quiz.bestScore
        };
      }
      return best;
    }, null);

    // Learning streak record (simplified - would need historical data for accurate streak)
    const streakRecord = null; // Would require tracking daily activity over time

    return {
      firstEnrollment,
      firstCompletion,
      firstCertificate,
      fastestCompletion,
      bestQuizScore: bestQuiz,
      streakRecord
    };
  }

  private generateRecentActivity(enrollments: any[], courseProgress: any[], quizProgress: any[]): UserActivitySummary[] {
    const activities: UserActivitySummary[] = [];

    // Add enrollment activities
    enrollments.forEach(enrollment => {
      activities.push({
        date: enrollment.enrolledAt,
        activityType: 'ENROLLMENT',
        courseId: enrollment.courseId,
        description: `Enrolled in course ${enrollment.courseId}`,
        metadata: { enrollmentId: enrollment.id, status: enrollment.status }
      });

      if (enrollment.completedAt) {
        activities.push({
          date: enrollment.completedAt,
          activityType: 'COMPLETION',
          courseId: enrollment.courseId,
          description: `Completed course ${enrollment.courseId}`,
          metadata: { enrollmentId: enrollment.id }
        });
      }

      if (enrollment.certificate) {
        activities.push({
          date: enrollment.certificate.issuedAt,
          activityType: 'CERTIFICATE_EARNED',
          courseId: enrollment.courseId,
          description: `Earned certificate for course ${enrollment.courseId}`,
          metadata: { 
            certificateId: enrollment.certificate.id,
            verificationCode: enrollment.certificate.verificationCode
          }
        });
      }
    });

    // Add course progress activities
    courseProgress.forEach(progress => {
      activities.push({
        date: progress.lastUpdated,
        activityType: 'PROGRESS_UPDATE',
        courseId: progress.courseId,
        description: `Progress updated to ${progress.overallProgress}% for course ${progress.courseId}`,
        metadata: {
          enrollmentId: progress.enrollmentId,
          overallProgress: progress.overallProgress,
          completedComponents: progress.completedComponents,
          totalComponents: progress.totalComponents
        }
      });
    });

    // Add quiz activities
    quizProgress.forEach(quiz => {
      if (quiz.lastAttemptAt) {
        activities.push({
          date: quiz.lastAttemptAt,
          activityType: 'QUIZ_ATTEMPT',
          courseId: 'unknown', // Would need to lookup via enrollment
          description: `${quiz.passed ? 'Passed' : 'Attempted'} quiz ${quiz.quizId} with score ${quiz.bestScore || 'N/A'}`,
          metadata: {
            quizId: quiz.quizId,
            attempts: quiz.attempts,
            bestScore: quiz.bestScore,
            passed: quiz.passed
          }
        });
      }
    });

    // Sort by date (most recent first) and limit to last 50 activities
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);
  }
}