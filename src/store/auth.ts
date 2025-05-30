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
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

// Mock user for development
const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'student'
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Start with logged in state for development
      user: mockUser,
      isAuthenticated: true,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
) 