/**
 * ストレージユーティリティ
 *
 * 【localStorageの制限と対策】
 * - 容量上限: ブラウザ共通で約5MB（文字列として保存されるため実質4〜5MB）
 * - 主な肥大化要因: 大量の商品データ・発注書の蓄積
 * - 対策: ①try-catchで書き込みエラーを検知 ②容量使用量を事前計測
 *         ③本実装時はサーバーDB/IndexedDBへ移行する設計を維持
 *
 * 【保存対象の方針】
 *   永続化する (localStorage):
 *     - currentProject (軽量・1件)
 *     - products (モック段階は最大50件程度)
 *     - projects (最大20件程度)
 *     - documents (最大30件程度)
 *     - settings (軽量)
 *     - isSeeded (フラグのみ)
 *
 *   永続化しない (セッション内のみ):
 *     - selectedProductIds (UI状態)
 *     - onboarding (一時入力)
 *     - onboardingStep (UI状態)
 *
 * 【本実装時の推奨保存方式】
 *   - Supabase / PlanetScale などのサーバーDB
 *   - クライアント側キャッシュとしてSWR/React Queryを使用
 *   - オフライン対応が必要なら IndexedDB (Dexie.js)
 */

const STORAGE_KEY = 'ap2026-store'
const WARN_THRESHOLD_BYTES = 3 * 1024 * 1024  // 3MB で警告
const MAX_DOCUMENTS = 100
const MAX_PRODUCTS = 500

/** localStorageの現在使用量 (bytes) を推定 */
export function getStorageUsage(): number {
  try {
    let total = 0
    for (const key of Object.keys(localStorage)) {
      total += key.length + (localStorage.getItem(key)?.length ?? 0)
    }
    return total * 2 // UTF-16なので×2
  } catch {
    return 0
  }
}

/** ストレージ使用量が警告閾値を超えていれば true */
export function isStorageNearLimit(): boolean {
  return getStorageUsage() > WARN_THRESHOLD_BYTES
}

/** 安全にlocalStorageへ書き込む（容量超過時はconsole.warnのみ） */
export function safeSave(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    if (e instanceof DOMException && (
      e.code === 22 ||
      e.code === 1014 ||
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      console.warn('[storage] localStorage quota exceeded. Data not saved.')
    } else {
      console.warn('[storage] localStorage write failed:', e)
    }
    return false
  }
}

/** 安全にlocalStorageから読み込む */
export function safeLoad(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** データサイズをMB表示の文字列で返す */
export function formatStorageSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/** 古い発注書データを自動トリミング（MAX_DOCUMENTS件を超えたら古い順に削除） */
export function trimDocuments<T extends { createdAt: string }>(docs: T[]): T[] {
  if (docs.length <= MAX_DOCUMENTS) return docs
  return [...docs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, MAX_DOCUMENTS)
}

/** 商品データを自動トリミング */
export function trimProducts<T extends { createdAt: string }>(products: T[]): T[] {
  if (products.length <= MAX_PRODUCTS) return products
  return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, MAX_PRODUCTS)
}

export { STORAGE_KEY }
