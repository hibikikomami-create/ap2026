import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../../components/common/StepLayout'
import { ChoiceButton } from '../../components/common/ChoiceButton'
import { useStore } from '../../store'
import { TOTAL_STEPS } from './constants'

export default function Step1BusinessType() {
  const navigate = useNavigate()
  const { onboarding, updateOnboarding } = useStore()

  const select = (v: 'product' | 'service') => {
    updateOnboarding({ businessType: v })
    navigate('/onboarding/2')
  }

  return (
    <StepLayout
      step={1}
      totalSteps={TOTAL_STEPS}
      title="どんなことをしたいですか？"
      subtitle="あなたのビジネスの種類を教えてください"
    >
      <ChoiceButton
        selected={onboarding.businessType === 'product'}
        onClick={() => select('product')}
        icon="📦"
        description="ハンドメイド、食品、アパレル、雑貨など"
      >
        プロダクト（もの）を作って売る
      </ChoiceButton>
      <ChoiceButton
        selected={onboarding.businessType === 'service'}
        onClick={() => select('service')}
        icon="💼"
        description="コンサル、教室、デザイン、施術など"
      >
        サービスを提供する
      </ChoiceButton>
    </StepLayout>
  )
}
