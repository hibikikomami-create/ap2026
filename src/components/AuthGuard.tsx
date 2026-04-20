import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { isSupabaseEnabled } from '../lib/supabase'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, isLoading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSupabaseEnabled) return
    if (!isLoading && !currentUser) {
      navigate('/login', { replace: true })
    }
  }, [currentUser, isLoading, navigate])

  if (isSupabaseEnabled && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="inline-block w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    )
  }

  if (isSupabaseEnabled && !currentUser) return null

  return <>{children}</>
}
