import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { SideNav } from './SideNav'
import { BottomNav } from './BottomNav'

const FULL_SCREEN_PATHS = ['/', '/login', '/signup', '/onboarding', '/sheet-result']

const GRADIENTS = [
  ['#3F4A5A', '#E8DFD1'],
  ['#4B5563', '#E5DCCF'],
  ['#5B6C7D', '#EADBC8'],
  ['#6B7280', '#F0E5D8'],
  ['#7C7F8C', '#EDE3D8'],
]

const g = GRADIENTS[new Date().getDate() % 5]

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
    <div
      className="flex min-h-svh"
      style={{
        background: `linear-gradient(138deg, ${g[0]} 0%, ${g[1]} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating ambient orbs */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '-80px', left: '-60px',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
          animation: 'orbF 20s ease-in-out infinite',
          '--ox': '40px', '--oy': '-50px',
        } as React.CSSProperties}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '40%', right: '-40px',
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 70%)',
          animation: 'orbF 26s ease-in-out infinite',
          animationDelay: '-8s',
          '--ox': '-30px', '--oy': '40px',
        } as React.CSSProperties}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', bottom: '20%', left: '30%',
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)',
          animation: 'orbF 18s ease-in-out infinite',
          animationDelay: '-4s',
          '--ox': '25px', '--oy': '-35px',
        } as React.CSSProperties}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', bottom: '-20px', right: '20%',
          width: 110, height: 110, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          animation: 'orbF 22s ease-in-out infinite',
          animationDelay: '-14s',
          '--ox': '-20px', '--oy': '20px',
        } as React.CSSProperties}
      />

      {/* Desktop sidebar — hidden on mobile */}
      <SideNav />

      <div className="flex-1 min-w-0 flex flex-col" style={{ position: 'relative', zIndex: 1 }}>
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
