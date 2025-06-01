'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { sessionsApi } from '@/lib/api'

interface Instructor {
  id: number
  name: string
}

interface Session {
  id: number
  title: string
  startTime: string
  isLive: boolean
}

interface Course {
  id: number
  title: string
  description: string
  instructor: Instructor
  sessions: Session[]
}

export default function CoursePage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchCourse = async () => {
      try {
        const courseId = parseInt(id as string, 10)
        const [courseData, sessionsData] = await Promise.all([
          fetch(`/api/courses/${courseId}`).then(res => res.json()),
          sessionsApi.getCoursesSessions(courseId)
        ])
        setCourse({
          ...courseData,
          sessions: sessionsData
        })
        setLoading(false)
      } catch (err) {
        setError('Failed to load course')
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id, isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Error loading course</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-500">
            Instructor: {course.instructor.name}
          </span>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href={`/courses/${id}/edit`}>Edit Course</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/courses/${id}/sessions/new`}>Create Session</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {course.sessions?.length > 0 ? (
            <div className="space-y-4">
              {course.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-semibold">{session.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(session.startTime).toLocaleString()}
                    </p>
                    <span className={`text-sm ${
                      session.isLive ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {session.isLive ? 'Live' : 'Scheduled'}
                    </span>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/sessions/${session.id}`}>
                      {session.isLive ? 'Join Session' : 'View Details'}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No sessions scheduled yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 