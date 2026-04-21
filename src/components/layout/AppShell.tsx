import { useState } from 'react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      {/* Desktop sidebar */}
      <SideNav />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-60 md:hidden">
            <SideNav onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-slate-900 text-sm">MySheet</span>
        </div>

        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          {children}
        </main>

        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
