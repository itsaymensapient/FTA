import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DEMO } from '@/data/fixtures'
import { cn } from '@/lib/utils'
import type { Role } from '@/data/types'
import { CalendarDays, CircleUserRound } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = {
  role: Role | 'ENTRY'
  visitorName?: string
  companyLabel?: string
  date?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Shell({
  role,
  visitorName = 'Sara',
  companyLabel,
  date,
  children,
  footer,
  className,
}: Props) {
  const isBiz = role === 'BUSINESS'
  const isEntry = role === 'ENTRY'
  const title = isBiz ? 'CDP · FTA ASSISTANT' : 'FTA CDP · AI Agent Demo'
  const shownDate = date ?? (isBiz ? DEMO.bizToday : DEMO.ftaToday)

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col text-foreground',
        isBiz ? 'shell-biz' : 'shell-fta dark',
      )}
      style={{ background: 'var(--shell-bg)' }}
    >
      <header
        className="sticky top-0 z-20 border-b border-border/80 backdrop-blur-md"
        style={{ background: 'color-mix(in oklab, var(--shell-chrome) 92%, transparent)' }}
      >
        <div className="stand-page flex items-center justify-between gap-4 px-6 py-3.5">
          <div className="min-w-0">
            <div
              className={cn(
                'truncate text-[0.9375rem] font-semibold tracking-[-0.01em]',
                isBiz ? 'text-gold' : 'text-foreground',
              )}
            >
              {title}
            </div>
            {isBiz ? (
              <div className="mt-0.5 text-xs leading-5 text-muted-foreground">
                for business · GITEX concept
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <Badge variant="outline" className="h-8 rounded-full px-3 text-xs font-medium">
              Demo data
            </Badge>
            <div className="hidden items-center gap-1.5 text-sm leading-none text-muted-foreground sm:flex">
              <CalendarDays className="size-3.5 opacity-70" />
              <span>{shownDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium leading-none text-foreground">
              <CircleUserRound className="size-3.5 opacity-70" />
              <span>
                {visitorName}
                {isBiz ? ' · Business' : ''}
              </span>
            </div>
          </div>
        </div>

        {isBiz && companyLabel ? (
          <>
            <Separator />
            <div className="bg-primary text-primary-foreground">
              <div className="stand-page flex flex-wrap items-center justify-between gap-2 px-6 py-2.5 text-sm leading-5">
                <span className="font-medium">
                  {visitorName} · Business
                </span>
                <span className="opacity-90">{companyLabel}</span>
                <span className="opacity-80">{shownDate}</span>
              </div>
            </div>
          </>
        ) : null}
      </header>

      <motion.main
        key={String(role) + String(companyLabel) + String(date)}
        initial={isEntry ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={cn('stand-page flex-1 px-6 py-6', className)}
      >
        {children}
      </motion.main>

      {footer ? (
        <footer
          className="sticky bottom-0 z-20 border-t border-border/80"
          style={{ background: 'var(--shell-footer)' }}
        >
          <div className="stand-page px-6 py-3 text-xs leading-5 text-muted-foreground">
            {footer}
          </div>
        </footer>
      ) : null}
    </div>
  )
}
