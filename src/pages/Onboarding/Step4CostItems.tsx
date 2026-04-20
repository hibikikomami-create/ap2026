import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../../components/common/StepLayout'
import { ChoiceButton } from '../../components/common/ChoiceButton'
import { useStore } from '../../store'
import type { CostItemKey } from '../../types'
import { COST_ITEMS, TOTAL_STEPS } from './constants'

export default function Step4CostItems() {
  const navigate = useNavigate()
  const { onboarding, updateOnboarding } = useStore()

  const toggle = (key: CostItemKey) => {
    const cur = onboarding.selectedCostItems
    const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]
    updateOnboarding({ selectedCostItems: next })
  }

  const canNext = onboarding.selectedCostItems.length > 0

  return (
    <StepLayout
      step={4}
      totalSteps={TOTAL_STEPS}
      title="発生しそうな費用を選んでください"
      subtitle="後で追加・削除もできます。複数選択可"
      onBack={() => navigate('/onboarding/3')}
      cta={
        <button
          type="button"
          disabled={!canNext}
          onClick={() => navigate('/onboarding/5')}
          className="btn-primary w-full py-4 text-lg"
        >
          次へ
        </button>
      }
    >
      {COST_ITEMS.map((item) => (
        <ChoiceButton
          key={item.key}
          selected={onboarding.selectedCostItems.includes(item.key)}
          onClick={() => toggle(item.key)}
          icon={item.icon}
          multi
        >
          {item.label}
        </ChoiceButton>
      ))}
    </StepLayout>
  )
}
