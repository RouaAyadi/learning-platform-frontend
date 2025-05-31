'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import Navbar from '@/components/layout/navbar'
import CreateCourseModal from '@/components/modals/CreateCourseModal'
import { Course } from '@/types/course'
import { GET_COURSES } from '@/lib/graphql/queries'
import { CREATE_COURSE } from '@/lib/graphql/mutations'

export default function CoursesPage() {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data, loading, error } = useQuery(GET_COURSES)
  const [createCourse] = useMutation(CREATE_COURSE, {
    refetchQueries: [{ query: GET_COURSES }]
  })

  const handleViewCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }

  const handleCreateCourse = async (formData: any) => {
    try {
      await createCourse({
        variables: {
          input: {
            title: formData.title,
            description: formData.description,
            startDate: formData.startDate,
            endDate: formData.endDate
          }
        }
      })
    } catch (error) {
      console.error('Failed to create course:', error)
    }
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
          <span>Error loading courses. Please try again later.</span>
        </div>
      </div>
    )
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
          {data?.courses.map((course: Course) => (
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