import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MagazineNav } from '../../components/magazine/MagazineNav'
import { MasonryGrid } from '../../components/magazine/MasonryGrid'
import { MagazineFooter } from '../../components/magazine/MagazineFooter'
import { useInstagramFeed } from '../../hooks/useInstagramFeed'
import type { Category } from '../../types/instagram'

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'ALL',          value: 'ALL' },
  { label: 'DESIGN',       value: 'DESIGN' },
  { label: 'ARCHITECTURE', value: 'ARCHITECTURE' },
  { label: 'CULTURE',      value: 'CULTURE' },
  { label: 'PHOTOGRAPHY',  value: 'PHOTOGRAPHY' },
  { label: 'TECHNOLOGY',   value: 'TECHNOLOGY' },
]

function captionMatchesCategory(caption: string | undefined, cat: Category): boolean {
  if (cat === 'ALL') return true
  const lower = (caption ?? '').toLowerCase()
  const map: Record<Category, string[]> = {
    ALL:          [],
    DESIGN:       ['design', 'デザイン'],
    ARCHITECTURE: ['architecture', '建築'],
    CULTURE:      ['culture', '文化', 'urban', '都市', 'poster', 'print'],
    PHOTOGRAPHY:  ['photography', 'photo', '写真', 'light', '光'],
    TECHNOLOGY:   ['technology', 'tech', 'テクノロジー', 'craft', '手仕事'],
  }
  return map[cat].some(k => lower.includes(k))
}

export default function MagazineHome() {
  const { posts, loading, hasMore, loadMore } = useInstagramFeed()
  const [searchParams, setSearchParams] = useSearchParams()
  const [visible, setVisible] = useState(false)

  const rawCat = (searchParams.get('cat') ?? 'ALL') as Category
  const activeCat = CATEGORIES.find(c => c.value === rawCat)?.value ?? 'ALL'

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(
    () => posts.filter(p => captionMatchesCategory(p.caption, activeCat)),
    [posts, activeCat],
  )

  function setCategory(cat: Category) {
    if (cat === 'ALL') {
      setSearchParams({})
    } else {
      setSearchParams({ cat })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mag-body min-h-screen">
      <MagazineNav />

      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-end overflow-hidden"
        style={{ height: 'min(90svh, 700px)', paddingBottom: '4rem' }}
      >
        {/* Background text / watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <span
            className="mag-serif text-mag-border font-black leading-none"
            style={{ fontSize: 'clamp(8rem, 25vw, 22rem)', letterSpacing: '-0.03em', opacity: 0.08 }}
          >
            SYN
          </span>
        </div>

        {/* Gold horizontal rule */}
        <div className="mag-rule w-16 mb-8" />

        {/* Issue label */}
        <p
          className="mag-mono text-mag-gold mb-4 text-center"
          style={{ fontSize: '0.55rem', letterSpacing: '0.4em' }}
        >
          VOL.01 — 2026
        </p>

        {/* Title */}
        <h1
          className={`mag-serif text-mag-text text-center font-black leading-none transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', letterSpacing: '-0.02em' }}
        >
          SYNAESIS
        </h1>

        {/* Tagline */}
        <p
          className={`mag-mono text-mag-dim mt-5 text-center transition-all duration-1000 delay-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ fontSize: '0.6rem', letterSpacing: '0.35em' }}
        >
          デザイン、建築、文化、思想の交差点
        </p>

        {/* Scroll indicator */}
        <div className={`absolute bottom-8 flex flex-col items-center gap-1.5 transition-opacity duration-1000 delay-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <span className="mag-mono text-mag-muted" style={{ fontSize: '0.45rem', letterSpacing: '0.25em' }}>
            SCROLL
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-mag-gold to-transparent" />
        </div>
      </section>

      {/* Gold divider */}
      <div className="mag-rule mx-auto" style={{ maxWidth: '80px' }} />

      {/* Category filter */}
      <div className="sticky top-14 z-40 py-4 px-5 flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e1e1e' }}
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`mag-filter-btn whitespace-nowrap ${activeCat === cat.value ? 'active' : ''}`}
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <main className="px-0.5 pt-0.5 pb-0.5">
        <MasonryGrid posts={filtered} loading={loading} />
      </main>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center py-16">
          <button
            onClick={loadMore}
            className="mag-filter-btn px-12 py-3 border-mag-gold text-mag-text"
          >
            MORE
          </button>
        </div>
      )}

      {/* Loading more spinner */}
      {loading && posts.length > 0 && (
        <div className="flex justify-center py-16">
          <div
            className="w-5 h-5 rounded-full border border-mag-gold border-t-transparent animate-spin"
          />
        </div>
      )}

      <MagazineFooter />
    </div>
  )
}
