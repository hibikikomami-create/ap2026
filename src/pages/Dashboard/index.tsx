import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { ProductCard } from './ProductCard'
import { ProductTable } from './ProductTable'
import { BulkActionBar } from './BulkActionBar'
import type { FilterConfig, SortConfig } from '../../types'
import { calcProduct } from '../../lib/calculations'

type ViewMode = 'card' | 'table'

const defaultFilter: FilterConfig = { status: 'all', channel: 'all', search: '' }

export default function Dashboard() {
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
    currentProject,
  } = useStore()

  const [viewMode, setViewMode] = useState<ViewMode>(
    window.innerWidth >= 768 ? 'table' : 'card'
  )
  const [filter, setFilter] = useState<FilterConfig>(defaultFilter)
  const [sort, setSort] = useState<SortConfig>({ key: 'createdAt', order: 'desc' })

  useEffect(() => {
    const handler = () => setViewMode(window.innerWidth >= 768 ? 'table' : 'card')
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const filteredProducts = useMemo(() => {
    let list = [...products]

    if (filter.status !== 'all') {
      list = list.filter((p) => p.status === filter.status)
    }
    if (filter.channel !== 'all') {
      list = list.filter((p) => p.salesChannels.includes(filter.channel as any))
    }
    if (filter.search) {
      const q = filter.search.toLowerCase()
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      const k = sort.key
      let av: any, bv: any
      if (k === 'grossProfit') {
        av = calcProduct(a).grossProfit; bv = calcProduct(b).grossProfit
      } else if (k === 'grossMargin') {
        av = calcProduct(a).grossMargin; bv = calcProduct(b).grossMargin
      } else {
        av = (a as any)[k] ?? ''; bv = (b as any)[k] ?? ''
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

  const handleToggleAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      clearSelection()
    } else {
      selectAllProducts(filteredProducts.map((p) => p.id))
    }
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
    <div className="flex flex-col min-h-svh">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-bold text-gray-900 text-base">商品管理</h1>
              <div className="text-xs text-gray-400">{products.length}件 · {currentProject?.name ?? 'すべて'}</div>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
                {(['card', 'table'] as ViewMode[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setViewMode(v)}
                    className={`p-1.5 rounded-md transition-all ${viewMode === v ? 'bg-white shadow text-brand-600' : 'text-gray-400'}`}
                  >
                    {v === 'card' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/products/new')}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">商品追加</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <div className="relative flex-1 min-w-[130px]">
              <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="商品名・品番で検索"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                value={filter.search}
                onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 whitespace-nowrap"
              value={filter.status}
              onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as any }))}
            >
              <option value="all">全ステータス</option>
              <option value="active">販売中</option>
              <option value="inactive">停止中</option>
              <option value="draft">下書き</option>
              <option value="discontinued">廃番</option>
            </select>
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 whitespace-nowrap"
              value={sort.key}
              onChange={(e) => setSort((s) => ({ ...s, key: e.target.value as any }))}
            >
              <option value="createdAt">作成日順</option>
              <option value="name">商品名順</option>
              <option value="sellingPrice">価格順</option>
              <option value="grossMargin">粗利率順</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📦</div>
            <div className="text-gray-500 text-lg font-medium mb-2">商品がありません</div>
            <div className="text-gray-400 text-sm mb-6">
              {filter.search || filter.status !== 'all'
                ? 'フィルターを変更してみてください'
                : '商品を追加して管理を始めましょう'}
            </div>
            <button
              type="button"
              onClick={() => navigate('/products/new')}
              className="btn-primary"
            >
              商品を追加する
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="card overflow-hidden">
            <ProductTable
              products={filteredProducts}
              selectedIds={selectedProductIds}
              onToggle={toggleProductSelection}
              onToggleAll={handleToggleAll}
              onEdit={(id) => navigate(`/products/${id}`)}
              onDuplicate={duplicateProduct}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-20">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                selected={selectedProductIds.includes(product.id)}
                onToggle={() => toggleProductSelection(product.id)}
                onEdit={() => navigate(`/products/${product.id}`)}
                onDuplicate={() => duplicateProduct(product.id)}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB for mobile */}
      <div className="sm:hidden fixed bottom-20 right-4 z-20">
        <button
          type="button"
          onClick={() => navigate('/products/new')}
          className="w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
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
