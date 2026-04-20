import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { calcFromOnboarding, fmt, fmtPct } from '../../lib/calculations'

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  highlight?: boolean
  warn?: boolean
}

function MetricCard({ label, value, sub, highlight, warn }: MetricCardProps) {
  return (
    <div className={`p-4 rounded-2xl border ${highlight ? 'bg-brand-50 border-brand-200' : warn ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-brand-700' : warn ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function StepResult() {
  const navigate = useNavigate()
  const { onboarding, addProduct, createProject } = useStore()

  const result = calcFromOnboarding(onboarding)

  const handleCreate = () => {
    const project = createProject({
      name: onboarding.productName || 'マイブランド',
      businessType: onboarding.businessType ?? 'product',
      salesChannels: onboarding.salesChannels,
      userRole: onboarding.userRole ?? 'owner',
      selectedCostItems: onboarding.selectedCostItems,
    })

    addProduct({
      projectId: project.id,
      name: onboarding.productName || '商品名未設定',
      code: onboarding.productCode || '',
      category: 'other',
      colors: [],
      sizes: [],
      variants: [],
      sellingPrice: onboarding.sellingPrice ?? 0,
      wholesalePrice: 0,
      unitCost: onboarding.unitCost ?? 0,
      additionalCosts: [],
      monthlyFixedCost: onboarding.monthlyFixedCost ?? 0,
      paymentFeeRate: onboarding.paymentFeeRate ?? 0,
      discountRate: onboarding.discountRate ?? 0,
      shippingCost: onboarding.shippingCost ?? 0,
      salesChannels: onboarding.salesChannels,
      status: 'active',
      expectedSalesVolume: onboarding.expectedSalesVolume ?? 0,
      memo: '',
    })

    navigate('/sheet-result')
  }

  const isProfit = result.netProfit >= 0

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-accent-600 px-4 pt-12 pb-8">
        <div className="max-w-xl mx-auto">
          <div className="text-white/70 text-sm mb-1">シミュレーション結果</div>
          <h1 className="text-white text-2xl font-bold">
            {onboarding.productName || '商品'} の収益見込み
          </h1>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-4">
          {/* Main metrics */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="想定売上（月間）" value={fmt(result.revenue)} />
            <MetricCard label="想定原価合計" value={fmt(result.totalCost)} />
            <MetricCard label="想定粗利" value={fmt(result.grossProfit)} sub={`粗利率 ${fmtPct(result.grossMargin)}`} highlight />
            <MetricCard
              label="固定費込みの利益見込み"
              value={fmt(result.netProfit)}
              sub={`利益率 ${fmtPct(result.netMargin)}`}
              highlight={isProfit}
              warn={!isProfit}
            />
          </div>

          {/* Break-even */}
          <div className="card p-4">
            <div className="text-sm text-gray-500 mb-2">損益分岐点</div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {result.breakEvenVolume === Infinity ? '計算不可' : `${result.breakEvenVolume.toLocaleString()}個`}
              </span>
              {result.breakEvenVolume !== Infinity && (
                <span className="text-gray-400 text-sm pb-1">/ 月</span>
              )}
            </div>
            {result.breakEvenRevenue !== Infinity && (
              <div className="text-xs text-gray-400 mt-1">
                売上換算：{fmt(result.breakEvenRevenue)}
              </div>
            )}
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="card p-4 border-l-4 border-amber-400 bg-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-500">⚠️</span>
                <div className="font-semibold text-amber-800 text-sm">注意ポイント</div>
              </div>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-700">・{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="pt-2 pb-8">
            <button
              type="button"
              onClick={handleCreate}
              className="btn-primary w-full py-5 text-lg"
            >
              この内容で専用シートを作成する ✦
            </button>
            <button
              type="button"
              onClick={() => navigate('/onboarding/5')}
              className="btn-ghost w-full mt-2 text-sm"
            >
              数値を修正する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
