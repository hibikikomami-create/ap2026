import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../../store'
import { SAMPLE_PROJECT, SAMPLE_PRODUCTS } from '../../lib/sampleData'
import { ProductCard } from './ProductCard'
import { ProductTable } from './ProductTable'
import { BulkActionBar } from './BulkActionBar'
import type { FilterConfig, SortConfig } from '../../types'
import { calcProduct } from '../../lib/calculations'

type ViewMode = 'card' | 'table'

const defaultFilter: FilterConfig = { status: 'all', channel: 'all', search: '' }

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isSample = searchParams.get('sample') === '1'

  const {
    currentProject, products: storeProducts, selectedProductIds,
    deleteProduct, duplicateProduct,
    toggleProductSelection, selectAllProducts, clearSelection,
    bulkUpdateStatus, bulkDelete,
  } = useStore()

  const [viewMode, setViewMode] = useState<ViewMode>(
    window.innerWidth >= 768 ? 'table' : 'card'
  )
  const [filter, setFilter] = useState<FilterConfig>(defaultFilter)
  const [sort, setSort] = useState<SortConfig>({ key: 'createdAt', order: 'desc' })


  const project = isSample ? SAMPLE_PROJECT : currentProject
  const rawProducts = isSample ? SAMPLE_PRODUCTS : storeProducts.filter(
    (p) => currentProject ? p.projectId === currentProject.id : true
  )

  useEffect(() => {
    if (!isSample && !currentProject) {
      navigate('/')
    }
  }, [isSample, currentProject, navigate])

  useEffect(() => {
    const handler = () => setViewMode(window.innerWidth >= 768 ? 'table' : 'card')
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const filteredProducts = useMemo(() => {
    let list = [...rawProducts]

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
      const calc = (p: typeof a) => calcProduct(p)
      let av: any, bv: any

      if (k === 'grossProfit') {
        av = calc(a).grossProfit; bv = calc(b).grossProfit
      } else if (k === 'grossMargin') {
        av = calc(a).grossMargin; bv = calc(b).grossMargin
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
  }, [rawProducts, filter, sort])

  const handleToggleAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      clearSelection()
    } else {
      selectAllProducts(filteredProducts.map((p) => p.id))
    }
  }

  const handleDelete = (id: string) => {
    if (isSample) return
    if (confirm('この商品を削除しますか？')) deleteProduct(id)
  }

  const handleBulkDelete = () => {
    if (isSample) return
    if (confirm(`${selectedProductIds.length}件の商品を削除しますか？`)) {
      bulkDelete(selectedProductIds)
      clearSelection()
    }
  }

  const handleCreateDocument = () => {
    navigate('/documents/new')
  }

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <div>
                <h1 className="font-bold text-gray-900 text-base leading-tight">
                  {project?.name || 'マイシート'}
                  {isSample && <span className="ml-2 badge bg-yellow-100 text-yellow-700">サンプル</span>}
                </h1>
                <div className="text-xs text-gray-400">{rawProducts.length}件の商品</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('card')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-white shadow text-brand-600' : 'text-gray-400'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow text-brand-600' : 'text-gray-400'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
              {!isSample && (
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
              )}
            </div>
          </div>

          {/* Filter bar */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <div className="relative flex-1 min-w-[140px]">
              <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            <div className="text-gray-500 text-lg font-medium mb-2">商品がまだありません</div>
            <div className="text-gray-400 text-sm mb-6">商品を追加して管理を始めましょう</div>
            {!isSample && (
              <button
                type="button"
                onClick={() => navigate('/products/new')}
                className="btn-primary"
              >
                最初の商品を追加する
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <div className="card overflow-hidden">
            <ProductTable
              products={filteredProducts}
              selectedIds={isSample ? [] : selectedProductIds}
              onToggle={isSample ? () => {} : toggleProductSelection}
              onToggleAll={isSample ? () => {} : handleToggleAll}
              onEdit={(id) => navigate(`/products/${id}`)}
              onDuplicate={isSample ? () => {} : duplicateProduct}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-20">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                selected={!isSample && selectedProductIds.includes(product.id)}
                onToggle={() => !isSample && toggleProductSelection(product.id)}
                onEdit={() => navigate(`/products/${product.id}`)}
                onDuplicate={() => !isSample && duplicateProduct(product.id)}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile add button */}
      {!isSample && (
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
      )}

      {/* Bulk action bar */}
      {!isSample && (
        <BulkActionBar
          count={selectedProductIds.length}
          onClearSelection={clearSelection}
          onBulkStatus={(s) => bulkUpdateStatus(selectedProductIds, s)}
          onBulkDelete={handleBulkDelete}
          onCreateDocument={handleCreateDocument}
        />
      )}
    </div>
  )
}
