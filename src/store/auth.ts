import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi } from '@/lib/api'
import { jwtDecode } from 'jwt-decode'

export type User = {
  id: number
  name: string
  email: string
  role: 'student' | 'instructor'
}

export type AuthResponse = {
  access_token: string
}

type DecodedToken = {
  sub: number
  email: string
  role: 'student' | 'instructor'
  exp: number
  iat: number
}

type AuthStore = {
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (token: string) => void
  logout: () => void
  setInitialized: () => void
  getUser: () => User | null
  initializeAuth: () => Promise<void>
}

const decodeToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return null
    }
    return {
      id: decoded.sub,
      name: decoded.email.split('@')[0], // Fallback name from email
      email: decoded.email,
      role: decoded.role
    }
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      getUser: () => {
        const token = get().token
        if (!token) return null
        console.log(decodeToken(token));
        return decodeToken(token)
      },
      login: (token) => {
        const user = decodeToken(token)
        if (user) {
          localStorage.setItem('auth-token', token)
          set({ 
            token,
            isAuthenticated: true 
          })
        } else {
          // If token is invalid, clear everything
          get().logout()
        }
      },
      logout: () => {
        localStorage.removeItem('auth-token')
        set({ 
          token: null, 
          isAuthenticated: false 
        })
      },
      setInitialized: () => set({ isInitialized: true }),
      initializeAuth: async () => {
        try {
          const token = localStorage.getItem('auth-token')
          if (!token) {
            set({ isInitialized: true })
            return
          }

          const user = decodeToken(token)
          if (!user) {
            // Token is invalid or expired
            get().logout()
            set({ isInitialized: true })
            return
          }

          // Verify token with backend
          await authApi.getCurrentUser()
          
          // If verification successful, set the auth state
          set({ 
            token,
            isAuthenticated: true,
            isInitialized: true
          })
        } catch (error) {
          console.error('Token verification failed:', error)
          get().logout()
          set({ isInitialized: true })
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initialize auth state
          state.initializeAuth()
        }
      },
    }
  )
) 