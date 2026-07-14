// Primitivos de UI compartilhados — tema escuro violeta da marca BRD.
import { forwardRef } from 'react'

export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function Button({ as: As = 'button', variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brd/60 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-brd text-white hover:bg-brd-500 shadow-lg shadow-brd/20',
    ghost: 'bg-white/5 text-white hover:bg-white/10 border border-white/10',
    subtle: 'bg-transparent text-white/70 hover:text-brd',
    danger: 'bg-red-500/90 text-white hover:bg-red-500'
  }
  return <As className={cx(base, variants[variant], className)} {...props} />
}

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="mb-1.5 block text-sm font-medium text-white/80">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-white/40">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  )
}

const controlBase =
  'w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-brd/60 focus:outline-none focus:ring-2 focus:ring-brd/30'

export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={cx(controlBase, className)} {...props} />
})

export const Textarea = forwardRef(function Textarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={cx(controlBase, 'min-h-[90px] resize-y', className)} {...props} />
})

export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select ref={ref} className={cx(controlBase, 'appearance-none', className)} {...props}>
      {children}
    </select>
  )
})

export function Badge({ tone = 'brd', className = '', children }) {
  const tones = {
    brd: 'bg-brd/15 text-brd-200 border-brd/30',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    red: 'bg-red-500/15 text-red-300 border-red-500/30',
    yellow: 'bg-amber-400/15 text-amber-200 border-amber-400/30',
    gray: 'bg-white/10 text-white/60 border-white/15'
  }
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

export function EmptyState({ title, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-12 text-center">
      <p className="text-sm font-semibold text-white/80">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-md text-sm text-white/50">{children}</p>}
    </div>
  )
}
