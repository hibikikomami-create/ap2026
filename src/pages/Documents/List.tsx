import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { fmt } from '../../lib/calculations'

export default function DocumentsList() {
  const navigate = useNavigate()
  const { documents, deleteDocument } = useStore()
  const [search, setSearch] = useState('')

  const filtered = documents
    .filter((d) =>
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.recipientName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const handleDelete = (id: string) => {
    if (confirm('この発注書を削除しますか？')) deleteDocument(id)
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
            <div className="overflow-x-auto">
              <table className="data-table min-w-[600px]">
                <thead>
                  <tr>
                    <th>タイトル</th>
                    <th>発注先</th>
                    <th className="hidden md:table-cell">発行日</th>
                    <th className="hidden md:table-cell">納期</th>
                    <th className="hidden sm:table-cell text-center">品目数</th>
                    <th className="text-right">合計</th>
                    <th className="text-center w-20">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id}>
                      <td className="font-medium text-slate-900">{doc.title}</td>
                      <td className="text-slate-600">{doc.recipientName || '—'}</td>
                      <td className="hidden md:table-cell text-slate-500 tabular-nums">{doc.issueDate}</td>
                      <td className="hidden md:table-cell text-slate-500 tabular-nums">{doc.dueDate || '—'}</td>
                      <td className="hidden sm:table-cell text-center text-slate-500">{doc.items.length}件</td>
                      <td className="text-right tabular-nums font-semibold text-slate-900">{fmt(doc.total)}</td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => navigate('/documents/new')}
                            className="p-1.5 rounded text-brand-600 hover:bg-brand-50 transition-colors"
                            title="新規作成"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.id)}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
