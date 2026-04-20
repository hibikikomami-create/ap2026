interface Props {
  current: number
  total: number
  label?: string
}

export function ProgressBar({ current, total, label }: Props) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {label && <span className="text-xs text-gray-500">{label}</span>}
        <span className="text-xs text-gray-400 ml-auto">
          {current} / {total}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
