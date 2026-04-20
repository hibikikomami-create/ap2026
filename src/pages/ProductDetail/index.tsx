import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store'
import { NumberInput } from '../../components/common/NumberInput'
import { calcProduct, fmt, fmtPct } from '../../lib/calculations'
import type { Product, ProductStatus, SalesChannel } from '../../types'


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

export default function ProductDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'

  const { currentProject, products, addProduct, updateProduct } = useStore()

  const existing = !isNew ? products.find((p) => p.id === id) : null

  const [form, setForm] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    projectId: currentProject?.id ?? '',
    name: '',
    code: '',
    sellingPrice: 0,
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

  useEffect(() => {
    if (existing) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = existing
      setForm(rest)
    }
  }, [existing])

  const calc = calcProduct({ ...form, id: 'preview', createdAt: '', updatedAt: '' })

  const upd = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  const handleSave = () => {
    if (!form.name.trim()) {
      alert('商品名を入力してください')
      return
    }
    if (isNew) {
      addProduct(form)
    } else if (id) {
      updateProduct(id, form)
    }
    navigate('/dashboard')
  }

  const toggleChannel = (ch: SalesChannel) => {
    const cur = form.salesChannels
    upd({ salesChannels: cur.includes(ch) ? cur.filter((c) => c !== ch) : [...cur, ch] })
  }

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-bold text-gray-900 text-base">
              {isNew ? '商品を追加' : '商品を編集'}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary py-2 px-5 text-sm"
          >
            保存
          </button>
        </div>
      </div>

      {/* Live preview bar */}
      <div className="bg-brand-600 text-white">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-4 overflow-x-auto text-sm">
          <div>
            <span className="text-brand-200 text-xs">粗利率</span>
            <span className={`ml-1.5 font-bold ${calc.grossMargin < 0 ? 'text-red-300' : 'text-white'}`}>
              {fmtPct(calc.grossMargin)}
            </span>
          </div>
          <div>
            <span className="text-brand-200 text-xs">月間粗利</span>
            <span className="ml-1.5 font-bold">{fmt(calc.grossProfit)}</span>
          </div>
          <div>
            <span className="text-brand-200 text-xs">月間純利益</span>
            <span className={`ml-1.5 font-bold ${calc.netProfit < 0 ? 'text-red-300' : 'text-white'}`}>
              {fmt(calc.netProfit)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-5 pb-10">
          {/* Basic info */}
          <div className="card p-4 space-y-4">
            <div className="section-title">基本情報</div>
            <div>
              <label className="label">商品名 <span className="text-brand-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="例：ハンドメイドキャンドル"
                value={form.name}
                onChange={(e) => upd({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">品番 / SKU</label>
              <input
                type="text"
                className="input-field"
                placeholder="例：HMC-001"
                value={form.code}
                onChange={(e) => upd({ code: e.target.value })}
              />
            </div>
            <div>
              <label className="label">ステータス</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => upd({ status: s.value })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                      ${form.status === s.value
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">販売チャネル</label>
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
          </div>

          {/* Selling conditions */}
          <div className="card p-4 space-y-4">
            <div className="section-title">販売条件</div>
            <NumberInput label="販売価格" value={form.sellingPrice} onChange={(v) => upd({ sellingPrice: v ?? 0 })} prefix="¥" required />
            <NumberInput label="想定販売数（月間）" value={form.expectedSalesVolume} onChange={(v) => upd({ expectedSalesVolume: v ?? 1 })} suffix="個" required />
            <NumberInput label="値引率" value={form.discountRate} onChange={(v) => upd({ discountRate: v ?? 0 })} suffix="%" hint="卸値引きなどがある場合に入力" />
          </div>

          {/* Cost info */}
          <div className="card p-4 space-y-4">
            <div className="section-title">原価情報</div>
            <NumberInput label="製造原価（1個あたり）" value={form.unitCost} onChange={(v) => upd({ unitCost: v ?? 0 })} prefix="¥" />
            <NumberInput label="配送料（1件あたり）" value={form.shippingCost} onChange={(v) => upd({ shippingCost: v ?? 0 })} prefix="¥" />
            <NumberInput label="決済手数料率" value={form.paymentFeeRate} onChange={(v) => upd({ paymentFeeRate: v ?? 0 })} suffix="%" hint="クレジット決済、ECサービスなど" />
            <NumberInput label="月額固定費（この商品に割り当てる分）" value={form.monthlyFixedCost} onChange={(v) => upd({ monthlyFixedCost: v ?? 0 })} prefix="¥" hint="家賃・光熱費・人件費など月額コストの配分額" />
          </div>

          {/* Memo */}
          <div className="card p-4 space-y-4">
            <div className="section-title">備考</div>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="メモ、注意事項など"
              value={form.memo}
              onChange={(e) => upd({ memo: e.target.value })}
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="btn-primary w-full py-4 text-lg"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  )
}
