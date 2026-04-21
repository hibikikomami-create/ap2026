import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { fmt } from '../../lib/calculations'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { showToast } from '../../components/common/Toast'
import { buildCsv, downloadCsv, makeCsvFilename, type CsvColumn } from '../../lib/exporters/csv'
import type { Document } from '../../types'

export default function DocumentsList() {
  const navigate = useNavigate()
  const { documents, deleteDocument, duplicateDocument, bulkDeleteDocuments } = useStore()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const filtered = useMemo(
    () =>
      documents
        .filter((d) =>
          !search ||
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          d.recipientName.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [documents, search]
  )

  const allSelected = filtered.length > 0 && filtered.every((d) => selected.has(d.id))

  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(filtered.map((d) => d.id)))
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const handleDuplicate = (id: string, title: string) => {
    duplicateDocument(id)
    showToast(`「${title}」を複製しました`, 'success')
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteDocument(deleteTarget.id)
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(deleteTarget.id)
      return next
    })
    showToast('発注書を削除しました', 'success')
    setDeleteTarget(null)
  }

  const confirmBulkDelete = () => {
    const ids = Array.from(selected)
    bulkDeleteDocuments(ids)
    showToast(`${ids.length}件の発注書を削除しました`, 'success')
    setSelected(new Set())
    setBulkDeleteOpen(false)
  }

  const handleExportCsv = () => {
    const source = selected.size > 0 ? filtered.filter((d) => selected.has(d.id)) : filtered
    if (source.length === 0) {
      showToast('エクスポート対象がありません', 'error')
      return
    }
    const columns: CsvColumn<Document>[] = [
      { header: 'タイトル',  value: (d) => d.title },
      { header: '発注先',   value: (d) => d.recipientName },
      { header: '発注者',   value: (d) => d.issuerName },
      { header: '発行日',   value: (d) => d.issueDate },
      { header: '納期',     value: (d) => d.dueDate ?? '' },
      { header: '品目数',   value: (d) => d.items.length },
      { header: '小計',     value: (d) => d.subtotal },
      { header: '消費税',   value: (d) => d.tax },
      { header: '合計',     value: (d) => d.total },
      { header: '備考',     value: (d) => d.memo ?? '' },
    ]
    downloadCsv(makeCsvFilename('documents'), buildCsv(source, columns))
    showToast(`${source.length}件をCSV出力しました`, 'success')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">発注書</h1>
            <p className="page-subtitle">{documents.length}件</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="btn-ghost flex items-center gap-1.5 border border-slate-200 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV出力
            </button>
            <button
              type="button"
              onClick={() => navigate('/documents/new')}
              className="btn-primary flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新規作成
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pb-3">
          <div className="relative max-w-xs">
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="タイトル・発注先で検索"
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="page-content flex-1">
        {filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-slate-500 font-medium mb-1">
              {search ? '該当する発注書がありません' : '発注書がまだありません'}
            </div>
            <div className="text-sm text-slate-400 mb-5">
              {search ? '検索条件を変更してみてください' : '商品を選んで発注書を作成できます'}
            </div>
            {!search && (
              <button type="button" onClick={() => navigate('/documents/new')} className="btn-primary">
                発注書を作成する
              </button>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            {selected.size > 0 && (
              <div className="bg-brand-50 border-b border-brand-100 px-4 py-2.5 flex items-center gap-3">
                <span className="text-sm font-medium text-brand-700">{selected.size}件を選択中</span>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="text-xs text-brand-600 hover:underline"
                >
                  選択をCSV出力
                </button>
                <button
                  type="button"
                  onClick={() => setBulkDeleteOpen(true)}
                  className="text-xs text-red-500 hover:underline"
                >
                  選択を削除
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="ml-auto text-xs text-slate-500 hover:underline"
                >
                  選択解除
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="data-table min-w-[640px]">
                <thead>
                  <tr>
                    <th className="w-10 px-4">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="accent-brand-600 w-3.5 h-3.5"
                      />
                    </th>
                    <th>タイトル</th>
                    <th>発注先</th>
                    <th className="hidden md:table-cell">発行日</th>
                    <th className="hidden md:table-cell">納期</th>
                    <th className="hidden sm:table-cell text-center">品目数</th>
                    <th className="text-right">合計</th>
                    <th className="text-center w-28">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => {
                    const sel = selected.has(doc.id)
                    return (
                      <tr key={doc.id} className={sel ? 'bg-brand-50/40' : ''}>
                        <td className="px-4">
                          <input
                            type="checkbox"
                            checked={sel}
                            onChange={() => toggleOne(doc.id)}
                            className="accent-brand-600 w-3.5 h-3.5"
                          />
                        </td>
                        <td className="font-medium text-slate-900">
                          <button
                            type="button"
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            className="text-left text-slate-900 hover:text-brand-600 hover:underline"
                          >
                            {doc.title}
                          </button>
                        </td>
                        <td className="text-slate-600">{doc.recipientName || '—'}</td>
                        <td className="hidden md:table-cell text-slate-500 tabular-nums">{doc.issueDate}</td>
                        <td className="hidden md:table-cell text-slate-500 tabular-nums">{doc.dueDate || '—'}</td>
                        <td className="hidden sm:table-cell text-center text-slate-500">{doc.items.length}件</td>
                        <td className="text-right tabular-nums font-semibold text-slate-900">{fmt(doc.total)}</td>
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => navigate(`/documents/${doc.id}`)}
                              className="p-1.5 rounded text-slate-400 hover:bg-slate-100 transition-colors"
                              title="編集"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(doc.id, doc.title)}
                              className="p-1.5 rounded text-slate-400 hover:bg-slate-100 transition-colors"
                              title="複製"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(doc)}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="発注書を削除しますか？"
        message={deleteTarget ? `「${deleteTarget.title}」を削除します。\nこの操作は取り消せません。` : ''}
        confirmLabel="削除する"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="選択した発注書を削除しますか？"
        message={`${selected.size}件をまとめて削除します。\nこの操作は取り消せません。`}
        confirmLabel="削除する"
        danger
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  )
}
