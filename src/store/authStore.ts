import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { signIn, signOut, signUp, getCurrentUser, onAuthStateChange } from '../lib/auth'

interface AuthState {
  currentUser: User | null
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<string | null>
  clearError: () => void
  initAuth: () => () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    const { user, error } = await signIn(email, password)
    if (error) {
      set({ isLoading: false, error })
      return error
    }
    set({ currentUser: user, isLoading: false })
    return null
  },

  logout: async () => {
    set({ isLoading: true })
    await signOut()
    set({ currentUser: null, isLoading: false })
  },

  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null })
    const { user, error } = await signUp(email, password, displayName)
    if (error) {
      set({ isLoading: false, error })
      return error
    }
    set({ currentUser: user, isLoading: false })
    return null
  },

  clearError: () => set({ error: null }),

  initAuth: () => {
    getCurrentUser().then((user) => {
      set({ currentUser: user, isLoading: false })
    })
    return onAuthStateChange((user) => {
      set({ currentUser: user, isLoading: false })
    })
  },
}))
