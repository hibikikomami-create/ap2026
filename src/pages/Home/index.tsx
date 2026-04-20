import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { calcProduct, fmt, fmtPct } from '../../lib/calculations'
import { statusBadge } from '../../components/common/Badge'
import { SAMPLE_CALC } from '../../lib/sampleData'

export default function Home() {
  const navigate = useNavigate()
  const { products, projects, documents, currentProject, settings } = useStore()

  const activeProducts = products.filter((p) => p.status === 'active')
  const totalRevenue = products.reduce((s, p) => {
    const c = calcProduct(p)
    return s + c.grossProfit
  }, 0)
  const avgMargin =
    products.length > 0
      ? products.reduce((s, p) => s + calcProduct(p).grossMargin, 0) / products.length
      : 0

  const recentProducts = [...products]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4)

  const recentDocs = [...documents]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 2)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'おはようございます' : hour < 17 ? 'こんにちは' : 'お疲れさまです'

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-sm text-gray-400">{greeting}</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
          {settings.displayName ? `${settings.displayName} さん` : 'マイページ'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {currentProject?.name || 'プロジェクト未選択'}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard
          label="商品数"
          value={`${products.length}`}
          sub={`うち販売中 ${activeProducts.length}件`}
          color="brand"
        />
        <SummaryCard
          label="月間粗利見込み"
          value={fmt(totalRevenue)}
          sub="全商品合計"
          color="green"
        />
        <SummaryCard
          label="平均粗利率"
          value={fmtPct(avgMargin)}
          sub="全商品平均"
          color={avgMargin >= 30 ? 'green' : avgMargin >= 15 ? 'yellow' : 'red'}
        />
        <SummaryCard
          label="プロジェクト数"
          value={`${projects.length}`}
          sub={`発注書 ${documents.length}件`}
          color="purple"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          クイックアクション
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            icon="➕"
            label="商品を追加"
            desc="新しい商品を登録する"
            onClick={() => navigate('/products/new')}
          />
          <QuickAction
            icon="🧮"
            label="収益を試算"
            desc="オンボーディングで試算"
            onClick={() => navigate('/onboarding/1')}
          />
          <QuickAction
            icon="📄"
            label="発注書を作成"
            desc="商品を選んで帳票生成"
            onClick={() => navigate('/documents/new')}
          />
          <QuickAction
            icon="📊"
            label="商品一覧を見る"
            desc="商品の管理・編集"
            onClick={() => navigate('/dashboard')}
          />
        </div>
      </div>

      {/* Trial calc result (always shown as sample insight) */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          直近の試算
        </h2>
        <div className="card p-4 bg-gradient-to-br from-brand-50 to-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-gray-900 text-sm">{SAMPLE_CALC.productName}</div>
              <div className="text-xs text-gray-400 mt-0.5">試算サンプル</div>
            </div>
            <span className="badge bg-green-100 text-green-700">良好</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-0.5">月間売上見込み</div>
              <div className="font-bold text-gray-900 text-base">{fmt(SAMPLE_CALC.revenue)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">粗利率</div>
              <div className="font-bold text-green-600 text-base">{fmtPct(SAMPLE_CALC.grossMargin)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-0.5">損益分岐点</div>
              <div className="font-bold text-gray-900 text-base">{SAMPLE_CALC.breakEvenVolume}個</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/onboarding/1')}
            className="mt-3 text-xs text-brand-600 font-medium hover:underline"
          >
            → 新しく試算する
          </button>
        </div>
      </div>

      {/* Recent products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            最近の商品
          </h2>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-xs text-brand-600 font-medium"
          >
            すべて見る →
          </button>
        </div>
        <div className="space-y-2">
          {recentProducts.map((product) => {
            const calc = calcProduct(product)
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => navigate(`/products/${product.id}`)}
                className="w-full card p-3 text-left flex items-center gap-3 hover:shadow-md transition-shadow active:scale-99"
              >
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg
                  ${product.category === 'apparel' ? 'bg-blue-100' :
                    product.category === 'home' ? 'bg-purple-100' :
                    product.category === 'food' ? 'bg-orange-100' : 'bg-gray-100'}`}
                >
                  {product.category === 'apparel' ? '👗' :
                   product.category === 'home' ? '🕯️' :
                   product.category === 'food' ? '🍱' : '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{product.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{product.code}</div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="font-semibold text-gray-900 text-sm">{fmt(product.sellingPrice)}</div>
                  <div className={`text-xs font-medium mt-0.5
                    ${calc.grossMargin >= 30 ? 'text-green-600' :
                      calc.grossMargin >= 15 ? 'text-yellow-600' : 'text-red-500'}`}
                  >
                    {fmtPct(calc.grossMargin)}
                  </div>
                </div>
                <div className="flex-shrink-0">{statusBadge(product.status)}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent documents */}
      {recentDocs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              最近の発注書
            </h2>
            <button
              type="button"
              onClick={() => navigate('/documents/new')}
              className="text-xs text-brand-600 font-medium"
            >
              新規作成 →
            </button>
          </div>
          <div className="space-y-2">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{doc.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{doc.recipientName} · {doc.issueDate}</div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="font-bold text-brand-700 text-sm">{fmt(doc.total)}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{doc.items.length}品目</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom spacer for mobile nav */}
      <div className="h-4" />
    </div>
  )
}

function SummaryCard({
  label, value, sub, color,
}: {
  label: string; value: string; sub: string; color: 'brand' | 'green' | 'yellow' | 'red' | 'purple'
}) {
  const colorClass = {
    brand: 'from-brand-50',
    green: 'from-green-50',
    yellow: 'from-yellow-50',
    red: 'from-red-50',
    purple: 'from-purple-50',
  }[color]
  const valueClass = {
    brand: 'text-brand-700',
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    red: 'text-red-600',
    purple: 'text-purple-700',
  }[color]
  return (
    <div className={`card p-3 bg-gradient-to-br ${colorClass} to-white`}>
      <div className="text-xs text-gray-500 mb-1 leading-tight">{label}</div>
      <div className={`font-bold text-lg leading-tight ${valueClass}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5 leading-tight">{sub}</div>
    </div>
  )
}

function QuickAction({
  icon, label, desc, onClick,
}: {
  icon: string; label: string; desc: string; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card p-4 text-left active:scale-98 transition-all hover:shadow-md group"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-semibold text-gray-900 text-sm group-hover:text-brand-700 transition-colors">
        {label}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
    </button>
  )
}
