import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function MagazineNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const el = document.querySelector('.mag-scroll-root') ?? window
    const onScroll = () => setScrolled((el as Window).scrollY > 60)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? 'rgba(10,10,10,0.95)'
          : 'linear-gradient(to bottom, rgba(10,10,10,0.8), transparent)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #1e1e1e' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/mag" className="flex flex-col leading-none group">
          <span
            className="mag-serif text-mag-text tracking-widest-2 font-black"
            style={{ fontSize: '1.05rem', letterSpacing: '0.28em' }}
          >
            SYNAESIS
          </span>
          <span
            className="mag-mono text-mag-gold"
            style={{ fontSize: '0.45rem', letterSpacing: '0.3em' }}
          >
            MAGAZINE
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <Link
              key={l.label}
              to={l.to}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noopener noreferrer' : undefined}
              className="mag-mono text-mag-dim hover:text-mag-text transition-colors duration-200"
              style={{ fontSize: '0.6rem', letterSpacing: '0.2em' }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Instagram link */}
        <a
          href="https://www.instagram.com/synaesis_mag/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 text-mag-dim hover:text-mag-gold transition-colors duration-200"
          aria-label="Instagram"
        >
          <InstagramIcon />
          <span className="mag-mono text-mag-dim hover:text-mag-gold" style={{ fontSize: '0.6rem', letterSpacing: '0.15em' }}>
            @SYNAESIS_MAG
          </span>
        </a>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          <span className={`block h-px w-5 bg-mag-text transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-px w-5 bg-mag-text transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-px w-5 bg-mag-text transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-mag-border bg-mag-bg/98 backdrop-blur-md">
          <nav className="flex flex-col px-6 py-6 gap-6">
            {NAV_LINKS.map(l => (
              <Link
                key={l.label}
                to={l.to}
                target={l.external ? '_blank' : undefined}
                className="mag-mono text-mag-dim hover:text-mag-text transition-colors text-xs tracking-[0.2em]"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://www.instagram.com/synaesis_mag/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-mag-gold text-xs tracking-widest mag-mono"
            >
              <InstagramIcon />
              @SYNAESIS_MAG
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

interface NavLink { label: string; to: string; external?: boolean }
const NAV_LINKS: NavLink[] = [
  { label: 'FEED',         to: '/mag' },
  { label: 'DESIGN',       to: '/mag?cat=DESIGN' },
  { label: 'ARCHITECTURE', to: '/mag?cat=ARCHITECTURE' },
  { label: 'CULTURE',      to: '/mag?cat=CULTURE' },
  { label: 'ABOUT',        to: '/mag/about' },
]

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
