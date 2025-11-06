import { Channel, Message } from 'amqplib';
import { RabbitMQConnection } from '../rabbitmq';
import { EnrollmentService } from '../../enrollmentService';
import { QuizProgressService } from '../../quizProgressService';
import { CourseProgressService } from '../../courseProgressService';

interface StudyStatisticsRequestMessage {
  requestId: string;
  eventType: string;
  replyTo?: string;
}

export class StudyStatisticsRequestConsumer {
  private enrollmentService: EnrollmentService;
  private quizProgressService: QuizProgressService;
  private courseProgressService: CourseProgressService;

  constructor() {
    this.enrollmentService = new EnrollmentService();
    this.quizProgressService = new QuizProgressService();
    this.courseProgressService = new CourseProgressService();
  }

  async setupConsumer() {
    console.log('📊 Setting up StudyStatisticsRequestConsumer...');
    const connection = RabbitMQConnection.getInstance(
      process.env.RABBITMQ_URL || 'amqp://rabbitmq_user:rabbitmq_secure_password_2024@195.210.47.20:5672'
    );
    const channel = await connection.getChannel();

    // Declare exchange, queue, and binding
    await channel.assertExchange('user_events', 'topic', { durable: true });
    console.log('✅ Exchange "user_events" declared');
    
    await channel.assertQueue('study_statistics_request_queue', { durable: true });
    console.log('✅ Queue "study_statistics_request_queue" declared');
    
    await channel.bindQueue('study_statistics_request_queue', 'user_events', 'study.statistics.request');
    console.log('✅ Queue bound to exchange with routing key "study.statistics.request"');

    // Set up consumer
    channel.consume('study_statistics_request_queue', async (message: Message | null) => {
      console.log('📨 Received study statistics request in StudentManagementService');
      if (message) {
        try {
          console.log('📋 Message content:', message.content.toString());
          await this.handleStudyStatisticsRequest(channel, message);
        } catch (error) {
          console.error('❌ Error processing study statistics request:', error);
          // Acknowledge the message to prevent infinite requeue
          channel.ack(message);
        }
      } else {
        console.log('⚠️ Received null message');
      }
    });

    console.log('🎯 Study statistics request consumer is ready and listening for messages');
  }

  private async handleStudyStatisticsRequest(channel: Channel, message: Message) {
    try {
      const messageContent = JSON.parse(message.content.toString()) as StudyStatisticsRequestMessage;
      const { requestId, eventType } = messageContent;

      console.log(`📊 Processing study statistics request with ID: ${requestId} and eventType: ${eventType}`);
      console.log('📋 Parsed message:', messageContent);

      if (eventType === 'COLLECT_STUDY_STATISTICS' && requestId) {
        // Collect comprehensive enrollment and student management statistics
        const enrollmentStatistics = await this.collectEnrollmentStatistics();

        // Prepare response data
        const responseData = {
          requestId,
          service: 'StudentManagementService',
          success: true,
          statistics: enrollmentStatistics
        };

        // Publish response with specific routing key
        const routingKey = `study.statistics.response.enrollment.${requestId}`;
        await channel.publish(
          'user_events',
          routingKey,
          Buffer.from(JSON.stringify(responseData))
        );

        console.log(`✅ Published study statistics response from StudentManagementService for request: ${requestId}`, {
          totalEnrollments: enrollmentStatistics.totalEnrollments,
          activeEnrollments: enrollmentStatistics.activeEnrollments,
          completedEnrollments: enrollmentStatistics.completedEnrollments
        });
      }

      channel.ack(message);
    } catch (error) {
      console.error('❌ Error handling study statistics request:', error);
      
      // Try to send error response
      try {
        const messageContent = JSON.parse(message.content.toString()) as StudyStatisticsRequestMessage;
        const errorResponse = {
          requestId: messageContent.requestId,
          service: 'StudentManagementService',
          success: false,
          error: `StudentManagementService error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };

        const routingKey = `study.statistics.response.enrollment.${messageContent.requestId}`;
        await channel.publish(
          'user_events',
          routingKey,
          Buffer.from(JSON.stringify(errorResponse))
        );
      } catch (publishError) {
        console.error('Failed to send error response:', publishError);
      }
      
      channel.ack(message);
    }
  }

  private async collectEnrollmentStatistics() {
    try {
      console.log('📈 Collecting comprehensive enrollment statistics from StudentManagementService');
      
      // Get all enrollments
      const allEnrollments = await this.enrollmentService.getAllEnrollments();
      const totalEnrollments = allEnrollments.length;
      
      // === BASIC ENROLLMENT METRICS ===
      const enrollmentsByStatus = allEnrollments.reduce((acc, enrollment) => {
        const status = enrollment.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const activeEnrollments = allEnrollments.filter(e => 
        e.status === 'ACTIVE'
      ).length;
      
      const completedEnrollments = allEnrollments.filter(e => 
        e.status === 'COMPLETED'
      ).length;
      
      const droppedEnrollments = allEnrollments.filter(e => 
        e.status === 'DROPPED'
      ).length;

      // === STUDENT METRICS ===
      const uniqueStudents = new Set(allEnrollments.map(e => e.userId || e.userEmail));
      const totalStudents = uniqueStudents.size;

      // Student engagement levels
      const studentEngagementLevels = Array.from(uniqueStudents).reduce((acc, studentId) => {
        const studentEnrollments = allEnrollments.filter(e => 
          e.userId === studentId || e.userEmail === studentId
        );
        const enrollmentCount = studentEnrollments.length;
        
        let level;
        if (enrollmentCount === 0) level = 'No Enrollments';
        else if (enrollmentCount === 1) level = 'Single Course';
        else if (enrollmentCount <= 3) level = 'Multi-Course (2-3)';
        else if (enrollmentCount <= 5) level = 'Active Learner (4-5)';
        else level = 'Power User (6+)';
        
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // === CERTIFICATE METRICS ===
      const enrollmentsWithCertificates = allEnrollments.filter(e => 
        e.certificate && e.certificate
      ).length;

      // === COMPREHENSIVE PROGRESS ANALYSIS ===
      console.log('🔄 Analyzing course progress...');
      const courseProgressData = await Promise.all(
        allEnrollments.map(async (enrollment, index) => {
          try {
            if (index % 100 === 0) {
              console.log(`Progress analysis: ${index}/${allEnrollments.length}`);
            }
            return await this.courseProgressService.getProgressByEnrollmentId(enrollment.id);
          } catch {
            return null;
          }
        })
      );

      const validProgress = courseProgressData.filter(progress => progress !== null);
      const averageProgress = validProgress.length > 0 
        ? validProgress.reduce((sum, progress) => sum + (progress?.overallProgress || 0), 0) / validProgress.length 
        : 0;

      // Progress distribution
      const progressDistribution = validProgress.reduce((acc, progress) => {
        const progressValue = progress?.overallProgress || 0;
        let category;
        if (progressValue === 0) category = 'Not Started (0%)';
        else if (progressValue <= 25) category = 'Just Started (1-25%)';
        else if (progressValue <= 50) category = 'Halfway (26-50%)';
        else if (progressValue <= 75) category = 'Almost Done (51-75%)';
        else if (progressValue < 100) category = 'Nearly Complete (76-99%)';
        else category = 'Completed (100%)';
        
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // === COMPREHENSIVE QUIZ ANALYSIS ===
      console.log('📝 Analyzing quiz performance...');
      const quizProgressData = await Promise.all(
        allEnrollments.map(async (enrollment, index) => {
          try {
            if (index % 100 === 0) {
              console.log(`Quiz analysis: ${index}/${allEnrollments.length}`);
            }
            return await this.quizProgressService.getQuizProgressByEnrollmentId(enrollment.id);
          } catch {
            return [];
          }
        })
      );

      const allQuizProgress = quizProgressData.flat();
      const totalQuizAttempts = allQuizProgress.reduce((sum, quiz) => sum + (quiz.attempts || 0), 0);
      const passedQuizzes = allQuizProgress.filter(quiz => quiz.passed).length;
      const quizPassRate = allQuizProgress.length > 0 ? (passedQuizzes / allQuizProgress.length) * 100 : 0;

      // Quiz performance distribution
      const quizPerformanceDistribution = allQuizProgress.reduce((acc, quiz) => {
        const score = quiz.bestScore || 0;
        let category;
        if (score === 0) category = 'Not Attempted';
        else if (score < 60) category = 'Below Standard (<60%)';
        else if (score < 80) category = 'Satisfactory (60-79%)';
        else if (score < 90) category = 'Good (80-89%)';
        else if (score < 100) category = 'Excellent (90-99%)';
        else category = 'Perfect (100%)';
        
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // === TIME-BASED ANALYSIS ===
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentEnrollments = allEnrollments.filter(e => 
        e.enrolledAt && new Date(e.enrolledAt) >= thirtyDaysAgo
      ).length;
      
      const veryRecentEnrollments = allEnrollments.filter(e => 
        e.enrolledAt && new Date(e.enrolledAt) >= sevenDaysAgo
      ).length;

      // Completion timeline analysis
      const recentCompletions = allEnrollments.filter(e => 
        e.completedAt && new Date(e.completedAt) >= thirtyDaysAgo
      ).length;

      // === COURSE POPULARITY ANALYSIS ===
      const courseEnrollmentCount = allEnrollments.reduce((acc, enrollment) => {
        const courseId = enrollment.courseId;
        acc[courseId] = (acc[courseId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCoursesByEnrollment = Object.entries(courseEnrollmentCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([courseId, count]) => ({ courseId, enrollmentCount: count }));

      // === RETENTION ANALYSIS ===
      const enrollmentRetention = allEnrollments.reduce((acc, enrollment) => {
        const enrolledDate = enrollment.enrolledAt ? new Date(enrollment.enrolledAt) : null;
        const completedDate = enrollment.completedAt ? new Date(enrollment.completedAt) : null;
        
        if (enrolledDate) {
          const daysEnrolled = enrolledDate ? Math.floor((now.getTime() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
          
          let retentionCategory;
          if (enrollment.status === 'COMPLETED') retentionCategory = 'Completed';
          else if (enrollment.status === 'DROPPED') retentionCategory = 'Dropped';
          else if (daysEnrolled <= 7) retentionCategory = 'New (≤7 days)';
          else if (daysEnrolled <= 30) retentionCategory = 'Recent (8-30 days)';
          else if (daysEnrolled <= 90) retentionCategory = 'Medium-term (31-90 days)';
          else retentionCategory = 'Long-term (90+ days)';
          
          acc[retentionCategory] = (acc[retentionCategory] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // === COMPREHENSIVE STATISTICS OBJECT ===
      const statistics = {
        // === CORE METRICS ===
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        droppedEnrollments,
        totalStudents,
        
        // === STATUS AND DISTRIBUTION ===
        enrollmentsByStatus,
        studentEngagementLevels,
        
        // === COMPLETION AND PROGRESS ===
        enrollmentsWithCertificates,
        completionRate: Math.round((totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0) * 100) / 100,
        averageProgress: Math.round(averageProgress * 100) / 100,
        progressDistribution,
        
        // === QUIZ PERFORMANCE ===
        totalQuizAttempts,
        totalQuizzes: allQuizProgress.length,
        quizPassRate: Math.round(quizPassRate * 100) / 100,
        quizPerformanceDistribution,
        avgQuizAttemptsPerQuiz: allQuizProgress.length > 0 ? 
          Math.round((totalQuizAttempts / allQuizProgress.length) * 100) / 100 : 0,
        
        // === TIME-BASED METRICS ===
        recentEnrollments,
        veryRecentEnrollments,
        recentCompletions,
        enrollmentRetention,
        
        // === POPULARITY AND ENGAGEMENT ===
        topCoursesByEnrollment,
        averageEnrollmentsPerStudent: Math.round((totalStudents > 0 ? totalEnrollments / totalStudents : 0) * 100) / 100,
        
        // === INSIGHTS ===
        insights: {
          dropoutRate: Math.round((totalEnrollments > 0 ? (droppedEnrollments / totalEnrollments) * 100 : 0) * 100) / 100,
          certificationRate: Math.round((totalEnrollments > 0 ? (enrollmentsWithCertificates / totalEnrollments) * 100 : 0) * 100) / 100,
          engagementScore: Math.round(((activeEnrollments + completedEnrollments) / Math.max(totalEnrollments, 1)) * 100 * 100) / 100,
          growthRate: Math.round((totalEnrollments > 0 ? (recentEnrollments / totalEnrollments) * 100 : 0) * 100) / 100
        }
      };

      console.log('📊 Comprehensive enrollment statistics collected:', {
        totalEnrollments,
        totalStudents,
        activeEnrollments,
        completedEnrollments,
        totalQuizzes: allQuizProgress.length,
        avgProgress: averageProgress
      });

      return statistics;
    } catch (error) {
      console.error('❌ Error collecting enrollment statistics:', error);
      return {
        error: `Failed to collect enrollment statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        totalStudents: 0
      };
    }
  }
}