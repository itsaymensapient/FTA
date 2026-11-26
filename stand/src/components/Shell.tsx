import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useStandData } from '@/data/StandData'
import { cn } from '@/lib/utils'
import type { Role } from '@/data/types'
import { useStand } from '@/session/StandSession'
import { CalendarDays, CircleUserRound } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
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
  const { DEMO, source } = useStandData()
  const shownDate = date ?? (isBiz ? DEMO.bizToday : DEMO.ftaToday)
  const { flash } = useStand()
  const reduce = useReducedMotion()
  const sourceLabel =
    source === 'postgres' ? 'Live DB' : source === 'snapshot' ? 'Workbook' : source === 'loading' ? '…' : 'Demo data'

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col text-foreground',
        isBiz ? 'shell-biz' : 'shell-fta dark',
      )}
      style={{ background: 'var(--shell-bg)' }}
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header
        className="sticky top-0 z-20 border-b border-border/80 backdrop-blur-md"
        style={{ background: 'color-mix(in oklab, var(--shell-chrome) 92%, transparent)' }}
      >
        <div className="stand-page flex items-center justify-between gap-4 px-6 py-3">
          <div className="min-w-0">
            <div
              className={cn(
                'truncate text-[0.875rem] font-semibold tracking-[-0.01em]',
                isBiz ? 'text-gold' : 'text-foreground',
              )}
              translate="no"
            >
              {title}
            </div>
            {isBiz ? (
              <div className="mt-0.5 text-[0.6875rem] leading-4 text-muted-foreground">
                for business · GITEX concept
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!isEntry ? (
              <a
                className="hidden sm:inline"
                href={isBiz ? '/guides/business.html' : '/guides/fta-specialist.html'}
                target="_blank"
                rel="noreferrer"
              >
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[0.625rem] font-semibold tracking-wide"
                >
                  GUIDE
                </Badge>
              </a>
            ) : null}
            <Badge variant="outline" className="h-6 px-2 font-medium" title="Data source for this demo">
              {sourceLabel}
            </Badge>
            <div className="hidden items-center gap-1.5 text-sm leading-none text-muted-foreground sm:flex">
              <CalendarDays className="size-3.5 opacity-70" aria-hidden="true" />
              <span>{shownDate}</span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5 text-sm font-medium leading-none text-foreground">
              <CircleUserRound className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
              <span className="truncate">
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
                <span className="font-medium">{visitorName} · Business</span>
                <span className="min-w-0 truncate opacity-90" translate="no">
                  {companyLabel}
                </span>
                <span className="opacity-80">{shownDate}</span>
              </div>
            </div>
          </>
        ) : null}
      </header>

      {flash ? (
        <div
          className="border-b border-gold/30 bg-gold/15"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="stand-page px-6 py-2 text-[0.8125rem] font-medium leading-5 text-foreground">
            {flash}
          </div>
        </div>
      ) : null}

      <motion.main
        id="main"
        key={String(role) + String(companyLabel) + String(date)}
        initial={isEntry || reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduce ? 0 : 0.22,
          ease: [0.23, 1, 0.32, 1],
        }}
        className={cn('stand-page flex-1 scroll-mt-20 px-6 py-5', className)}
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
