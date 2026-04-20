import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { SideNav } from './SideNav'
import { BottomNav } from './BottomNav'

// Pages that use their own full-screen layout (no shell)
const FULL_SCREEN_PATHS = ['/', '/onboarding']

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  const location = useLocation()
  const isFullScreen = FULL_SCREEN_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith('/onboarding')
  )

  if (isFullScreen) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-svh bg-gray-50">
      <SideNav />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
