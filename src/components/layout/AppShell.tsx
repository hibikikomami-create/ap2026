import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { SideNav } from './SideNav'
import { BottomNav } from './BottomNav'

const FULL_SCREEN_PATHS = ['/', '/login', '/signup', '/onboarding', '/sheet-result']

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  const location = useLocation()

  const isFullScreen = FULL_SCREEN_PATHS.some(
    (p) =>
      location.pathname === p ||
      location.pathname.startsWith('/onboarding')
  )

  if (isFullScreen) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-svh bg-slate-100">
      {/* Desktop sidebar — hidden on mobile */}
      <SideNav />

      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 min-w-0 pb-nav-mobile">
          {children}
        </main>

        {/* Bottom tab bar — mobile only */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
