import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { BulkActionBar } from './BulkActionBar'
import { calcProduct, fmt, fmtPct } from '../../lib/calculations'
import { statusBadge } from '../../components/common/Badge'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { showToast } from '../../components/common/Toast'
import { buildCsv, downloadCsv, makeCsvFilename, type CsvColumn } from '../../lib/exporters/csv'
import type { FilterConfig, SortConfig, Product, ProductStatus, SalesChannel } from '../../types'

const defaultFilter: FilterConfig = { status: 'all', channel: 'all', search: '' }
const PAGE_SIZES = [10, 20, 50, 100] as const
type PageSize = typeof PAGE_SIZES[number]

const STATUS_LABEL: Record<ProductStatus, string> = {
  active: '販売中',
  inactive: '停止中',
  draft: '下書き',
  discontinued: '廃番',
}

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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(20)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

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

  useEffect(() => {
    setPage(1)
  }, [filter.search, filter.status, filter.channel, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const pageEnd = Math.min(pageStart + pageSize, filteredProducts.length)
  const pageRows = filteredProducts.slice(pageStart, pageEnd)

  const allSelected =
    pageRows.length > 0 && pageRows.every((p) => selectedProductIds.includes(p.id))

  const handleToggleAll = () => {
    if (allSelected) clearSelection()
    else selectAllProducts(pageRows.map((p) => p.id))
  }

  const handleRequestDelete = (product: Product) => setDeleteTarget(product)

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteProduct(deleteTarget.id)
    showToast('商品を削除しました', 'success')
    setDeleteTarget(null)
  }

  const handleDuplicate = (id: string, name: string) => {
    duplicateProduct(id)
    showToast(`「${name}」を複製しました`, 'success')
  }

  const handleBulkStatus = (s: ProductStatus) => {
    const n = selectedProductIds.length
    bulkUpdateStatus(selectedProductIds, s)
    showToast(`${n}件のステータスを「${STATUS_LABEL[s]}」に変更しました`, 'success')
  }

  const confirmBulkDelete = () => {
    const n = selectedProductIds.length
    bulkDelete(selectedProductIds)
    clearSelection()
    setBulkDeleteOpen(false)
    showToast(`${n}件の商品を削除しました`, 'success')
  }

  const handleExportCsv = () => {
    const source =
      selectedProductIds.length > 0
        ? filteredProducts.filter((p) => selectedProductIds.includes(p.id))
        : filteredProducts
    if (source.length === 0) {
      showToast('エクスポート対象がありません', 'error')
      return
    }
    const columns: CsvColumn<Product>[] = [
      { header: '商品名',       value: (p) => p.name },
      { header: '品番',         value: (p) => p.code },
      { header: 'カテゴリ',     value: (p) => p.category },
      { header: 'ステータス',   value: (p) => STATUS_LABEL[p.status] ?? p.status },
      { header: '上代',         value: (p) => p.sellingPrice },
      { header: '卸価格',       value: (p) => p.wholesalePrice },
      { header: '原価',         value: (p) => p.unitCost },
      { header: '月間販売数',   value: (p) => p.expectedSalesVolume },
      { header: '粗利率(%)',    value: (p) => calcProduct(p).grossMargin.toFixed(1) },
      { header: '月間粗利',     value: (p) => calcProduct(p).grossProfit },
      { header: 'チャネル',     value: (p) => p.salesChannels.join('|') },
      { header: 'カラー',       value: (p) => p.colors.join('|') },
      { header: 'サイズ',       value: (p) => p.sizes.join('|') },
      { header: '登録日',       value: (p) => p.createdAt.slice(0, 10) },
    ]
    downloadCsv(makeCsvFilename('products'), buildCsv(source, columns))
    showToast(`${source.length}件をCSV出力しました`, 'success')
  }

  const hasActiveFilter = !!filter.search || filter.status !== 'all'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">商品管理</h1>
            <p className="page-subtitle">{products.length}件登録中</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="hidden sm:flex btn-ghost items-center gap-1.5 border border-slate-200 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV出力
            </button>
            <button
              type="button"
              onClick={() => navigate('/products/new')}
              className="btn-primary flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">商品追加</span>
              <span className="sm:hidden">追加</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-4 md:px-6 pb-3 space-y-2 md:space-y-0 md:flex md:items-center md:gap-3 md:flex-wrap">
          {/* Search — full width on mobile */}
          <div className="relative w-full md:flex-1 md:min-w-[200px] md:max-w-xs">
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="商品名・品番で検索"
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
              value={filter.search}
              onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
          {/* Selects row */}
          <div className="flex items-center gap-2">
            <select
              className="flex-1 md:flex-none text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
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
              className="flex-1 md:flex-none text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              value={`${sort.key}-${sort.order}`}
              onChange={(e) => {
                const [key, order] = e.target.value.split('-')
                setSort({ key: key as SortConfig['key'], order: order as 'asc' | 'desc' })
              }}
            >
              <option value="createdAt-desc">新しい順</option>
              <option value="createdAt-asc">古い順</option>
              <option value="name-asc">商品名順</option>
              <option value="sellingPrice-desc">価格（高い順）</option>
              <option value="grossMargin-desc">粗利率（高い順）</option>
            </select>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => setFilter(defaultFilter)}
                className="text-xs text-slate-500 hover:text-slate-700 underline whitespace-nowrap"
              >
                クリア
              </button>
            )}

            <div className="ml-auto text-xs text-slate-500 whitespace-nowrap">
              {filteredProducts.length !== products.length
                ? `${filteredProducts.length} / ${products.length}件`
                : `${products.length}件`}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="page-content flex-1">
        {filteredProducts.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
            </svg>
            <div className="text-slate-500 font-medium mb-1">
              {hasActiveFilter ? '該当する商品がありません' : '商品がまだ登録されていません'}
            </div>
            <div className="text-sm text-slate-400 mb-5">
              {hasActiveFilter
                ? '検索条件を変更してみてください'
                : '商品を追加して収益管理を始めましょう'}
            </div>
            {hasActiveFilter ? (
              <button type="button" onClick={() => setFilter(defaultFilter)} className="btn-ghost border border-slate-200 text-sm">
                フィルターをクリア
              </button>
            ) : (
              <button type="button" onClick={() => navigate('/products/new')} className="btn-primary">
                商品を追加する
              </button>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            {/* ── Mobile card list ─────────────────────────── */}
            <div className="md:hidden divide-y divide-slate-100">
              {pageRows.map((product) => {
                const calc = calcProduct(product)
                return (
                  <div
                    key={product.id}
                    className="mobile-card-item"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-medium text-slate-900 text-sm leading-tight">{product.name}</span>
                        {statusBadge(product.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="tabular-nums text-slate-600 font-medium">{fmt(product.sellingPrice)}</span>
                        <span className={`font-semibold tabular-nums ${
                          calc.grossMargin >= 30 ? 'text-green-600' : calc.grossMargin >= 15 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          粗利 {fmtPct(calc.grossMargin)}
                        </span>
                        {product.code && (
                          <span className="font-mono text-slate-400 text-[11px]">{product.code}</span>
                        )}
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-0.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleDuplicate(product.id, product.name)}
                        className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                        title="複製"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestDelete(product)}
                        className="p-2.5 rounded-xl text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors"
                        title="削除"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Desktop table ─────────────────────────────── */}
            <div className="hidden md:block overflow-x-auto">
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
                    <th>品番</th>
                    <th className="text-right">上代</th>
                    <th className="hidden lg:table-cell text-right">原価</th>
                    <th className="hidden lg:table-cell text-right">粗利（月間）</th>
                    <th className="text-right">粗利率</th>
                    <th>ステータス</th>
                    <th className="text-center w-28">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((product) => {
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
                        <td className="text-slate-500 font-mono text-xs">
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
                              onClick={() => handleDuplicate(product.id, product.name)}
                              className="p-1.5 rounded text-slate-400 hover:bg-slate-100 transition-colors"
                              title="複製"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRequestDelete(product)}
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

            {/* ── Pagination ────────────────────────────────── */}
            {/* Mobile pagination */}
            <div className="md:hidden px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="tabular-nums">
                {filteredProducts.length === 0 ? '0' : `${pageStart + 1}〜${pageEnd}`} / {filteredProducts.length}件
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 text-sm"
                  aria-label="前へ"
                >
                  ‹
                </button>
                <span className="px-2 tabular-nums">{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 text-sm"
                  aria-label="次へ"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Desktop pagination */}
            <div className="hidden md:flex px-4 py-3 border-t border-slate-100 flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>表示件数</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value) as PageSize)}
                  className="border border-slate-200 rounded-md px-2 py-1 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>{n}件</option>
                  ))}
                </select>
                <span className="ml-2 tabular-nums">
                  {filteredProducts.length === 0 ? '0' : `${pageStart + 1}-${pageEnd}`} / {filteredProducts.length}件
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setPage(1)} disabled={currentPage <= 1} className="px-2 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50" aria-label="先頭へ">«</button>
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="px-2 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50" aria-label="前へ">‹</button>
                <span className="px-2 tabular-nums">{currentPage} / {totalPages}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-2 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50" aria-label="次へ">›</button>
                <button type="button" onClick={() => setPage(totalPages)} disabled={currentPage >= totalPages} className="px-2 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50" aria-label="末尾へ">»</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BulkActionBar
        count={selectedProductIds.length}
        onClearSelection={clearSelection}
        onBulkStatus={handleBulkStatus}
        onBulkDelete={() => setBulkDeleteOpen(true)}
        onCreateDocument={() => navigate('/documents/new')}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="商品を削除しますか？"
        message={deleteTarget ? `「${deleteTarget.name}」を削除します。\nこの操作は取り消せません。` : ''}
        confirmLabel="削除する"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="選択した商品を削除しますか？"
        message={`${selectedProductIds.length}件をまとめて削除します。\nこの操作は取り消せません。`}
        confirmLabel="削除する"
        danger
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  )
}
