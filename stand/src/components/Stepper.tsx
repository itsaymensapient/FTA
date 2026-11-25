import { cn } from '@/lib/utils'
import type { StepId } from '@/data/types'
import { Check } from 'lucide-react'

const FTA_STEPS: { id: StepId; label: string }[] = [
  { id: 'SIGNAL', label: 'Signal' },
  { id: 'EXPLAIN', label: 'Explain' },
  { id: 'DECIDE', label: 'Decide' },
  { id: 'ACT', label: 'Act' },
  { id: 'FOLLOW_UP', label: 'Follow-up' },
  { id: 'CLOSED', label: 'Closed' },
]

const BIZ_STEPS: { id: StepId; label: string }[] = [
  { id: 'CHECK', label: 'Check' },
  { id: 'EXPLAIN', label: 'Explain' },
  { id: 'DECIDE', label: 'Decide' },
  { id: 'ACT', label: 'Act' },
  { id: 'FOLLOW_UP', label: 'Follow-up' },
  { id: 'DONE', label: 'Done' },
]

type Props = {
  variant: 'FTA' | 'BUSINESS'
  current: StepId
  eventLabel?: string
}

export function Stepper({ variant, current, eventLabel }: Props) {
  const steps = variant === 'FTA' ? FTA_STEPS : BIZ_STEPS
  const currentIdx = Math.max(
    0,
    steps.findIndex((s) => s.id === current),
  )

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <ol className="flex flex-wrap items-center gap-1.5">
        {steps.map((step, i) => {
          const done = i < currentIdx
          const active = i === currentIdx
          return (
            <li key={step.id} className="flex items-center gap-1.5">
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-sm text-[0.6875rem] font-semibold transition-colors',
                  done && 'bg-success text-white',
                  active && 'bg-primary text-primary-foreground shadow-sm',
                  !done && !active && 'border border-border bg-card/40 text-muted-foreground',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check className="size-3" strokeWidth={2.5} aria-hidden="true" /> : i + 1}
              </div>
              <span
                className={cn(
                  'pr-2 text-[0.8125rem] leading-none',
                  active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground',
                )}
              >
                {step.label}
              </span>
              {i < steps.length - 1 ? (
                <span className="mr-1 hidden h-px w-5 bg-border sm:block" aria-hidden />
              ) : null}
            </li>
          )
        })}
      </ol>
      {eventLabel ? (
        <div className="text-sm font-medium leading-5 text-muted-foreground">{eventLabel}</div>
      ) : null}
    </div>
  )
}
