import { Channel } from 'amqplib';
import { logger } from '../../../utils/logger';

const EXCHANGE_NAME = 'user_events';
const ROUTING_KEY = 'user.achievements';

export interface UserAchievementMessage {
  type: string;
  data: {
    user_id: string | null;
    course_id: string;
    type: string;
    earned_at: string;
    completed_at: string | null;
    score: number;
    metadata: {
      enrollmentId: string;
      status: string;
      language: string;
    };
  };
}

export async function publishUserAchievement(channel: Channel, message: UserAchievementMessage) {
  try {
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    
    const success = channel.publish(
      EXCHANGE_NAME,
      ROUTING_KEY,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    if (success) {
      logger.info(`Published user achievement message for enrollment ${message.data.metadata.enrollmentId}`);
    } else {
      logger.error(`Failed to publish user achievement message for enrollment ${message.data.metadata.enrollmentId}`);
    }
  } catch (error) {
    logger.error('Error publishing user achievement message:', error);
    throw error;
  }
}
