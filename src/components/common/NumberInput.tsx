import type { InputHTMLAttributes } from 'react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  prefix?: string
  suffix?: string
  hint?: string
  required?: boolean
}

export function NumberInput({ label, value, onChange, prefix, suffix, hint, required, ...rest }: Props) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-brand-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-gray-500 text-sm font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="numeric"
          value={value ?? ''}
          onChange={(e) => {
            const v = e.target.value
            onChange(v === '' ? null : parseFloat(v))
          }}
          className={`input-field ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-12' : ''}`}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-3 text-gray-500 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
