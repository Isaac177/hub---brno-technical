import amqp, { Channel, Connection } from 'amqplib';
import { logger } from '../../utils/logger';
import { setupQuizCompletionConsumer } from './consumers/quizCompletionConsumer';
import { setupSchoolDeletionConsumer } from './consumers/schoolDeletionConsumer';
import { setupEnrollmentEventPublisher } from './publishers/enrollmentEventPublisher';
import { SchoolDataRequestConsumer } from './consumers/schoolDataRequestConsumer';
import { UserDataRequestConsumer } from './consumers/userDataRequestConsumer';
import { UserDataResponseConsumer } from './consumers/userDataResponseConsumer';
import { StudyStatisticsRequestConsumer } from './consumers/studyStatisticsRequestConsumer';

export class RabbitMQConnection {
    private static instance: RabbitMQConnection;
    private connection: Connection | null = null;
    private channel: Channel | null = null;

    private constructor(private readonly url: string) {}

    static getInstance(url: string): RabbitMQConnection {
        if (!RabbitMQConnection.instance) {
            RabbitMQConnection.instance = new RabbitMQConnection(url);
        }
        return RabbitMQConnection.instance;
    }

    async connect() {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();

            await setupQuizCompletionConsumer(this.channel);
            await setupSchoolDeletionConsumer(this.channel);
            await setupEnrollmentEventPublisher(this.channel);
            
            // Setup school data request consumer
            console.log('🚀 Initializing SchoolDataRequestConsumer...');
            const schoolDataConsumer = new SchoolDataRequestConsumer();
            await schoolDataConsumer.setupConsumer();
            console.log('✅ SchoolDataRequestConsumer initialized successfully');

            // Setup user data request consumer
            console.log('🚀 Initializing UserDataRequestConsumer...');
            const userDataConsumer = new UserDataRequestConsumer();
            await userDataConsumer.setupConsumer();
            console.log('✅ UserDataRequestConsumer initialized successfully');

            // Setup user data response consumer
            console.log('🚀 Initializing UserDataResponseConsumer...');
            const userDataResponseConsumer = new UserDataResponseConsumer();
            await userDataResponseConsumer.setupConsumer();
            console.log('✅ UserDataResponseConsumer initialized successfully');

            // Setup study statistics request consumer
            console.log('🚀 Initializing StudyStatisticsRequestConsumer...');
            const studyStatisticsConsumer = new StudyStatisticsRequestConsumer();
            await studyStatisticsConsumer.setupConsumer();
            console.log('✅ StudyStatisticsRequestConsumer initialized successfully');
            
            logger.info('Successfully connected to RabbitMQ and setup all consumers/publishers');
        } catch (error) {
            logger.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    getChannel(): Channel {
        if (!this.channel) {
            throw new Error('RabbitMQ channel not initialized');
        }
        return this.channel;
    }

    async close() {
        try {
            await this.channel?.close();
            await this.connection?.close();
            logger.info('RabbitMQ connection closed');
        } catch (error) {
            logger.error('Error closing RabbitMQ connection:', error);
        }
    }
}

export const rabbitMQ = RabbitMQConnection.getInstance(
    process.env.RABBITMQ_URL || 'amqp://rabbitmq_user:rabbitmq_secure_password_2024@195.210.47.20:5672'
);
