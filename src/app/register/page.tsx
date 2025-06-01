'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { AuthForm } from '@/components/auth/AuthForm'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-4">
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