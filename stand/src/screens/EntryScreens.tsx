import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ActivityFooter } from '@/components/ActivityFooter'
import { Shell } from '@/components/Shell'
import { ActionCard, AskBar, Button, Input, Panel } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { useStandData } from '@/data/StandData'
import { aed } from '@/lib/format'
import { useStand } from '@/session/StandSession'
import { Building2, Check, Landmark, LoaderCircle } from 'lucide-react'

export function NameScreen() {
  const { DEMO } = useStandData()
  const { visitorName, setName, go } = useStand()
  return (
    <Shell
      role="ENTRY"
      visitorName={visitorName || 'Visitor'}
      date={DEMO.ftaToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[{ label: 'Waiting for a visitor', status: 'wait' }]}
        />
      }
    >
      <div className="mx-auto flex min-h-[68vh] max-w-lg flex-col justify-center gap-7 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="stand-title text-white">Welcome to the FTA Central Data Platform</h1>
          <p className="stand-subtitle mx-auto max-w-[42ch]">
            Meet the AI agent that works with tax data. All data on this stand is synthetic.
          </p>
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            const next = visitorName.trim()
            if (!next) return
            setName(next)
            go('02_role')
          }}
        >
          <label
            className="text-[0.6875rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
            htmlFor="visitor-name"
          >
            What is your name?
          </label>
          <Input
            id="visitor-name"
            name="visitor-name"
            autoComplete="nickname"
            autoFocus
            spellCheck={false}
            placeholder="e.g. Sara…"
            value={visitorName}
            onChange={(e) => setName(e.target.value)}
            className="h-11 border-primary/50 bg-card/70 text-center text-[0.9375rem] leading-none"
          />
          <Button size="lg" type="submit" className="mx-auto min-w-40" disabled={!visitorName.trim()}>
            Continue
          </Button>
        </form>
      </div>
    </Shell>
  )
}

export function RoleScreen() {
  const { DEMO } = useStandData()
  const { visitorName, chooseRole } = useStand()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      role="ENTRY"
      visitorName={name}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[{ label: `Visitor: ${name}`, status: 'done' }]}
        />
      }
    >
      <div className="mx-auto max-w-4xl py-8">
        <h1 className="stand-title mb-8 text-center text-white">
          Hello, {name}. Who are you today?
        </h1>
        <div className="grid gap-4 md:grid-cols-2">
          <div
            role="button"
            tabIndex={0}
            className="relative rounded-md border-2 border-primary bg-card p-5 text-left transition-[background-color,border-color,transform] duration-150 ease-[var(--ease-out)] hover:bg-card/90 focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.99]"
            onClick={() => chooseRole('FTA_SPECIALIST')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                chooseRole('FTA_SPECIALIST')
              }
            }}
          >
            <a
              href="/guides/fta-specialist.html"
              target="_blank"
              rel="noreferrer"
              className="absolute top-3 right-3"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-[0.625rem] font-semibold tracking-wide text-primary"
              >
                GUIDE
              </Badge>
            </a>
            <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Landmark className="size-4" aria-hidden="true" />
            </div>
            <div className="text-[0.9375rem] font-semibold leading-snug text-white">FTA Specialist</div>
            <p className="mt-2 text-[0.8125rem] leading-5 text-muted-foreground">
              The agent finds tax risks and explains them. You decide; the agent acts and follows up.
            </p>
          </div>
          <div
            role="button"
            tabIndex={0}
            className="relative rounded-md border border-border bg-card p-5 text-left transition-[background-color,border-color,transform] duration-150 ease-[var(--ease-out)] hover:border-gold/60 hover:bg-card/90 focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.99]"
            onClick={() => chooseRole('BUSINESS')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                chooseRole('BUSINESS')
              }
            }}
          >
            <a
              href="/guides/business.html"
              target="_blank"
              rel="noreferrer"
              className="absolute top-3 right-3"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-[0.625rem] font-semibold tracking-wide text-gold"
              >
                GUIDE
              </Badge>
            </a>
            <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-gold/15 text-gold">
              <Building2 className="size-4" aria-hidden="true" />
            </div>
            <div className="text-[0.9375rem] font-semibold leading-snug text-white">Business</div>
            <p className="mt-2 text-[0.8125rem] leading-5 text-muted-foreground">
              The agent checks your VAT return against your e-invoices and helps you respond to the FTA.
            </p>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function PrepList({
  lines,
}: {
  lines: { text: string; done: boolean; time?: string; group?: string }[]
}) {
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(reduce ? lines.length : 1)
  useEffect(() => {
    if (reduce) {
      setVisible(lines.length)
      return
    }
    if (visible >= lines.length) return
    const t = setTimeout(() => setVisible((v) => v + 1), 520)
    return () => clearTimeout(t)
  }, [visible, lines.length, reduce])

  let lastGroup = ''
  return (
    <div className="flex flex-col gap-3" aria-live="polite" aria-relevant="additions">
      {lines.slice(0, visible).map((line, index) => {
        const isCurrent = !line.done && index === visible - 1
        const showGroup = line.group && line.group !== lastGroup
        if (line.group) lastGroup = line.group
        return (
          <div key={line.text}>
            {showGroup ? (
              <div className="mb-2 mt-1 text-[0.6875rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                {line.group}
              </div>
            ) : null}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-start gap-3 text-sm leading-6"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
                {line.done ? (
                  <Check className="size-4 text-success" strokeWidth={2.5} />
                ) : isCurrent ? (
                  <LoaderCircle className="size-4 animate-spin text-primary motion-reduce:animate-none" />
                ) : (
                  <span className="size-2 rounded-full bg-border" />
                )}
              </span>
              <span>
                {line.text}
                {line.time ? (
                  <span className="ml-2 text-muted-foreground">{line.time}</span>
                ) : null}
              </span>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

export function PrepFtaScreen() {
  const { DEMO, PREP_FTA_LINES } = useStandData()
  const { visitorName, go } = useStand()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={name}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'CDP rules: 21,480 e-invoices, 214 returns, 12 refunds', status: 'done' },
            { label: 'Agent: evidence collected', status: 'done' },
            { label: 'Agent: writing the briefing', status: 'wait' },
          ]}
        />
      }
    >
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[220px_1fr] md:items-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-28 items-center justify-center rounded-full border border-gold/50 text-4xl text-gold">
            ✦
          </div>
          <div className="font-semibold leading-snug text-gold">FTA agent</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">working for you since 06:00</p>
        </div>
        <Panel>
          <h2 className="mb-4 text-xl font-semibold leading-snug tracking-[-0.02em]">
            Good day, {name}. I prepared your day.
          </h2>
          <PrepList lines={PREP_FTA_LINES} />
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
            {[
              ['FOUND', '2 issues', ''],
              ['AT STAKE', 'AED 643,000', 'text-gold'],
              ['WAITING FOR YOU', '2 decisions', ''],
            ].map(([label, value, accent]) => (
              <div key={label} className="rounded-lg bg-muted/60 px-3 py-3">
                <div className="text-[0.625rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  {label}
                </div>
                <div className={`mt-2 text-lg font-semibold leading-none ${accent}`}>{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => go('03_briefing')}>Open my briefing</Button>
            <Button variant="outline" onClick={() => go('03_briefing')}>
              Skip
            </Button>
          </div>
        </Panel>
      </div>
    </Shell>
  )
}

export function PrepBizScreen() {
  const { DEMO, COMPANIES, PREP_BIZ_LINES, YASMEEN_INVOICE_COUNT } = useStandData()
  const { visitorName, go } = useStand()
  return (
    <Shell
      role="BUSINESS"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${COMPANIES.yasmeen.name} · TRN ${COMPANIES.yasmeen.trn}`}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: 'FTA letter received', status: 'done' },
            { label: `${YASMEEN_INVOICE_COUNT} invoices matched`, status: 'done' },
            { label: 'VD being prepared', status: 'wait' },
          ]}
        />
      }
    >
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[220px_1fr] md:items-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-28 items-center justify-center rounded-full border border-gold/50 text-4xl text-gold">
            ✦
          </div>
          <div className="font-semibold leading-snug text-gold">Your FTA Assistant</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Works for you. Sees only your company&apos;s data.
          </p>
        </div>
        <Panel>
          <h2 className="mb-1 text-xl font-semibold leading-snug tracking-[-0.02em]">
            A letter from the FTA has arrived. I am already on it.
          </h2>
          <p className="mb-4 text-sm leading-6 text-muted-foreground">
            {COMPANIES.yasmeen.name} · letter {COMPANIES.yasmeen.caseId} of 10 Dec 2026
          </p>
          <PrepList lines={PREP_BIZ_LINES} />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="gold" onClick={() => go('B01_company')}>
              Open my overview
            </Button>
            <Button variant="outline" onClick={() => go('B01_company')}>
              Skip
            </Button>
          </div>
        </Panel>
      </div>
    </Shell>
  )
}

export function BriefingScreen() {
  const { DEMO, BRIEFING, YASMEEN_GAP_1B, YASMEEN_GAP_NET, WAHA_CLAIMED } = useStandData()
  const { visitorName, openCase, go, log } = useStand()
  const name = visitorName || DEMO.visitorDefault
  const unsupported = WAHA_CLAIMED - 53600
  const detail: Record<string, string> = {
    yasmeen: `Output VAT under-declared by ${aed(YASMEEN_GAP_NET)} net · Aug–Oct 2026 · Dubai gap ${aed(YASMEEN_GAP_1B)}.`,
    waha: `Refund claimed ${aed(WAHA_CLAIMED)} · ${aed(unsupported)} not supported by e-invoices or by a filing supplier.`,
  }
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={name}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: '21,480 e-invoices checked', status: 'done' },
            { label: '214 VAT returns reconciled', status: 'done' },
            { label: '12 refund requests checked', status: 'done' },
            { label: '2 items prioritised by risk', status: 'done' },
          ]}
        />
      }
    >
      <div className="mx-auto grid max-w-5xl items-start gap-5 lg:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-3">
          <Panel>
            <div className="mb-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-primary uppercase">
              AI agent
            </div>
            <p className="text-[0.9375rem] leading-7">
              Good day, {name}. Since your last session I checked 21,480 new e-invoices, 214 VAT returns and 12
              refund requests. <strong className="font-semibold text-foreground">Two items need your attention</strong>,
              ordered by risk. Where would you like to start?
            </p>
          </Panel>
          <AskBar placeholder="…or ask me anything about the data." />
        </div>
        <div>
          <div className="mb-3 text-[0.6875rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            2 items · ordered by risk
          </div>
          <div className="grid gap-4">
            {BRIEFING.map((item) => (
              <Panel key={item.id} className="border-l-2 border-l-destructive">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="size-2 rounded-full bg-destructive" aria-hidden />
                      <span className="text-[0.8125rem] font-semibold tracking-wide text-destructive uppercase">
                        High · {item.reason}
                      </span>
                    </div>
                    <div className="text-[0.9375rem] font-semibold leading-snug tracking-[-0.01em]">
                      {item.event}
                    </div>
                    <div className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">{item.company}</div>
                    <p className="mt-2 text-[0.8125rem] leading-5 text-muted-foreground">
                      {detail[item.id]}
                    </p>
                  </div>
                  <Button
                    className="shrink-0 self-end"
                    onClick={() => {
                      log(`Opened ${item.company}`)
                      if (item.id === 'yasmeen') openCase('yasmeen', '04_c1_explain')
                      else openCase('waha', 'R1_refund_explain')
                    }}
                  >
                    Open
                  </Button>
                </div>
              </Panel>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="outline" onClick={() => go('16_query_table')}>
              Ask about the data
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  )
}

export function CompanyChooserScreen() {
  const { DEMO, COMPANIES, YASMEEN_GAP_1B, WAHA_CLAIMED } = useStandData()
  const { visitorName, openCase } = useStand()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      role="BUSINESS"
      visitorName={name}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: `Visitor: ${name} · role Business`, status: 'done' },
            { label: '2 companies checked against e-invoices, returns and FTA letters', status: 'done' },
          ]}
        />
      }
    >
      <div className="mx-auto max-w-4xl py-4">
        <h1 className="stand-title mb-2">Choose a company</h1>
        <p className="stand-subtitle mb-6 max-w-[62ch]">
          Today you are the VAT manager of one of two companies. The FTA Assistant found one open issue in each, with
          its deadline. Choose a company to start.
        </p>
        <div className="grid items-stretch gap-4 md:grid-cols-2">
          <ActionCard
            className="border-l-2 border-l-gold"
            action={
              <Button variant="gold" onClick={() => openCase('yasmeen', 'Y1_home')}>
                Open
              </Button>
            }
          >
            <div className="flex items-center gap-2 text-[0.75rem] font-semibold tracking-wide text-gold uppercase">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden />
              Reply due 7 Jan 2027
            </div>
            <div className="text-[0.9375rem] font-semibold leading-snug text-primary">{COMPANIES.yasmeen.name}</div>
            <div className="text-[0.75rem] text-muted-foreground">TRN {COMPANIES.yasmeen.trn}</div>
            <p className="text-[0.8125rem] leading-5 text-muted-foreground">
              The FTA asks you to explain your Aug–Oct 2026 return. Your e-invoices show {aed(YASMEEN_GAP_1B)} more
              output VAT for Dubai than your return · letter of 10 Dec.
            </p>
          </ActionCard>
          <ActionCard
            className="border-l-2 border-l-gold"
            action={
              <Button variant="gold" onClick={() => openCase('waha', 'W1_home')}>
                Open
              </Button>
            }
          >
            <div className="flex items-center gap-2 text-[0.75rem] font-semibold tracking-wide text-gold uppercase">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden />
              Documents due 24 Dec
            </div>
            <div className="text-[0.9375rem] font-semibold leading-snug text-primary">{COMPANIES.waha.name}</div>
            <div className="text-[0.75rem] text-muted-foreground">TRN {COMPANIES.waha.trn}</div>
            <p className="text-[0.8125rem] leading-5 text-muted-foreground">
              The FTA needs documents for AED 231,000 of your refund. Refund request {aed(WAHA_CLAIMED)} · AED 53,600
              approved, the rest on hold · letter of 10 Dec.
            </p>
          </ActionCard>
        </div>
      </div>
    </Shell>
  )
}
