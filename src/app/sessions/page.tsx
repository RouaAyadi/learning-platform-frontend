'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { useAuthStore } from '@/store/auth'
import { sessionsApi } from '@/lib/api'

interface Session {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  isLive: boolean
  instructor: {
    id: number
    name: string
  }
  courseId: number
  courseName: string
}

export default function SessionsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchSessions = async () => {
      try {
        const response = await sessionsApi.getAllSessions()
        setSessions(response)
        setLoading(false)
      } catch (err) {
        setError('Failed to load sessions')
        setLoading(false)
      }
    }

    fetchSessions()
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    )
  }

  const liveSessions = sessions.filter(session => session.isLive)
  const upcomingSessions = sessions.filter(session => !session.isLive)

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Sessions</h1>
        </div>

        {/* Active Sessions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Active Sessions</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {liveSessions.map((session) => (
              <div key={session.id} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h3 className="card-title">{session.title}</h3>
                    <span className="badge badge-success">Live</span>
                  </div>
                  <p className="text-base-content/70">{session.description}</p>
                  <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <span>Instructor: </span>
                    <span>•</span>
                    <span>Course: {session.courseName}</span>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className="btn btn-primary"
                      onClick={() => router.push(`/sessions/${session.id}`)}
                    >
                      Join Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {liveSessions.length === 0 && (
              <div className="col-span-full text-center py-8 text-base-content/70">
                No active sessions at the moment
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Upcoming Sessions</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Start Time</th>
                  <th>Course</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.title}</td>
                    <td>{session.instructor ? session.instructor.name : "Unknown"}</td>
                    <td>{new Date(session.startTime).toLocaleString()}</td>
                    <td>{session.courseName}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => router.push(`/sessions/${session.id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {upcomingSessions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-base-content/70">
                      No upcoming sessions scheduled
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}