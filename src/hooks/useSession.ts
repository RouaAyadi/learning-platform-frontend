'use client'

import { useQuery, useMutation } from '@apollo/client'
import { GET_SESSION, GET_RECENT_MESSAGES } from '@/lib/graphql/queries'
import {
  CREATE_MESSAGE,
  START_LIVE_SESSION,
  END_LIVE_SESSION,
  CREATE_QUIZ,
} from '@/lib/graphql/mutations'

export function useSession(sessionId: string) {
  // Fetch session data
  const {
    data: sessionData,
    loading: sessionLoading,
    error: sessionError,
  } = useQuery(GET_SESSION, {
    variables: { id: parseInt(sessionId) },
    pollInterval: 5000, // Poll every 5 seconds for updates
  })

  // Fetch recent messages
  const {
    data: messagesData,
    loading: messagesLoading,
    error: messagesError,
  } = useQuery(GET_RECENT_MESSAGES, {
    variables: { sessionId: parseInt(sessionId), limit: 50 },
    pollInterval: 2000, // Poll every 2 seconds for new messages
  })

  // Mutations
  const [createMessage] = useMutation(CREATE_MESSAGE, {
    refetchQueries: [
      {
        query: GET_RECENT_MESSAGES,
        variables: { sessionId: parseInt(sessionId), limit: 50 },
      },
    ],
  })

  const [startLiveSession] = useMutation(START_LIVE_SESSION, {
    refetchQueries: [
      {
        query: GET_SESSION,
        variables: { id: parseInt(sessionId) },
      },
    ],
  })

  const [endLiveSession] = useMutation(END_LIVE_SESSION, {
    refetchQueries: [
      {
        query: GET_SESSION,
        variables: { id: parseInt(sessionId) },
      },
    ],
  })

  const [createQuiz] = useMutation(CREATE_QUIZ)

  // Helper functions
  const sendMessage = async (content: string, senderId: number) => {
    try {
      await createMessage({
        variables: {
          input: {
            content,
            sessionId: parseInt(sessionId),
            senderId,
          },
        },
      })
      return true
    } catch (error) {
      console.error('Error sending message:', error)
      return false
    }
  }

  const startSession = async () => {
    try {
      await startLiveSession({
        variables: { id: parseInt(sessionId) },
      })
      return true
    } catch (error) {
      console.error('Error starting session:', error)
      return false
    }
  }

  const endSession = async () => {
    try {
      await endLiveSession({
        variables: { id: parseInt(sessionId) },
      })
      return true
    } catch (error) {
      console.error('Error ending session:', error)
      return false
    }
  }

  const createNewQuiz = async (title: string, questions: any[]) => {
    try {
      const result = await createQuiz({
        variables: {
          input: {
            title,
            sessionId: parseInt(sessionId),
            questions,
          },
        },
      })
      return result.data.createQuiz
    } catch (error) {
      console.error('Error creating quiz:', error)
      return null
    }
  }

  return {
    session: sessionData?.session,
    messages: messagesData?.recentMessages || [],
    loading: sessionLoading || messagesLoading,
    error: sessionError || messagesError,
    sendMessage,
    startSession,
    endSession,
    createNewQuiz,
  }
} 