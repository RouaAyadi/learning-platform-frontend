'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import CreateCourseModal from '@/components/modals/CreateCourseModal'
import { Course } from '@/types/course'

// Mock data for development
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Web Development Basics',
    description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
    instructor: {
      id: 1,
      name: 'John Doe'
    },
    enrolledStudents: 45,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days from now
    status: 'in-progress'
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    description: 'Deep dive into advanced React patterns and best practices.',
    instructor: {
      id: 2,
      name: 'Jane Smith'
    },
    enrolledStudents: 30,
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 37).toISOString(), // 37 days from now
    status: 'upcoming'
  }
]

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleViewCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }

  const handleCreateCourse = (data: any) => {
    const newCourse: Course = {
      id: (courses.length + 1).toString(),
      title: data.title,
      description: data.description,
      instructor: {
        id: 1,
        name: 'Test User'
      },
      enrolledStudents: 0,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'upcoming'
    }
    setCourses([...courses, newCourse])
  }

  const getStatusBadgeClass = (status: Course['status']) => {
    switch (status) {
      case 'upcoming':
        return 'badge-warning'
      case 'in-progress':
        return 'badge-success'
      case 'completed':
        return 'badge-neutral'
      default:
        return 'badge-ghost'
    }
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Courses</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Course
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <div key={course.id} className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">{course.title}</h2>
                  <span className={`badge ${getStatusBadgeClass(course.status)}`}>
                    {course.status}
                  </span>
                </div>
                <p className="text-base-content/70">{course.description}</p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Instructor:</span>
                    <span>{course.instructor.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Enrolled:</span>
                    <span>{course.enrolledStudents} students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Duration:</span>
                    <span>
                      {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="card-actions justify-end mt-6">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewCourse(course.id)}
                  >
                    View Course
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <CreateCourseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCourse}
        />
      </main>
    </div>
  )
} 