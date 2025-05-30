'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { gql } from '@apollo/client'
import { useAuthStore } from '@/store/auth'

const MESSAGES_QUERY = gql`
  query GetMessages($sessionId: ID!) {
    messages(sessionId: $sessionId) {
      id
      content
      createdAt
      user {
        id
        name
      }
    }
  }
`

const SEND_MESSAGE = gql`
  mutation SendMessage($sessionId: ID!, $content: String!) {
    sendMessage(sessionId: $sessionId, content: $content) {
      id
      content
      createdAt
      user {
        id
        name
      }
    }
  }
`

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageSent($sessionId: ID!) {
    messageSent(sessionId: $sessionId) {
      id
      content
      createdAt
      user {
        id
        name
      }
    }
  }
`

type Message = {
  id: string
  content: string
  createdAt: string
  user: {
    id: number
    name: string
  }
}

type ChatWindowProps = {
  sessionId: string
}

export default function ChatWindow({ sessionId }: ChatWindowProps) {
  const [message, setMessage] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()

  const { data, loading } = useQuery(MESSAGES_QUERY, {
    variables: { sessionId },
  })

  const [sendMessage] = useMutation(SEND_MESSAGE)

  useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { sessionId },
    onData: ({ data }) => {
      // Handle new message
      if (data.data?.messageSent) {
        // Apollo Cache will automatically update
        scrollToBottom()
      }
    },
  })

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [data?.messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !user) return

    try {
      await sendMessage({
        variables: {
          sessionId,
          content: message.trim(),
        },
      })
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  if (loading) {
    return <div className="loading loading-spinner"></div>
  }

  return (
    <div className="flex flex-col h-[600px] bg-base-200 rounded-lg">
      <div className="flex-1 overflow-y-auto p-4">
        {data?.messages.map((msg: Message) => (
          <div
            key={msg.id}
            className={`chat ${msg.user.id === user?.id ? 'chat-end' : 'chat-start'}`}
          >
            <div className="chat-header">
              {msg.user.name}
              <time className="text-xs opacity-50 ml-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </time>
            </div>
            <div className={`chat-bubble ${
              msg.user.id === user?.id ? 'chat-bubble-primary' : ''
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