import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { nanoid } from '../../lib/nanoid'
import { exportDocumentToPDF } from '../../lib/exporters/pdf'
import { exportDocumentToExcel } from '../../lib/exporters/excel'
import type { Document, DocumentItem } from '../../types'
import { fmt } from '../../lib/calculations'

export default function DocumentsNew() {
  const navigate = useNavigate()
  const { products, selectedProductIds, currentProject, addDocument, clearSelection } = useStore()

  const preSelected = products.filter((p) => selectedProductIds.includes(p.id))

  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [issuerName, setIssuerName] = useState('')
  const [memo, setMemo] = useState('')
  const [items, setItems] = useState<DocumentItem[]>(
    preSelected.map((p) => ({
      productId: p.id,
      productName: p.name,
      productCode: p.code,
      quantity: 1,
      unitPrice: p.sellingPrice,
      subtotal: p.sellingPrice,
      memo: '',
    }))
  )
  const [exporting, setExporting] = useState(false)

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0)
  const tax = Math.round(subtotal * 0.1)
  const total = subtotal + tax

  const updateItem = (idx: number, patch: Partial<DocumentItem>) => {
    setItems((prev) => {
      const next = [...prev]
      const item = { ...next[idx], ...patch }
      item.subtotal = item.quantity * item.unitPrice
      next[idx] = item
      return next
    })
  }

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        productName: '',
        productCode: '',
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
        memo: '',
      },
    ])
  }

  const buildDoc = (): Document => ({
    id: nanoid(),
    projectId: currentProject?.id ?? '',
    type: 'purchase_order',
    title: '発注書',
    issueDate,
    dueDate,
    recipientName,
    issuerName,
    items,
    subtotal,
    tax,
    total,
    memo,
    createdAt: new Date().toISOString(),
  })

  const handleSaveAndExportPDF = async () => {
    const doc = buildDoc()
    addDocument(doc)
    clearSelection()
    setExporting(true)
    try {
      await exportDocumentToPDF(doc)
    } finally {
      setExporting(false)
    }
  }

  const handleSaveAndExportExcel = () => {
    const doc = buildDoc()
    addDocument(doc)
    clearSelection()
    exportDocumentToExcel(doc)
  }

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-bold text-gray-900 text-base">発注書を作成</h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Header info */}
          <div className="card p-4 space-y-4">
            <div className="section-title">発注書情報</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">発注先名</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="株式会社○○"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">発注者名</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="自分の名前・屋号"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">発行日</label>
                <input
                  type="date"
                  className="input-field"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="label">納期</label>
                <input
                  type="date"
                  className="input-field"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="section-title">発注明細</div>
              <button
                type="button"
                onClick={addItem}
                className="btn-ghost text-sm text-brand-600"
              >
                + 行を追加
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="label">商品名</label>
                      <input
                        type="text"
                        className="input-field"
                        value={item.productName}
                        onChange={(e) => updateItem(idx, { productName: e.target.value })}
                        placeholder="商品名"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="flex-shrink-0 mt-5 p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="label">数量</label>
                      <input
                        type="number"
                        className="input-field"
                        value={item.quantity}
                        min={1}
                        onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <label className="label">単価</label>
                      <input
                        type="number"
                        className="input-field"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="label">小計</label>
                      <div className="input-field bg-gray-100 text-gray-700 font-medium">
                        {fmt(item.subtotal)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-sm">「行を追加」で明細を追加してください</div>
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="card p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>小計</span>
              <span className="font-medium">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>消費税（10%）</span>
              <span className="font-medium">{fmt(tax)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
              <span>合計金額</span>
              <span className="text-brand-700">{fmt(total)}</span>
            </div>
          </div>

          {/* Memo */}
          <div className="card p-4">
            <label className="label">備考</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="特記事項など"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {/* Export buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-10">
            <button
              type="button"
              onClick={handleSaveAndExportPDF}
              disabled={exporting || items.length === 0}
              className="btn-primary py-4 flex items-center justify-center gap-2"
            >
              <span>📄</span>
              <span>{exporting ? '生成中...' : 'PDF出力'}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAndExportExcel}
              disabled={items.length === 0}
              className="btn-secondary py-4 flex items-center justify-center gap-2"
            >
              <span>📊</span>
              <span>Excel出力</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
