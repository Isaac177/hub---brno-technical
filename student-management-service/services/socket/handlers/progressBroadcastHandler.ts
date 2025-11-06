import { Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { CourseProgressData } from './progressHandler';

const prisma = new PrismaClient();

// Event names matching client-side eventTypes.js
const PROGRESS_EVENTS = {
  SEND: {
    UPDATE: 'updateProgress',
    BROADCAST: 'broadcastProgress',
    REQUEST_SYNC: 'requestSync'
  },
  RECEIVE: {
    UPDATE: 'progressUpdate',
    BROADCAST: 'progressBroadcast',
    SYNC: 'progressSync'
  }
};

export const handleProgressBroadcast = (socket: Socket) => {
  const { email } = socket.handshake.auth;

  console.log('🔌 Setting up progress broadcast handler for user:', JSON.stringify({
    socketId: socket.id,
    email,
    timestamp: new Date().toISOString()
  }, null, 2));

  // Handle room management
  socket.on('join', async (data: { room: string }) => {
    const { room } = data;
    
    // Get current rooms for this socket
    const currentRooms = Array.from(socket.rooms.values());
    
    console.log('🔍 Current rooms before join:', JSON.stringify({
      socketId: socket.id,
      email,
      currentRooms,
      joiningRoom: room,
      timestamp: new Date().toISOString()
    }, null, 2));

    await socket.join(room);
    
    // Verify room was joined
    const updatedRooms = Array.from(socket.rooms.values());
    console.log('✅ Room join complete:', JSON.stringify({
      socketId: socket.id,
      email,
      previousRooms: currentRooms,
      currentRooms: updatedRooms,
      joinedRoom: room,
      timestamp: new Date().toISOString()
    }, null, 2));

    // Notify others in the room
    socket.to(room).emit('userJoined', {
      socketId: socket.id,
      room,
      userEmail: email,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('leave', async (data: { room: string }) => {
    const { room } = data;
    
    // Get current rooms before leaving
    const currentRooms = Array.from(socket.rooms.values());
    
    console.log('🔍 Current rooms before leave:', JSON.stringify({
      socketId: socket.id,
      email,
      currentRooms,
      leavingRoom: room,
      timestamp: new Date().toISOString()
    }, null, 2));

    await socket.leave(room);
    
    // Verify room was left
    const updatedRooms = Array.from(socket.rooms.values());
    console.log('👋 Room leave complete:', JSON.stringify({
      socketId: socket.id,
      email,
      previousRooms: currentRooms,
      currentRooms: updatedRooms,
      leftRoom: room,
      timestamp: new Date().toISOString()
    }, null, 2));

    // Notify others in the room
    socket.to(room).emit('userLeft', {
      socketId: socket.id,
      room,
      userEmail: email,
      timestamp: new Date().toISOString()
    });
  });

  // Handle progress request
  socket.on(PROGRESS_EVENTS.SEND.REQUEST_SYNC, async (data: { courseId: string }) => {
    try {
      const { courseId } = data;
      
      console.log('🔄 Progress sync requested:', JSON.stringify({
        socketId: socket.id,
        courseId,
        userEmail: email,
        timestamp: new Date().toISOString()
      }, null, 2));

      console.log('🔍 Querying database for progress:', JSON.stringify({
        courseId,
        userEmail: email,
        query: {
          where: { courseId, enrollment: { userEmail: email } },
          select: [
            'courseId',
            'componentProgress',
            'totalComponents',
            'completedComponents',
            'overallProgress',
            'topicsProgress',
            'enrollmentId',
            'lastUpdated'
          ]
        },
        timestamp: new Date().toISOString()
      }, null, 2));

      // Fetch the actual progress data from the database
      const progressData = await prisma.courseProgress.findFirst({
        where: {
          courseId,
          enrollment: {
            userEmail: email
          }
        },
        select: {
          courseId: true,
          componentProgress: true,
          totalComponents: true,
          completedComponents: true,
          overallProgress: true,
          topicsProgress: true,
          enrollmentId: true,
          lastUpdated: true
        }
      });

      if (!progressData) {
        console.log('⚠️ No progress data found:', JSON.stringify({
          courseId,
          userEmail: email,
          timestamp: new Date().toISOString()
        }, null, 2));
        
        const defaultProgress = {
          courseId,
          progress: {
            componentProgress: {
              videos: { total: 0, completed: 0 },
              quizzes: { total: 0, completed: 0 }
            },
            totalComponents: 0,
            completedComponents: 0,
            overallProgress: 0,
            topicsProgress: {}
          },
          source: 'sync',
          timestamp: new Date().toISOString()
        };

        console.log('📤 Sending default progress to client:', JSON.stringify({
          socketId: socket.id,
          userEmail: email,
          data: defaultProgress,
          timestamp: new Date().toISOString()
        }, null, 2));

        // Send default initial progress
        socket.emit(PROGRESS_EVENTS.RECEIVE.SYNC, defaultProgress);
        return;
      }

      console.log('✅ Found progress data:', JSON.stringify({
        courseId,
        userEmail: email,
        progressData,
        timestamp: new Date().toISOString()
      }, null, 2));

      const progressDataTyped: any = {
        ...progressData,
        type: 'courseProgress',
        timestamp: new Date().toISOString()
      };

      if (!progressDataTyped.componentProgress) {
        console.log('⚠️ No component progress data found:', JSON.stringify({
          courseId,
          userEmail: email,
          timestamp: new Date().toISOString()
        }, null, 2));
        return;
      }

      const syncResponse = {
        courseId,
        progress: {
          componentProgress: progressDataTyped.componentProgress,
          totalComponents: progressDataTyped.totalComponents,
          completedComponents: progressDataTyped.completedComponents,
          overallProgress: progressDataTyped.overallProgress,
          topicsProgress: progressDataTyped.topicsProgress
        },
        source: 'sync',
        timestamp: new Date().toISOString()
      };

      console.log('📤 Sending progress sync to client:', JSON.stringify({
        socketId: socket.id,
        userEmail: email,
        data: syncResponse,
        timestamp: new Date().toISOString(),
        details: {
          componentProgress: {
            videos: {
              total: progressDataTyped.componentProgress.videos.total,
              completed: progressDataTyped.componentProgress.videos.completed
            },
            quizzes: {
              total: progressDataTyped.componentProgress.quizzes.total,
              completed: progressDataTyped.componentProgress.quizzes.completed
            }
          },
          totalComponents: progressDataTyped.totalComponents,
          completedComponents: progressDataTyped.completedComponents,
          overallProgress: progressDataTyped.overallProgress,
          topicsProgressKeys: Object.keys(progressDataTyped.topicsProgress || {})
        }
      }, null, 2));

      // Send the actual progress data to the requesting client
      socket.emit(PROGRESS_EVENTS.RECEIVE.SYNC, syncResponse);

    } catch (error) {
      console.error('❌ Error handling progress sync:', JSON.stringify({
        socketId: socket.id,
        userEmail: email,
        courseId: data.courseId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      const errorResponse = {
        courseId: data.courseId,
        error: 'Failed to fetch progress data',
        source: 'sync',
        timestamp: new Date().toISOString()
      };

      console.log('📤 Sending error response to client:', JSON.stringify({
        socketId: socket.id,
        userEmail: email,
        data: errorResponse,
        timestamp: new Date().toISOString()
      }, null, 2));

      // Send error response
      socket.emit(PROGRESS_EVENTS.RECEIVE.SYNC, errorResponse);
    }
  });

  // Handle course progress broadcast
  socket.on(PROGRESS_EVENTS.SEND.BROADCAST, async (data: CourseProgressData) => {
    try {
      const { courseId, enrollmentId } = data;

      // Get current rooms to verify socket is in the right room
      const currentRooms = Array.from(socket.rooms.values());
      
      console.log('📢 Broadcasting progress:', JSON.stringify({
        socketId: socket.id,
        courseId,
        enrollmentId,
        userEmail: email,
        currentRooms,
        timestamp: new Date().toISOString()
      }, null, 2));

      if (!currentRooms.includes(courseId)) {
        console.warn('⚠️ Socket not in course room:', JSON.stringify({
          socketId: socket.id,
          courseId,
          currentRooms,
          timestamp: new Date().toISOString()
        }, null, 2));
      }

      // Broadcast to all clients in the course room
      socket.to(courseId).emit(PROGRESS_EVENTS.RECEIVE.BROADCAST, {
        ...data,
        userEmail: email,
        source: 'broadcast',
        timestamp: new Date().toISOString()
      });

      console.log('✅ Broadcast sent:', JSON.stringify({
        socketId: socket.id,
        courseId,
        recipientRoom: courseId,
        timestamp: new Date().toISOString()
      }, null, 2));

    } catch (error) {
      console.error('❌ Error broadcasting progress:', error);
    }
  });
};
