import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { useAuthStore } from '../../store/authStore'
import { calcProduct, fmt, fmtPct } from '../../lib/calculations'
import { statusBadge } from '../../components/common/Badge'

export default function Home() {
  const navigate = useNavigate()
  const { products, projects, documents, settings } = useStore()
  const { currentUser } = useAuthStore()

  const activeProducts = products.filter((p) => p.status === 'active')
  const totalGrossProfit = products.reduce((s, p) => s + calcProduct(p).grossProfit, 0)
  const avgMargin =
    products.length > 0
      ? products.reduce((s, p) => s + calcProduct(p).grossMargin, 0) / products.length
      : 0

  const recentProducts = [...products]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)

  const recentDocs = [...documents]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  const displayName = currentUser?.user_metadata?.display_name || settings.displayName || 'ユーザー'

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">ダッシュボード</h1>
            <p className="page-subtitle">{displayName} さん、{greeting()} 。</p>
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
      </div>

      <div className="page-content space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="登録商品"
            value={`${products.length}`}
            sub={`販売中 ${activeProducts.length}件`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
              </svg>
            }
          />
          <KpiCard
            label="月間粗利見込み"
            value={fmt(totalGrossProfit)}
            sub="全商品合計"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            highlight
          />
          <KpiCard
            label="平均粗利率"
            value={fmtPct(avgMargin)}
            sub="全商品平均"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            }
            warn={avgMargin < 15}
          />
          <KpiCard
            label="発注書"
            value={`${documents.length}`}
            sub={`プロジェクト ${projects.length}件`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent products */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">最近の商品</h2>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="text-xs text-brand-600 hover:underline"
                >
                  すべて表示
                </button>
              </div>
              {recentProducts.length === 0 ? (
                <div className="px-4 py-10 text-center text-slate-400 text-sm">
                  商品がまだ登録されていません
                  <br />
                  <button
                    type="button"
                    onClick={() => navigate('/products/new')}
                    className="mt-3 text-brand-600 underline text-sm"
                  >
                    最初の商品を追加する
                  </button>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>商品名</th>
                      <th className="hidden sm:table-cell">品番</th>
                      <th>上代</th>
                      <th>粗利率</th>
                      <th>ステータス</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((product) => {
                      const calc = calcProduct(product)
                      return (
                        <tr
                          key={product.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          <td className="font-medium text-slate-900">{product.name}</td>
                          <td className="hidden sm:table-cell text-slate-500 font-mono text-xs">{product.code}</td>
                          <td className="tabular-nums">{fmt(product.sellingPrice)}</td>
                          <td className={`tabular-nums font-medium
                            ${calc.grossMargin >= 30 ? 'text-green-600' : calc.grossMargin >= 15 ? 'text-amber-600' : 'text-red-500'}`}
                          >
                            {fmtPct(calc.grossMargin)}
                          </td>
                          <td>{statusBadge(product.status)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">クイックアクション</h2>
              <div className="space-y-1.5">
                <QuickLink
                  label="商品を追加"
                  desc="新規商品の登録"
                  onClick={() => navigate('/products/new')}
                />
                <QuickLink
                  label="発注書を作成"
                  desc="商品を選んで帳票生成"
                  onClick={() => navigate('/documents/new')}
                />
                <QuickLink
                  label="収益を試算"
                  desc="シミュレーション開始"
                  onClick={() => navigate('/onboarding/1')}
                />
              </div>
            </div>

            {/* Recent documents */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">最近の発注書</h2>
                <button
                  type="button"
                  onClick={() => navigate('/documents')}
                  className="text-xs text-brand-600 hover:underline"
                >
                  すべて表示
                </button>
              </div>
              {recentDocs.length === 0 ? (
                <div className="px-4 py-6 text-center text-slate-400 text-sm">発注書がありません</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentDocs.map((doc) => (
                    <div key={doc.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{doc.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{doc.recipientName} · {doc.issueDate}</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900 shrink-0 tabular-nums">
                          {fmt(doc.total)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'おはようございます' : h < 17 ? 'こんにちは' : 'お疲れさまです'
}

function KpiCard({
  label, value, sub, icon, highlight, warn,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  highlight?: boolean
  warn?: boolean
}) {
  return (
    <div className="card px-4 py-4">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className={`p-1.5 rounded-md ${highlight ? 'bg-brand-50 text-brand-600' : warn ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
          {icon}
        </div>
      </div>
      <div className={`text-2xl font-semibold mt-2 tabular-nums ${warn ? 'text-red-600' : 'text-slate-900'}`}>
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  )
}

function QuickLink({ label, desc, onClick }: { label: string; desc: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-slate-50 transition-colors text-left group"
    >
      <div>
        <div className="text-sm font-medium text-slate-800 group-hover:text-brand-700">{label}</div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
      <svg className="w-4 h-4 text-slate-300 group-hover:text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
