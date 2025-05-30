'use client'

import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import ChatWindow from '@/components/chat/ChatWindow'
import { useAuthStore } from '@/store/auth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const sessionId = params.id as string

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Session Content */}
          <div className="lg:col-span-2">
            <div className="card bg-base-200">
              <div className="card-body">
                <h2 className="card-title">Session Title</h2>
                <p className="text-base-content/70">
                  Session description and content will go here. This could include
                  video streams, shared documents, or other interactive elements.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-1">
            <ChatWindow sessionId={sessionId} />
          </div>
        </div>
      </main>
    </div>
  )
} 