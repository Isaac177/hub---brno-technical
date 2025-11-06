export interface SocketConfig {
    cors: {
      origin: string | string[];
      methods: string[];
      credentials: boolean;
    };
    transports: string[];
    pingTimeout: number;
    pingInterval: number;
  }