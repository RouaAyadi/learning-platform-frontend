'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';
import { useRef } from 'react';

export interface Message {
  id: string;
  content: string;
  sender: {
    id: number;
    name: string;
    role: string;
  };
  timestamp: string;
  sessionId: number;
}

interface SessionSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  messages: Message[];
  sendMessage: (content: string) => void;
  isTyping: { [key: number]: boolean };
  setUserTyping: (isTyping: boolean) => void;
}

const SessionSocketContext = createContext<SessionSocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
  messages: [],
  sendMessage: () => {},
  isTyping: {},
  setUserTyping: () => {}
});

export const useSessionSocket = () => useContext(SessionSocketContext);

export interface SessionSocketProviderProps {
  children: React.ReactNode;
  sessionId: number;
}

// Create stable selectors outside the component
const selectToken = (state: any) => state.token;
const selectUser = (state: any) => state.getUser();

export function SessionSocketProvider({ children, sessionId }: SessionSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<{ [key: number]: boolean }>({});
  const processedIdsRef = useRef(new Set<string>());

  // Use direct user object from Zustand for stability
  const token = useAuthStore(state => state.token);
  const getUser = useAuthStore(state => state.getUser);
  const user = getUser();

  // Join the session room and handle socket events
  useEffect(() => {
    if (!token || !user) return;
    const socketInstance = io('http://localhost:3300/chat', {
      transports: ['websocket'],
      autoConnect: true,
      auth: { token: `Bearer ${token}` }
    });
    setSocket(socketInstance);

    socketInstance.emit('joinSession', { sessionId, userId: user.id });

    const handleNewMessage = (message: Message) => {
      if (processedIdsRef.current.has(message.id)) return;
      processedIdsRef.current.add(message.id);
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setIsTyping(prev => ({ ...prev, [message.sender.id]: false }));
    };

    const handleRecentMessages = (msgs: Message[]) => {
      setMessages(msgs);
    };

    const handleUserTyping = ({ userId, isTyping }: { userId: number, isTyping: boolean }) => {
      setIsTyping(prev => ({ ...prev, [userId]: isTyping }));
    };

    socketInstance.on('newMessage', handleNewMessage);
    socketInstance.on('recentMessages', handleRecentMessages);
    socketInstance.on('userTyping', handleUserTyping);
    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });
    socketInstance.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });
    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      setError(`Disconnected: ${reason}`);
    });
    socketInstance.on('error', (error: { message: string }) => {
      setError(`Socket error: ${error.message}`);
    });

    return () => {
      socketInstance.emit('leaveSession', { sessionId, userId: user.id });
      socketInstance.off('newMessage', handleNewMessage);
      socketInstance.off('recentMessages', handleRecentMessages);
      socketInstance.off('userTyping', handleUserTyping);
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [token, user, sessionId]);

  const sendMessage = useCallback((content: string) => {
    if (!socket || !user) return;
    socket.emit('sendMessage', {
      sessionId,
      content,
      senderId: user.id
    });
  }, [socket, user && user.id, sessionId]);

  const setUserTyping = useCallback((isTyping: boolean) => {
    if (!socket || !user) return;
    socket.emit('typing', {
      sessionId,
      userId: user.id,
      isTyping
    });
  }, [socket, user && user.id, sessionId]);

  const contextValue = useMemo(() => ({
    socket,
    isConnected,
    error,
    messages,
    sendMessage,
    isTyping,
    setUserTyping
  }), [socket, isConnected, error, messages, isTyping, sendMessage, setUserTyping]);

  return (
    <SessionSocketContext.Provider value={contextValue}>
      {children}
    </SessionSocketContext.Provider>
  );
}