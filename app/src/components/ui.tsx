import { useEffect } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { BadgeCheck, Star, X } from 'lucide-react'
import { cn } from '../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

export function btn(variant: Variant = 'primary', size: Size = 'md') {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    'disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]',
    size === 'sm' && 'h-8 px-3.5 text-[13px]',
    size === 'md' && 'h-10 px-5 text-sm',
    size === 'lg' && 'h-12 px-6 text-[15px]',
    variant === 'primary' && 'bg-ink text-white hover:bg-neutral-800 shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_1px_2px_rgba(0,0,0,0.2)]',
    variant === 'secondary' && 'bg-white text-ink ring-1 ring-neutral-200 hover:ring-neutral-400 hover:bg-neutral-50',
    variant === 'ghost' && 'text-ink hover:bg-neutral-100',
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn(btn(variant, size), className)} {...props} />
}

export function Pill({ children, solid, className }: { children: ReactNode; solid?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide whitespace-nowrap',
        solid ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-neutral-200',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Pill solid className={className}>
      <BadgeCheck className="size-3" strokeWidth={2.25} /> Verified
    </Pill>
  )
}

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-medium', className)}>
      <Star className="size-3.5 fill-ink" strokeWidth={0} />
      {value.toFixed(1)}
      {count !== undefined && <span className="font-normal text-neutral-500">({count})</span>}
    </span>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase', className)}>{children}</p>
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl bg-white ring-1 ring-neutral-200', className)}>{children}</div>
}

export function Field({ label, children, hint, className }: { label: string; children: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-neutral-500">{hint}</span>}
    </label>
  )
}

export const inputCls =
  'h-11 w-full rounded-xl bg-white px-3.5 text-sm text-ink ring-1 ring-neutral-200 outline-none transition placeholder:text-neutral-400 hover:ring-neutral-300 focus:ring-2 focus:ring-ink'

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md animate-fade-up rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button onClick={onClose} className="-m-1 rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-ink" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Stat({ label, value, sub, className }: { label: string; value: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <Card className={cn('p-5', className)}>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
    </Card>
  )
}

export function Bar({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-neutral-100', className)}>
      <div className="h-full rounded-full bg-ink transition-[width] duration-700" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  )
}
