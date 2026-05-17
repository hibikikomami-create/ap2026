import { useState, useCallback } from 'react'
import { useStore } from '../../store'
import { nanoid } from '../../lib/nanoid'
import type { DailyTask } from '../../types'

const WEEK = ['月', '火', '水', '木', '金', '土', '日']

const MOODS = [
  { key: 'great', label: '絶好調', color: '#3D8A5C', bg: 'rgba(61,138,92,0.10)' },
  { key: 'good',  label: 'まあまあ', color: '#1D6FA8', bg: 'rgba(29,111,168,0.09)' },
  { key: 'okay',  label: 'ふつう',   color: '#92600A', bg: 'rgba(146,96,10,0.09)' },
  { key: 'bad',   label: 'きつい',   color: '#C04040', bg: 'rgba(192,64,64,0.08)' },
] as const

type MoodKey = typeof MOODS[number]['key']

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function firstWeekday(y: number, m: number) { return (new Date(y, m, 1).getDay() + 6) % 7 } // 0=Mon

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function CalendarPage() {
  const { dailyReports, upsertDailyReport } = useStore()

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  const [sheetDate, setSheetDate] = useState<string | null>(null)
  const [sales, setSales] = useState(0)
  const [orders, setOrders] = useState(0)
  const [mood, setMood] = useState<MoodKey>('good')
  const [memo, setMemo] = useState('')
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [newTask, setNewTask] = useState('')

  const reportMap = Object.fromEntries(dailyReports.map(r => [r.date, r]))

  const openSheet = useCallback((dateStr: string) => {
    const r = reportMap[dateStr]
    setSales(r?.salesAmount ?? 0)
    setOrders(r?.orderCount ?? 0)
    setMood((r?.mood ?? 'good') as MoodKey)
    setMemo(r?.memo ?? '')
    setTasks(r?.tasks ?? [])
    setNewTask('')
    setSheetDate(dateStr)
  }, [reportMap])

  const handleSave = () => {
    if (!sheetDate) return
    upsertDailyReport(sheetDate, { salesAmount: sales, orderCount: orders, mood, memo, tasks })
    setSheetDate(null)
  }

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const dim = daysInMonth(year, month)
  const startOffset = firstWeekday(year, month)
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const recentReports = [...dailyReports].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: '80px' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <button
            onClick={prevMonth}
            style={{ padding: '8px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.60)', cursor: 'pointer', display: 'flex' }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--ink)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={{ textAlign: 'center' }}>
            <div className="page-title">{year}年{month + 1}月</div>
            <div className="page-subtitle">予定・日報</div>
          </div>
          <button
            onClick={nextMonth}
            style={{ padding: '8px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.60)', cursor: 'pointer', display: 'flex' }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--ink)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Calendar grid */}
        <div className="card a0" style={{ overflow: 'hidden', marginBottom: '14px' }}>
          {/* Weekday header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            {WEEK.map((d, i) => (
              <div key={d} style={{ textAlign: 'center', padding: '8px 0', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', color: i >= 5 ? 'var(--err)' : 'var(--stone)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} style={{ minHeight: '52px' }} />
              const ds = toDateStr(year, month, day)
              const report = reportMap[ds]
              const isToday = ds === todayStr
              const isSat = idx % 7 === 5
              const isSun = idx % 7 === 6
              const moodInfo = report ? MOODS.find(m => m.key === report.mood) : null

              return (
                <button
                  key={ds}
                  onClick={() => openSheet(ds)}
                  style={{
                    padding: '6px 4px', border: 'none', minHeight: '52px',
                    background: isToday ? 'rgba(196,98,45,0.08)' : 'transparent',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '3px',
                    transition: 'background 120ms ease',
                  }}
                >
                  <span style={{
                    fontSize: '13.5px', fontWeight: isToday ? 600 : 400,
                    color: isToday ? 'var(--accent)' : isSun ? 'var(--err)' : isSat ? 'var(--info)' : 'var(--ink)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {day}
                  </span>
                  {report && (
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: moodInfo?.color ?? 'var(--stone)', flexShrink: 0 }} />
                  )}
                  {report?.salesAmount ? (
                    <span style={{ fontSize: '8px', color: 'var(--ok)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                      {report.salesAmount >= 10000
                        ? `${(report.salesAmount / 10000).toFixed(1)}万`
                        : `${(report.salesAmount / 1000).toFixed(0)}k`}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent reports */}
        <div className="a1">
          <div className="section-label" style={{ marginBottom: '8px' }}>最近の日報</div>
          {recentReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--stone)', fontSize: '13px' }}>
              日付をタップして日報を記録しましょう
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentReports.map(r => {
                const moodInfo = MOODS.find(m => m.key === r.mood)
                const doneTasks = r.tasks.filter(t => t.done).length
                return (
                  <button
                    key={r.id}
                    onClick={() => openSheet(r.date)}
                    className="card"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', cursor: 'pointer', border: 'none', width: '100%',
                      textAlign: 'left', transition: 'opacity 120ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{r.date}</span>
                      {moodInfo && (
                        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10.5px', fontWeight: 500, background: moodInfo.bg, color: moodInfo.color, whiteSpace: 'nowrap' }}>
                          {moodInfo.label}
                        </span>
                      )}
                      {r.tasks.length > 0 && (
                        <span style={{ fontSize: '10px', color: 'var(--stone)' }}>{doneTasks}/{r.tasks.length}</span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                        ¥{r.salesAmount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--stone)' }}>{r.orderCount}件</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet */}
      {sheetDate && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 120,
            background: 'rgba(0,0,0,0.40)',
            display: 'flex', alignItems: 'flex-end',
            animation: 'fIn 160ms ease both',
          }}
          onClick={e => { if (e.target === e.currentTarget) setSheetDate(null) }}
        >
          <div
            style={{
              width: '100%', maxHeight: '92dvh', overflowY: 'auto',
              background: 'rgba(240,237,232,0.99)',
              borderRadius: '22px 22px 0 0',
              borderTop: '1px solid rgba(255,255,255,0.52)',
              padding: '12px 19px 40px',
              animation: 'sUp 240ms cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            {/* Handle */}
            <div style={{ width: '36px', height: '4px', background: 'rgba(0,0,0,0.18)', borderRadius: '2px', margin: '0 auto 18px' }} />

            <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.3px', marginBottom: '16px' }}>
              {sheetDate} の日報
            </div>

            {/* Sales / Orders KPI cells */}
            <div className="kg" style={{ marginBottom: '14px' }}>
              <div className="kc">
                <div className="kl">売上 (¥)</div>
                <input
                  type="number" value={sales || ''}
                  onChange={e => setSales(Number(e.target.value) || 0)}
                  placeholder="0"
                  style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '20px', fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', outline: 'none', padding: 0 }}
                />
              </div>
              <div className="kc">
                <div className="kl">注文数 (件)</div>
                <input
                  type="number" value={orders || ''}
                  onChange={e => setOrders(Number(e.target.value) || 0)}
                  placeholder="0"
                  style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '20px', fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', outline: 'none', padding: 0 }}
                />
              </div>
            </div>

            {/* Mood */}
            <div style={{ marginBottom: '14px' }}>
              <div className="section-label" style={{ marginBottom: '8px' }}>Mood</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {MOODS.map(m => (
                  <button
                    key={m.key}
                    onClick={() => setMood(m.key)}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: '10px',
                      border: `1.5px solid ${mood === m.key ? m.color : 'transparent'}`,
                      background: mood === m.key ? m.bg : 'rgba(255,255,255,0.60)',
                      color: mood === m.key ? m.color : 'var(--ink-soft)',
                      fontSize: '11px', fontWeight: mood === m.key ? 600 : 400,
                      cursor: 'pointer', transition: 'all 160ms ease',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div style={{ marginBottom: '14px' }}>
              <div className="section-label" style={{ marginBottom: '8px' }}>Tasks</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {tasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.60)', borderRadius: '10px' }}>
                    <button
                      onClick={() => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                      style={{
                        width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${task.done ? 'var(--ok)' : 'rgba(0,0,0,0.20)'}`,
                        background: task.done ? 'var(--ok)' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {task.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>
                    <span style={{ flex: 1, fontSize: '13px', color: task.done ? 'var(--stone)' : 'var(--ink)', textDecoration: task.done ? 'line-through' : 'none' }}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => setTasks(ts => ts.filter(t => t.id !== task.id))}
                      style={{ color: 'var(--stone)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newTask.trim()) {
                      setTasks(ts => [...ts, { id: nanoid(), text: newTask.trim(), done: false }])
                      setNewTask('')
                    }
                  }}
                  placeholder="タスクを追加…"
                  style={{ flex: 1, minHeight: '42px', padding: '0 13px', background: 'rgba(255,255,255,0.72)', border: '1.5px solid rgba(255,255,255,0.54)', borderRadius: '11px', fontSize: '13px', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }}
                />
                <button
                  onClick={() => {
                    if (newTask.trim()) {
                      setTasks(ts => [...ts, { id: nanoid(), text: newTask.trim(), done: false }])
                      setNewTask('')
                    }
                  }}
                  style={{ width: '42px', height: '42px', borderRadius: '11px', background: 'var(--accent)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            {/* Memo */}
            <div style={{ marginBottom: '20px' }}>
              <div className="section-label" style={{ marginBottom: '8px' }}>Memo</div>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="今日の気づき・メモ…"
                rows={3}
                style={{ width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,0.72)', border: '1.5px solid rgba(255,255,255,0.54)', borderRadius: '11px', fontSize: '13px', color: 'var(--ink)', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              保存する
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
