'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import CreateSessionModal from '@/components/modals/CreateSessionModal'
import { Session } from '@/types/course'

// Mock data for development
const mockSessions: Session[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    courseId: '1',
    startTime: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30 minutes from now
    endTime: new Date(Date.now() + 1000 * 60 * 90).toISOString(), // 90 minutes from now
    instructor: {
      id: 1,
      name: 'John Doe'
    },
    participants: 25,
    status: 'live',
    description: 'Introduction to ES6+ features'
  },
  {
    id: '2',
    title: 'React Hooks Deep Dive',
    courseId: '2',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(),
    instructor: {
      id: 2,
      name: 'Jane Smith'
    },
    participants: 15,
    status: 'scheduled',
    description: 'Advanced React Hooks patterns and use cases'
  }
]

export default function SessionsPage() {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [sessions, setSessions] = useState<Session[]>(mockSessions)
  const [reminders, setReminders] = useState<Set<string>>(new Set())

  const handleCreateSession = (data: any) => {
    const newSession: Session = {
      id: (sessions.length + 1).toString(),
      title: data.title,
      courseId: '1', // Mock courseId
      startTime: data.startTime,
      endTime: data.endTime,
      instructor: {
        id: 1,
        name: 'Test User'
      },
      participants: 0,
      status: 'scheduled',
      description: data.description
    }
    setSessions([...sessions, newSession])
  }

  const handleJoinSession = (sessionId: string) => {
    router.push(`/sessions/${sessionId}`)
  }

  const toggleReminder = (sessionId: string) => {
    const newReminders = new Set(reminders)
    if (newReminders.has(sessionId)) {
      newReminders.delete(sessionId)
    } else {
      newReminders.add(sessionId)
      // Mock notification
      setTimeout(() => {
        alert(`Reminder set for session: ${sessions.find(s => s.id === sessionId)?.title}`)
      }, 500)
    }
    setReminders(newReminders)
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
            {sessions
              .filter(session => session.status === 'live')
              .map(session => (
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
                {sessions
                  .filter(session => session.status === 'scheduled')
                  .map(session => (
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