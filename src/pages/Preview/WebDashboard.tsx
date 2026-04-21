import { useMemo, useState } from 'react'
import { showToast } from '../../components/common/Toast'
import { buildCsv, downloadCsv, makeCsvFilename, type CsvColumn } from '../../lib/exporters/csv'

// ─── Dummy data types ────────────────────────────────────────────────────────

type ItemStatus = 'active' | 'pending' | 'review' | 'closed'

interface DemoItem {
  id: string
  name: string
  category: string
  status: ItemStatus
  amount: number
  updatedAt: string
  createdAt: string
  assignee: string
}

interface Activity {
  id: string
  type: 'created' | 'updated' | 'status' | 'document'
  subject: string
  detail: string
  time: string
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const ITEMS: DemoItem[] = [
  { id: '01', name: '春夏コレクション 2025', category: 'アパレル', status: 'active',  amount: 248000, updatedAt: '2026-04-21', createdAt: '2026-04-01', assignee: '山田 花子' },
  { id: '02', name: 'カスタムオーダー対応 A社', category: '受注',     status: 'pending', amount:  87000, updatedAt: '2026-04-20', createdAt: '2026-04-18', assignee: '佐藤 健' },
  { id: '03', name: 'ホームフレグランスライン', category: '雑貨',     status: 'active',  amount: 156000, updatedAt: '2026-04-19', createdAt: '2026-03-10', assignee: '山田 花子' },
  { id: '04', name: 'ブランドロゴリニューアル', category: 'デザイン', status: 'review',  amount:  45000, updatedAt: '2026-04-19', createdAt: '2026-04-05', assignee: '田中 悟' },
  { id: '05', name: '展示会出展（東京）',       category: 'イベント', status: 'active',  amount: 320000, updatedAt: '2026-04-18', createdAt: '2026-02-20', assignee: '山田 花子' },
  { id: '06', name: 'EC向け秋冬新作',           category: 'アパレル', status: 'pending', amount: 190000, updatedAt: '2026-04-17', createdAt: '2026-04-15', assignee: '佐藤 健' },
  { id: '07', name: 'B社 卸取引 Q2',           category: '卸売',     status: 'active',  amount: 540000, updatedAt: '2026-04-17', createdAt: '2026-01-08', assignee: '山田 花子' },
  { id: '08', name: 'パッケージデザイン改訂',   category: 'デザイン', status: 'closed',  amount:  38000, updatedAt: '2026-04-15', createdAt: '2026-03-01', assignee: '田中 悟' },
  { id: '09', name: 'ポップアップ 大阪店',      category: 'イベント', status: 'review',  amount:  92000, updatedAt: '2026-04-14', createdAt: '2026-04-10', assignee: '佐藤 健' },
  { id: '10', name: '定番モデル 改良版',        category: 'アパレル', status: 'active',  amount: 175000, updatedAt: '2026-04-12', createdAt: '2026-03-25', assignee: '山田 花子' },
  { id: '11', name: 'SNSキャンペーン 春季',    category: 'マーケ',   status: 'closed',  amount:  28000, updatedAt: '2026-04-10', createdAt: '2026-03-12', assignee: '田中 悟' },
  { id: '12', name: 'C社 特注対応',            category: '受注',     status: 'pending', amount:  63000, updatedAt: '2026-04-09', createdAt: '2026-04-07', assignee: '佐藤 健' },
  { id: '13', name: 'アクセサリーライン立上げ', category: '雑貨',     status: 'review',  amount: 210000, updatedAt: '2026-04-08', createdAt: '2026-04-02', assignee: '山田 花子' },
  { id: '14', name: '夏季限定コラボ企画',       category: 'アパレル', status: 'pending', amount: 145000, updatedAt: '2026-04-07', createdAt: '2026-04-06', assignee: '山田 花子' },
  { id: '15', name: '年度末棚卸・整理',         category: '管理',     status: 'closed',  amount:       0, updatedAt: '2026-04-01', createdAt: '2026-03-28', assignee: '田中 悟' },
]

const ACTIVITIES: Activity[] = [
  { id: 'a1', type: 'status',   subject: 'B社 卸取引 Q2',           detail: 'ステータスを「進行中」に変更',    time: '本日 14:32' },
  { id: 'a2', type: 'document', subject: 'EC向け秋冬新作',           detail: '発注書を作成しました',            time: '本日 13:15' },
  { id: 'a3', type: 'updated',  subject: '展示会出展（東京）',       detail: '金額を ¥320,000 に更新',          time: '本日 11:40' },
  { id: 'a4', type: 'created',  subject: '夏季限定コラボ企画',       detail: '新規追加',                        time: '昨日 17:55' },
  { id: 'a5', type: 'status',   subject: 'アクセサリーライン立上げ', detail: 'ステータスを「レビュー中」に変更', time: '昨日 15:22' },
  { id: 'a6', type: 'document', subject: 'C社 特注対応',            detail: '発注書を作成しました',            time: '昨日 14:08' },
  { id: 'a7', type: 'updated',  subject: '定番モデル 改良版',        detail: '担当者を「山田 花子」に変更',      time: '昨日 10:30' },
  { id: 'a8', type: 'status',   subject: 'パッケージデザイン改訂',   detail: 'ステータスを「完了」に変更',       time: '3日前 16:45' },
  { id: 'a9', type: 'created',  subject: 'カスタムオーダー対応 A社', detail: '新規追加',                        time: '3日前 09:12' },
]

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n === 0 ? '—' : `¥${n.toLocaleString('ja-JP')}`

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `¥${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000)    return `¥${Math.round(n / 10_000)}万`
  return `¥${n.toLocaleString('ja-JP')}`
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ItemStatus, string> = {
  active:  '進行中',
  pending: '未対応',
  review:  'レビュー中',
  closed:  '完了',
}

const STATUS_CLASS: Record<ItemStatus, string> = {
  active:  'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  review:  'bg-blue-50 text-blue-700',
  closed:  'bg-slate-100 text-slate-500',
}

const ACTIVITY_ICON: Record<Activity['type'], React.ReactNode> = {
  created:  (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  updated:  (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  status:   (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  document: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
}

const ACTIVITY_COLOR: Record<Activity['type'], string> = {
  created:  'bg-green-50 text-green-600',
  updated:  'bg-brand-50 text-brand-600',
  status:   'bg-amber-50 text-amber-600',
  document: 'bg-slate-100 text-slate-500',
}

type SortKey = 'name' | 'amount' | 'updatedAt' | 'status'

// ─── Main component ───────────────────────────────────────────────────────────

export default function WebDashboardPreview() {
  const [items, setItems]     = useState<DemoItem[]>(ITEMS)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState<ItemStatus | 'all'>('all')
  const [category, setCategory] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailItem, setDetailItem] = useState<DemoItem | null>(null)
  const [editItem, setEditItem] = useState<DemoItem | null>(null)
  const [editDraft, setEditDraft] = useState<{ name: string; amount: number; status: ItemStatus } | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [newDraft, setNewDraft] = useState({ name: '', category: 'アパレル', amount: 0, assignee: '' })
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false)
  const [bulkStatusValue, setBulkStatusValue] = useState<ItemStatus>('active')

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(items.map((i) => i.category)))],
    [items]
  )

  const filtered = useMemo(() => {
    let list = [...items]
    if (status !== 'all')   list = list.filter((i) => i.status === status)
    if (category !== 'all') list = list.filter((i) => i.category === category)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) => i.name.toLowerCase().includes(q) || i.assignee.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      const av: string | number = sortKey === 'amount' ? a.amount : a[sortKey]
      const bv: string | number = sortKey === 'amount' ? b.amount : b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number')
        return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv), 'ja')
        : String(bv).localeCompare(String(av), 'ja')
    })
    return list
  }, [items, search, status, category, sortKey, sortDir])

  // KPI (live against state, not frozen data)
  const activeItems   = items.filter((i) => i.status === 'active')
  const pendingItems  = items.filter((i) => i.status === 'pending')
  const reviewItems   = items.filter((i) => i.status === 'review')
  const thisMonthRev  = items.filter((i) => i.createdAt.startsWith('2026-04') && i.status !== 'closed')
                             .reduce((s, i) => s + i.amount, 0)

  const allSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((i) => i.id)))
    }
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  // ── Actions ──────────────────────────────────────────────────────────────
  const today = () => new Date().toISOString().slice(0, 10)

  const handleCsvExport = () => {
    const source = selected.size > 0 ? filtered.filter((i) => selected.has(i.id)) : filtered
    if (source.length === 0) {
      showToast('エクスポート対象がありません', 'error')
      return
    }
    const columns: CsvColumn<DemoItem>[] = [
      { header: 'ID',          value: (i) => i.id },
      { header: '案件名',      value: (i) => i.name },
      { header: '分類',        value: (i) => i.category },
      { header: 'ステータス',  value: (i) => STATUS_LABEL[i.status] },
      { header: '担当者',      value: (i) => i.assignee },
      { header: '金額',        value: (i) => i.amount },
      { header: '更新日',      value: (i) => i.updatedAt },
      { header: '作成日',      value: (i) => i.createdAt },
    ]
    downloadCsv(makeCsvFilename('dashboard'), buildCsv(source, columns))
    showToast(`${source.length}件をCSV出力しました`, 'success')
  }

  const handleCreate = () => {
    if (!newDraft.name.trim()) {
      showToast('案件名を入力してください', 'error')
      return
    }
    const id = String(items.length + 1).padStart(2, '0')
    const next: DemoItem = {
      id,
      name: newDraft.name.trim(),
      category: newDraft.category,
      status: 'pending',
      amount: newDraft.amount || 0,
      updatedAt: today(),
      createdAt: today(),
      assignee: newDraft.assignee.trim() || '（未設定）',
    }
    setItems((prev) => [next, ...prev])
    setNewOpen(false)
    setNewDraft({ name: '', category: 'アパレル', amount: 0, assignee: '' })
    showToast(`「${next.name}」を追加しました`, 'success')
  }

  const handleEdit = () => {
    if (!editItem || !editDraft) return
    if (!editDraft.name.trim()) {
      showToast('案件名を入力してください', 'error')
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === editItem.id
          ? { ...i, name: editDraft.name.trim(), amount: editDraft.amount, status: editDraft.status, updatedAt: today() }
          : i
      )
    )
    setEditItem(null)
    setEditDraft(null)
    showToast('変更を保存しました', 'success')
  }

  const handleBulkStatus = () => {
    const ids = Array.from(selected)
    setItems((prev) =>
      prev.map((i) => (ids.includes(i.id) ? { ...i, status: bulkStatusValue, updatedAt: today() } : i))
    )
    setSelected(new Set())
    setBulkStatusOpen(false)
    showToast(`${ids.length}件のステータスを「${STATUS_LABEL[bulkStatusValue]}」に変更しました`, 'success')
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return (
      <svg className="w-3 h-3 text-slate-300 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    )
    return sortDir === 'asc'
      ? <svg className="w-3 h-3 text-brand-500 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
      : <svg className="w-3 h-3 text-brand-500 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">プレビュー</span>
              <h1 className="page-title">案件・商品ダッシュボード</h1>
            </div>
            <p className="page-subtitle">進行中の案件と商品の状況を一覧で確認・管理します</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-ghost flex items-center gap-1.5 border border-slate-200"
              onClick={handleCsvExport}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV出力
            </button>
            <button
              type="button"
              className="btn-primary flex items-center gap-1.5"
              onClick={() => setNewOpen(true)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新規作成
            </button>
          </div>
        </div>
      </div>

      <div className="page-content space-y-5 flex-1">

        {/* ── KPI cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="今月の売上見込み"
            value={fmtShort(thisMonthRev)}
            delta="+12%"
            positive
            icon="¥"
          />
          <KpiCard
            label="進行中"
            value={`${activeItems.length}件`}
            sub={`¥${(activeItems.reduce((s, i) => s + i.amount, 0) / 10000).toFixed(0)}万`}
            icon="●"
            iconColor="text-green-600"
          />
          <KpiCard
            label="未対応"
            value={`${pendingItems.length}件`}
            sub="要対応"
            icon="!"
            iconColor="text-amber-500"
            warn={pendingItems.length >= 3}
          />
          <KpiCard
            label="レビュー待ち"
            value={`${reviewItems.length}件`}
            sub="確認待ち"
            icon="↺"
            iconColor="text-blue-500"
          />
        </div>

        {/* ── Filter bar ─────────────────────────────────────────────────────── */}
        <div className="card px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="案件名・担当者で検索"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 whitespace-nowrap">ステータス</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus | 'all')}
                className="text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="all">すべて</option>
                <option value="active">進行中</option>
                <option value="pending">未対応</option>
                <option value="review">レビュー中</option>
                <option value="closed">完了</option>
              </select>
            </div>

            {/* Category */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 whitespace-nowrap">分類</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'all' ? 'すべて' : c}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 whitespace-nowrap">並び替え</span>
              <select
                value={`${sortKey}-${sortDir}`}
                onChange={(e) => {
                  const [k, d] = e.target.value.split('-')
                  setSortKey(k as SortKey)
                  setSortDir(d as 'asc' | 'desc')
                }}
                className="text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="updatedAt-desc">更新日（新しい順）</option>
                <option value="updatedAt-asc">更新日（古い順）</option>
                <option value="amount-desc">金額（高い順）</option>
                <option value="amount-asc">金額（低い順）</option>
                <option value="name-asc">名前順</option>
              </select>
            </div>

            {/* Clear / count */}
            {(search || status !== 'all' || category !== 'all') && (
              <button
                type="button"
                onClick={() => { setSearch(''); setStatus('all'); setCategory('all') }}
                className="text-xs text-slate-400 hover:text-slate-600 underline whitespace-nowrap"
              >
                クリア
              </button>
            )}
            <div className="ml-auto text-xs text-slate-400 whitespace-nowrap">
              {filtered.length !== items.length
                ? `${filtered.length} / ${items.length}件`
                : `${items.length}件`}
            </div>
          </div>
        </div>

        {/* ── Main content: table + activity ───────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">

          {/* Table */}
          <div className="xl:col-span-3">
            <div className="card overflow-hidden">
              {selected.size > 0 && (
                <div className="bg-brand-50 border-b border-brand-100 px-4 py-2.5 flex items-center gap-3">
                  <span className="text-sm font-medium text-brand-700">{selected.size}件を選択中</span>
                  <button
                    type="button"
                    className="text-xs text-brand-600 hover:underline"
                    onClick={() => setBulkStatusOpen(true)}
                  >
                    ステータス変更
                  </button>
                  <button
                    type="button"
                    className="text-xs text-brand-600 hover:underline"
                    onClick={handleCsvExport}
                  >
                    CSV出力
                  </button>
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:underline ml-auto"
                    onClick={() => setSelected(new Set())}
                  >
                    選択解除
                  </button>
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  条件に一致する項目が見つかりません
                </div>
              ) : (
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
                        <th>
                          <button type="button" onClick={() => toggleSort('name')} className="hover:text-slate-800 flex items-center">
                            案件名 / 商品名 <SortIcon k="name" />
                          </button>
                        </th>
                        <th className="hidden md:table-cell">分類</th>
                        <th>
                          <button type="button" onClick={() => toggleSort('status')} className="hover:text-slate-800 flex items-center">
                            ステータス <SortIcon k="status" />
                          </button>
                        </th>
                        <th className="hidden lg:table-cell">担当者</th>
                        <th className="hidden lg:table-cell">
                          <button type="button" onClick={() => toggleSort('updatedAt')} className="hover:text-slate-800 flex items-center">
                            更新日 <SortIcon k="updatedAt" />
                          </button>
                        </th>
                        <th className="text-right">
                          <button type="button" onClick={() => toggleSort('amount')} className="hover:text-slate-800 flex items-center ml-auto">
                            金額 <SortIcon k="amount" />
                          </button>
                        </th>
                        <th className="text-center w-20 hidden sm:table-cell">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => {
                        const sel = selected.has(item.id)
                        return (
                          <tr key={item.id} className={sel ? 'bg-brand-50/40' : ''}>
                            <td className="px-4">
                              <input
                                type="checkbox"
                                checked={sel}
                                onChange={() => {
                                  const next = new Set(selected)
                                  sel ? next.delete(item.id) : next.add(item.id)
                                  setSelected(next)
                                }}
                                className="accent-brand-600 w-3.5 h-3.5"
                              />
                            </td>
                            <td className="font-medium text-slate-900">{item.name}</td>
                            <td className="hidden md:table-cell">
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {item.category}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${STATUS_CLASS[item.status]}`}>
                                {STATUS_LABEL[item.status]}
                              </span>
                            </td>
                            <td className="hidden lg:table-cell text-slate-600 text-xs">{item.assignee}</td>
                            <td className="hidden lg:table-cell text-slate-400 tabular-nums text-xs">{item.updatedAt}</td>
                            <td className="text-right tabular-nums font-medium text-slate-800">
                              {fmt(item.amount)}
                            </td>
                            <td className="hidden sm:table-cell">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setDetailItem(item)}
                                  className="p-1.5 rounded text-brand-600 hover:bg-brand-50 transition-colors"
                                  title="詳細"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditItem(item)
                                    setEditDraft({ name: item.name, amount: item.amount, status: item.status })
                                  }}
                                  className="p-1.5 rounded text-slate-400 hover:bg-slate-100 transition-colors"
                                  title="編集"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
              )}

              {/* Table footer */}
              <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {filtered.length}件表示
                  {selected.size > 0 && <span className="text-brand-600 ml-2">（{selected.size}件選択中）</span>}
                </span>
                <span className="hidden sm:inline">
                  合計金額: <span className="tabular-nums font-medium text-slate-600">
                    {fmt(filtered.reduce((s, i) => s + i.amount, 0))}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Activity panel */}
          <div className="xl:col-span-1 space-y-4">
            {/* Status summary */}
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                ステータス内訳
              </h3>
              <div className="space-y-2">
                {(
                  [
                    ['active',  '進行中',    'bg-green-500'],
                    ['pending', '未対応',    'bg-amber-400'],
                    ['review',  'レビュー中', 'bg-blue-400'],
                    ['closed',  '完了',      'bg-slate-300'],
                  ] as [ItemStatus, string, string][]
                ).map(([s, label, barColor]) => {
                  const count = items.filter((i) => i.status === s).length
                  const pct = items.length > 0 ? Math.round((count / items.length) * 100) : 0
                  return (
                    <div key={s}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">{label}</span>
                        <span className="text-xs tabular-nums text-slate-500">{count}件 ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Activity feed */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  最近のアクティビティ
                </h3>
              </div>
              <div className="divide-y divide-slate-50">
                {ACTIVITIES.map((act) => (
                  <div key={act.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 p-1 rounded-md shrink-0 ${ACTIVITY_COLOR[act.type]}`}>
                        {ACTIVITY_ICON[act.type]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-slate-800 truncate">{act.subject}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{act.detail}</div>
                        <div className="text-xs text-slate-300 mt-0.5">{act.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                <button type="button" className="text-xs text-slate-400 hover:text-brand-600">
                  すべての履歴を見る
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Detail modal ─────────────────────────────────────────────────── */}
      {detailItem && (
        <PreviewModal title="案件の詳細" onClose={() => setDetailItem(null)}>
          <dl className="grid grid-cols-3 gap-x-3 gap-y-3 text-sm">
            <dt className="col-span-1 text-slate-500">案件名</dt>
            <dd className="col-span-2 font-medium text-slate-900">{detailItem.name}</dd>
            <dt className="col-span-1 text-slate-500">分類</dt>
            <dd className="col-span-2">{detailItem.category}</dd>
            <dt className="col-span-1 text-slate-500">ステータス</dt>
            <dd className="col-span-2">
              <span className={`badge ${STATUS_CLASS[detailItem.status]}`}>
                {STATUS_LABEL[detailItem.status]}
              </span>
            </dd>
            <dt className="col-span-1 text-slate-500">担当者</dt>
            <dd className="col-span-2">{detailItem.assignee}</dd>
            <dt className="col-span-1 text-slate-500">金額</dt>
            <dd className="col-span-2 tabular-nums font-medium">{fmt(detailItem.amount)}</dd>
            <dt className="col-span-1 text-slate-500">作成日</dt>
            <dd className="col-span-2 tabular-nums text-slate-600">{detailItem.createdAt}</dd>
            <dt className="col-span-1 text-slate-500">更新日</dt>
            <dd className="col-span-2 tabular-nums text-slate-600">{detailItem.updatedAt}</dd>
          </dl>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDetailItem(null)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md"
            >
              閉じる
            </button>
            <button
              type="button"
              onClick={() => {
                setEditItem(detailItem)
                setEditDraft({ name: detailItem.name, amount: detailItem.amount, status: detailItem.status })
                setDetailItem(null)
              }}
              className="btn-primary px-4 py-2 text-sm"
            >
              編集する
            </button>
          </div>
        </PreviewModal>
      )}

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      {editItem && editDraft && (
        <PreviewModal title="案件を編集" onClose={() => { setEditItem(null); setEditDraft(null) }}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">案件名</label>
              <input
                type="text"
                value={editDraft.name}
                onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">金額</label>
                <input
                  type="number"
                  value={editDraft.amount}
                  onChange={(e) => setEditDraft({ ...editDraft, amount: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ステータス</label>
                <select
                  value={editDraft.status}
                  onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value as ItemStatus })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                >
                  <option value="active">進行中</option>
                  <option value="pending">未対応</option>
                  <option value="review">レビュー中</option>
                  <option value="closed">完了</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setEditItem(null); setEditDraft(null) }}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="btn-primary px-4 py-2 text-sm"
            >
              保存
            </button>
          </div>
        </PreviewModal>
      )}

      {/* ── New item modal ───────────────────────────────────────────────── */}
      {newOpen && (
        <PreviewModal title="案件を新規作成" onClose={() => setNewOpen(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">案件名 <span className="text-brand-500">*</span></label>
              <input
                type="text"
                value={newDraft.name}
                onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })}
                placeholder="例：夏季限定コラボ企画"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">分類</label>
                <select
                  value={newDraft.category}
                  onChange={(e) => setNewDraft({ ...newDraft, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                >
                  {categories.filter((c) => c !== 'all').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">金額</label>
                <input
                  type="number"
                  value={newDraft.amount}
                  onChange={(e) => setNewDraft({ ...newDraft, amount: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">担当者</label>
              <input
                type="text"
                value={newDraft.assignee}
                onChange={(e) => setNewDraft({ ...newDraft, assignee: e.target.value })}
                placeholder="例：山田 花子"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="btn-primary px-4 py-2 text-sm"
            >
              作成
            </button>
          </div>
        </PreviewModal>
      )}

      {/* ── Bulk status modal ────────────────────────────────────────────── */}
      {bulkStatusOpen && (
        <PreviewModal title="選択項目のステータスを変更" onClose={() => setBulkStatusOpen(false)}>
          <p className="text-sm text-slate-600 mb-3">
            {selected.size}件のステータスをまとめて変更します。
          </p>
          <select
            value={bulkStatusValue}
            onChange={(e) => setBulkStatusValue(e.target.value as ItemStatus)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
          >
            <option value="active">進行中</option>
            <option value="pending">未対応</option>
            <option value="review">レビュー中</option>
            <option value="closed">完了</option>
          </select>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setBulkStatusOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleBulkStatus}
              className="btn-primary px-4 py-2 text-sm"
            >
              変更する
            </button>
          </div>
        </PreviewModal>
      )}
    </div>
  )
}

// Small inline modal used only for the Preview page to avoid touching the global Modal.
function PreviewModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:bg-slate-50"
            aria-label="閉じる"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, delta, positive, warn, icon, iconColor,
}: {
  label: string; value: string; sub?: string; delta?: string
  positive?: boolean; warn?: boolean; icon: string; iconColor?: string
}) {
  return (
    <div className={`card px-4 py-4 ${warn ? 'border-amber-200' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 leading-tight">{label}</span>
        <span className={`text-base font-bold shrink-0 ${iconColor ?? 'text-slate-400'}`}>{icon}</span>
      </div>
      <div className={`text-2xl font-semibold mt-2 tabular-nums ${warn ? 'text-amber-700' : 'text-slate-900'}`}>
        {value}
      </div>
      <div className="flex items-center gap-2 mt-1">
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
        {delta && (
          <span className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  )
}
