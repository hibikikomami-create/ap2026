import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { InstagramPost } from '../../types/instagram'

interface Props {
  post: InstagramPost
  index: number
}

function inferCategory(caption?: string): string {
  if (!caption) return 'FEED'
  const lower = caption.toLowerCase()
  if (lower.includes('architecture') || lower.includes('建築')) return 'ARCHITECTURE'
  if (lower.includes('photography') || lower.includes('photo') || lower.includes('写真')) return 'PHOTOGRAPHY'
  if (lower.includes('technology') || lower.includes('tech') || lower.includes('テクノロジー')) return 'TECHNOLOGY'
  if (lower.includes('culture') || lower.includes('文化')) return 'CULTURE'
  if (lower.includes('design') || lower.includes('デザイン')) return 'DESIGN'
  return 'FEED'
}

function extractFirstLine(caption?: string): string {
  if (!caption) return ''
  return caption.split('\n')[0] ?? ''
}

export function PostCard({ post, index }: Props) {
  const navigate = useNavigate()
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const category = inferCategory(post.caption)
  const title = extractFirstLine(post.caption)
  const date = new Date(post.timestamp).toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })

  const isVideo = post.media_type === 'VIDEO'
  const imgSrc = isVideo ? (post.thumbnail_url ?? post.media_url) : post.media_url

  return (
    <article
      className="post-card relative block cursor-pointer overflow-hidden bg-mag-surface"
      onClick={() => navigate(`/mag/${post.id}`, { state: { post } })}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') navigate(`/mag/${post.id}`, { state: { post } }) }}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Skeleton */}
      {!imgLoaded && !imgError && (
        <div
          className="mag-skeleton w-full"
          style={{ paddingBottom: '120%' }}
          aria-hidden="true"
        />
      )}

      {/* Image */}
      {!imgError && (
        <img
          src={imgSrc}
          alt={title || `Post by @synaesis_mag`}
          loading={index < 6 ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className="w-full block transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ display: imgLoaded ? 'block' : 'none' }}
        />
      )}

      {/* Fallback gradient for broken images */}
      {imgError && (
        <div
          className="w-full bg-gradient-to-br from-mag-surface to-mag-border flex items-center justify-center"
          style={{ paddingBottom: '100%', position: 'relative' }}
        >
          <span
            className="absolute inset-0 flex items-center justify-center mag-mono text-mag-muted"
            style={{ fontSize: '0.55rem', letterSpacing: '0.2em' }}
          >
            SYNAESIS
          </span>
        </div>
      )}

      {/* Overlay */}
      <div className="post-card-overlay absolute inset-0 pointer-events-none" />

      {/* Meta — revealed on hover */}
      <div className="post-card-meta absolute bottom-0 left-0 right-0 p-4">
        {/* Category tag */}
        <span
          className="mag-mono text-mag-gold block mb-2"
          style={{ fontSize: '0.5rem', letterSpacing: '0.25em' }}
        >
          {category}
        </span>

        {/* Caption excerpt */}
        {title && (
          <p
            className="mag-serif text-mag-text leading-snug line-clamp-2"
            style={{ fontSize: '0.85rem' }}
          >
            {title}
          </p>
        )}

        {/* Date */}
        <span
          className="mag-mono text-mag-dim mt-2 block"
          style={{ fontSize: '0.5rem', letterSpacing: '0.15em' }}
        >
          {date}
        </span>
      </div>

      {/* Video indicator */}
      {isVideo && (
        <div className="absolute top-3 right-3 pointer-events-none">
          <VideoIcon />
        </div>
      )}
    </article>
  )
}

function VideoIcon() {
  return (
    <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
        <polygon points="3,2 8,5 3,8" />
      </svg>
    </div>
  )
}
