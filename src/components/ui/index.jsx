// Primitivos de UI compartilhados — tema escuro violeta da marca BRD.
import { forwardRef } from 'react'

export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function Button({ as: As = 'button', variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-brd-500 text-white hover:bg-brd-600',
    ghost: 'bg-white/5 text-white hover:bg-white/10 border border-white/10',
    subtle: 'bg-transparent text-white/70 hover:text-brd-200',
    danger: 'bg-red-700 text-white hover:bg-red-800'
  }
  return <As className={cx(base, variants[variant], className)} {...props} />
}

export function Card({ as: As = 'div', className = '', children, ...props }) {
  return (
    <As
      className={cx(
        'min-w-0 rounded-2xl border border-white/10 bg-surface p-5',
        className
      )}
      {...props}
    >
      {children}
    </As>
  )
}

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="mb-1.5 block text-sm font-medium text-white/80">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  )
}

const controlBase =
  'min-h-11 w-full min-w-0 rounded-xl border border-white/40 bg-control px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:border-brd-200 disabled:cursor-not-allowed disabled:opacity-50'

export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={cx(controlBase, className)} {...props} />
})

export const Textarea = forwardRef(function Textarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={cx(controlBase, 'min-h-[90px] resize-y', className)} {...props} />
})

export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select ref={ref} className={cx(controlBase, className)} {...props}>
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
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums',
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
      {children && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{children}</p>}
    </div>
  )
}
