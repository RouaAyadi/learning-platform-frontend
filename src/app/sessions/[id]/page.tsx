'use client'

import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useQuery, useSubscription } from '@apollo/client'
import Navbar from '@/components/layout/navbar'
import ChatWindow from '@/components/chat/ChatWindow'
import { useAuthStore } from '@/store/auth'
import { GET_SESSION } from '@/lib/graphql/queries'
import { SESSION_UPDATED } from '@/lib/graphql/subscriptions'

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const sessionId = params.id as string

  const { data, loading, error } = useQuery(GET_SESSION, {
    variables: { id: parseInt(sessionId, 10) },
    skip: !sessionId
  })

  useSubscription(SESSION_UPDATED, {
    variables: { sessionId },
    onData: ({ data }) => {
      // Handle session updates (e.g., participant count, status changes)
      console.log('Session updated:', data)
    }
  })

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  if (error || !data?.session) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="alert alert-error">
          <span>Error loading session. Please try again later.</span>
        </div>
      </div>
    )
  }

  const session = data.session

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Session Content */}
          <div className="lg:col-span-2">
            <div className="card bg-base-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">{session.title}</h2>
                  <span className={`badge ${session.status === 'live' ? 'badge-success' : 'badge-warning'}`}>
                    {session.status}
                  </span>
                </div>
                <p className="text-base-content/70">{session.description}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-base-content/70">
                  <div>
                    <span className="font-medium">Instructor:</span> {session.instructor.name}
                  </div>
                  <div>
                    <span className="font-medium">Participants:</span> {session.participants}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>{' '}
                    {new Date(session.startTime).toLocaleTimeString()} -{' '}
                    {new Date(session.endTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-1">
            <ChatWindow sessionId={sessionId} />
          </div>
        </div>
      </main>
    </div>
  )
} 