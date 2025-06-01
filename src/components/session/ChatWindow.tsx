'use client';

import { useState, useRef, useEffect } from 'react';
import { useSessionSocket } from './SessionSocket';
import { useAuthStore } from '@/store/auth';
import { debounce } from 'lodash';

// Create stable selector outside component
const selectUser = (state: any) => state.getUser();

export function ChatWindow() {
  const { messages, sendMessage, isConnected, error, isTyping, setUserTyping } = useSessionSocket();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Use stable selector
  const user = useAuthStore(selectUser);

  // Handle client-side only code
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isClient && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isClient]);

  // Debounced typing indicator
  const debouncedTyping = useRef(
    debounce((isTyping: boolean) => {
      setUserTyping(isTyping);
    }, 500)
  ).current;

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedTyping.cancel();
    };
  }, [debouncedTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    debouncedTyping(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    sendMessage(newMessage.trim());
    setNewMessage('');
    debouncedTyping(false);
  };

  // Show typing indicators
  const typingUsers = Object.entries(isTyping)
    .filter(([userId, isTyping]) => isTyping && Number(userId) !== user?.id)
    .map(([userId]) => userId);

  if (!isClient) {
    return (
      <div className="flex flex-col h-full bg-base-200 rounded-lg">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-error">Please log in to participate in the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-base-200 rounded-lg">
      {/* Connection Status */}
      {error && (
        <div className="alert alert-error shadow-lg m-2">
          <span>{error}</span>
        </div>
      )}
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat ${
              message.sender.id === user.id ? 'chat-end' : 'chat-start'
            }`}
          >
            <div className="chat-header">
              {message.sender.name}
              <time className="text-xs opacity-50 ml-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </time>
            </div>
            <div className={`chat-bubble ${
              message.sender.id === user.id 
                ? 'chat-bubble-primary' 
                : 'chat-bubble-secondary'
            }`}>
              {message.content}
            </div>
            <div className="chat-footer opacity-50">
              {message.sender.role}
            </div>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-secondary opacity-50">
              {typingUsers.length === 1
                ? 'Someone is typing...'
                : 'Multiple people are typing...'}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-base-300 rounded-b-lg">
        <div className="join w-full">
          <input
            type="text"
            placeholder={
              isConnected
                ? "Type your message..."
                : "Connecting to chat..."
            }
            className="input input-bordered join-item flex-1"
            value={newMessage}
            onChange={handleInputChange}
            onBlur={() => debouncedTyping(false)}
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="btn btn-primary join-item"
            disabled={!isConnected || !newMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 