'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/navbar'
import { useAuthStore } from '@/store/auth'
import { sessionsApi } from '@/lib/api'
import SocketIOChat from '@/components/chat/SocketIOChat'

interface Session {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'live' | 'ended'
  isLive: boolean
  instructor: {
    id: number
    name: string
  }
  courseId: number
  courseName: string
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = Number(params.id)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const loadSession = async () => {
      try {
        const data = await sessionsApi.getSession(sessionId)
        setSession(data)
      } catch (err) {
        console.error('Failed to load session:', err)
        setError('Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [sessionId, isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </>
    )
  }

  if (error || !session) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="alert alert-error">
            <span>{error || 'Session not found'}</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{session.title}</h1>
                <p className="text-base-content/70 mb-4">{session.description}</p>
              </div>
              <div className={`badge ${
                session.isLive 
                  ? 'badge-success' 
                  : session.status === 'ended' 
                    ? 'badge-neutral' 
                    : 'badge-warning'
              } badge-lg`}>
                {session.status}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Session Details</h2>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Instructor: </span>
                  <span>{session.instructor.name}</span>
                </div>
                <div>
                  <span className="font-medium">Course: </span>
                  <span>{session.courseName}</span>
                </div>
                <div>
                  <span className="font-medium">Start Time: </span>
                  <span>{new Date(session.startTime).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">End Time: </span>
                  <span>{new Date(session.endTime).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4 mt-8">
        <SocketIOChat 
      serverUrl="http://localhost:3300"
      namespace="/chat"
      sessionId={sessionId} // Required - the session ID to join
      reconnectInterval={3000}
      maxReconnectAttempts={5}
    />
      </div>
      
    </>
  )
} 