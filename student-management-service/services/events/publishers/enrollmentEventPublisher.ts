import { Channel } from 'amqplib';
import { logger } from '../../../utils/logger';

export const EXCHANGE_NAME = 'enrollment_events';

export async function setupEnrollmentEventPublisher(channel: Channel) {
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    logger.info('Enrollment event publisher setup completed');
}

export async function publishEnrollmentEvent(channel: Channel, eventType: string, data: any) {
    try {
        const message = {
            event: eventType,
            data,
            timestamp: new Date().toISOString()
        };

        await channel.publish(
            EXCHANGE_NAME,
            eventType,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );

        logger.info(`Published ${eventType} event`, { eventType });
    } catch (error) {
        logger.error(`Failed to publish ${eventType} event:`, error);
        throw error;
    }
}
