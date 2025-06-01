'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { AuthForm } from '@/components/auth/AuthForm'
import Link from 'next/link'

export default function RegisterPage() {
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
      <h1 className="text-4xl font-bold mb-8">Create Account</h1>
      <AuthForm mode="register" />
      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <Link href="/login" className="link link-primary">
          Sign in here
        </Link>
      </p>
    </div>
  )
} 