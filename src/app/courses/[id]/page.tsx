'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { coursesApi, sessionsApi } from '@/lib/api'
import Navbar from '@/components/layout/navbar'

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
  const params = useParams()
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

    const loadCourse = async () => {
      try {
        const courseId = parseInt(params.id as string, 10)
        const [courseData, sessionsData] = await Promise.all([
          coursesApi.getCourse(courseId),
          sessionsApi.getCoursesSessions(courseId)
        ])
        setCourse({
          ...courseData,
          sessions: sessionsData
        })
      } catch (err) {
        console.error('Failed to load course:', err)
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [params.id, isAuthenticated, router])

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

  if (error || !course) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="alert alert-error">
            <span>{error || 'Course not found'}</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-base-content/70 mb-4">{course.description}</p>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-base-content/70">
              Instructor: {course.instructor.name}
            </span>
          </div>
          <div className="flex gap-4">
            <Button asChild>
              <Link href={`/courses/${params.id}/edit`}>Edit Course</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/courses/${params.id}/sessions/new`}>Create Session</Link>
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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-base-200"
                  >
                    <div>
                      <h3 className="font-semibold">{session.title}</h3>
                      <p className="text-sm text-base-content/70">
                        {new Date(session.startTime).toLocaleString()}
                      </p>
                      <span className={`badge ${
                        session.isLive ? 'badge-success' : 'badge-warning'
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
              <p className="text-base-content/70 text-center py-4">
                No sessions scheduled yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
} 