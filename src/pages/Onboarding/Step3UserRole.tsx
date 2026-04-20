import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../../components/common/StepLayout'
import { ChoiceButton } from '../../components/common/ChoiceButton'
import { useStore } from '../../store'
import type { UserRole } from '../../types'
import { TOTAL_STEPS } from './constants'

const roles: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value: 'owner', label: 'オーナー（生産者）', icon: '🌱', desc: '自分で作って自分で販売する' },
  { value: 'production_manager', label: '生産管理者', icon: '⚙️', desc: '製造・仕入れを担当している' },
  { value: 'sales', label: '販売担当', icon: '🛍️', desc: '販売・マーケティングを担当している' },
]

export default function Step3UserRole() {
  const navigate = useNavigate()
  const { onboarding, updateOnboarding } = useStore()

  const select = (v: UserRole) => {
    updateOnboarding({ userRole: v })
    navigate('/onboarding/4')
  }

  return (
    <StepLayout
      step={3}
      totalSteps={TOTAL_STEPS}
      title="あなたの立場を教えてください"
      subtitle="最も近いものを選んでください"
      onBack={() => navigate('/onboarding/2')}
    >
      {roles.map((r) => (
        <ChoiceButton
          key={r.value}
          selected={onboarding.userRole === r.value}
          onClick={() => select(r.value)}
          icon={r.icon}
          description={r.desc}
        >
          {r.label}
        </ChoiceButton>
      ))}
    </StepLayout>
  )
}
