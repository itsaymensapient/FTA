import type { ReactNode } from 'react'
import { CalendarDays, CircleUserRound } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Shell({
  variant,
  title,
  visitorName,
  companyLabel,
  date,
  footer,
  children,
}: {
  variant: 'fta' | 'biz' | 'entry'
  title?: string
  visitorName: string
  companyLabel?: string
  date?: string
  footer?: ReactNode
  children: ReactNode
}) {
  const isBiz = variant === 'biz'
  return (
    <div className={cn(isBiz ? 'shell-biz' : 'shell-fta dark', 'flex min-h-screen flex-col')}>
      <header
        className="sticky top-0 z-20 border-b border-border/80 backdrop-blur-md"
        style={{ background: 'color-mix(in oklab, var(--shell-chrome) 92%, transparent)' }}
      >
        <div className="stand-page flex items-center justify-between gap-4 px-6 py-3">
          <div>
            <div className={cn('text-[0.875rem] font-semibold', isBiz ? 'text-gold' : 'text-foreground')}>
              {title || (isBiz ? 'CDP · FTA ASSISTANT' : 'FTA CDP · AI Agent Demo')}
            </div>
            {isBiz ? (
              <div className="mt-0.5 text-[0.6875rem] text-muted-foreground">for business · GITEX concept</div>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full border border-border px-2.5 py-1 text-xs">Demo data</span>
            {date ? (
              <span className="hidden items-center gap-1.5 text-muted-foreground sm:flex">
                <CalendarDays className="size-3.5 opacity-70" />
                {date}
              </span>
            ) : null}
            <span className="flex items-center gap-1.5 font-medium">
              <CircleUserRound className="size-3.5 opacity-70" />
              {visitorName}
              {isBiz ? ' · Business' : ''}
            </span>
          </div>
        </div>
        {isBiz && companyLabel ? (
          <div className="bg-primary text-primary-foreground">
            <div className="stand-page flex justify-between gap-2 px-6 py-2.5 text-sm">
              <span className="font-medium">{visitorName} · Business</span>
              <span className="truncate opacity-90">{companyLabel}</span>
              <span className="opacity-80">{date}</span>
            </div>
          </div>
        ) : null}
      </header>
      <main className="stand-page flex-1 px-5 py-7 sm:px-6 sm:py-8">{children}</main>
      {footer ? (
        <footer className="sticky bottom-0 border-t border-border/80" style={{ background: 'var(--shell-footer)' }}>
          <div className="stand-page px-6 py-3 text-xs text-muted-foreground">{footer}</div>
        </footer>
      ) : null}
    </div>
  )
}

export function ActivityFooter({
  label,
  items,
}: {
  label: string
  items: { label: string; status: 'done' | 'wait' }[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="font-semibold tracking-[0.08em] text-primary uppercase">{label}</span>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span>{item.status === 'done' ? '✓' : '⏳'}</span>
          {item.label}
        </span>
      ))}
    </div>
  )
}

export function Stepper({
  variant,
  current,
  eventLabel,
}: {
  variant: 'FTA' | 'BUSINESS'
  current: string
  eventLabel?: string
}) {
  const steps =
    variant === 'FTA'
      ? ['Signal', 'Explain', 'Decide', 'Act', 'Follow-up', 'Closed']
      : ['Check', 'Explain', 'Decide', 'Act', 'Follow-up', 'Done']
  const map: Record<string, number> = {
    SIGNAL: 0, CHECK: 0, EXPLAIN: 1, DECIDE: 2, ACT: 3, FOLLOW_UP: 4, CLOSED: 5, DONE: 5,
  }
  const idx = map[current] ?? 0
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((label, i) => {
          const done = i < idx
          const active = i === idx
          return (
            <li key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-[0.6875rem] font-semibold',
                  done && 'bg-success text-white',
                  active && 'bg-primary text-primary-foreground',
                  !done && !active && 'bg-muted text-muted-foreground',
                )}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={cn('text-sm', active ? 'font-semibold' : 'text-muted-foreground')}>{label}</span>
            </li>
          )
        })}
      </ol>
      {eventLabel ? <div className="text-sm text-muted-foreground">{eventLabel}</div> : null}
    </div>
  )
}
