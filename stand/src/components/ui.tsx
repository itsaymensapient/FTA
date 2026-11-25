import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export function Panel({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <Card className={cn('gap-0 py-0 shadow-none ring-border/70', className)}>
      <CardContent className={cn('p-5', contentClassName)}>{children}</CardContent>
    </Card>
  )
}

export function PaperPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Card
      className={cn(
        'gap-0 border-border bg-white py-0 text-[#12263a] shadow-none ring-1 ring-black/5',
        className,
      )}
    >
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2.5 text-[0.6875rem] font-semibold tracking-[0.12em] text-gold uppercase">
      {children}
    </div>
  )
}

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow }

export function AskBar({
  placeholder = 'Ask about this case…',
  onAsk,
}: {
  placeholder?: string
  onAsk?: (q: string) => void
}) {
  return (
    <form
      className="mt-1"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const q = String(fd.get('q') || '').trim()
        if (q) onAsk?.(q)
        e.currentTarget.reset()
      }}
    >
      <Input name="q" placeholder={placeholder} aria-label={placeholder} className="h-12" />
    </form>
  )
}

export function OptionList({
  options,
  selected,
  onSelect,
  accent = 'primary',
}: {
  options: {
    id: string
    label: string
    recommended?: boolean
    tone?: 'default' | 'danger'
  }[]
  selected: string
  onSelect: (id: string) => void
  accent?: 'primary' | 'gold'
}) {
  return (
    <div className="flex flex-col gap-2" role="listbox" aria-label="Options">
      {options.map((opt) => {
        const active = selected === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onSelect(opt.id)}
            className={cn(
              'flex w-full items-start gap-2 rounded-lg border px-3.5 py-3 text-left text-sm leading-5 transition-colors',
              active && accent === 'primary' && 'border-primary bg-primary/15 text-foreground',
              active && accent === 'gold' && 'border-gold bg-gold/15 text-foreground',
              !active && 'border-border bg-transparent text-foreground hover:bg-muted/50',
              opt.tone === 'danger' && !active && 'border-destructive/50 text-destructive',
            )}
          >
            {opt.recommended ? (
              <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
            ) : null}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function DangerNote({ children }: { children: ReactNode }) {
  return (
    <Alert variant="destructive" className="mt-3">
      <AlertDescription className="text-sm leading-5">{children}</AlertDescription>
    </Alert>
  )
}

export function StatTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'ok' | 'default' | 'gold'
}) {
  return (
    <Panel>
      <div className="text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </div>
      <div
        className={cn(
          'mt-1.5 text-xl font-semibold leading-tight tracking-[-0.02em]',
          tone === 'ok' && 'num-ok',
          tone === 'gold' && 'num-gold',
        )}
      >
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</div> : null}
    </Panel>
  )
}
