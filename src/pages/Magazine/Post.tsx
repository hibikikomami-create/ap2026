import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MagazineNav } from '../../components/magazine/MagazineNav'
import { MagazineFooter } from '../../components/magazine/MagazineFooter'
import type { InstagramPost } from '../../types/instagram'
import { useInstagramFeed } from '../../hooks/useInstagramFeed'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatCaption(caption?: string) {
  if (!caption) return []
  return caption
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !line.startsWith('#'))
}

function extractTags(caption?: string): string[] {
  if (!caption) return []
  return [...caption.matchAll(/#([\w_]+)/g)].map(m => m[1])
}

export default function MagazinePost() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { posts } = useInstagramFeed()
  const [visible, setVisible] = useState(false)

  // Post may be passed via location state (instant) or looked up from feed
  const statePost = location.state?.post as InstagramPost | undefined
  const post: InstagramPost | undefined =
    statePost ?? posts.find(p => p.id === id)

  useEffect(() => {
    window.scrollTo(0, 0)
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [id])

  if (!post) {
    if (posts.length === 0) {
      // Still loading
      return (
        <div className="mag-body min-h-screen flex flex-col">
          <MagazineNav />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border border-mag-gold border-t-transparent animate-spin" />
          </div>
        </div>
      )
    }
    return (
      <div className="mag-body min-h-screen flex flex-col">
        <MagazineNav />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-32">
          <span className="mag-mono text-mag-dim" style={{ fontSize: '0.6rem', letterSpacing: '0.3em' }}>
            POST NOT FOUND
          </span>
          <Link to="/mag" className="mag-filter-btn px-8 py-2">← BACK TO FEED</Link>
        </div>
      </div>
    )
  }

  const imgSrc = post.media_type === 'VIDEO'
    ? (post.thumbnail_url ?? post.media_url)
    : post.media_url

  const paragraphs = formatCaption(post.caption)
  const tags = extractTags(post.caption)
  const date = formatDate(post.timestamp)

  // Nearby posts (prev/next)
  const idx = posts.findIndex(p => p.id === post.id)
  const prev = idx > 0 ? posts[idx - 1] : null
  const next = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null

  return (
    <div className="mag-body min-h-screen">
      <MagazineNav />

      <article
        className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        {/* Hero image — full bleed */}
        <div className="relative w-full overflow-hidden" style={{ maxHeight: '90svh' }}>
          <img
            src={imgSrc}
            alt={paragraphs[0] ?? 'SYNAESIS'}
            className="w-full object-cover block"
            style={{ maxHeight: '90svh' }}
          />
          {/* Bottom gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.4) 40%, transparent 70%)' }}
          />

          {/* Overlaid title */}
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-10 md:pb-14 max-w-4xl">
            <span
              className="mag-mono text-mag-gold block mb-4"
              style={{ fontSize: '0.55rem', letterSpacing: '0.35em' }}
            >
              @SYNAESIS_MAG — {date}
            </span>
            {paragraphs[0] && (
              <h1
                className="mag-serif text-mag-text font-black leading-tight"
                style={{ fontSize: 'clamp(1.6rem, 5vw, 3.5rem)', maxWidth: '30ch' }}
              >
                {paragraphs[0]}
              </h1>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 md:px-0 pt-12 pb-20">

          {/* Gold rule */}
          <div className="mag-rule mb-10" />

          {/* Body paragraphs */}
          <div className="space-y-6">
            {paragraphs.slice(1).map((para, i) => (
              <p
                key={i}
                className="text-mag-text leading-relaxed"
                style={{
                  fontFamily: i === 0 ? '"Playfair Display", Georgia, serif' : 'Inter, system-ui, sans-serif',
                  fontSize: i === 0 ? '1.15rem' : '0.95rem',
                  fontStyle: i === 0 ? 'italic' : 'normal',
                  color: i === 0 ? '#e8e3dc' : '#9e9890',
                }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="mag-mono text-mag-gold border border-mag-gold-dim px-3 py-1"
                  style={{ fontSize: '0.5rem', letterSpacing: '0.15em' }}
                >
                  #{tag.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {/* Instagram link */}
          <div className="mt-10 pt-10 border-t border-mag-border">
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-mag-dim hover:text-mag-gold transition-colors duration-200"
            >
              <InstagramIcon />
              <span className="mag-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.2em' }}>
                VIEW ON INSTAGRAM
              </span>
              <ArrowIcon />
            </a>
          </div>

          {/* Gold rule */}
          <div className="mag-rule mt-10" />

          {/* Prev / Next navigation */}
          <nav className="flex items-center justify-between mt-10 gap-4">
            {prev ? (
              <button
                onClick={() => navigate(`/mag/${prev.id}`, { state: { post: prev } })}
                className="group flex items-center gap-2 text-mag-dim hover:text-mag-text transition-colors duration-200"
              >
                <span className="mag-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.2em' }}>← PREV</span>
              </button>
            ) : <div />}

            <Link
              to="/mag"
              className="mag-mono text-mag-dim hover:text-mag-gold transition-colors duration-200"
              style={{ fontSize: '0.55rem', letterSpacing: '0.25em' }}
            >
              ALL POSTS
            </Link>

            {next ? (
              <button
                onClick={() => navigate(`/mag/${next.id}`, { state: { post: next } })}
                className="group flex items-center gap-2 text-mag-dim hover:text-mag-text transition-colors duration-200"
              >
                <span className="mag-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.2em' }}>NEXT →</span>
              </button>
            ) : <div />}
          </nav>
        </div>
      </article>

      <MagazineFooter />
    </div>
  )
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6h8M7 3l3 3-3 3" />
    </svg>
  )
}
