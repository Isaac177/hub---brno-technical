import { Socket } from 'socket.io';

export const setupRoomHandler = (socket: Socket, email: string) => {
  socket.on('join', async (data: { room: string; userEmail: string; timestamp: string }, callback) => {
    try {
      const { room, userEmail } = data;
      
      await socket.join(room);
      
      console.log('👤 User joined room:', JSON.stringify({
        socketId: socket.id,
        room,
        userEmail,
        timestamp: new Date().toISOString()
      }, null, 2));

      // Broadcast to others in the room that someone joined
      socket.to(room).emit('userJoined', {
        userEmail,
        timestamp: new Date().toISOString()
      });

      callback({ success: true });
    } catch (error: any) {
      console.error('❌ Error joining room:', JSON.stringify({
        error: error.message,
        stack: error.stack,
        socketId: socket.id,
        email,
        data,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      callback({ error: 'Failed to join room', details: error.message });
    }
  });

  socket.on('leave', (data: { room: string; userEmail: string; timestamp: string }) => {
    try {
      const { room, userEmail } = data;
      
      socket.leave(room);
      
      console.log('👋 User left room:', JSON.stringify({
        socketId: socket.id,
        room,
        userEmail,
        timestamp: new Date().toISOString()
      }, null, 2));

      // Broadcast to others that someone left
      socket.to(room).emit('userLeft', {
        userEmail,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Error leaving room:', JSON.stringify({
        error: error.message,
        stack: error.stack,
        socketId: socket.id,
        email,
        data,
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  });
};
