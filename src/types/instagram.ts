export type MediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'

export interface InstagramPost {
  id: string
  caption?: string
  media_url: string
  thumbnail_url?: string
  permalink: string
  media_type: MediaType
  timestamp: string
}

export interface InstagramResponse {
  data: InstagramPost[]
  paging?: {
    cursors: { before: string; after: string }
    next?: string
  }
}

export type Category =
  | 'ALL'
  | 'DESIGN'
  | 'ARCHITECTURE'
  | 'CULTURE'
  | 'PHOTOGRAPHY'
  | 'TECHNOLOGY'
