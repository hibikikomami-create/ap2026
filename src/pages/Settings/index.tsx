import { useState } from 'react'
import { useStore } from '../../store'
import type { UserSettings } from '../../types'

type Tab = 'user' | 'company' | 'output'

const TABS: { key: Tab; label: string }[] = [
  { key: 'user', label: 'ユーザー情報' },
  { key: 'company', label: '会社・屋号' },
  { key: 'output', label: '出力設定' },
]

export default function Settings() {
  const { settings, updateSettings } = useStore()
  const [tab, setTab] = useState<Tab>('user')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<UserSettings>(settings)

  const upd = (patch: Partial<UserSettings>) => setForm((f) => ({ ...f, ...patch }))

  const handleSave = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="min-h-screen">
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">設定</h1>
            <p className="page-subtitle">アカウントおよび出力に関する設定</p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary"
          >
            {saved ? '保存しました' : '変更を保存'}
          </button>
        </div>
      </div>

      <div className="page-content max-w-4xl">
        <div className="flex gap-6 flex-col md:flex-row">
          {/* Sidebar tabs */}
          <div className="md:w-48 shrink-0">
            <nav className="space-y-0.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${tab === t.key
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {tab === 'user' && (
              <div className="card p-5">
                <h2 className="section-title mb-4">ユーザー情報</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="表示名"
                    value={form.displayName}
                    onChange={(v) => upd({ displayName: v })}
                    placeholder="山田 花子"
                  />
                  <Field
                    label="メールアドレス"
                    value={form.email}
                    onChange={(v) => upd({ email: v })}
                    type="email"
                    placeholder="you@example.com"
                  />
                  <DisabledField label="パスワード変更" placeholder="••••••••" note="本実装時に対応予定" />
                  <DisabledField label="2段階認証" placeholder="未設定" note="本実装時に対応予定" />
                </div>
              </div>
            )}

            {tab === 'company' && (
              <div className="card p-5">
                <h2 className="section-title mb-4">会社・屋号情報</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="屋号・ブランド名"
                    value={form.companyName}
                    onChange={(v) => upd({ companyName: v })}
                    placeholder="Lumière Atelier"
                    colSpan
                  />
                  <Field
                    label="住所"
                    value={form.companyAddress}
                    onChange={(v) => upd({ companyAddress: v })}
                    placeholder="東京都渋谷区..."
                    colSpan
                  />
                  <Field
                    label="電話番号"
                    value={form.companyPhone}
                    onChange={(v) => upd({ companyPhone: v })}
                    placeholder="03-0000-0000"
                  />
                  <DisabledField label="ロゴ画像" placeholder="ファイルを選択" note="本実装時に対応予定" />
                </div>
              </div>
            )}

            {tab === 'output' && (
              <div className="card p-5">
                <h2 className="section-title mb-4">出力設定</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">消費税率</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="input-field w-24"
                        value={form.taxRate}
                        min={0}
                        max={30}
                        onChange={(e) => upd({ taxRate: parseFloat(e.target.value) || 0 })}
                      />
                      <span className="text-slate-500 text-sm">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="label">用紙サイズ</label>
                    <div className="flex gap-2">
                      {(['a4', 'letter'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => upd({ outputFormat: f })}
                          className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors
                            ${form.outputFormat === f
                              ? 'bg-brand-600 text-white border-brand-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                            }`}
                        >
                          {f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label">デフォルト支払い条件</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.defaultPaymentTerms}
                      onChange={(e) => upd({ defaultPaymentTerms: e.target.value })}
                      placeholder="納品後30日以内"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <Toggle
                      label="帳票にロゴを含める"
                      checked={form.outputIncludeLogo}
                      onChange={(v) => upd({ outputIncludeLogo: v })}
                    />
                    <Toggle
                      label="帳票に消費税を表示"
                      checked={form.outputIncludeTax}
                      onChange={(v) => upd({ outputIncludeTax: v })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Danger zone */}
            <div className="mt-6 card p-5 border-red-100">
              <h2 className="text-sm font-semibold text-slate-500 mb-3">危険な操作</h2>
              <div className="space-y-2">
                <DangerRow label="全データをリセット" />
                <DangerRow label="アカウントを削除" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', placeholder, colSpan,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; colSpan?: boolean
}) {
  return (
    <div className={colSpan ? 'sm:col-span-2' : ''}>
      <label className="label">{label}</label>
      <input
        type={type}
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function DisabledField({ label, placeholder, note }: { label: string; placeholder: string; note: string }) {
  return (
    <div className="opacity-50">
      <label className="label">{label}</label>
      <input type="text" className="input-field bg-slate-50 cursor-not-allowed" value={placeholder} disabled />
      <p className="text-xs text-slate-400 mt-1">{note}</p>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
        style={{ height: '22px' }}
      >
        <span
          className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-200`}
          style={{
            width: '18px',
            height: '18px',
            transform: checked ? 'translateX(20px)' : 'translateX(2px)',
          }}
        />
      </button>
    </div>
  )
}

function DangerRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 opacity-50">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        disabled
        className="px-3 py-1.5 rounded-md border border-red-200 text-red-400 text-xs font-medium cursor-not-allowed"
      >
        実行
      </button>
    </div>
  )
}
