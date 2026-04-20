import type { CostItemKey } from '../../types'

export const COST_ITEMS: { key: CostItemKey; label: string; icon: string }[] = [
  { key: 'material', label: '材料費', icon: '🧵' },
  { key: 'processing', label: '加工費', icon: '⚙️' },
  { key: 'rent', label: '家賃', icon: '🏠' },
  { key: 'utilities', label: '光熱費', icon: '💡' },
  { key: 'labor', label: '人件費', icon: '👥' },
  { key: 'ec_fee', label: 'ECサービス利用料', icon: '🛒' },
  { key: 'payment_fee', label: '決済手数料', icon: '💳' },
  { key: 'shipping', label: '配送料', icon: '📦' },
  { key: 'packaging', label: '梱包費', icon: '🎁' },
  { key: 'advertising', label: '広告費', icon: '📢' },
  { key: 'accountant', label: '税理士費用', icon: '📋' },
  { key: 'communication', label: '通信費', icon: '📡' },
  { key: 'other', label: 'その他', icon: '✦' },
]

export const CHANNEL_LABELS: Record<string, string> = {
  store: '実店舗',
  ec: 'EC / WEB',
  both: '店舗 + EC',
  wholesale: '卸売',
  made_to_order: '受注販売',
}

export const TOTAL_STEPS = 6
