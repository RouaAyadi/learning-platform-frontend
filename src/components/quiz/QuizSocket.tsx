'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';

interface QuizSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

const QuizSocketContext = createContext<QuizSocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
  reconnect: () => {}
});

export const useQuizSocket = () => useContext(QuizSocketContext);

export interface Question {
  id: number;
  questionText: string;
  options: string[];
}

export interface QuizSocketProviderProps {
  children: React.ReactNode;
}

export function QuizSocketProvider({ children }: QuizSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const setupSocket = useCallback(() => {
    if (!token) {
      setError('Authentication required');
      return null;
    }

    const socketInstance = io('http://localhost:3300', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        token: `Bearer ${token}`
      }
    });

    // Setup event listeners
    socketInstance.on('connect', () => {
      console.log('Connected to quiz server');
      setIsConnected(true);
      setError(null);
      
      // Join the quizzes namespace after connection
      socketInstance.emit('join', { namespace: 'quizzes' });
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from quiz server:', reason);
      setIsConnected(false);

      // Handle different disconnect reasons
      switch (reason) {
        case 'io server disconnect':
          // Server disconnected us, try to reconnect
          socketInstance.connect();
          break;
        case 'transport close':
          // Connection lost, will automatically try to reconnect
          setError('Connection lost. Attempting to reconnect...');
          break;
        case 'ping timeout':
          // Connection timed out, will automatically try to reconnect
          setError('Connection timed out. Attempting to reconnect...');
          break;
        default:
          setError(`Disconnected: ${reason}. Attempting to reconnect...`);
      }
    });

    socketInstance.on('error', (error) => {
      console.error('Quiz socket error:', error);
      setError(`Socket error: ${error.message}`);
    });

    // Setup ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit('ping');
      }
    }, 25000);

    // Setup reconnection check
    const reconnectCheck = setInterval(() => {
      if (!socketInstance.connected) {
        console.log('Connection check: attempting to reconnect...');
        socketInstance.connect();
      }
    }, 5000);

    return {
      socket: socketInstance,
      cleanup: () => {
        clearInterval(pingInterval);
        clearInterval(reconnectCheck);
        socketInstance.disconnect();
      }
    };
  }, [token]);

  // Initialize socket connection
  useEffect(() => {
    const connection = setupSocket();
    if (connection) {
      setSocket(connection.socket);
      return connection.cleanup;
    }
    return undefined;
  }, [setupSocket]);

  // Reconnect function
  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    const connection = setupSocket();
    if (connection) {
      setSocket(connection.socket);
    }
  }, [socket, setupSocket]);

  return (
    <QuizSocketContext.Provider value={{ socket, isConnected, error, reconnect }}>
      {children}
    </QuizSocketContext.Provider>
  );
} 