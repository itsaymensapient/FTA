import { useAIActivity } from '@/components/AIActivity'
import { useStand } from '@/session/StandSession'
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
import { motion, useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'

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
    <Card className={cn('gap-0 rounded-xl py-0 shadow-none ring-border/70', className)}>
      <CardContent className={cn('p-5 sm:p-6', contentClassName)}>{children}</CardContent>
    </Card>
  )
}

/** Equal-height card with body content and a CTA pinned to the bottom edge. */
export function ActionCard({
  children,
  action,
  className,
  contentClassName,
}: {
  children: ReactNode
  action: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <Panel className={cn('h-full', className)} contentClassName={cn('flex h-full flex-col', contentClassName)}>
      <div className="flex min-h-0 flex-1 flex-col gap-3">{children}</div>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">{action}</div>
    </Panel>
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

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2 text-[0.625rem] font-semibold tracking-[0.1em] text-gold uppercase',
        className,
      )}
    >
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
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0 : 0.22,
        delay: reduce ? 0 : delay,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

export { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow }

export function AskBar({
  placeholder = 'Ask about this case…',
  onAsk,
  live = true,
}: {
  placeholder?: string
  onAsk?: (q: string) => void
  /** When true (default), POST /api/agent/ask and show the tool answer under the input. */
  live?: boolean
}) {
  const [busy, setBusy] = useState(false)
  const setAIActive = useAIActivity()
  const { role, company } = useStand()
  const [answer, setAnswer] = useState<string | null>(null)
  const [meta, setMeta] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="mt-1 flex flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const fd = new FormData(form)
          const q = String(fd.get('q') || '').trim()
          if (!q) return
          onAsk?.(q)
          if (!live) {
            form.reset()
            return
          }
          setBusy(true)
          setAIActive(true)
          setError(null)
          setAnswer(null)
          setMeta(null)
          void fetch('/api/agent/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: q, ...(role === 'BUSINESS' ? { demo_company: company || 'unknown' } : {}) }),
          })
            .then(async (res) => {
              const body = (await res.json()) as {
                ok?: boolean
                answer?: string
                tool?: string
                source?: string
                error?: string
                llm?: { used?: boolean; model?: string }
              }
              if (!res.ok || body.ok === false) {
                throw new Error(body.error || `Ask failed (${res.status})`)
              }
              setAnswer(body.answer || '')
              const provider = body.llm?.used
                ? `Live AI · ${body.llm.model || 'shared model'}`
                : 'Offline demo · tool-based answer'
              const evidence = [body.tool, body.source].filter(Boolean).join(' · ')
              setMeta([provider, evidence ? `How I got this: ${evidence}` : null].filter(Boolean).join(' — '))
              form.reset()
            })
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : String(err))
            })
            .finally(() => { setBusy(false); setAIActive(false) })
        }}
      >
        <Input
          name="q"
          placeholder={busy ? 'Looking up CDP tools…' : placeholder}
          aria-label={placeholder}
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
          className="h-10"
        />
      </form>
      <p role="status" className="text-xs leading-5 text-destructive">{error || ''}</p>
      {answer ? (
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5">
          <p className="whitespace-pre-wrap text-sm leading-6">{answer}</p>
          {meta ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{meta}</p> : null}
        </div>
      ) : null}
    </div>
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
              'flex w-full items-start gap-2 rounded-md border px-3 py-2.5 text-left text-[0.8125rem] leading-5 transition-[color,background-color,border-color] duration-150 ease-[var(--ease-out)]',
              'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40',
              active && accent === 'primary' && 'border-primary bg-primary/15 text-foreground',
              active && accent === 'gold' && 'border-gold bg-gold/15 text-foreground',
              !active && 'border-border bg-transparent text-foreground hover:bg-muted/50',
              opt.tone === 'danger' && !active && 'border-destructive/50 text-destructive',
            )}
          >
            {opt.recommended ? (
              <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" />
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
    <Alert variant="destructive" className="mt-3" role="alert">
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
      <div className="text-[0.625rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </div>
      <div
        className={cn(
          'mt-1 text-[1.0625rem] font-semibold leading-tight tracking-[-0.02em] tabular-nums',
          tone === 'ok' && 'num-ok',
          tone === 'gold' && 'num-gold',
        )}
      >
        {value}
      </div>
      {hint ? <div className="mt-1 text-[0.6875rem] leading-4 text-muted-foreground">{hint}</div> : null}
    </Panel>
  )
}
