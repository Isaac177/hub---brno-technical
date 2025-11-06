import { Socket } from 'socket.io';
import { handleProgressUpdate } from './handlers/progressHandler';
import { handleProgressBroadcast } from './handlers/progressBroadcastHandler';

export const setupSocketHandlers = (socket: Socket) => {
  const { email } = socket.handshake.auth;

  if (email) {
    // Join user-specific room for broadcasting
    socket.join(`user:${email}`);
    
    // Set up progress handlers
    handleProgressUpdate(socket);
    handleProgressBroadcast(socket);
  }
};
