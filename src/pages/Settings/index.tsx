import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { showToast } from '../../components/common/Toast'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import type { UserSettings } from '../../types'

type Tab = 'user' | 'company' | 'output' | 'ai' | 'team' | 'customize'

const TABS: { key: Tab; label: string }[] = [
  { key: 'user',      label: 'ユーザー情報' },
  { key: 'company',   label: '会社・屋号' },
  { key: 'output',    label: '出力設定' },
  { key: 'ai',        label: 'AIアシスタント' },
  { key: 'team',      label: 'チーム共有' },
  { key: 'customize', label: 'カスタマイズ' },
]

const MODELS = [
  { value: 'claude-haiku-4-5-20251001', label: 'Haiku（高速・低コスト）' },
  { value: 'claude-sonnet-4-6', label: 'Sonnet（バランス型）' },
]

export default function Settings() {
  const navigate = useNavigate()
  const { settings, updateSettings, resetAllData } = useStore()
  const [tab, setTab] = useState<Tab>('user')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<UserSettings>(settings)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [shareCode] = useState(() => btoa(JSON.stringify({ team: settings.teamName || 'myteam', v: 1 })).slice(0, 24))

  const upd = (patch: Partial<UserSettings>) => setForm(f => ({ ...f, ...patch }))

  const handleSave = async () => {
    if (!form.displayName.trim()) {
      showToast('表示名を入力してください', 'error')
      setTab('user')
      return
    }
    setSaving(true)
    try {
      updateSettings(form)
      await new Promise(r => setTimeout(r, 200))
      showToast('設定を保存しました', 'success')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      resetAllData()
      await new Promise(r => setTimeout(r, 200))
      showToast('すべてのデータを削除しました', 'success')
      navigate('/home')
    } finally {
      setResetting(false)
      setResetOpen(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: '80px' }}>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="page-title">設定</div>
            <div className="page-subtitle">アカウント・連携・カスタマイズ</div>
          </div>
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary" style={{ minHeight: '38px', padding: '0 16px', fontSize: '13px' }}>
            {saving && <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.40)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
            {saving ? '保存中' : '保存'}
          </button>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: '100%' }}>
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', alignItems: 'stretch' }} className="md:flex-row">
          {/* Tab nav — horizontal scroll on mobile */}
          <div style={{ flexShrink: 0 }} className="md:w-48">
            <nav style={{ display: 'flex', gap: '4px', overflowX: 'auto', margin: '0 -18px', padding: '0 18px 4px', scrollbarWidth: 'none' }} className="md:flex-col md:overflow-visible md:m-0 md:p-0">
              {TABS.map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  style={{
                    flexShrink: 0, padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: tab === t.key ? 500 : 400,
                    whiteSpace: 'nowrap', transition: 'all 160ms ease',
                    background: tab === t.key ? 'var(--accent-bg)' : 'rgba(255,255,255,0.50)',
                    color: tab === t.key ? 'var(--accent)' : 'var(--ink-mid)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {tab === 'user' && (
              <div className="card a0" style={{ padding: '18px' }}>
                <div className="section-title" style={{ marginBottom: '16px' }}>ユーザー情報</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }} className="sm:grid-cols-2">
                  <Field label="表示名" value={form.displayName} onChange={v => upd({ displayName: v })} placeholder="山田 花子" />
                  <Field label="メールアドレス" value={form.email} onChange={v => upd({ email: v })} type="email" placeholder="you@example.com" />
                  <DisabledField label="パスワード変更" placeholder="••••••••" note="本実装時に対応予定" />
                  <DisabledField label="2段階認証" placeholder="未設定" note="本実装時に対応予定" />
                </div>
              </div>
            )}

            {tab === 'company' && (
              <div className="card a0" style={{ padding: '18px' }}>
                <div className="section-title" style={{ marginBottom: '16px' }}>会社・屋号情報</div>
                <div style={{ display: 'grid', gap: '14px' }}>
                  <Field label="屋号・ブランド名" value={form.companyName} onChange={v => upd({ companyName: v })} placeholder="Lumière Atelier" />
                  <Field label="住所" value={form.companyAddress} onChange={v => upd({ companyAddress: v })} placeholder="東京都渋谷区..." />
                  <Field label="電話番号" value={form.companyPhone} onChange={v => upd({ companyPhone: v })} placeholder="03-0000-0000" />
                  <DisabledField label="ロゴ画像" placeholder="ファイルを選択" note="本実装時に対応予定" />
                </div>
              </div>
            )}

            {tab === 'output' && (
              <div className="card a0" style={{ padding: '18px' }}>
                <div className="section-title" style={{ marginBottom: '16px' }}>出力設定</div>
                <div style={{ display: 'grid', gap: '14px' }}>
                  <div>
                    <div className="label">消費税率</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="number" className="input-field" style={{ width: '100px' }} value={form.taxRate} min={0} max={30} onChange={e => upd({ taxRate: parseFloat(e.target.value) || 0 })} />
                      <span style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>%</span>
                    </div>
                  </div>
                  <div>
                    <div className="label">用紙サイズ</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(['a4', 'letter'] as const).map(f => (
                        <button key={f} type="button" onClick={() => upd({ outputFormat: f })}
                          style={{
                            padding: '8px 20px', borderRadius: '999px', border: `1.5px solid ${form.outputFormat === f ? 'var(--accent)' : 'transparent'}`,
                            background: form.outputFormat === f ? 'var(--accent-bg)' : 'rgba(255,255,255,0.60)',
                            color: form.outputFormat === f ? 'var(--accent)' : 'var(--ink-mid)',
                            fontSize: '13px', fontWeight: form.outputFormat === f ? 600 : 400, cursor: 'pointer',
                          }}
                        >
                          {f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="label">デフォルト支払い条件</div>
                    <input type="text" className="input-field" value={form.defaultPaymentTerms} onChange={e => upd({ defaultPaymentTerms: e.target.value })} placeholder="納品後30日以内" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    <Toggle label="帳票にロゴを含める" checked={form.outputIncludeLogo} onChange={v => upd({ outputIncludeLogo: v })} />
                    <Toggle label="帳票に消費税を表示" checked={form.outputIncludeTax} onChange={v => upd({ outputIncludeTax: v })} />
                  </div>
                </div>
              </div>
            )}

            {tab === 'ai' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="a0">
                <div className="card" style={{ padding: '18px' }}>
                  <div className="section-title" style={{ marginBottom: '6px' }}>Anthropic APIキー</div>
                  <p style={{ fontSize: '12px', color: 'var(--stone)', marginBottom: '14px', lineHeight: 1.6 }}>
                    console.anthropic.com でAPIキーを取得してください。キーはデバイス内にのみ保存されます。
                  </p>
                  <div className="label">APIキー</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type={apiKeyVisible ? 'text' : 'password'}
                      className="input-field"
                      value={form.apiKey}
                      onChange={e => upd({ apiKey: e.target.value })}
                      placeholder="sk-ant-..."
                      style={{ flex: 1, fontFamily: 'monospace' }}
                    />
                    <button
                      type="button"
                      onClick={() => setApiKeyVisible(v => !v)}
                      style={{ padding: '0 14px', borderRadius: '11px', border: '1.5px solid rgba(255,255,255,0.54)', background: 'rgba(255,255,255,0.72)', cursor: 'pointer', color: 'var(--stone)', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      {apiKeyVisible ? '隠す' : '表示'}
                    </button>
                  </div>
                </div>

                <div className="card" style={{ padding: '18px' }}>
                  <div className="section-title" style={{ marginBottom: '14px' }}>AIモデル</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {MODELS.map(m => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => upd({ aiModel: m.value })}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', borderRadius: '12px',
                          border: `1.5px solid ${form.aiModel === m.value ? 'var(--accent)' : 'rgba(255,255,255,0.54)'}`,
                          background: form.aiModel === m.value ? 'var(--accent-bg)' : 'rgba(255,255,255,0.60)',
                          cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: '13.5px', fontWeight: 500, color: form.aiModel === m.value ? 'var(--accent)' : 'var(--ink)' }}>{m.label}</span>
                        {form.aiModel === m.value && (
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/chat')}
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '16px' }}
                  >
                    AIチャットを開く
                  </button>
                </div>
              </div>
            )}

            {tab === 'team' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="a0">
                <div className="card" style={{ padding: '18px' }}>
                  <div className="section-title" style={{ marginBottom: '6px' }}>チーム設定</div>
                  <p style={{ fontSize: '12px', color: 'var(--stone)', marginBottom: '14px', lineHeight: 1.6 }}>
                    チーム名を設定すると、共有コードが生成されます。メンバーはそのコードでデータをインポートできます。
                  </p>
                  <Field label="チーム名" value={form.teamName} onChange={v => upd({ teamName: v })} placeholder="例：Lumière チーム" />
                </div>

                <div className="card" style={{ padding: '18px' }}>
                  <div className="section-title" style={{ marginBottom: '14px' }}>共有コード</div>
                  <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.04)', borderRadius: '11px', marginBottom: '12px' }}>
                    <code style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--ink-mid)', letterSpacing: '0.5px' }}>
                      {shareCode}
                    </code>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard?.writeText(shareCode); showToast('コードをコピーしました', 'success') }}
                      className="btn-secondary"
                      style={{ flex: 1, minHeight: '40px', fontSize: '13px' }}
                    >
                      コピー
                    </button>
                    <button type="button" disabled className="btn-ghost" style={{ flex: 1, minHeight: '40px', fontSize: '13px' }}>
                      インポート（準備中）
                    </button>
                  </div>
                </div>

                <div className="card" style={{ padding: '18px' }}>
                  <div className="section-title" style={{ marginBottom: '14px' }}>メンバー</div>
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--stone)', fontSize: '13px' }}>
                    チーム共有機能は本実装時に対応予定です
                  </div>
                </div>
              </div>
            )}

            {tab === 'customize' && (
              <div className="card a0" style={{ padding: '18px' }}>
                <div className="section-title" style={{ marginBottom: '6px' }}>機能カスタマイズ</div>
                <p style={{ fontSize: '12px', color: 'var(--stone)', marginBottom: '16px', lineHeight: 1.6 }}>
                  使わない機能をオフにして画面をシンプルに保てます。
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Toggle
                    label="AIアシスタント（チャット）"
                    note="AIによる事業アドバイス機能"
                    checked={form.featureChat}
                    onChange={v => upd({ featureChat: v })}
                  />
                  <Toggle
                    label="カレンダー・日報"
                    note="売上記録と月次カレンダー"
                    checked={form.featureCalendar}
                    onChange={v => upd({ featureCalendar: v })}
                  />
                </div>
              </div>
            )}

            {/* Danger zone */}
            <div className="card" style={{ padding: '18px', marginTop: '14px', border: '1px solid rgba(192,64,64,0.15)' }}>
              <div className="section-label" style={{ marginBottom: '12px' }}>危険な操作</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--divider)' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', color: 'var(--ink-mid)', fontWeight: 500 }}>全データをリセット</div>
                    <div style={{ fontSize: '11px', color: 'var(--stone)', marginTop: '2px' }}>商品・発注書・プロジェクトをすべて削除します</div>
                  </div>
                  <button type="button" onClick={() => setResetOpen(true)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(192,64,64,0.30)', color: 'var(--err)', fontSize: '12px', fontWeight: 500, background: 'transparent', cursor: 'pointer' }}>
                    実行
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', opacity: 0.45 }}>
                  <div>
                    <div style={{ fontSize: '13.5px', color: 'var(--ink-mid)', fontWeight: 500 }}>アカウントを削除</div>
                    <div style={{ fontSize: '11px', color: 'var(--stone)', marginTop: '2px' }}>本実装時に対応予定</div>
                  </div>
                  <button disabled style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(192,64,64,0.30)', color: 'var(--err)', fontSize: '12px', background: 'transparent', cursor: 'not-allowed' }}>
                    実行
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="全データをリセットしますか？"
        message={'登録済みの商品・発注書・プロジェクトをすべて削除します。\nこの操作は取り消せません。'}
        confirmLabel="リセットする"
        danger
        busy={resetting}
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string
}) {
  return (
    <div>
      <div className="label">{label}</div>
      <input type={type} className="input-field" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function DisabledField({ label, placeholder, note }: { label: string; placeholder: string; note: string }) {
  return (
    <div style={{ opacity: 0.50 }}>
      <div className="label">{label}</div>
      <input type="text" className="input-field" value={placeholder} disabled style={{ cursor: 'not-allowed', background: 'rgba(255,255,255,0.40)' }} />
      <p style={{ fontSize: '11px', color: 'var(--stone)', marginTop: '4px' }}>{note}</p>
    </div>
  )
}

function Toggle({ label, note, checked, onChange }: { label: string; note?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--divider)' }}>
      <div>
        <div style={{ fontSize: '13.5px', color: 'var(--ink)', fontWeight: 500 }}>{label}</div>
        {note && <div style={{ fontSize: '11px', color: 'var(--stone)', marginTop: '2px' }}>{note}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative', width: '44px', height: '24px', borderRadius: '12px',
          background: checked ? 'var(--accent)' : 'rgba(0,0,0,0.15)',
          border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'background 200ms ease',
        }}
      >
        <span
          style={{
            position: 'absolute', top: '3px', width: '18px', height: '18px',
            background: 'white', borderRadius: '50%',
            boxShadow: '0 1px 4px rgba(0,0,0,0.20)',
            transform: checked ? 'translateX(23px)' : 'translateX(3px)',
            transition: 'transform 200ms ease',
          }}
        />
      </button>
    </div>
  )
}
