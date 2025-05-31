'use client'

import { useQuery, useMutation } from '@apollo/client'
import { GET_SESSION, GET_SESSIONS } from '@/lib/graphql/queries'
import { CREATE_MESSAGE, START_LIVE_SESSION, END_LIVE_SESSION } from '@/lib/graphql/mutations'

enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface Course {
  id: number;
  title: string;
  description: string;
}

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: User;
}

interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface Quiz {
  id: number;
  title: string;
  questions: QuizQuestion[];
}

interface Session {
  id: number;
  title: string;
  startTime: string;
  isLive: boolean;
  instructor: User;
  course: Course;
  messages?: Message[];
  quizzes?: Quiz[];
}

export function useSession(sessionId?: string) {
  const { data: sessionsData, loading: sessionsLoading, error: sessionsError } = useQuery(GET_SESSIONS)
  const { data: sessionData, loading: sessionLoading, error: sessionError } = useQuery(
    GET_SESSION,
    { variables: { id: sessionId ? parseInt(sessionId) : undefined }, skip: !sessionId }
  )

  const [sendMessage] = useMutation(CREATE_MESSAGE, {
    update(cache, { data: { createMessage } }) {
      const { session } = cache.readQuery({ 
        query: GET_SESSION,
        variables: { id: parseInt(sessionId!) }
      }) as { session: Session }

      cache.writeQuery({
        query: GET_SESSION,
        variables: { id: parseInt(sessionId!) },
        data: {
          session: {
            ...session,
            messages: [...(session.messages || []), createMessage],
          },
        },
      })
    },
  })

  const [startLiveSession] = useMutation(START_LIVE_SESSION)
  const [endLiveSession] = useMutation(END_LIVE_SESSION)

  const handleSendMessage = async (content: string) => {
    if (!sessionId) return
    try {
      await sendMessage({
        variables: {
          input: {
            content,
            sessionId: parseInt(sessionId),
          },
        },
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleStartSession = async () => {
    if (!sessionId) return
    try {
      await startLiveSession({
        variables: {
          id: parseInt(sessionId),
        },
      })
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const handleEndSession = async () => {
    if (!sessionId) return
    try {
      await endLiveSession({
        variables: {
          id: parseInt(sessionId),
        },
      })
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  return {
    sessions: sessionsData?.sessions as Session[],
    session: sessionData?.session as Session,
    loading: sessionsLoading || sessionLoading,
    error: sessionsError || sessionError,
    sendMessage: handleSendMessage,
    startSession: handleStartSession,
    endSession: handleEndSession,
  }
} 