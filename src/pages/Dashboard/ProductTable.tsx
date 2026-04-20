import type { Product } from '../../types'
import { calcProduct, fmt, fmtPct } from '../../lib/calculations'
import { statusBadge } from '../../components/common/Badge'

interface Props {
  products: Product[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onToggleAll: () => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function ProductTable({ products, selectedIds, onToggle, onToggleAll, onEdit, onDuplicate, onDelete }: Props) {
  const allSelected = products.length > 0 && selectedIds.length === products.length

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-3 text-left w-10">
              <button
                type="button"
                onClick={onToggleAll}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                  ${allSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}
              >
                {allSelected && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </th>
            <th className="px-3 py-3 text-left text-gray-500 font-medium">商品名</th>
            <th className="px-3 py-3 text-left text-gray-500 font-medium">品番</th>
            <th className="px-3 py-3 text-right text-gray-500 font-medium">販売価格</th>
            <th className="px-3 py-3 text-right text-gray-500 font-medium">原価</th>
            <th className="px-3 py-3 text-right text-gray-500 font-medium">粗利（月間）</th>
            <th className="px-3 py-3 text-right text-gray-500 font-medium">粗利率</th>
            <th className="px-3 py-3 text-left text-gray-500 font-medium">ステータス</th>
            <th className="px-3 py-3 text-center text-gray-500 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => {
            const calc = calcProduct(product)
            const sel = selectedIds.includes(product.id)
            return (
              <tr
                key={product.id}
                className={`hover:bg-gray-50 transition-colors ${sel ? 'bg-brand-50/30' : ''}`}
              >
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onToggle(product.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                      ${sel ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}
                  >
                    {sel && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </td>
                <td className="px-3 py-3 font-medium text-gray-900">{product.name}</td>
                <td className="px-3 py-3 text-gray-500">{product.code || '—'}</td>
                <td className="px-3 py-3 text-right text-gray-900">{fmt(product.sellingPrice)}</td>
                <td className="px-3 py-3 text-right text-gray-600">{fmt(product.unitCost)}</td>
                <td className="px-3 py-3 text-right text-brand-700 font-medium">
                  {fmt(calc.grossProfit)}
                </td>
                <td className="px-3 py-3 text-right">
                  <span className={`font-semibold ${calc.grossMargin >= 30 ? 'text-green-600' : calc.grossMargin >= 15 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {fmtPct(calc.grossMargin)}
                  </span>
                </td>
                <td className="px-3 py-3">{statusBadge(product.status)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(product.id)}
                      className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                      title="編集"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicate(product.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                      title="複製"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      title="削除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
