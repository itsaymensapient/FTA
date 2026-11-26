import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('panel agent-bubble', className)}>{children}</div>
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="stand-label mb-2">{children}</div>
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'gold' | 'ghost'
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:opacity-95',
        variant === 'outline' && 'border border-border bg-transparent hover:bg-muted/40',
        variant === 'gold' && 'bg-gold text-white hover:opacity-95',
        variant === 'ghost' && 'bg-transparent hover:bg-muted/40',
        className,
      )}
      {...props}
    />
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="h-11 w-full rounded-lg border border-border bg-card/70 px-3 text-center text-[0.9375rem] outline-none focus:border-primary"
      {...props}
    />
  )
}
