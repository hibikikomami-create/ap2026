import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store'
import { nanoid } from '../../lib/nanoid'
import { exportDocumentToPDF } from '../../lib/exporters/pdf'
import { exportDocumentToExcel } from '../../lib/exporters/excel'
import { showToast } from '../../components/common/Toast'
import type { Document, DocumentItem } from '../../types'
import { fmt } from '../../lib/calculations'

export default function DocumentsNew() {
  const navigate = useNavigate()
  const { id: editId } = useParams<{ id?: string }>()
  const {
    products,
    selectedProductIds,
    currentProject,
    projects,
    documents,
    addDocument,
    updateDocument,
    clearSelection,
    setCurrentProject,
    createProject,
  } = useStore()

  const editingDoc = editId ? documents.find((d) => d.id === editId) ?? null : null
  const isEdit = !!editingDoc

  // currentProject が null の場合の自動リカバリ（プロジェクト選択 or デフォルト作成）
  useEffect(() => {
    if (currentProject) return
    if (projects.length > 0) {
      setCurrentProject(projects[0])
    } else {
      createProject({
        name: 'マイシート',
        businessType: 'product',
        salesChannels: [],
        userRole: 'owner',
        selectedCostItems: [],
      })
    }
  }, [currentProject, projects, setCurrentProject, createProject])

  // 編集モードで該当IDが見つからない場合、一覧へ戻す
  useEffect(() => {
    if (editId && !editingDoc) {
      showToast('発注書が見つかりませんでした', 'error')
      navigate('/documents', { replace: true })
    }
  }, [editId, editingDoc, navigate])

  // 新規作成時: 選択中の商品を明細に取り込んだら、商品一覧の選択状態を即座にクリア
  useEffect(() => {
    if (!isEdit && selectedProductIds.length > 0) {
      clearSelection()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const preSelected = products.filter((p) => selectedProductIds.includes(p.id))

  const [issueDate, setIssueDate] = useState(
    editingDoc?.issueDate ?? new Date().toISOString().slice(0, 10)
  )
  const [dueDate, setDueDate] = useState(editingDoc?.dueDate ?? '')
  const [recipientName, setRecipientName] = useState(editingDoc?.recipientName ?? '')
  const [issuerName, setIssuerName] = useState(editingDoc?.issuerName ?? '')
  const [memo, setMemo] = useState(editingDoc?.memo ?? '')
  const [items, setItems] = useState<DocumentItem[]>(
    editingDoc?.items ??
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
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ recipient?: string; items?: string }>({})

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
    id: editingDoc?.id ?? nanoid(),
    projectId: editingDoc?.projectId ?? currentProject?.id ?? (projects[0]?.id ?? ''),
    type: 'purchase_order',
    title: editingDoc?.title ?? '発注書',
    issueDate,
    dueDate,
    recipientName,
    issuerName,
    items,
    subtotal,
    tax,
    total,
    memo,
    createdAt: editingDoc?.createdAt ?? new Date().toISOString(),
  })

  const persistDoc = (doc: Document) => {
    if (isEdit) updateDocument(doc.id, doc)
    else addDocument(doc)
  }

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!recipientName.trim()) next.recipient = '発注先名を入力してください'
    if (items.length === 0) next.items = '明細を1件以上追加してください'
    setErrors(next)
    if (next.recipient || next.items) {
      showToast(next.recipient ?? next.items ?? '入力内容を確認してください', 'error')
      return false
    }
    return true
  }

  const handleSaveDraft = async () => {
    if (!recipientName.trim() || items.length === 0) {
      const msg = !recipientName.trim()
        ? '発注先名を入力してください'
        : '明細を1件以上追加してください'
      setErrors({
        recipient: !recipientName.trim() ? msg : undefined,
        items: items.length === 0 ? '明細を1件以上追加してください' : undefined,
      })
      showToast(msg, 'error')
      return
    }
    setErrors({})
    setSaving(true)
    try {
      const doc = buildDoc()
      const draftTitle = doc.title.includes('（下書き）')
        ? doc.title
        : `${doc.title}（下書き）`
      persistDoc({ ...doc, title: draftTitle })
      clearSelection()
      showToast(isEdit ? '下書きを更新しました' : '下書きとして保存しました', 'success')
      await new Promise((r) => setTimeout(r, 120))
      navigate('/documents')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      persistDoc(buildDoc())
      clearSelection()
      showToast(isEdit ? '発注書を更新しました' : '発注書を保存しました', 'success')
      await new Promise((r) => setTimeout(r, 120))
      navigate('/documents')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAndExportPDF = async () => {
    if (!validate()) return
    const doc = buildDoc()
    persistDoc(doc)
    clearSelection()
    setExporting(true)
    try {
      await exportDocumentToPDF(doc)
      showToast('PDFを生成しました', 'success')
    } catch (e) {
      showToast('PDF生成に失敗しました', 'error')
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  const handleSaveAndExportExcel = () => {
    if (!validate()) return
    try {
      const doc = buildDoc()
      persistDoc(doc)
      clearSelection()
      exportDocumentToExcel(doc)
      showToast('Excelを生成しました', 'success')
    } catch (e) {
      showToast('Excel生成に失敗しました', 'error')
      console.error(e)
    }
  }

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/documents')}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all"
              aria-label="戻る"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-bold text-gray-900 text-base truncate">
              {isEdit ? '発注書を編集' : '発注書を作成'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving || exporting}
              className="text-sm px-3 py-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              下書き保存
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || exporting}
              className="text-sm px-3 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : isEdit ? '更新する' : '保存する'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Header info */}
          <div className="card p-4 space-y-4">
            <div className="section-title">発注書情報</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">発注先名 <span className="text-brand-500">*</span></label>
                <input
                  type="text"
                  className={`input-field ${errors.recipient ? 'border-red-400 focus:ring-red-300' : ''}`}
                  placeholder="株式会社○○"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value)
                    if (errors.recipient) setErrors((x) => ({ ...x, recipient: undefined }))
                  }}
                />
                {errors.recipient && (
                  <p className="mt-1 text-xs text-red-500">{errors.recipient}</p>
                )}
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
                <div className={`text-center py-8 rounded-lg border border-dashed ${errors.items ? 'border-red-300 bg-red-50/40' : 'border-slate-200 text-gray-400'}`}>
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-sm">{errors.items ?? '「行を追加」で明細を追加してください'}</div>
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
