import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, ServerOptions } from 'socket.io';

export interface CorsConfig {
  origin: string | string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}