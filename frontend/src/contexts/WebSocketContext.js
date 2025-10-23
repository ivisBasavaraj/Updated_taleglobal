import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Always use localhost for development
    const socketUrl = 'http://localhost:5000';
    console.log('Connecting to WebSocket:', socketUrl);
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinCandidateRoom = (candidateId) => {
    if (socket && candidateId) {
      socket.emit('join-candidate', candidateId);
      console.log(`Joined candidate room: ${candidateId}`);
    }
  };

  const joinAdminRoom = () => {
    if (socket) {
      socket.emit('join-admin');
      console.log('Joined admin room');
    }
  };

  const value = {
    socket,
    isConnected,
    joinCandidateRoom,
    joinAdminRoom
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};