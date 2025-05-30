'use client'

import Navbar from '@/components/layout/navbar'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Active Sessions Card */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Active Sessions</h2>
              <p className="text-4xl font-bold">3</p>
              <p className="text-base-content/70">Live sessions in progress</p>
            </div>
          </div>

          {/* Upcoming Sessions Card */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Upcoming Sessions</h2>
              <p className="text-4xl font-bold">5</p>
              <p className="text-base-content/70">Sessions scheduled</p>
            </div>
          </div>

          {/* Total Courses Card */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Total Courses</h2>
              <p className="text-4xl font-bold">12</p>
              <p className="text-base-content/70">Courses enrolled/teaching</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Course</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="badge badge-primary">Quiz</span>
                  </td>
                  <td>Completed "Introduction to React" quiz</td>
                  <td>Web Development Basics</td>
                  <td>2 hours ago</td>
                </tr>
                <tr>
                  <td>
                    <span className="badge badge-secondary">Session</span>
                  </td>
                  <td>Attended "JavaScript Fundamentals" live session</td>
                  <td>JavaScript Mastery</td>
                  <td>Yesterday</td>
                </tr>
                <tr>
                  <td>
                    <span className="badge badge-accent">Question</span>
                  </td>
                  <td>Asked a question in "Database Design" session</td>
                  <td>Database Fundamentals</td>
                  <td>2 days ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
} 