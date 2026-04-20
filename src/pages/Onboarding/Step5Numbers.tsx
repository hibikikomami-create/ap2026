import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../../components/common/StepLayout'
import { NumberInput } from '../../components/common/NumberInput'
import { useStore } from '../../store'
import { TOTAL_STEPS } from './constants'

export default function Step5Numbers() {
  const navigate = useNavigate()
  const { onboarding, updateOnboarding } = useStore()
  const costs = onboarding.selectedCostItems

  const has = (...keys: string[]) => keys.some((k) => costs.includes(k as any))

  const canNext =
    onboarding.productName.trim() !== '' &&
    onboarding.sellingPrice !== null &&
    onboarding.expectedSalesVolume !== null &&
    (onboarding.unitCost !== null || !has('material', 'processing'))

  return (
    <StepLayout
      step={5}
      totalSteps={TOTAL_STEPS}
      title="数値を入力してください"
      subtitle="わかる範囲で入力してください。あとで編集できます"
      onBack={() => navigate('/onboarding/4')}
      cta={
        <button
          type="button"
          disabled={!canNext}
          onClick={() => navigate('/onboarding/result')}
          className="btn-primary w-full py-4 text-lg"
        >
          結果を見る
        </button>
      }
    >
      <div className="space-y-5">
        {/* Basic */}
        <div className="card p-4 space-y-4">
          <div className="section-title">商品基本情報</div>
          <div>
            <label className="label">
              商品名 <span className="text-brand-500">*</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="例：ハンドメイドキャンドル"
              value={onboarding.productName}
              onChange={(e) => updateOnboarding({ productName: e.target.value })}
            />
          </div>
          <div>
            <label className="label">品番 / SKU</label>
            <input
              type="text"
              className="input-field"
              placeholder="例：HMC-001"
              value={onboarding.productCode}
              onChange={(e) => updateOnboarding({ productCode: e.target.value })}
            />
          </div>
          <NumberInput
            label="販売価格"
            value={onboarding.sellingPrice}
            onChange={(v) => updateOnboarding({ sellingPrice: v })}
            prefix="¥"
            placeholder="3000"
            required
          />
          <NumberInput
            label="想定販売数（月間）"
            value={onboarding.expectedSalesVolume}
            onChange={(v) => updateOnboarding({ expectedSalesVolume: v })}
            suffix="個"
            placeholder="20"
            required
          />
        </div>

        {/* Variable costs */}
        {has('material', 'processing') && (
          <div className="card p-4 space-y-4">
            <div className="section-title">原価</div>
            {has('material') && (
              <NumberInput
                label="材料費（1個あたり）"
                value={onboarding.unitCost}
                onChange={(v) => updateOnboarding({ unitCost: v })}
                prefix="¥"
                placeholder="800"
              />
            )}
          </div>
        )}

        {/* Fixed costs */}
        {has('rent', 'utilities', 'labor', 'ec_fee', 'advertising', 'accountant', 'communication') && (
          <div className="card p-4 space-y-4">
            <div className="section-title">月額固定費（合計）</div>
            <NumberInput
              label="毎月かかる固定費の合計"
              value={onboarding.monthlyFixedCost}
              onChange={(v) => updateOnboarding({ monthlyFixedCost: v })}
              prefix="¥"
              placeholder="50000"
              hint="家賃、光熱費、人件費など月額でかかる費用の合計を入力してください"
            />
          </div>
        )}

        {/* Transaction costs */}
        {has('payment_fee') && (
          <div className="card p-4 space-y-4">
            <div className="section-title">取引コスト</div>
            {has('payment_fee') && (
              <NumberInput
                label="決済手数料率"
                value={onboarding.paymentFeeRate}
                onChange={(v) => updateOnboarding({ paymentFeeRate: v })}
                suffix="%"
                placeholder="3.6"
              />
            )}
            <NumberInput
              label="値引率（卸・割引）"
              value={onboarding.discountRate}
              onChange={(v) => updateOnboarding({ discountRate: v })}
              suffix="%"
              placeholder="0"
            />
          </div>
        )}

        {/* Shipping */}
        {has('shipping', 'packaging') && (
          <div className="card p-4 space-y-4">
            <div className="section-title">配送・梱包</div>
            <NumberInput
              label="送料（1件あたり）"
              value={onboarding.shippingCost}
              onChange={(v) => updateOnboarding({ shippingCost: v })}
              prefix="¥"
              placeholder="600"
            />
          </div>
        )}

        {has('other') && (
          <div className="card p-4">
            <NumberInput
              label="その他費用（1個あたり）"
              value={onboarding.otherCost}
              onChange={(v) => updateOnboarding({ otherCost: v })}
              prefix="¥"
              placeholder="0"
            />
          </div>
        )}
      </div>
    </StepLayout>
  )
}
