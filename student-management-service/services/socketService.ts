import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { SocketConfig, defaultConfig } from './socket/config';
import { handleConnection } from './socket/handlers/connectionHandler';
import { handleProgressUpdate } from './socket/handlers/progressHandler';
import { handleProgressBroadcast } from './socket/handlers/progressBroadcastHandler';
import { setupRoomHandler } from './socket/handlers/roomHandler';

export class SocketService {
  private io: Server;

  constructor(httpServer: HttpServer, config: Partial<SocketConfig> = {}) {
    const finalConfig = {
      ...defaultConfig,
      ...config
    };

    this.io = new Server(httpServer, {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:3003', 'https://ybyraihub.kz', 'https://www.ybyraihub.kz'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const { email } = socket.handshake.auth;

      if (!email) {
        console.error('Socket connection rejected: No email provided in auth');
        socket.disconnect(true);
        return;
      }

      console.log(' New socket connection:', JSON.stringify({
        socketId: socket.id,
        email,
        timestamp: new Date().toISOString()
      }, null, 2));

      socket.join(`user:${email}`);

      handleConnection(socket);
      handleProgressUpdate(socket);
      handleProgressBroadcast(socket);
      setupRoomHandler(socket, email);

      socket.on('disconnect', () => {
        console.log(' Socket disconnected:', JSON.stringify({
          socketId: socket.id,
          email,
          timestamp: new Date().toISOString()
        }, null, 2));
      });

      socket.on('error', (error) => {
        console.error('Socket error:', JSON.stringify({
          socketId: socket.id,
          email,
          error: error.message,
          timestamp: new Date().toISOString()
        }, null, 2));
      });
    });

    this.io.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2));
    });
  }

  async broadcastProgress(courseId: string, progress: number) {
    console.log('Broadcasting progress:', JSON.stringify({
      courseId,
      progress,
      timestamp: new Date().toISOString()
    }, null, 2));

    this.io.emit('courseProgress', { courseId, progress });
  }

  public getIO(): Server {
    return this.io;
  }
}
