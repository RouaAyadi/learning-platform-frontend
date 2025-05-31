'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { useAuthStore } from '@/store/auth'
import { io, Socket } from 'socket.io-client'

const MESSAGES_QUERY = gql`
  query GetMessages($sessionId: Int!) {
    messagesBySession(sessionId: $sessionId) {
      id
      content
      timestamp
      sender {
        id
        name
      }
    }
  }
`

type Message = {
  id: string
  content: string
  timestamp: string
  sender: {
    id: number
    name: string
  }
}

type ChatWindowProps = {
  sessionId: string
}

export default function ChatWindow({ sessionId }: ChatWindowProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { user, token } = useAuthStore()
  const sessionIdNumber = parseInt(sessionId, 10)
  const socketRef = useRef<Socket | null>(null)

  const { data, loading } = useQuery(MESSAGES_QUERY, {
    variables: { sessionId: sessionIdNumber },
    onCompleted: (data) => {
      setMessages(data?.messagesBySession || [])
    },
  })

  useEffect(() => {
    if (!user || !token) return
    const socket = io('http://localhost:3300/chat', {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('joinSession', {
        sessionId: sessionIdNumber,
        userId: user.id,
      })
    })

    socket.on('recentMessages', (msgs: Message[]) => {
      setMessages(msgs)
      scrollToBottom()
    })

    socket.on('newMessage', (msg: Message) => {
      setMessages((prev) => [...prev, msg])
      scrollToBottom()
    })


    return () => {
      socket.emit('leaveSession', {
        sessionId: sessionIdNumber,
        userId: user.id,
      })
      socket.disconnect()
    }
  }, [user, token, sessionIdNumber])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !user || !socketRef.current) return
    socketRef.current.emit('sendMessage', {
      content: message.trim(),
      sessionId: sessionIdNumber,
      senderId: user.id,
    })
    setMessage('')
  }

  if (loading) {
    return <div className="loading loading-spinner"></div>
  }

  return (
    <div className="flex flex-col h-[600px] bg-base-200 rounded-lg">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg: Message) => (
          <div
            key={msg.id}
            className={`chat ${msg.sender.id === user?.id ? 'chat-end' : 'chat-start'}`}
          >
            <div className="chat-header">
              {msg.sender.name}
              <time className="text-xs opacity-50 ml-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </time>
            </div>
            <div className={`chat-bubble ${
              msg.sender.id === user?.id ? 'chat-bubble-primary' : ''
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-base-300 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="input input-bordered flex-1"
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </div>
      </form>
    </div>
  )
}