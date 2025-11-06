import { Channel, Message } from 'amqplib';
import { RabbitMQConnection } from '../rabbitmq';
import { EnrollmentService } from '../../enrollmentService';
import { QuizProgressService } from '../../quizProgressService';
import { CourseProgressService } from '../../courseProgressService';

interface SchoolDataRequestMessage {
  schoolId: string;
  eventType: string;
}

export class SchoolDataRequestConsumer {
  private enrollmentService: EnrollmentService;
  private quizProgressService: QuizProgressService;
  private courseProgressService: CourseProgressService;

  constructor() {
    this.enrollmentService = new EnrollmentService();
    this.quizProgressService = new QuizProgressService();
    this.courseProgressService = new CourseProgressService();
  }

  async setupConsumer() {
    console.log('🚀 Setting up SchoolDataRequestConsumer...');
    const connection = RabbitMQConnection.getInstance(
      process.env.RABBITMQ_URL || 'amqp://rabbitmq_user:rabbitmq_secure_password_2024@195.210.47.20:5672'
    );
    const channel = await connection.getChannel();

    // Declare exchange, queue, and binding
    await channel.assertExchange('school_events', 'topic', { durable: true });
    console.log('✅ Exchange "school_events" declared');
    
    await channel.assertQueue('school_data_request_queue', { durable: true });
    console.log('✅ Queue "school_data_request_queue" declared');
    
    await channel.bindQueue('school_data_request_queue', 'school_events', 'school.data.request');
    console.log('✅ Queue bound to exchange with routing key "school.data.request"');

    // Set up consumer
    channel.consume('school_data_request_queue', async (message: Message | null) => {
      console.log('📨 Received message in school_data_request_queue');
      if (message) {
        try {
          console.log('📋 Message content:', message.content.toString());
          await this.handleSchoolDataRequest(channel, message);
        } catch (error) {
          console.error('❌ Error processing school data request:', error);
          // Acknowledge the message to prevent infinite requeue
          channel.ack(message);
        }
      } else {
        console.log('⚠️ Received null message');
      }
    });

    console.log('🎯 School data request consumer is ready and listening for messages');
  }

  private async handleSchoolDataRequest(channel: Channel, message: Message) {
    try {
      const messageContent = JSON.parse(message.content.toString()) as SchoolDataRequestMessage;
      const { schoolId, eventType } = messageContent;

      console.log(`🎯 Processing school data request for schoolId: ${schoolId} with eventType: ${eventType}`);

      if (eventType === 'SCHOOL_DATA_REQUEST' && schoolId) {
        // Get school-related student data
        const schoolStudentData = await this.getSchoolStudentData(schoolId);

        // Prepare response data with full details
        const responseData = {
          schoolId,
          serviceType: 'STUDENT_MANAGEMENT_SERVICE',
          // Statistics (keeping for backward compatibility)
          totalEnrollments: schoolStudentData.totalEnrollments,
          totalStudents: schoolStudentData.totalStudents,
          totalQuizAttempts: schoolStudentData.totalQuizAttempts,
          averageProgress: schoolStudentData.averageProgress,
          enrollmentsByStatus: schoolStudentData.enrollmentsByStatus,
          quizCompletionRate: schoolStudentData.quizCompletionRate,
          // Full data
          enrollments: schoolStudentData.enrollments,
          courseProgress: schoolStudentData.courseProgress,
          quizProgress: schoolStudentData.quizProgress,
          students: schoolStudentData.students
        };

        // Publish response
        await channel.publish(
          'school_events',
          'school.data.response.students',
          Buffer.from(JSON.stringify(responseData))
        );

        console.log(`✅ Published school student data response for schoolId: ${schoolId}`, {
          totalEnrollments: schoolStudentData.totalEnrollments,
          totalStudents: schoolStudentData.totalStudents,
          averageProgress: schoolStudentData.averageProgress
        });
      }

      channel.ack(message);
    } catch (error) {
      console.error('Error handling school data request:', error);
      channel.ack(message);
    }
  }

  private async getSchoolStudentData(schoolId: string) {
    try {
      // Get all enrollments for courses in this school
      const enrollments = await this.enrollmentService.getEnrollmentsBySchoolId(schoolId);
      
      // Get unique students
      const uniqueStudents = new Set(enrollments.map(enrollment => enrollment.userId));
      const totalStudents = uniqueStudents.size;
      const totalEnrollments = enrollments.length;

      // Get enrollment status breakdown
      const enrollmentsByStatus = enrollments.reduce((acc, enrollment) => {
        const status = enrollment.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get course progress data
      const courseProgressData = await Promise.all(
        enrollments.map(enrollment => 
          this.courseProgressService.getProgressByEnrollmentId(enrollment.id)
        )
      );

      const validProgress = courseProgressData.filter(progress => progress !== null);
      const averageProgress = validProgress.length > 0 
        ? validProgress.reduce((sum, progress) => sum + (progress?.overallProgress || 0), 0) / validProgress.length 
        : 0;

      // Get quiz attempts data
      const quizAttempts = await Promise.all(
        enrollments.map(enrollment =>
          this.quizProgressService.getQuizProgressByEnrollmentId(enrollment.id)
        )
      );

      const totalQuizAttempts = quizAttempts.flat().length;
      const completedQuizzes = quizAttempts.flat().filter(quiz => quiz.passed).length;
      const quizCompletionRate = totalQuizAttempts > 0 ? (completedQuizzes / totalQuizAttempts) * 100 : 0;

      // Get unique students with their enrollment details
      const students = Array.from(uniqueStudents).map(userId => {
        const userEnrollments = enrollments.filter(e => e.userId === userId || e.userEmail === userId);
        return {
          userId: userId,
          userEmail: userEnrollments[0]?.userEmail,
          enrollmentCount: userEnrollments.length,
          enrollments: userEnrollments.map(e => ({
            id: e.id,
            courseId: e.courseId,
            status: e.status,
            progress: e.progress,
            enrolledAt: e.enrolledAt,
            completedAt: e.completedAt
          }))
        };
      });

      return {
        // Statistics
        totalEnrollments,
        totalStudents,
        totalQuizAttempts,
        averageProgress: Math.round(averageProgress * 100) / 100,
        enrollmentsByStatus,
        quizCompletionRate: Math.round(quizCompletionRate * 100) / 100,
        // Full data
        enrollments: enrollments.map(e => ({
          id: e.id,
          userId: e.userId,
          userEmail: e.userEmail,
          courseId: e.courseId,
          status: e.status,
          progress: e.progress,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt,
          updatedAt: e.updatedAt
        })),
        courseProgress: validProgress.map(p => ({
          id: p.id,
          enrollmentId: p.enrollmentId,
          courseId: p.courseId,
          overallProgress: p.overallProgress,
          totalComponents: p.totalComponents,
          completedComponents: p.completedComponents,
          lastUpdated: p.lastUpdated
        })),
        quizProgress: quizAttempts.flat().map(q => ({
          id: q.id,
          enrollmentId: q.enrollmentId,
          quizId: q.quizId,
          attempts: q.attempts,
          bestScore: q.bestScore,
          passed: q.passed,
          lastAttemptAt: q.lastAttemptAt
        })),
        students: students
      };
    } catch (error) {
      console.error('Error getting school student data:', error);
      return {
        totalEnrollments: 0,
        totalStudents: 0,
        totalQuizAttempts: 0,
        averageProgress: 0,
        enrollmentsByStatus: {},
        quizCompletionRate: 0
      };
    }
  }
}