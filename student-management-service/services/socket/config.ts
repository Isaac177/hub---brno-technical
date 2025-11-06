import { CorsOptions } from 'cors';

export interface SocketConfig {
    cors: CorsOptions;
    transports?: string[];
    pingTimeout?: number;
    pingInterval?: number;
}

export const defaultConfig: SocketConfig = {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3003', 'https://online-school.fly.dev', 'https://ybyraihub.kz'],
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 10000,
    pingInterval: 5000
};
