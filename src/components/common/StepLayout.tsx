import type { ReactNode } from 'react'
import { ProgressBar } from './ProgressBar'

interface Props {
  step: number
  totalSteps: number
  title: string
  subtitle?: string
  children: ReactNode
  cta?: ReactNode
  onBack?: () => void
}

export function StepLayout({ step, totalSteps, title, subtitle, children, cta, onBack }: Props) {
  return (
    <div className="flex flex-col min-h-svh bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 pt-safe">
        <div className="max-w-xl mx-auto py-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex-shrink-0 p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex-1">
              <ProgressBar current={step} total={totalSteps} label="ステップ" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}
          <div className="space-y-3">{children}</div>
        </div>
      </div>

      {/* Fixed CTA */}
      {cta && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 pb-safe">
          <div className="max-w-xl mx-auto">{cta}</div>
        </div>
      )}
    </div>
  )
}
