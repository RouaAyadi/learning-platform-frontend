'use client'

import Navbar from '@/components/layout/navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Welcome to Learning Platform</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">For Students</h2>
              <p>Join interactive sessions, participate in quizzes, and learn from expert instructors.</p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary">Browse Sessions</button>
              </div>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">For Instructors</h2>
              <p>Create engaging sessions, manage courses, and interact with students in real-time.</p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary">Create Session</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
