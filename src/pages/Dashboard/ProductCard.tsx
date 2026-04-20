import type { Product } from '../../types'
import { calcProduct, fmt, fmtPct } from '../../lib/calculations'
import { statusBadge } from '../../components/common/Badge'

interface Props {
  product: Product
  selected: boolean
  onToggle: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function ProductCard({ product, selected, onToggle, onEdit, onDuplicate, onDelete }: Props) {
  const calc = calcProduct(product)

  return (
    <div
      className={`card p-4 transition-all duration-150 ${selected ? 'ring-2 ring-brand-400 bg-brand-50/30' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggle}
          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
            ${selected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-gray-900 text-base truncate">{product.name}</div>
              {product.code && (
                <div className="text-xs text-gray-400 mt-0.5">{product.code}</div>
              )}
            </div>
            <div className="flex-shrink-0">{statusBadge(product.status)}</div>
          </div>

          {/* Metrics grid */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div>
              <div className="text-xs text-gray-400">販売価格</div>
              <div className="font-semibold text-gray-900 text-sm">{fmt(product.sellingPrice)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">粗利</div>
              <div className="font-semibold text-brand-600 text-sm">{fmt(calc.grossProfit / (product.expectedSalesVolume || 1))}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">粗利率</div>
              <div className={`font-semibold text-sm ${calc.grossMargin >= 30 ? 'text-green-600' : calc.grossMargin >= 15 ? 'text-yellow-600' : 'text-red-500'}`}>
                {fmtPct(calc.grossMargin)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 btn-secondary py-2 text-sm"
        >
          編集
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
          title="複製"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-xl border border-gray-200 text-red-400 hover:bg-red-50 active:scale-95 transition-all"
          title="削除"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
