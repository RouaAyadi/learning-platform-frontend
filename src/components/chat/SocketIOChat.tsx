'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketIOChat = ({ 
  serverUrl = 'http://localhost:3300',
  namespace = '/chat',
  sessionId,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5 
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const connectSocket = useCallback(() => {
    // Get auth token from localStorage
    const authToken = localStorage.getItem('auth-token');
    
    if (!authToken) {
      console.error('No auth token found in localStorage');
      setConnectionStatus('Authentication Failed');
      return;
    }

    if (!sessionId) {
      console.error('Session ID is required');
      setConnectionStatus('Session ID Required');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('Connecting...');

    try {
      // Create Socket.IO connection with auth
      const socket = io(`${serverUrl}${namespace}`, {
        auth: {
          token: `Bearer ${authToken}`
        },
        transports: ['websocket', 'polling'],
        forceNew: true,
      });

      socket.on('connect', () => {
        console.log('Socket.IO connected');
        setConnectionStatus('Connected');
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        
        // Join the session room
        socket.emit('joinSession', { 
          sessionId: parseInt(sessionId),
          userId: null // Will be set by server from token
        });
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
        setConnectionStatus('Disconnected');
        setIsConnecting(false);
        
        // Attempt to reconnect for certain disconnect reasons
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          // Server initiated disconnect or client initiated - don't auto-reconnect
          return;
        }
        
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setConnectionStatus(`Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          setTimeout(() => {
            connectSocket();
          }, reconnectInterval);
        } else {
          setConnectionStatus('Connection Failed');
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        setConnectionStatus('Connection Error');
        setIsConnecting(false);
      });

      // Handle recent messages when joining a session
      socket.on('recentMessages', (recentMessages) => {
        console.log('Received recent messages:', recentMessages);
        setMessages(recentMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender?.username || msg.sender?.email || 'Unknown',
          senderId: msg.senderId,
          timestamp: msg.createdAt || msg.timestamp,
          type: 'message'
        })));
      });

      // Handle new messages
      socket.on('newMessage', (message) => {
        console.log('New message received:', message);
        setMessages(prev => [...prev, {
          id: message.id,
          content: message.content,
          sender: message.sender?.username || message.sender?.email || 'Unknown',
          senderId: message.senderId,
          timestamp: message.createdAt || message.timestamp,
          type: 'message'
        }]);
      });

      // Handle message read status
      socket.on('messageRead', (data) => {
        console.log('Message read:', data);
        // You can update message read status in UI if needed
      });

      // Handle typing indicators
      socket.on('userTyping', (data) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: `Error: ${error.message}`,
          type: 'error',
          timestamp: new Date().toISOString()
        }]);
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('Failed to create Socket.IO connection:', error);
      setConnectionStatus('Connection Failed');
      setIsConnecting(false);
    }
  }, [serverUrl, namespace, sessionId, reconnectInterval, maxReconnectAttempts]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      // Leave session before disconnecting
      if (sessionId) {
        socketRef.current.emit('leaveSession', { 
          sessionId: parseInt(sessionId),
          userId: null
        });
      }
      
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    reconnectAttemptsRef.current = 0;
    setConnectionStatus('Disconnected');
    setTypingUsers(new Set());
  }, [sessionId]);

  const sendMessage = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.error('Socket is not connected');
      return;
    }

    if (!inputMessage.trim()) {
      return;
    }

    const messageData = {
      content: inputMessage.trim(),
      sessionId: parseInt(sessionId),
      // senderId will be set by server from auth token
    };

    try {
      socketRef.current.emit('sendMessage', messageData);
      setInputMessage('');
      
      // Stop typing indicator
      if (isTyping) {
        socketRef.current.emit('typing', {
          sessionId: parseInt(sessionId),
          userId: null, // Will be set by server
          isTyping: false
        });
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [inputMessage, sessionId, isTyping]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('typing', {
          sessionId: parseInt(sessionId),
          userId: null, // Will be set by server
          isTyping: true
        });
      }
    }
    
    // Clear typing timeout and set new one
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('typing', {
          sessionId: parseInt(sessionId),
          userId: null,
          isTyping: false
        });
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const markAsRead = useCallback((messageId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('markAsRead', {
        messageId: messageId,
        userId: null // Will be set by server
      });
    }
  }, []);

  // Connect on component mount
  useEffect(() => {
    if (sessionId) {
      connectSocket();
    }
    
    // Cleanup on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      disconnectSocket();
    };
  }, [sessionId, connectSocket, disconnectSocket]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          (!socketRef.current || !socketRef.current.connected)) {
        connectSocket();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [connectSocket]);

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center h-96 max-w-2xl mx-auto border border-gray-300 rounded-lg bg-gray-50">
        <p className="text-gray-500">Session ID is required to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 max-w-2xl mx-auto border border-gray-300 rounded-lg bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold">Chat Session {sessionId}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'Connected' ? 'bg-green-500' : 
            connectionStatus.includes('Connecting') || connectionStatus.includes('Reconnecting') ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">{connectionStatus}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-2 rounded cursor-pointer hover:bg-gray-50 ${
                msg.type === 'error' 
                  ? 'bg-red-50 border-l-4 border-red-500'
                  : msg.type === 'system' 
                  ? 'bg-gray-100 text-gray-600 text-center text-sm'
                  : msg.isCurrentUser
                  ? 'bg-green-50 border-l-4 border-green-500 ml-8'
                  : 'bg-blue-50 border-l-4 border-blue-500 mr-8'
              }`}
              onClick={() => msg.type === 'message' && markAsRead(msg.id)}
            >
              {msg.type === 'message' && (
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-medium text-sm ${
                    msg.isCurrentUser ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {msg.isCurrentUser ? 'You' : msg.sender}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
              <div className={msg.type === 'system' ? '' : 'text-gray-800'}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="text-sm text-gray-500 italic">
            {typingUsers.size === 1 ? 'Someone is' : `${typingUsers.size} people are`} typing...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="1"
            disabled={connectionStatus !== 'Connected'}
          />
          <button
            onClick={sendMessage}
            disabled={connectionStatus !== 'Connected' || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </span>
          {connectionStatus !== 'Connected' && (
            <button
              onClick={connectSocket}
              disabled={isConnecting}
              className="text-xs text-blue-500 hover:text-blue-700 disabled:text-gray-400"
            >
              {isConnecting ? 'Connecting...' : 'Reconnect'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocketIOChat;