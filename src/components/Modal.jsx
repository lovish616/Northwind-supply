import { useEffect, useRef } from 'react'
import { useEntrance } from '../lib/useEntrance.js'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

export default function Modal({ open, onClose, children, size = 'md', labelledBy }) {
  const rootRef = useRef(null)
  useEntrance(rootRef, open)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative w-full ${SIZES[size]} max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl animate-pop-in sm:rounded-2xl`}
      >
        {children}
      </div>
    </div>
  )
}
