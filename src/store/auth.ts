import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id: number
  name: string
  email: string
  role: 'student' | 'instructor'
}

type AuthStore = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

// Mock user for development
const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'student'
}

// Mock token for development
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IlRlc3QgVXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJzdHVkZW50In0.8tJdGevD1oH5nZksX9RjvPHp6JyqKHOVHIg-PQB4Z8M'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Start with logged in state for development
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      login: (user, token) => {
        localStorage.setItem('auth-token', token)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('auth-token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
) 