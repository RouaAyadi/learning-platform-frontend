'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import Navbar from '@/components/layout/navbar'
import CreateSessionModal from '@/components/modals/CreateSessionModal'
import { Session } from '@/types/course'
import { GET_SESSIONS } from '@/lib/graphql/queries'
import { CREATE_SESSION, SET_REMINDER, JOIN_SESSION } from '@/lib/graphql/mutations'

export default function SessionsPage() {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [reminders, setReminders] = useState<Set<string>>(new Set())

  const { data, loading, error } = useQuery(GET_SESSIONS)
  const [createSession] = useMutation(CREATE_SESSION, {
    refetchQueries: [{ query: GET_SESSIONS }]
  })
  const [setReminder] = useMutation(SET_REMINDER)
  const [joinSession] = useMutation(JOIN_SESSION)

  const handleCreateSession = async (formData: any) => {
    try {
      await createSession({
        variables: {
          input: {
            title: formData.title,
            description: formData.description,
            startTime: formData.startTime,
            endTime: formData.endTime,
            courseId: '1' // TODO: Add course selection to form
          }
        }
      })
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleJoinSession = async (sessionId: string) => {
    try {
      await joinSession({
        variables: { sessionId }
      })
      router.push(`/sessions/${sessionId}`)
    } catch (error) {
      console.error('Failed to join session:', error)
    }
  }

  const toggleReminder = async (sessionId: string) => {
    try {
      if (!reminders.has(sessionId)) {
        await setReminder({
          variables: {
            input: {
              sessionId,
              reminderTime: new Date(Date.now() + 1000 * 60 * 15).toISOString() // 15 minutes before
            }
          }
        })
        const newReminders = new Set(reminders)
        newReminders.add(sessionId)
        setReminders(newReminders)
      }
    } catch (error) {
      console.error('Failed to set reminder:', error)
    }
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
          <span>Error loading sessions. Please try again later.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Live Sessions</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Session
          </button>
        </div>

        {/* Active Sessions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Active Sessions</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.sessions
              .filter((session: Session) => session.status === 'live')
              .map((session: Session) => (
                <div key={session.id} className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <h3 className="card-title">{session.title}</h3>
                      <span className="badge badge-success">Live</span>
                    </div>
                    <p className="text-base-content/70">{session.description}</p>
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                      <span>Instructor: {session.instructor.name}</span>
                      <span>•</span>
                      <span>{session.participants} participants</span>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleJoinSession(session.id)}
                      >
                        Join Session
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                {data?.sessions
                  .filter((session: Session) => session.status === 'scheduled')
                  .map((session: Session) => (
                    <tr key={session.id}>
                      <td>{session.title}</td>
                      <td>{session.instructor.name}</td>
                      <td>{new Date(session.startTime).toLocaleString()}</td>
                      <td>Course {session.courseId}</td>
                      <td>
                        <button 
                          className={`btn btn-sm ${reminders.has(session.id) ? 'btn-success' : 'btn-outline'}`}
                          onClick={() => toggleReminder(session.id)}
                        >
                          {reminders.has(session.id) ? 'Reminder Set' : 'Set Reminder'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <CreateSessionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSession}
        />
      </main>
    </div>
  )
} 