import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store'
import { NumberInput } from '../../components/common/NumberInput'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { showToast } from '../../components/common/Toast'
import { calcProduct, fmt, fmtPct } from '../../lib/calculations'
import type { Product, ProductStatus, SalesChannel, ProductCategory } from '../../types'

const CHANNELS: { value: SalesChannel; label: string }[] = [
  { value: 'store', label: '実店舗' },
  { value: 'ec', label: 'EC / WEB' },
  { value: 'both', label: '両方' },
  { value: 'wholesale', label: '卸売' },
  { value: 'made_to_order', label: '受注販売' },
]

const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: 'active', label: '販売中' },
  { value: 'inactive', label: '停止中' },
  { value: 'draft', label: '下書き' },
  { value: 'discontinued', label: '廃番' },
]

const CATEGORIES: { value: ProductCategory; label: string; icon: string }[] = [
  { value: 'apparel', label: 'アパレル', icon: '👗' },
  { value: 'accessory', label: 'アクセサリー', icon: '💍' },
  { value: 'food', label: '食品', icon: '🍱' },
  { value: 'beauty', label: 'ビューティー', icon: '💄' },
  { value: 'home', label: 'インテリア', icon: '🕯️' },
  { value: 'digital', label: 'デジタル', icon: '💻' },
  { value: 'service', label: 'サービス', icon: '💼' },
  { value: 'other', label: 'その他', icon: '📦' },
]

type FormState = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export default function ProductDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'

  const { currentProject, products, addProduct, updateProduct, deleteProduct, duplicateProduct } = useStore()

  const existing = !isNew ? products.find((p) => p.id === id) : null

  const [errors, setErrors] = useState<{ name?: string; sellingPrice?: string; expectedSalesVolume?: string }>({})
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [form, setForm] = useState<FormState>({
    projectId: currentProject?.id ?? '',
    name: '',
    code: '',
    category: 'other',
    colors: [],
    sizes: [],
    variants: [],
    sellingPrice: 0,
    wholesalePrice: 0,
    unitCost: 0,
    additionalCosts: [],
    monthlyFixedCost: 0,
    paymentFeeRate: 0,
    discountRate: 0,
    shippingCost: 0,
    salesChannels: [],
    status: 'draft',
    expectedSalesVolume: 1,
    memo: '',
  })

  const [colorInput, setColorInput] = useState('')
  const [sizeInput, setSizeInput] = useState('')

  useEffect(() => {
    if (existing) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = existing
      setForm(rest)
    }
  }, [existing])

  const calc = calcProduct({ ...form, id: 'preview', createdAt: '', updatedAt: '' })

  const upd = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const handleSave = async (opts?: { draft?: boolean }) => {
    const draft = opts?.draft ?? false
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = '商品名を入力してください'
    if (!draft) {
      if (!form.sellingPrice || form.sellingPrice <= 0) next.sellingPrice = '販売価格を入力してください'
      if (!form.expectedSalesVolume || form.expectedSalesVolume <= 0) next.expectedSalesVolume = '想定販売数を入力してください'
    }
    setErrors(next)
    if (next.name || next.sellingPrice || next.expectedSalesVolume) {
      showToast(next.name ?? next.sellingPrice ?? next.expectedSalesVolume ?? '入力内容を確認してください', 'error')
      return
    }
    setErrors({})
    setSaving(true)
    try {
      const payload = draft ? { ...form, status: 'draft' as ProductStatus } : form
      if (isNew) {
        addProduct(payload)
        showToast(draft ? '下書きとして保存しました' : '商品を追加しました', 'success')
      } else if (id) {
        updateProduct(id, payload)
        showToast(draft ? '下書きとして保存しました' : '商品を更新しました', 'success')
      }
      // wait a tick so the toast is visible before navigation
      await new Promise((r) => setTimeout(r, 120))
      navigate('/products')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!id || isNew) return
    deleteProduct(id)
    showToast('商品を削除しました', 'success')
    setDeleteOpen(false)
    navigate('/products')
  }

  const handleDuplicate = () => {
    if (!id || isNew) return
    duplicateProduct(id)
    showToast('商品を複製しました', 'success')
    navigate('/products')
  }

  const toggleChannel = (ch: SalesChannel) => {
    const cur = form.salesChannels
    upd({ salesChannels: cur.includes(ch) ? cur.filter((c) => c !== ch) : [...cur, ch] })
  }

  const addColor = () => {
    const v = colorInput.trim()
    if (v && !form.colors.includes(v)) {
      upd({ colors: [...form.colors, v] })
    }
    setColorInput('')
  }

  const removeColor = (c: string) => upd({ colors: form.colors.filter((x) => x !== c) })

  const addSize = () => {
    const v = sizeInput.trim()
    if (v && !form.sizes.includes(v)) {
      upd({ sizes: [...form.sizes, v] })
    }
    setSizeInput('')
  }

  const removeSize = (s: string) => upd({ sizes: form.sizes.filter((x) => x !== s) })

  return (
    <div className="flex flex-col min-h-svh bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all"
              aria-label="戻る"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-bold text-gray-900 text-base truncate">
              {isNew ? '商品を追加' : '商品を編集'}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {!isNew && (
              <>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  disabled={saving}
                  className="hidden sm:inline-flex text-sm px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  複製
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  disabled={saving}
                  className="hidden sm:inline-flex text-sm px-3 py-2 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  削除
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => handleSave({ draft: true })}
              disabled={saving}
              className="text-sm px-3 py-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              下書き保存
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving && (
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {/* Live metrics bar */}
      <div className="bg-brand-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-5 overflow-x-auto text-sm">
          <div>
            <span className="text-brand-300 text-xs">粗利率</span>
            <span className={`ml-1.5 font-bold ${calc.grossMargin < 0 ? 'text-red-300' : 'text-white'}`}>
              {fmtPct(calc.grossMargin)}
            </span>
          </div>
          <div>
            <span className="text-brand-300 text-xs">月間粗利</span>
            <span className="ml-1.5 font-bold">{fmt(calc.grossProfit)}</span>
          </div>
          <div>
            <span className="text-brand-300 text-xs">月間純利益</span>
            <span className={`ml-1.5 font-bold ${calc.netProfit < 0 ? 'text-red-300' : 'text-white'}`}>
              {fmt(calc.netProfit)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-5 pb-12">

          {/* Basic info */}
          <div className="card p-4 space-y-4">
            <div className="section-title">基本情報</div>

            <div>
              <label className="label">商品名 <span className="text-brand-500">*</span></label>
              <input
                type="text"
                className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-300' : ''}`}
                placeholder="例：アロマキャンドル ラベンダー S"
                value={form.name}
                onChange={(e) => {
                  upd({ name: e.target.value })
                  if (errors.name) setErrors((x) => ({ ...x, name: undefined }))
                }}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">品番 / SKU</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ARC-001"
                  value={form.code}
                  onChange={(e) => upd({ code: e.target.value })}
                />
              </div>
              <div>
                <label className="label">ステータス</label>
                <select
                  className="input-field"
                  value={form.status}
                  onChange={(e) => upd({ status: e.target.value as ProductStatus })}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="label">カテゴリ</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => upd({ category: c.value })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                      ${form.category === c.value
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                      }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Variants: colors & sizes */}
          <div className="card p-4 space-y-4">
            <div className="section-title">カラー / サイズ</div>

            <div>
              <label className="label">カラー展開</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {form.colors.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 bg-brand-100 text-brand-700 px-2.5 py-1 rounded-lg text-sm">
                    {c}
                    <button type="button" onClick={() => removeColor(c)} className="text-brand-400 hover:text-brand-700 ml-0.5">✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="例：ホワイト"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                />
                <button type="button" onClick={addColor} className="btn-secondary px-4 py-2 text-sm">追加</button>
              </div>
            </div>

            <div>
              <label className="label">サイズ展開</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {form.sizes.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-sm">
                    {s}
                    <button type="button" onClick={() => removeSize(s)} className="text-gray-400 hover:text-gray-700 ml-0.5">✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="例：S / M / L"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                />
                <button type="button" onClick={addSize} className="btn-secondary px-4 py-2 text-sm">追加</button>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-4 space-y-4">
            <div className="section-title">価格</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <NumberInput
                  label="上代（販売価格）"
                  value={form.sellingPrice}
                  onChange={(v) => {
                    upd({ sellingPrice: v ?? 0 })
                    if (errors.sellingPrice) setErrors((x) => ({ ...x, sellingPrice: undefined }))
                  }}
                  prefix="¥"
                  required
                />
                {errors.sellingPrice && (
                  <p className="mt-1 text-xs text-red-500">{errors.sellingPrice}</p>
                )}
              </div>
              <NumberInput
                label="卸価格"
                value={form.wholesalePrice}
                onChange={(v) => upd({ wholesalePrice: v ?? 0 })}
                prefix="¥"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <NumberInput
                  label="想定販売数（月間）"
                  value={form.expectedSalesVolume}
                  onChange={(v) => {
                    upd({ expectedSalesVolume: v ?? 1 })
                    if (errors.expectedSalesVolume) setErrors((x) => ({ ...x, expectedSalesVolume: undefined }))
                  }}
                  suffix="個"
                  required
                />
                {errors.expectedSalesVolume && (
                  <p className="mt-1 text-xs text-red-500">{errors.expectedSalesVolume}</p>
                )}
              </div>
              <NumberInput
                label="値引率"
                value={form.discountRate}
                onChange={(v) => upd({ discountRate: v ?? 0 })}
                suffix="%"
              />
            </div>
          </div>

          {/* Cost */}
          <div className="card p-4 space-y-4">
            <div className="section-title">原価情報</div>
            <NumberInput
              label="製造原価（1個あたり）"
              value={form.unitCost}
              onChange={(v) => upd({ unitCost: v ?? 0 })}
              prefix="¥"
            />
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="配送料（1件あたり）"
                value={form.shippingCost}
                onChange={(v) => upd({ shippingCost: v ?? 0 })}
                prefix="¥"
              />
              <NumberInput
                label="決済手数料率"
                value={form.paymentFeeRate}
                onChange={(v) => upd({ paymentFeeRate: v ?? 0 })}
                suffix="%"
              />
            </div>
            <NumberInput
              label="月額固定費（この商品への割り当て分）"
              value={form.monthlyFixedCost}
              onChange={(v) => upd({ monthlyFixedCost: v ?? 0 })}
              prefix="¥"
              hint="家賃・人件費など月額コストの配分額"
            />
          </div>

          {/* Sales channels */}
          <div className="card p-4 space-y-3">
            <div className="section-title">販売チャネル</div>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleChannel(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                    ${form.salesChannels.includes(c.value)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                    }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Memo */}
          <div className="card p-4">
            <label className="label">備考</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="メモ、注意事項、仕入れ先など"
              value={form.memo}
              onChange={(e) => upd({ memo: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSave({ draft: true })}
              disabled={saving}
              className="w-full py-3 rounded-md border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              下書きとして保存
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>

          {!isNew && (
            <div className="sm:hidden grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={saving}
                className="w-full py-2.5 rounded-md border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50 disabled:opacity-50"
              >
                複製
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={saving}
                className="w-full py-2.5 rounded-md border border-red-200 bg-white text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
              >
                削除
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="商品を削除しますか？"
        message={`「${form.name}」を削除します。\nこの操作は取り消せません。`}
        confirmLabel="削除する"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
