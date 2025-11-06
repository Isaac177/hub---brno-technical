import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://ums.ybyraihub.kz';

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) {
      console.log('No user email, skipping socket connection');
      return;
    }

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: {
        userEmail: user.email
      }
    });

    // Socket connection handlers
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setCurrentRoom(null);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setCurrentRoom(null);
      }
    };
  }, [user?.email]);

  const joinRoom = useCallback((roomId) => {
    if (!isConnected || !socketRef.current || !user?.email || !roomId) {
      console.warn('Cannot join room - prerequisites not met');
      return;
    }

    socketRef.current.emit('join', { roomId, userEmail: user.email });
    setCurrentRoom(roomId);
  }, [isConnected, user?.email]);

  const leaveRoom = useCallback(() => {
    if (!isConnected || !socketRef.current || !currentRoom) {
      return;
    }

    socketRef.current.emit('leave', { roomId: currentRoom });
    setCurrentRoom(null);
  }, [isConnected, currentRoom]);

  const value = {
    socket: socketRef.current,
    isConnected,
    currentRoom,
    joinRoom,
    leaveRoom
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;