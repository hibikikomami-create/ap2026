/**
 * Supabase クライアント
 *
 * 環境変数 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY が未設定の場合は
 * オフラインモード（localStorage）で動作します。
 * 本番環境では必ず .env.local に実際の値を設定してください。
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const isPlaceholder = !url ||
  url === 'https://your-project-id.supabase.co' ||
  !key ||
  key === 'your-anon-key-here'

if (isPlaceholder) {
  console.info(
    '[supabase] 環境変数が未設定のためオフラインモードで起動します。\n' +
    '.env.local に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定すると\n' +
    'データがクラウドに保存されるようになります。'
  )
}

export const supabase = isPlaceholder
  ? null
  : createClient(url!, key!)

/** Supabase が有効かどうかを示すフラグ */
export const isSupabaseEnabled = !isPlaceholder
