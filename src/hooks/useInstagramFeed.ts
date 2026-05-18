import { useState, useEffect } from 'react'
import type { InstagramPost } from '../types/instagram'

// Editorial mock data – used when no Instagram token is configured.
// Each entry reflects the @synaesis_mag aesthetic: design, architecture, culture.
const MOCK_POSTS: InstagramPost[] = [
  {
    id: 'm01',
    caption: '静寂の中に宿る美しさ。\nデザインとは何かを問い続けること。\n\nThe beauty that dwells in silence. To keep questioning what design is.\n\n#synaesis #design #silence #minimalism',
    media_url: 'https://picsum.photos/seed/syn01/800/1040',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-15T10:00:00Z',
  },
  {
    id: 'm02',
    caption: '建築は時間を固定する。空間は記憶を宿す。\n\nArchitecture fixes time. Space harbors memory.\n\n#architecture #concrete #brutalism #synaesis',
    media_url: 'https://picsum.photos/seed/syn02/800/800',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-14T08:30:00Z',
  },
  {
    id: 'm03',
    caption: '光と影の対話。\n\nA dialogue between light and shadow.\n\n#photography #light #shadow #editorial #synaesis',
    media_url: 'https://picsum.photos/seed/syn03/800/1200',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-13T14:00:00Z',
  },
  {
    id: 'm04',
    caption: 'テクノロジーと手仕事の狭間で。\n\nBetween technology and craft.\n\n#craft #technology #design #material #synaesis',
    media_url: 'https://picsum.photos/seed/syn04/800/960',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-12T11:00:00Z',
  },
  {
    id: 'm05',
    caption: '都市という生き物。\n\nThe city as a living organism.\n\n#urban #city #culture #tokyo #synaesis',
    media_url: 'https://picsum.photos/seed/syn05/800/640',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-11T09:00:00Z',
  },
  {
    id: 'm06',
    caption: '素材の記憶。木、石、金属。それぞれが持つ時間の層。\n\nThe memory of materials. Wood, stone, metal — each carries layers of time.\n\n#material #texture #architecture #synaesis',
    media_url: 'https://picsum.photos/seed/syn06/800/1100',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-10T16:00:00Z',
  },
  {
    id: 'm07',
    caption: '余白は沈黙ではない、雄弁だ。\n\nNegative space is not silence — it is eloquence.\n\n#whitespace #design #typography #print #synaesis',
    media_url: 'https://picsum.photos/seed/syn07/800/800',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-09T12:00:00Z',
  },
  {
    id: 'm08',
    caption: '自然の幾何学。\n\nThe geometry of nature.\n\n#nature #geometry #pattern #photography #synaesis',
    media_url: 'https://picsum.photos/seed/syn08/800/1340',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-08T08:00:00Z',
  },
  {
    id: 'm09',
    caption: '未来の家具は過去の記憶から生まれる。\n\nFuture furniture is born from the memory of the past.\n\n#furniture #craft #design #object #synaesis',
    media_url: 'https://picsum.photos/seed/syn09/800/900',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-07T15:00:00Z',
  },
  {
    id: 'm10',
    caption: 'ポスターは街の詩。\n\nPosters are the poetry of the street.\n\n#poster #typography #graphicdesign #culture #synaesis',
    media_url: 'https://picsum.photos/seed/syn10/800/1120',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-06T10:00:00Z',
  },
  {
    id: 'm11',
    caption: '境界が崩れるとき、新しい形が現れる。\n\nWhen boundaries dissolve, new forms emerge.\n\n#art #boundary #contemporary #culture #synaesis',
    media_url: 'https://picsum.photos/seed/syn11/800/720',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-05T13:00:00Z',
  },
  {
    id: 'm12',
    caption: '夜の建築。照明が語る空間の意志。\n\nNight architecture. Lighting articulates the will of space.\n\n#architecture #night #light #interior #synaesis',
    media_url: 'https://picsum.photos/seed/syn12/800/1000',
    permalink: 'https://www.instagram.com/synaesis_mag/',
    media_type: 'IMAGE',
    timestamp: '2026-05-04T20:00:00Z',
  },
]

interface UseFeedResult {
  posts: InstagramPost[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
}

export function useInstagramFeed(): UseFeedResult {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const token = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN as string | undefined

  useEffect(() => {
    if (!token) {
      // Simulate a short loading delay for UX realism
      const t = setTimeout(() => {
        setPosts(MOCK_POSTS)
        setLoading(false)
      }, 800)
      return () => clearTimeout(t)
    }

    fetchInstagram(token, null)
  }, [token])

  async function fetchInstagram(accessToken: string, cursor: string | null) {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        fields: 'id,caption,media_url,thumbnail_url,permalink,media_type,timestamp',
        access_token: accessToken,
        limit: '24',
      })
      if (cursor) params.set('after', cursor)

      const res = await fetch(`https://graph.instagram.com/me/media?${params}`)
      if (!res.ok) throw new Error(`Instagram API error: ${res.status}`)

      const json = await res.json()
      setPosts(prev => cursor ? [...prev, ...json.data] : json.data)
      setNextCursor(json.paging?.cursors?.after ?? null)
      setHasMore(!!json.paging?.next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed')
      // Fallback to mock on error
      setPosts(MOCK_POSTS)
    } finally {
      setLoading(false)
    }
  }

  function loadMore() {
    if (!token || !nextCursor || loading) return
    fetchInstagram(token, nextCursor)
  }

  return { posts, loading, error, hasMore, loadMore }
}
