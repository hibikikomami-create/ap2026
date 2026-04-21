import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { BulkActionBar } from './BulkActionBar'
import { calcProduct, fmt, fmtPct } from '../../lib/calculations'
import { statusBadge } from '../../components/common/Badge'
import type { FilterConfig, SortConfig, ProductStatus, SalesChannel } from '../../types'

const defaultFilter: FilterConfig = { status: 'all', channel: 'all', search: '' }

export default function ProductsPage() {
  const navigate = useNavigate()
  const {
    products,
    selectedProductIds,
    deleteProduct,
    duplicateProduct,
    toggleProductSelection,
    selectAllProducts,
    clearSelection,
    bulkUpdateStatus,
    bulkDelete,
  } = useStore()

  const [filter, setFilter] = useState<FilterConfig>(defaultFilter)
  const [sort, setSort] = useState<SortConfig>({ key: 'createdAt', order: 'desc' })

  const filteredProducts = useMemo(() => {
    let list = [...products]

    if (filter.status !== 'all') {
      list = list.filter((p) => p.status === filter.status)
    }
    if (filter.channel !== 'all') {
      list = list.filter((p) => p.salesChannels.includes(filter.channel as SalesChannel))
    }
    if (filter.search) {
      const q = filter.search.toLowerCase()
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      const k = sort.key
      let av: number | string
      let bv: number | string
      if (k === 'grossProfit') {
        av = calcProduct(a).grossProfit; bv = calcProduct(b).grossProfit
      } else if (k === 'grossMargin') {
        av = calcProduct(a).grossMargin; bv = calcProduct(b).grossMargin
      } else {
        av = (a as unknown as Record<string, unknown>)[k as string] as string ?? ''
        bv = (b as unknown as Record<string, unknown>)[k as string] as string ?? ''
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.order === 'asc' ? av - bv : bv - av
      }
      return sort.order === 'asc'
        ? String(av).localeCompare(String(bv), 'ja')
        : String(bv).localeCompare(String(av), 'ja')
    })

    return list
  }, [products, filter, sort])

  const allSelected = filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length

  const handleToggleAll = () => {
    if (allSelected) clearSelection()
    else selectAllProducts(filteredProducts.map((p) => p.id))
  }

  const handleDelete = (id: string) => {
    if (confirm('この商品を削除しますか？')) deleteProduct(id)
  }

  const handleBulkDelete = () => {
    if (confirm(`${selectedProductIds.length}件の商品を削除しますか？`)) {
      bulkDelete(selectedProductIds)
      clearSelection()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">商品管理</h1>
            <p className="page-subtitle">{products.length}件登録中</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/products/new')}
            className="btn-primary flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            商品追加
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 pb-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="商品名・品番で検索"
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
              value={filter.search}
              onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
          <select
            className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as ProductStatus | 'all' }))}
          >
            <option value="all">全ステータス</option>
            <option value="active">販売中</option>
            <option value="inactive">停止中</option>
            <option value="draft">下書き</option>
            <option value="discontinued">廃番</option>
          </select>
          <select
            className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={`${sort.key}-${sort.order}`}
            onChange={(e) => {
              const [key, order] = e.target.value.split('-')
              setSort({ key: key as SortConfig['key'], order: order as 'asc' | 'desc' })
            }}
          >
            <option value="createdAt-desc">登録日（新しい順）</option>
            <option value="createdAt-asc">登録日（古い順）</option>
            <option value="name-asc">商品名順</option>
            <option value="sellingPrice-desc">価格（高い順）</option>
            <option value="grossMargin-desc">粗利率（高い順）</option>
          </select>

          {filter.search || filter.status !== 'all' ? (
            <button
              type="button"
              onClick={() => setFilter(defaultFilter)}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              クリア
            </button>
          ) : null}

          <div className="ml-auto text-sm text-slate-500">
            {filteredProducts.length !== products.length
              ? `${filteredProducts.length} / ${products.length}件`
              : `${products.length}件`}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="page-content flex-1">
        {filteredProducts.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
            </svg>
            <div className="text-slate-500 font-medium mb-1">
              {filter.search || filter.status !== 'all' ? '該当する商品がありません' : '商品がまだ登録されていません'}
            </div>
            <div className="text-sm text-slate-400 mb-5">
              {filter.search || filter.status !== 'all'
                ? '検索条件を変更してみてください'
                : '商品を追加して収益管理を始めましょう'}
            </div>
            {!(filter.search || filter.status !== 'all') && (
              <button type="button" onClick={() => navigate('/products/new')} className="btn-primary">
                商品を追加する
              </button>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table min-w-[700px]">
                <thead>
                  <tr>
                    <th className="w-10 px-4">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleToggleAll}
                        className="accent-brand-600 w-3.5 h-3.5"
                      />
                    </th>
                    <th>商品名</th>
                    <th className="hidden md:table-cell">品番</th>
                    <th className="text-right">上代</th>
                    <th className="hidden lg:table-cell text-right">原価</th>
                    <th className="hidden lg:table-cell text-right">粗利（月間）</th>
                    <th className="text-right">粗利率</th>
                    <th>ステータス</th>
                    <th className="text-center w-28">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const calc = calcProduct(product)
                    const sel = selectedProductIds.includes(product.id)
                    return (
                      <tr key={product.id} className={sel ? 'bg-brand-50/40' : ''}>
                        <td className="px-4">
                          <input
                            type="checkbox"
                            checked={sel}
                            onChange={() => toggleProductSelection(product.id)}
                            className="accent-brand-600 w-3.5 h-3.5"
                          />
                        </td>
                        <td
                          className="font-medium text-slate-900 cursor-pointer hover:text-brand-700"
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          {product.name}
                        </td>
                        <td className="hidden md:table-cell text-slate-500 font-mono text-xs">
                          {product.code || '—'}
                        </td>
                        <td className="text-right tabular-nums">{fmt(product.sellingPrice)}</td>
                        <td className="hidden lg:table-cell text-right tabular-nums text-slate-500">
                          {fmt(product.unitCost)}
                        </td>
                        <td className="hidden lg:table-cell text-right tabular-nums font-medium text-brand-700">
                          {fmt(calc.grossProfit)}
                        </td>
                        <td className={`text-right tabular-nums font-semibold
                          ${calc.grossMargin >= 30 ? 'text-green-600' : calc.grossMargin >= 15 ? 'text-amber-600' : 'text-red-500'}`}
                        >
                          {fmtPct(calc.grossMargin)}
                        </td>
                        <td>{statusBadge(product.status)}</td>
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => navigate(`/products/${product.id}`)}
                              className="p-1.5 rounded text-brand-600 hover:bg-brand-50 transition-colors"
                              title="編集"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicateProduct(product.id)}
                              className="p-1.5 rounded text-slate-400 hover:bg-slate-100 transition-colors"
                              title="複製"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 rounded text-red-400 hover:bg-red-50 transition-colors"
                              title="削除"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          </div>
        )}
      </div>

      <BulkActionBar
        count={selectedProductIds.length}
        onClearSelection={clearSelection}
        onBulkStatus={(s) => bulkUpdateStatus(selectedProductIds, s)}
        onBulkDelete={handleBulkDelete}
        onCreateDocument={() => navigate('/documents/new')}
      />
    </div>
  )
}
