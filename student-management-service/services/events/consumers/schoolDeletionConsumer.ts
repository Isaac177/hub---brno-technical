import { Channel, ConsumeMessage } from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../../utils/logger';

const prisma = new PrismaClient();

interface SchoolDeletedEvent {
  schoolId: string;
  eventType: 'SCHOOL_DELETED';
}

export async function handleSchoolDeleted(message: ConsumeMessage) {
  try {
    const event = JSON.parse(message.content.toString()) as SchoolDeletedEvent;
    logger.info(`Processing school deletion event for school ${event.schoolId}`);

    // Delete all related data for the school
    await prisma.$transaction(async (tx) => {
      // First, get all enrollments for courses from this school
      const enrollments = await tx.enrollment.findMany({
        where: {
          courseId: {
            startsWith: `${event.schoolId}_`
          }
        },
        select: {
          id: true
        }
      });

      const enrollmentIds = enrollments.map(e => e.id);

      // Delete all quiz progress records for these enrollments
      if (enrollmentIds.length > 0) {
        await tx.quizProgress.deleteMany({
          where: {
            enrollmentId: {
              in: enrollmentIds
            }
          }
        });
      }

      // Delete all course progress records for these enrollments
      if (enrollmentIds.length > 0) {
        await tx.courseProgress.deleteMany({
          where: {
            enrollmentId: {
              in: enrollmentIds
            }
          }
        });
      }

      // Finally, delete all enrollments
      await tx.enrollment.deleteMany({
        where: {
          courseId: {
            startsWith: `${event.schoolId}_`
          }
        }
      });
    });

    logger.info(`Successfully processed school deletion for school ${event.schoolId}`);
  } catch (error) {
    logger.error('Error processing school deletion event:', error);
    throw error;
  }
}

export async function setupSchoolDeletionConsumer(channel: Channel) {
  // Assert queue and exchange
  await channel.assertQueue('school_deleted_queue', { durable: true });
  await channel.assertExchange('school_events', 'topic', { durable: true });
  await channel.bindQueue('school_deleted_queue', 'school_events', 'school.deleted');

  // Setup consumer
  await channel.consume('school_deleted_queue', async (message) => {
    if (message) {
      try {
        await handleSchoolDeleted(message);
        channel.ack(message);
      } catch (error) {
        logger.error('Error processing school deletion message:', error);
        channel.nack(message, false, false);
      }
    }
  });

  logger.info('School deletion consumer setup completed');
}
