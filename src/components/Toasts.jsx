import { useRef } from 'react'
import { useShop } from '../store/shop.jsx'
import { useEntrance } from '../lib/useEntrance.js'

const TONES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  default: 'border-slate-200 bg-white text-slate-800',
}

export default function Toasts() {
  const { toasts, dismissToast } = useShop()
  const stackRef = useRef(null)
  useEntrance(stackRef, toasts.length > 0)
  if (toasts.length === 0) return null
  return (
    <div
      ref={stackRef}
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-card animate-toast-in ${TONES[t.tone] || TONES.default}`}
          role="status"
        >
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            className="text-current/60 hover:text-current"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
