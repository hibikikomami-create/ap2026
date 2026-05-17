import { useLocation, useNavigate } from 'react-router-dom'

const items = [
  {
    path: '/home',
    label: 'ホーム',
    matchPrefix: '/home',
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/products',
    label: '商品',
    matchPrefix: '/products',
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
      </svg>
    ),
  },
  {
    path: '/documents',
    label: '数値',
    matchPrefix: '/documents',
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    path: '/calendar',
    label: '予定',
    matchPrefix: '/calendar',
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: '/settings',
    label: '設定',
    matchPrefix: '/settings',
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (matchPrefix: string) => location.pathname.startsWith(matchPrefix)

  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 80,
        background: 'rgba(232,228,222,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.46)',
        paddingBottom: 'env(safe-area-inset-bottom, 4px)',
      }}
    >
      <div style={{ display: 'flex', maxWidth: '430px', margin: '0 auto' }}>
        {items.map((item) => {
          const active = isActive(item.matchPrefix)
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              style={{
                flex: 1, minHeight: '52px', padding: '8px 4px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '3px', border: 'none', background: 'transparent', cursor: 'pointer',
                transition: 'transform 140ms cubic-bezier(0.34,1.4,0.64,1)',
                userSelect: 'none',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.90)')}
              onMouseUp={e => (e.currentTarget.style.transform = '')}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.90)')}
              onTouchEnd={e => (e.currentTarget.style.transform = '')}
            >
              <span style={{ color: active ? 'var(--accent)' : 'var(--stone)', transition: 'color 180ms ease' }}>
                {item.icon(active)}
              </span>
              <span style={{
                fontSize: '9.5px',
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--accent)' : 'var(--stone)',
                transition: 'color 180ms ease, font-weight 180ms ease',
                lineHeight: 1,
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
