import { RabbitMQConnection } from './events/rabbitmq';
import { publishEnrollmentEvent } from './events/publishers/enrollmentEventPublisher';
import { publishUserAchievement, UserAchievementMessage } from './events/publishers/userAchievementPublisher';
import { logger } from '../utils/logger';
import { Channel, Connection, connect } from 'amqplib';
import { setupQuizCompletionConsumer } from './events/consumers/quizCompletionConsumer';
import { handleSchoolDeleted } from './events/consumers/schoolDeletionConsumer';

class MessageQueueService {
    private rabbitMQ: RabbitMQConnection;

    constructor(url: string) {
        this.rabbitMQ = RabbitMQConnection.getInstance(url);
    }

    async connect() {
        await this.rabbitMQ.connect();
    }

    async publishEnrollmentEvent(eventType: string, data: any) {
        try {
            const channel = this.rabbitMQ.getChannel();
            await publishEnrollmentEvent(channel, eventType, data);
        } catch (error) {
            logger.error(`Failed to publish enrollment event:`, error);
            throw error;
        }
    }

    async publishUserAchievement(message: UserAchievementMessage) {
        try {
            const channel = this.rabbitMQ.getChannel();
            await publishUserAchievement(channel, message);
        } catch (error) {
            logger.error(`Failed to publish user achievement:`, error);
            throw error;
        }
    }

    async publishUserDataRequest(request: { requestId: string; userEmails: string[]; requesterService: string }) {
        try {
            const channel = this.rabbitMQ.getChannel();
            await channel.assertExchange('user_events', 'topic', { durable: true });
            
            const message = {
                ...request,
                timestamp: new Date().toISOString()
            };

            await channel.publish(
                'user_events',
                'user.data.request',
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            );

            logger.info(`Published user data request for ${request.userEmails.length} users`);
        } catch (error) {
            logger.error(`Failed to publish user data request:`, error);
            throw error;
        }
    }

    async close() {
        await this.rabbitMQ.close();
    }
}

export async function setupMessageQueues(connection: Connection) {
  try {
    const channel = await connection.createChannel();
    
    // Setup queues
    await channel.assertQueue('quiz_completion_queue', { durable: true });
    await channel.assertQueue('school_deleted_queue', { durable: true });
    await channel.assertQueue('school_data_request_queue', { durable: true });
    
    // Setup exchanges
    await channel.assertExchange('quiz_events', 'topic', { durable: true });
    await channel.assertExchange('school_events', 'topic', { durable: true });
    
    // Bind queues to exchanges
    await channel.bindQueue('quiz_completion_queue', 'quiz_events', 'quiz.completed');
    await channel.bindQueue('school_deleted_queue', 'school_events', 'school.deleted');
    await channel.bindQueue('school_data_request_queue', 'school_events', 'school.data.request');
    
    // Setup consumers
    await setupQuizCompletionConsumer(channel);
    await setupSchoolDeletionConsumer(channel);
    
    logger.info('Message queues setup completed');
  } catch (error) {
    logger.error('Error setting up message queues:', error);
    throw error;
  }
}

async function setupSchoolDeletionConsumer(channel: Channel) {
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
}


export default MessageQueueService;
