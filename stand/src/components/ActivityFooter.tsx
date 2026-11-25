import type { ActivityItem } from '@/data/types'
import { Check, Circle, LoaderCircle } from 'lucide-react'

export function ActivityFooter({
  label,
  items,
}: {
  label: string
  items: ActivityItem[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className="font-semibold tracking-[0.08em] text-foreground/80 uppercase">
        {label}
      </span>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5 leading-none">
          {item.status === 'done' ? (
            <Check className="size-3.5 text-success" strokeWidth={2.5} />
          ) : item.status === 'wait' ? (
            <LoaderCircle className="size-3.5 animate-spin text-gold" />
          ) : (
            <Circle className="size-3 text-muted-foreground/60" />
          )}
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  )
}
