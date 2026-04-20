import type {
  OnboardingData,
  CalcResult,
  Product,
  ProductWithCalc,
} from '../../types'

export function calcFromOnboarding(data: OnboardingData): CalcResult {
  const {
    sellingPrice = 0,
    expectedSalesVolume = 0,
    unitCost = 0,
    monthlyFixedCost = 0,
    paymentFeeRate = 0,
    discountRate = 0,
    shippingCost = 0,
    otherCost = 0,
  } = data

  const sp = sellingPrice ?? 0
  const qty = expectedSalesVolume ?? 0
  const uc = unitCost ?? 0
  const fixed = monthlyFixedCost ?? 0
  const feeRate = (paymentFeeRate ?? 0) / 100
  const discRate = (discountRate ?? 0) / 100
  const ship = shippingCost ?? 0
  const other = otherCost ?? 0

  const effectivePrice = sp * (1 - discRate)
  const revenue = effectivePrice * qty
  const paymentFee = effectivePrice * feeRate * qty
  const variableCosts = (uc + ship + other) * qty + paymentFee
  const totalCost = variableCosts + fixed
  const grossProfit = revenue - variableCosts
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0
  const netProfit = revenue - totalCost
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

  const unitContributionMargin = effectivePrice - uc - ship - other - effectivePrice * feeRate
  const breakEvenVolume =
    unitContributionMargin > 0 ? Math.ceil(fixed / unitContributionMargin) : Infinity
  const breakEvenRevenue = breakEvenVolume === Infinity ? Infinity : breakEvenVolume * effectivePrice

  const warnings: string[] = []
  if (grossMargin < 20) warnings.push('粗利率が20%未満です。価格または原価を見直してください。')
  if (netProfit < 0) warnings.push('固定費を含めると赤字になります。販売数量を増やすか固定費を削減してください。')
  if (effectivePrice < uc) warnings.push('販売価格が原価を下回っています。')
  if (breakEvenVolume !== Infinity && breakEvenVolume > qty * 1.5) {
    warnings.push('損益分岐点が想定販売数の1.5倍以上です。収益化が難しい可能性があります。')
  }

  return {
    revenue,
    totalCost,
    grossProfit,
    grossMargin,
    netProfit,
    netMargin,
    breakEvenVolume,
    breakEvenRevenue,
    warnings,
  }
}

export function calcProduct(product: Product): ProductWithCalc {
  const {
    sellingPrice,
    unitCost,
    additionalCosts,
    monthlyFixedCost,
    paymentFeeRate,
    discountRate,
    shippingCost,
    expectedSalesVolume,
  } = product

  const feeRate = paymentFeeRate / 100
  const discRate = discountRate / 100
  const effectivePrice = sellingPrice * (1 - discRate)
  const addCostTotal = additionalCosts.reduce((s, c) => s + c.amount, 0)
  const paymentFee = effectivePrice * feeRate
  const totalVariableCostPerUnit = unitCost + shippingCost + addCostTotal + paymentFee
  const revenue = effectivePrice * expectedSalesVolume
  const variableCosts = totalVariableCostPerUnit * expectedSalesVolume
  const grossProfit = (effectivePrice - unitCost) * expectedSalesVolume
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0
  const netProfit = revenue - variableCosts - monthlyFixedCost
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

  return {
    ...product,
    grossProfit,
    grossMargin,
    netProfit,
    netMargin,
  }
}

export function calcProductSimple(product: Product): Pick<ProductWithCalc, 'grossProfit' | 'grossMargin' | 'netProfit' | 'netMargin'> {
  const p = calcProduct(product)
  return {
    grossProfit: p.grossProfit,
    grossMargin: p.grossMargin,
    netProfit: p.netProfit,
    netMargin: p.netMargin,
  }
}

export function fmt(value: number, currency = true): string {
  if (!isFinite(value)) return '—'
  if (currency) return `¥${Math.round(value).toLocaleString('ja-JP')}`
  return value.toLocaleString('ja-JP')
}

export function fmtPct(value: number): string {
  if (!isFinite(value)) return '—'
  return `${value.toFixed(1)}%`
}
