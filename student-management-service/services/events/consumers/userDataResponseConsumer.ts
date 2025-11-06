import { Channel, Message } from 'amqplib';
import { RabbitMQConnection } from '../rabbitmq';
import { logger } from '../../../utils/logger';

interface UserDataResponseMessage {
  requestId: string;
  requesterService: string;
  success: boolean;
  timestamp: string;
  userData: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    role: string;
    schoolId?: string;
  }>;
  error?: string;
}

export class UserDataResponseConsumer {
  private static responseCache = new Map<string, any>();

  async setupConsumer() {
    console.log('🚀 Setting up UserDataResponseConsumer...');
    const connection = RabbitMQConnection.getInstance(
      process.env.RABBITMQ_URL || 'amqp://rabbitmq_user:rabbitmq_secure_password_2024@195.210.47.20:5672'
    );
    const channel = await connection.getChannel();

    // Declare exchange, queue, and binding
    await channel.assertExchange('user_events', 'topic', { durable: true });
    console.log('✅ Exchange "user_events" declared');
    
    await channel.assertQueue('user_data_response_queue_student_mgmt', { durable: true });
    console.log('✅ Queue "user_data_response_queue_student_mgmt" declared');
    
    await channel.bindQueue('user_data_response_queue_student_mgmt', 'user_events', 'user.data.response');
    console.log('✅ Queue bound to exchange with routing key "user.data.response"');

    // Set up consumer
    channel.consume('user_data_response_queue_student_mgmt', async (message: Message | null) => {
      console.log('📨 Received user data response in student management service');
      if (message) {
        try {
          await this.handleUserDataResponse(channel, message);
        } catch (error) {
          console.error('❌ Error processing user data response:', error);
          // Acknowledge the message to prevent infinite requeue
          channel.ack(message);
        }
      } else {
        console.log('⚠️ Received null message');
      }
    });

    console.log('🎯 User data response consumer is ready and listening for messages');
  }

  private async handleUserDataResponse(channel: Channel, message: Message) {
    try {
      const responseData = JSON.parse(message.content.toString()) as UserDataResponseMessage;
      const { requestId, success, userData, error } = responseData;

      console.log(`📥 Processing user data response for requestId: ${requestId}, success: ${success}`);

      if (success && userData) {
        // Cache the user data for use by the school service
        UserDataResponseConsumer.responseCache.set(requestId, {
          success: true,
          userData: userData,
          timestamp: new Date().toISOString()
        });

        console.log(`✅ Cached user data for ${userData.length} users with requestId: ${requestId}`);
      } else {
        // Cache error response
        UserDataResponseConsumer.responseCache.set(requestId, {
          success: false,
          error: error || 'Unknown error',
          timestamp: new Date().toISOString()
        });

        console.log(`❌ Cached error response for requestId: ${requestId}, error: ${error}`);
      }

      // Clean up old cache entries (older than 5 minutes)
      this.cleanupCache();

      channel.ack(message);
    } catch (error) {
      console.error('Error handling user data response:', error);
      channel.ack(message);
    }
  }

  static getUserDataFromCache(requestId: string): any {
    return UserDataResponseConsumer.responseCache.get(requestId);
  }

  static removeFromCache(requestId: string): void {
    UserDataResponseConsumer.responseCache.delete(requestId);
  }

  private cleanupCache(): void {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    for (const [requestId, data] of UserDataResponseConsumer.responseCache.entries()) {
      const cacheTime = new Date(data.timestamp).getTime();
      if (cacheTime < fiveMinutesAgo) {
        UserDataResponseConsumer.responseCache.delete(requestId);
        logger.info(`🗑️ Cleaned up expired cache entry for requestId: ${requestId}`);
      }
    }
  }
}