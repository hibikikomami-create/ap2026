import { useNavigate } from 'react-router-dom'
import { StepLayout } from '../../components/common/StepLayout'
import { ChoiceButton } from '../../components/common/ChoiceButton'
import { useStore } from '../../store'
import type { SalesChannel } from '../../types'
import { TOTAL_STEPS } from './constants'

const channels: { value: SalesChannel; label: string; icon: string; desc: string }[] = [
  { value: 'store', label: '実店舗', icon: '🏪', desc: '直営店・マルシェ・ポップアップなど' },
  { value: 'ec', label: 'EC / WEB', icon: '🛒', desc: 'BASE、minne、Shopifyなど' },
  { value: 'both', label: '店舗 + EC', icon: '🔁', desc: '両方で販売する' },
  { value: 'wholesale', label: '卸売', icon: '🏢', desc: 'セレクトショップや小売店へ卸す' },
  { value: 'made_to_order', label: '受注販売', icon: '📝', desc: 'オーダーを受けてから作る' },
]

export default function Step2SalesChannel() {
  const navigate = useNavigate()
  const { onboarding, updateOnboarding } = useStore()

  const toggle = (v: SalesChannel) => {
    const cur = onboarding.salesChannels
    const next = cur.includes(v) ? cur.filter((c) => c !== v) : [...cur, v]
    updateOnboarding({ salesChannels: next })
  }

  const canNext = onboarding.salesChannels.length > 0

  return (
    <StepLayout
      step={2}
      totalSteps={TOTAL_STEPS}
      title="どんな売り方をしたいですか？"
      subtitle="複数選択できます"
      onBack={() => navigate('/onboarding/1')}
      cta={
        <button
          type="button"
          disabled={!canNext}
          onClick={() => navigate('/onboarding/3')}
          className="btn-primary w-full py-4 text-lg"
        >
          次へ
        </button>
      }
    >
      {channels.map((c) => (
        <ChoiceButton
          key={c.value}
          selected={onboarding.salesChannels.includes(c.value)}
          onClick={() => toggle(c.value)}
          icon={c.icon}
          description={c.desc}
          multi
        >
          {c.label}
        </ChoiceButton>
      ))}
    </StepLayout>
  )
}
