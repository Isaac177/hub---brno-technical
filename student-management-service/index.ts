import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { PrismaClient } from '@prisma/client';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import i18nextBackend from 'i18next-fs-backend';
import { logger } from './utils/logger';
import { rateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './utils/errors';
import enrollmentRoutes from "./routes/enrollmentRoutes";
import certificateRoutes from "./routes/certificateRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import progressRoutes from './routes/progressRoutes';
import viewRoutes from "./routes/viewRoutes";
import schoolRoutes from "./routes/schoolRoutes";
import aiRecommendationRoutes from "./routes/aiRecommendationRoutes";
import expressWinston from 'express-winston';
import MessageQueueService from "./services/messageQueue";
import { createServer } from 'http';
import { SocketService } from './services/socketService';
import { SocketConfig } from './services/socket/config';

dotenv.config();

const app = express();
const httpServer = createServer(app);
app.set('trust proxy', 1);

declare global {
    namespace Express {
        interface Application {
            messageQueue: typeof messageQueue;
            socketService: SocketService;
        }
    }
}

const prisma = new PrismaClient();
const swaggerDocument = YAML.load('./swagger.yaml');
const messageQueue = new MessageQueueService(process.env.RABBITMQ_URL || '');

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3003', 'https://online-school.fly.dev', 'https://ybyraihub.kz', 'https://www.ybyraihub.kz'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'user-email', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

const socketConfig: SocketConfig = {
    cors: {
        origin: corsOptions.origin,
        methods: corsOptions.methods,
        credentials: corsOptions.credentials
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 10000,
    pingInterval: 5000
};
const socketService = new SocketService(httpServer, socketConfig);

app.messageQueue = messageQueue;
app.socketService = socketService;

async function initializeServices() {
    try {
        await messageQueue.connect();
        logger.info('RabbitMQ connection established');

        logger.info('Socket.IO server initialized');

        await i18next
            .use(i18nextBackend)
            .use(i18nextMiddleware.LanguageDetector)
            .init({
                backend: {
                    loadPath: './locales/{{lng}}.json',
                },
                fallbackLng: 'en',
                preload: ['en', 'ru'],
            });

        app.use(expressWinston.logger({
            winstonInstance: logger,
            meta: false,
            msg: "HTTP {{req.method}} {{req.url}}",
            expressFormat: true,
            colorize: true,
        }));

        app.use(helmet());

        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        app.use(cookieParser());
        app.use(rateLimiter);
        app.use(i18nextMiddleware.handle(i18next));

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        app.get('/', (req, res) => {
            res.send(req.t('welcome'));
        });

        app.use('/api', [
            enrollmentRoutes,
            certificateRoutes,
            categoryRoutes,
            postRoutes,
            commentRoutes,
            viewRoutes,
            progressRoutes,
            schoolRoutes,
            aiRecommendationRoutes
        ]);

        app.use((req, res, next) => {
            try {
                next(new NotFoundError('Route not found'));
            } catch (error) {
                // Fallback if i18next or other middleware fails
                logger.error('Error in 404 handler:', error);
                res.status(404).json({
                    status: 'error',
                    statusCode: 404,
                    message: 'Route not found'
                });
            }
        });

        app.use(expressWinston.errorLogger({
            winstonInstance: logger,
        }));

        app.use(errorHandler);

    } catch (error) {
        logger.error('Failed to initialize services:', error);
        process.exit(1);
    }
}

initializeServices().catch((error) => {
    logger.error('Failed to start the application:', error);
    process.exit(1);
});

const PORT = process.env.PORT || 3003;
httpServer.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

const shutdown = async () => {
    logger.info('Shutdown signal received');

    try {
        await new Promise((resolve) => {
            httpServer.close(resolve);
        });
        logger.info('HTTP server closed');

        await messageQueue.close();
        logger.info('RabbitMQ connection closed');

        await prisma.$disconnect();
        logger.info('Database connection closed');

        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);