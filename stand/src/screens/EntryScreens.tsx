import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ActivityFooter } from '@/components/ActivityFooter'
import { Shell } from '@/components/Shell'
import { ActionCard, Button, Input, Panel } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { BRIEFING, COMPANIES, DEMO, PREP_BIZ_LINES, PREP_FTA_LINES } from '@/data/fixtures'
import { useStand } from '@/session/StandSession'
import { Building2, Check, Landmark, LoaderCircle } from 'lucide-react'

export function NameScreen() {
  const { visitorName, setName, go } = useStand()
  return (
    <Shell role="ENTRY" visitorName={visitorName || 'Visitor'} date={DEMO.ftaToday}>
      <div className="mx-auto flex min-h-[68vh] max-w-lg flex-col justify-center gap-7 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="stand-title text-white">Welcome to the FTA Central Data Platform</h1>
          <p className="stand-subtitle mx-auto max-w-[38ch]">
            Type your name to begin the Federal Tax Authority stand demo.
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
          <label className="sr-only" htmlFor="visitor-name">
            Your name
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
            className="h-11 bg-card/70 text-center text-[0.9375rem] leading-none"
          />
          <Button size="lg" type="submit" className="mx-auto min-w-40" disabled={!visitorName.trim()}>
            Continue
          </Button>
        </form>
      </div>
      <div className="mt-8 text-center text-xs leading-5 text-muted-foreground">
        Waiting for a visitor
      </div>
    </Shell>
  )
}

export function RoleScreen() {
  const { visitorName, chooseRole } = useStand()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell role="ENTRY" visitorName={name}>
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
              Work with the FTA agent on overnight findings, letters, and follow-up.
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
              Become the VAT manager. The FTA Assistant already has the letter and a draft answer.
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
  lines: { text: string; done: boolean; time?: string }[]
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

  return (
    <div className="flex flex-col gap-3" aria-live="polite" aria-relevant="additions">
      {lines.slice(0, visible).map((line, index) => {
        const isCurrent = !line.done && index === visible - 1
        return (
          <motion.div
            key={line.text}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-start gap-3 text-sm leading-6"
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
              {line.done ? (
                <Check className="size-4 text-success" strokeWidth={2.5} />
              ) : isCurrent ? (
                <LoaderCircle className="size-4 animate-spin text-gold motion-reduce:animate-none" />
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
        )
      })}
    </div>
  )
}

export function PrepFtaScreen() {
  const { visitorName, go } = useStand()
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={visitorName || DEMO.visitorDefault}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: '21,480 e-invoices checked', status: 'done' },
            { label: '214 returns checked', status: 'done' },
            { label: 'Briefing ready', status: 'wait' },
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
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Works overnight on CDP rules. You decide what is sent.
          </p>
        </div>
        <Panel>
          <h2 className="mb-4 text-xl font-semibold leading-snug tracking-[-0.02em]">
            What I did before you arrived
          </h2>
          <PrepList lines={PREP_FTA_LINES} />
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
            {[
              ['2', 'issues'],
              ['AED 643k', 'at stake'],
              ['2', 'decisions due'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg bg-muted/60 px-3 py-3">
                <div className="text-lg font-semibold leading-none">{value}</div>
                <div className="mt-2 text-xs leading-4 text-muted-foreground">{label}</div>
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
            { label: '38 invoices matched', status: 'done' },
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
            Works for you. Sees only your company's data.
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
  const { visitorName, openCase, go, log } = useStand()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={name}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Returns vs e-invoices ranked', status: 'done' },
            { label: 'Refund deadlines checked', status: 'done' },
            { label: '2 events ready', status: 'done' },
          ]}
        />
      }
    >
      <div className="mx-auto max-w-4xl">
        <Panel className="mb-5">
          <p className="text-[0.9375rem] leading-7">
            Good day, {name}. Since your last session I checked 21,480 new e-invoices, 214 VAT returns and 12
            refund requests. Two items need your attention, ordered by risk.
          </p>
        </Panel>
        <div className="grid gap-4">
          {BRIEFING.map((item) => (
            <Panel key={item.id}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="destructive" className="h-6 px-2">
                      High
                    </Badge>
                    <span className="text-[0.8125rem] font-medium text-destructive">{item.reason}</span>
                  </div>
                  <div className="text-[0.9375rem] font-semibold leading-snug tracking-[-0.01em]">
                    {item.event}
                  </div>
                  <div className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">{item.company}</div>
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
    </Shell>
  )
}

export function CompanyChooserScreen() {
  const { visitorName, openCase } = useStand()
  return (
    <Shell role="BUSINESS" visitorName={visitorName || DEMO.visitorDefault}>
      <div className="mx-auto max-w-4xl py-4">
        <h1 className="stand-title mb-2">Choose a company</h1>
        <p className="stand-subtitle mb-6 max-w-[60ch]">
          You become the VAT manager. Each card shows the open issue and its deadline — no risk ratings on this side.
        </p>
        <div className="grid items-stretch gap-4 md:grid-cols-2">
          <ActionCard
            action={<Button onClick={() => openCase('yasmeen', 'Y1_home')}>Open</Button>}
          >
            <Badge variant="destructive" className="h-6 w-fit">
              Reply due 07.01.2027
            </Badge>
            <div className="text-[0.9375rem] font-semibold leading-snug">{COMPANIES.yasmeen.name}</div>
            <p className="text-[0.8125rem] leading-5 text-muted-foreground">
              The FTA asks for an explanation of the August–October 2026 return: e-invoices show AED 486,200 more VAT for
              Dubai, AED 412,000 net.
            </p>
          </ActionCard>
          <ActionCard
            action={<Button onClick={() => openCase('waha', 'W1_home')}>Open</Button>}
          >
            <Badge variant="destructive" className="h-6 w-fit">
              Documents due 24.12.2026
            </Badge>
            <div className="text-[0.9375rem] font-semibold leading-snug">{COMPANIES.waha.name}</div>
            <p className="text-[0.8125rem] leading-5 text-muted-foreground">
              Of a refund of AED 284,600, AED 53,600 is approved; documents needed for AED 231,000.
            </p>
          </ActionCard>
        </div>
      </div>
    </Shell>
  )
}
