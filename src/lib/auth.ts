/**
 * 認証ユーティリティ
 * Supabase Auth のラッパー。オフラインモードでは何もしない。
 */
import { supabase, isSupabaseEnabled } from './supabase'
import type { AuthError, User } from '@supabase/supabase-js'

// ─── エラーメッセージの日本語変換 ─────────────────────────────────────────────

export function toJapaneseAuthError(error: AuthError | Error): string {
  const msg = 'message' in error ? error.message : String(error)
  if (msg.includes('Invalid login credentials')) {
    return 'メールアドレスまたはパスワードが違います'
  }
  if (msg.includes('Email not confirmed')) {
    return '確認メールのリンクをクリックしてからログインしてください'
  }
  if (msg.includes('User already registered') || msg.includes('already been registered')) {
    return 'このメールアドレスはすでに登録されています'
  }
  if (msg.includes('Password should be at least')) {
    return 'パスワードは6文字以上で設定してください'
  }
  if (msg.includes('Unable to validate email') || msg.includes('invalid email')) {
    return 'メールアドレスの形式が正しくありません'
  }
  if (msg.includes('Email rate limit exceeded') || msg.includes('over_email_send_rate_limit')) {
    return 'メール送信の上限に達しました。しばらく待ってから再試行してください'
  }
  if (msg.includes('Network') || msg.includes('fetch')) {
    return 'ネットワークエラーが発生しました。接続を確認してください'
  }
  if (msg.includes('Token has expired') || msg.includes('refresh_token_not_found')) {
    return 'セッションが切れました。再度ログインしてください'
  }
  return `エラーが発生しました（${msg}）`
}

// ─── 認証操作 ─────────────────────────────────────────────────────────────────

export interface AuthResult {
  user: User | null
  error: string | null
}

/** 新規ユーザー登録 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  if (!isSupabaseEnabled || !supabase) {
    return { user: null, error: 'Supabase が設定されていません。.env.local を確認してください。' }
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  })
  if (error) return { user: null, error: toJapaneseAuthError(error) }

  // プロフィール行の作成は Supabase の Database Webhook または after-signup trigger で行う
  // ここでは users テーブルへの upsert を試みる
  if (data.user) {
    await supabase.from('users').upsert({
      id: data.user.id,
      email,
      display_name: displayName,
    })
  }
  return { user: data.user, error: null }
}

/** ログイン */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseEnabled || !supabase) {
    return { user: null, error: 'Supabase が設定されていません。.env.local を確認してください。' }
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { user: null, error: toJapaneseAuthError(error) }
  return { user: data.user, error: null }
}

/** ログアウト */
export async function signOut(): Promise<{ error: string | null }> {
  if (!isSupabaseEnabled || !supabase) {
    return { error: null }
  }
  const { error } = await supabase.auth.signOut()
  if (error) return { error: toJapaneseAuthError(error) }
  return { error: null }
}

/** 現在のセッションユーザー取得 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseEnabled || !supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

/** 認証状態変化のリスナー */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  if (!isSupabaseEnabled || !supabase) {
    return () => undefined
  }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => data.subscription.unsubscribe()
}
