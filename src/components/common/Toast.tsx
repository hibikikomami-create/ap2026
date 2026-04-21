import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  const colorClass =
    type === 'success'
      ? 'bg-green-600'
      : type === 'error'
        ? 'bg-red-600'
        : 'bg-gray-800'

  return (
    <div
      className={`fixed z-50 px-5 py-3 rounded-xl text-white text-sm shadow-lg max-w-xs w-full text-center
        bottom-20 left-1/2 -translate-x-1/2
        md:bottom-6 md:right-6 md:left-auto md:translate-x-0 md:text-left ${colorClass}`}
      role="alert"
    >
      {message}
    </div>
  )
}

interface ToastState {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

let _setToasts: React.Dispatch<React.SetStateAction<ToastState[]>> | null = null
let _counter = 0

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastState[]>([])
  _setToasts = setToasts

  return (
    <div className="fixed bottom-20 left-0 right-0 flex flex-col items-center gap-2 z-50 pointer-events-none
      md:bottom-6 md:right-6 md:left-auto md:items-end">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast
            message={t.message}
            type={t.type}
            onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          />
        </div>
      ))}
    </div>
  )
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (!_setToasts) return
  const id = ++_counter
  _setToasts((prev) => [...prev, { id, message, type }])
}
