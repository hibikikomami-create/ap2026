import type { ReactNode } from 'react'

interface Props {
  selected?: boolean
  onClick: () => void
  children: ReactNode
  icon?: ReactNode
  description?: string
  multi?: boolean
}

export function ChoiceButton({ selected, onClick, children, icon, description, multi }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 active:scale-98
        ${selected
          ? 'border-brand-500 bg-brand-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/30'
        }`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className={`text-2xl flex-shrink-0 ${selected ? 'opacity-100' : 'opacity-70'}`}>
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-base ${selected ? 'text-brand-700' : 'text-gray-800'}`}>
            {children}
          </div>
          {description && (
            <div className="text-sm text-gray-500 mt-0.5">{description}</div>
          )}
        </div>
        <div className={`flex-shrink-0 w-5 h-5 rounded-${multi ? 'md' : 'full'} border-2 flex items-center justify-center transition-all
          ${selected
            ? 'bg-brand-500 border-brand-500'
            : 'border-gray-300'
          }`}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}
