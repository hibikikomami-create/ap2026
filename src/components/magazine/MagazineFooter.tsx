export function MagazineFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-mag-border mt-16 py-12 px-6">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start">
          <span
            className="mag-serif text-mag-text font-black tracking-widest"
            style={{ fontSize: '1rem', letterSpacing: '0.28em' }}
          >
            SYNAESIS
          </span>
          <span
            className="mag-mono text-mag-dim mt-1"
            style={{ fontSize: '0.5rem', letterSpacing: '0.25em' }}
          >
            デザイン、建築、文化、思想の交差点
          </span>
        </div>

        {/* Divider rule on mobile */}
        <div className="mag-rule w-16 md:hidden" />

        {/* Links */}
        <nav className="flex items-center gap-6">
          <a
            href="https://www.instagram.com/synaesis_mag/"
            target="_blank"
            rel="noopener noreferrer"
            className="mag-mono text-mag-dim hover:text-mag-gold transition-colors duration-200"
            style={{ fontSize: '0.55rem', letterSpacing: '0.2em' }}
          >
            INSTAGRAM
          </a>
          <span className="text-mag-border">|</span>
          <span
            className="mag-mono text-mag-dim"
            style={{ fontSize: '0.55rem', letterSpacing: '0.2em' }}
          >
            @SYNAESIS_MAG
          </span>
        </nav>

        {/* Copyright */}
        <p
          className="mag-mono text-mag-muted text-center md:text-right"
          style={{ fontSize: '0.5rem', letterSpacing: '0.15em' }}
        >
          © {year} SYNAESIS. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  )
}
