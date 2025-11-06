import { Channel, ConsumeMessage } from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../../utils/logger';
import { QuizProgressService } from '../../quizProgressService';

const prisma = new PrismaClient();

// Types
type JavaWrapper<T, K extends string> = [K, T];
type JavaLong = JavaWrapper<number, 'java.lang.Long'>;
type JavaUUID = JavaWrapper<string, 'java.util.UUID'>;

interface JavaMessage {
  '@class': 'java.util.HashMap';
  timeElapsed: JavaLong;
  score: number;
  completedAt: [string, number[]];  // Java ArrayList format
  firstAttempt: boolean;
  quizId: JavaUUID;
  perfectScore: boolean;
  passed: boolean;
  userId: string;
  courseId: string;
}

interface RawMessage {
  rawMessage: JavaMessage;
}

interface QuizCompletion {
  userId: string;
  courseId: string;
  quizId: string;
  score: number;
  passed: boolean;
  completedAt: Date;
  firstAttempt: boolean;
  perfectScore: boolean;
  timeElapsed: number;
  totalQuizzesInCourse: number;
  quizzesCompletedByUser: number;
  overallProgress: number;
}

// Constants
const QUEUE_NAME = 'quiz_completion_queue';
const EXCHANGE_NAME = 'quiz_events';
const ROUTING_KEY = 'quiz.completion.enrollment';

// Utils
class JavaConversionError extends Error {
  constructor(message: string, public readonly data?: unknown) {
    super(message);
    this.name = 'JavaConversionError';
  }
}

// Date handling
function parseJavaArrayList(wrapper: [string, number[]]): number[] {
  const [type, values] = wrapper;
  if (type !== 'java.util.Arrays$ArrayList' || !Array.isArray(values)) {
    throw new JavaConversionError('Invalid ArrayList format', wrapper);
  }
  return values;
}

function createDateFromArray(dateArray: number[]): Date {
  if (!Array.isArray(dateArray) || dateArray.length < 7) {
    throw new JavaConversionError('Invalid date array length', dateArray);
  }

  const [year, month, day, hour, minute, second, nanos] = dateArray;
  
  if ([year, month, day, hour, minute, second, nanos].some(n => typeof n !== 'number')) {
    throw new JavaConversionError('Invalid date components', { year, month, day, hour, minute, second, nanos });
  }

  const date = new Date(Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    Math.floor(nanos / 1_000_000)
  ));

  if (isNaN(date.getTime())) {
    throw new JavaConversionError('Invalid date', { year, month, day, hour, minute, second, nanos });
  }

  return date;
}

// Message handling
function convertMessage(raw: any): QuizCompletion {
  try {
    logger.info('Starting message conversion', {
      messageType: raw['@class'],
      hasCompletedAt: !!raw.completedAt,
      completedAtType: typeof raw.completedAt,
      completedAtValue: raw.completedAt
    });

    // Extract the date array from the completedAt field
    const [_, dateArray] = raw.completedAt;
    const completedAt = createDateFromArray(dateArray);

    // Extract the UUID from quizId field
    const [__, quizId] = raw.quizId;

    const result: QuizCompletion = {
      userId: raw.userId,
      courseId: raw.courseId,
      quizId: quizId,
      score: raw.score,
      passed: raw.passed,
      completedAt: completedAt,
      firstAttempt: raw.firstAttempt || false,
      perfectScore: raw.perfectScore || false,
      timeElapsed: 0, // This field is not present in the new message format
      totalQuizzesInCourse: raw.totalQuizzesInCourse,
      quizzesCompletedByUser: raw.quizzesCompletedByUser,
      overallProgress: raw.overallProgress
    };

    logger.info('Successfully converted message', { result });
    return result;
  } catch (error) {
    logger.error('Failed to convert message', {
      error,
      rawMessageType: typeof raw,
      rawMessageKeys: raw ? Object.keys(raw) : [],
      rawMessage: raw
    });
    throw new JavaConversionError('Failed to convert message', raw);
  }
}

class DatabaseError extends Error {
  constructor(message: string, public readonly operation: string, public readonly data?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

async function getOrCreateEnrollment(userId: string, courseId: string) {
  try {
    return await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId, courseId }
      },
      update: {},
      create: {
        userId,
        courseId,
        progress: 0,
        status: 'ACTIVE'
      }
    });
  } catch (error) {
    throw new DatabaseError(
      'Failed to get or create enrollment',
      'enrollment.upsert',
      { userId, courseId, error }
    );
  }
}

async function updateQuizProgress(quiz: QuizCompletion, enrollmentId: string) {
  try {
    const current = await prisma.quizProgress.findUnique({
      where: {
        enrollmentId_quizId: { enrollmentId, quizId: quiz.quizId }
      }
    });

    return await prisma.quizProgress.upsert({
      where: {
        enrollmentId_quizId: { enrollmentId, quizId: quiz.quizId }
      },
      update: {
        attempts: { increment: 1 },
        bestScore: current?.bestScore && current.bestScore > quiz.score 
          ? current.bestScore 
          : quiz.score,
        lastAttemptAt: new Date(),
        passed: current?.passed || quiz.passed
      },
      create: {
        enrollmentId,
        quizId: quiz.quizId,
        attempts: 1,
        bestScore: quiz.score,
        lastAttemptAt: new Date(),
        passed: quiz.passed
      }
    });
  } catch (error) {
    throw new DatabaseError(
      'Failed to update quiz progress',
      'quizProgress.upsert',
      { quiz, enrollmentId, error }
    );
  }
}

// Main handler
async function processQuizCompletion(channel: Channel, msg: ConsumeMessage) {
  try {
    const content = msg.content.toString();
    logger.info('Received raw message content', { content });

    // Parse the JSON content
    const rawMessage = JSON.parse(content);
    logger.info('Parsed raw message', {
      messageType: typeof rawMessage,
      hasRawMessage: !!rawMessage,
      rawMessageType: typeof rawMessage
    });

    // Convert the message
    const normalized = convertMessage(rawMessage);
    logger.info('Normalized message', { 
      normalizedType: typeof normalized,
      hasCompletedAt: !!normalized.completedAt,
      completedAtType: typeof normalized.completedAt,
      completedAtValue: normalized.completedAt.toISOString(),
      normalizedMessage: normalized 
    });

    const quizProgressService = new QuizProgressService();
    await getOrCreateEnrollment(normalized.userId, normalized.courseId);
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: normalized.userId, courseId: normalized.courseId }
    });
    if (enrollment) {
      await updateQuizProgress(normalized, enrollment.id);
    }
    logger.info('Successfully processed quiz completion');
    
    channel.ack(msg);
  } catch (error) {
    logger.error('Error processing quiz completion message:', error);
    // Reject the message and don't requeue
    channel.nack(msg, false, false);
  }
}

// Queue consumer
export async function setupQuizConsumer(channel: Channel) {
  // First, delete the existing queue if it exists
  try {
    await channel.deleteQueue(QUEUE_NAME);
  } catch (error) {
    logger.info('Queue does not exist or could not be deleted, proceeding with creation');
  }

  // Setup main exchange and queue
  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
  const { queue } = await channel.assertQueue(QUEUE_NAME, { 
    durable: true, 
    arguments: { 
      'x-dead-letter-exchange': 'quiz_completion_dlx' 
    } 
  });
  await channel.bindQueue(queue, EXCHANGE_NAME, ROUTING_KEY);

  // Setup dead letter exchange and queue
  await channel.assertExchange('quiz_completion_dlx', 'direct', { durable: true });
  const dlq = await channel.assertQueue('quiz_completion_dlq', { durable: true });
  await channel.bindQueue(dlq.queue, 'quiz_completion_dlx', '');

  await channel.consume(QUEUE_NAME, (msg) => {
    if (msg) {
      processQuizCompletion(channel, msg).catch((error) => {
        logger.error('Error in quiz completion consumer:', error);
      });
    }
  });

  logger.info('Quiz completion consumer ready');
}

export { 
  processQuizCompletion as handleQuizCompletion,
  setupQuizConsumer as setupQuizCompletionConsumer 
};