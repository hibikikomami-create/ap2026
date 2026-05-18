import { useEffect, useState } from 'react'
import { MagazineNav } from '../../components/magazine/MagazineNav'
import { MagazineFooter } from '../../components/magazine/MagazineFooter'

export default function MagazineAbout() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    window.scrollTo(0, 0)
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="mag-body min-h-screen">
      <MagazineNav />

      <div
        className={`max-w-2xl mx-auto px-6 pt-36 pb-24 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Issue stamp */}
        <p
          className="mag-mono text-mag-gold mb-10"
          style={{ fontSize: '0.55rem', letterSpacing: '0.4em' }}
        >
          ABOUT — SYNAESIS MAGAZINE
        </p>

        {/* Gold rule */}
        <div className="mag-rule w-12 mb-10" />

        {/* Title */}
        <h1
          className="mag-serif text-mag-text font-black leading-none mb-12"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', letterSpacing: '-0.02em' }}
        >
          SYNAE-<br />SIS.
        </h1>

        {/* Body */}
        <div className="space-y-8">
          <p
            className="mag-serif text-mag-text leading-relaxed italic"
            style={{ fontSize: '1.15rem' }}
          >
            synaesis（シナエシス）とは、文法的な形式ではなく、意味と概念の結びつきによって
            言葉が呼応する修辞法である。
          </p>

          <p className="text-mag-dim leading-relaxed" style={{ fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>
            SYNAESISは、デザイン・建築・文化・思想の交差点から生まれるオルタナティブ・マガジンです。
            表層的なトレンドを追うのではなく、ものの本質、つくることの意味、
            そして静寂の中に潜む美しさを問い続けます。
          </p>

          <p className="text-mag-dim leading-relaxed" style={{ fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>
            WIREDが未来の緊張感を、PENが洗練の余白を語るように、
            SYNAESISは「繋がり」と「合成」をテーマに、
            異なる領域の思考が共鳴する場をつくります。
          </p>

          {/* English version */}
          <div className="pt-8 border-t border-mag-border">
            <p
              className="mag-serif text-mag-text leading-relaxed italic mb-6"
              style={{ fontSize: '1rem' }}
            >
              SYNAESIS is a magazine born at the intersection of design, architecture, culture, and ideas.
            </p>
            <p className="text-mag-dim leading-relaxed" style={{ fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}>
              Rather than chasing surface trends, we ask deeper questions — about the essence of things,
              the meaning of making, and the beauty that dwells in silence.
            </p>
          </div>
        </div>

        {/* Gold rule */}
        <div className="mag-rule w-full my-14" />

        {/* Instagram */}
        <div className="flex flex-col gap-4">
          <p className="mag-mono text-mag-dim" style={{ fontSize: '0.55rem', letterSpacing: '0.3em' }}>
            FOLLOW THE MAGAZINE
          </p>
          <a
            href="https://www.instagram.com/synaesis_mag/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 group"
          >
            <span
              className="mag-serif text-mag-text font-bold group-hover:text-mag-gold transition-colors duration-300"
              style={{ fontSize: '1.5rem', letterSpacing: '0.02em' }}
            >
              @synaesis_mag
            </span>
          </a>
          <p className="text-mag-dim" style={{ fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>
            Instagram
          </p>
        </div>
      </div>

      <MagazineFooter />
    </div>
  )
}
