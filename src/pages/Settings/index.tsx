import { useState } from 'react'
import { useStore } from '../../store'
import type { UserSettings } from '../../types'

type Tab = 'user' | 'company' | 'output'

const TAB_LABELS: Record<Tab, string> = {
  user: 'ユーザー情報',
  company: '会社情報',
  output: '出力設定',
}

export default function Settings() {
  const { settings, updateSettings } = useStore()
  const [tab, setTab] = useState<Tab>('user')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<UserSettings>(settings)

  const upd = (patch: Partial<UserSettings>) => setForm((f) => ({ ...f, ...patch }))

  const handleSave = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-sm text-gray-500 mt-1">アカウント・出力に関する設定</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all
              ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tab === 'user' && (
          <>
            <SettingField
              label="表示名"
              value={form.displayName}
              onChange={(v) => upd({ displayName: v })}
              placeholder="山田 花子"
            />
            <SettingField
              label="メールアドレス"
              value={form.email}
              onChange={(v) => upd({ email: v })}
              type="email"
              placeholder="you@example.com"
            />
            <DisabledField label="パスワード変更" placeholder="••••••••••" note="本実装時に対応予定" />
            <DisabledField label="2段階認証" placeholder="未設定" note="本実装時に対応予定" />
          </>
        )}

        {tab === 'company' && (
          <>
            <SettingField
              label="屋号・ブランド名"
              value={form.companyName}
              onChange={(v) => upd({ companyName: v })}
              placeholder="Lumière Atelier"
            />
            <SettingField
              label="住所"
              value={form.companyAddress}
              onChange={(v) => upd({ companyAddress: v })}
              placeholder="東京都渋谷区..."
            />
            <SettingField
              label="電話番号"
              value={form.companyPhone}
              onChange={(v) => upd({ companyPhone: v })}
              placeholder="03-0000-0000"
            />
            <DisabledField label="ロゴ画像" placeholder="ファイルを選択" note="本実装時に対応予定" />
          </>
        )}

        {tab === 'output' && (
          <>
            <div>
              <label className="label">消費税率</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  className="input-field w-24"
                  value={form.taxRate}
                  min={0}
                  max={30}
                  onChange={(e) => upd({ taxRate: parseFloat(e.target.value) || 0 })}
                />
                <span className="text-gray-500">%</span>
              </div>
            </div>
            <div>
              <label className="label">用紙サイズ</label>
              <div className="flex gap-3">
                {(['a4', 'letter'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => upd({ outputFormat: fmt })}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
                      ${form.outputFormat === fmt
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-gray-600 border-gray-200'
                      }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">デフォルト支払い条件</label>
              <input
                type="text"
                className="input-field"
                value={form.defaultPaymentTerms}
                onChange={(e) => upd({ defaultPaymentTerms: e.target.value })}
                placeholder="納品後30日以内"
              />
            </div>
            <div className="space-y-3">
              <ToggleSetting
                label="帳票にロゴを含める"
                checked={form.outputIncludeLogo}
                onChange={(v) => upd({ outputIncludeLogo: v })}
              />
              <ToggleSetting
                label="帳票に消費税を表示"
                checked={form.outputIncludeTax}
                onChange={(v) => upd({ outputIncludeTax: v })}
              />
            </div>
          </>
        )}
      </div>

      {/* Save button */}
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="btn-primary px-8"
        >
          {saved ? '✓ 保存しました' : '変更を保存'}
        </button>
        {saved && (
          <span className="text-green-600 text-sm font-medium">設定を更新しました</span>
        )}
      </div>

      {/* Danger zone */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <div className="text-sm font-semibold text-gray-500 mb-3">危険な操作</div>
        <div className="space-y-2">
          <DangerItem label="全データをリセット" note="本実装時に対応予定" />
          <DangerItem label="アカウントを削除" note="本実装時に対応予定" />
        </div>
      </div>
    </div>
  )
}

function SettingField({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
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
      <input type="text" className="input-field bg-gray-100 cursor-not-allowed" value={placeholder} disabled />
      <p className="text-xs text-gray-400 mt-1">{note}</p>
    </div>
  )
}

function ToggleSetting({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200
          ${checked ? 'bg-brand-500' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}

function DangerItem({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 opacity-60">
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-xs text-gray-400">{note}</div>
      </div>
      <button
        type="button"
        disabled
        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-400 text-xs font-medium cursor-not-allowed"
      >
        実行
      </button>
    </div>
  )
}
