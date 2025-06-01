'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { AuthForm } from '@/components/auth/AuthForm'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isInitialized, router])

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  // Don't show the form while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome Back</h1>
      <AuthForm mode="login" />
      <p className="mt-4 text-sm">
        Don't have an account?{' '}
        <Link href="/register" className="link link-primary">
          Create one here
        </Link>
      </p>
    </div>
  )
} 