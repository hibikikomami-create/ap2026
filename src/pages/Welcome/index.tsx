import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'

export default function Welcome() {
  const navigate = useNavigate()
  const { currentProject, resetOnboarding } = useStore()

  const handleStart = () => {
    resetOnboarding()
    navigate('/onboarding/1')
  }

  const handleSample = () => {
    navigate('/dashboard?sample=1')
  }

  return (
    <div className="min-h-svh flex flex-col bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-white/5" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="text-center max-w-sm w-full">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-8 shadow-lg">
            <span className="text-4xl">✦</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            あなたのクリエイティブな<br />未来を支援します
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-10">
            質問に答えるだけで、あなた専用の商品管理シートが自動で完成します。
          </p>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleStart}
              className="w-full bg-white text-brand-700 font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-all hover:bg-brand-50"
            >
              はじめる
            </button>
            <button
              type="button"
              onClick={handleSample}
              className="w-full bg-white/15 text-white font-semibold py-4 rounded-2xl text-base active:scale-95 transition-all hover:bg-white/20 border border-white/20"
            >
              サンプルを見る
            </button>
            {currentProject && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full text-white/70 text-sm py-2 active:scale-95 transition-all"
              >
                → 作成済みシートに戻る
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="px-6 pb-10 relative">
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-4">
          {[
            { icon: '💬', text: '質問に答えるだけ' },
            { icon: '📊', text: '自動でシート生成' },
            { icon: '📄', text: 'PDF・Excel出力' },
          ].map((f) => (
            <div key={f.text} className="text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-white/70 text-xs">{f.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
