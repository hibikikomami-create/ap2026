import { useMemo } from 'react'
import type { InstagramPost } from '../../types/instagram'
import { PostCard } from './PostCard'

interface Props {
  posts: InstagramPost[]
  loading?: boolean
}

export function MasonryGrid({ posts, loading }: Props) {
  if (loading && posts.length === 0) {
    return <SkeletonGrid />
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="mag-mono text-mag-dim" style={{ fontSize: '0.6rem', letterSpacing: '0.3em' }}>
          NO POSTS FOUND
        </span>
      </div>
    )
  }

  return (
    <div
      className="masonry"
      style={{
        columns: 'var(--col-count, 2)',
      }}
    >
      <style>{`
        @media (min-width: 640px)  { :root { --col-count: 3; } }
        @media (min-width: 1024px) { :root { --col-count: 4; } }
        @media (max-width: 639px)  { :root { --col-count: 2; } }
      `}</style>
      {posts.map((post, i) => (
        <div key={post.id} className="masonry-item">
          <PostCard post={post} index={i} />
        </div>
      ))}
    </div>
  )
}

function SkeletonGrid() {
  const heights = useMemo(() =>
    Array.from({ length: 12 }, (_, i) =>
      [120, 150, 100, 130, 110, 160, 125, 140, 105, 145, 115, 135][i] + '%'
    ),
  [])

  return (
    <div
      className="masonry"
      style={{ columns: 'var(--col-count, 2)' }}
    >
      <style>{`
        @media (min-width: 640px)  { :root { --col-count: 3; } }
        @media (min-width: 1024px) { :root { --col-count: 4; } }
        @media (max-width: 639px)  { :root { --col-count: 2; } }
      `}</style>
      {heights.map((h, i) => (
        <div key={i} className="masonry-item">
          <div
            className="mag-skeleton w-full"
            style={{ paddingBottom: h }}
          />
        </div>
      ))}
    </div>
  )
}
