import { CaseInvoices } from '@/components/CaseInvoices'
import { ActivityFooter } from '@/components/ActivityFooter'
import { Shell } from '@/components/Shell'
import { Stepper } from '@/components/Stepper'
import {
  ActionCard,
  AskBar,
  Button,
  FadeIn,
  Panel,
  SectionLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { useStandData } from '@/data/StandData'
import { aed, aedPlain } from '@/lib/format'
import { useStand } from '@/session/StandSession'
import { UC2Journey } from '@/components/UC2Journey'
import { useState } from 'react'

export function C1ExplainFta() {
  const {
    DEMO,
    COMPANIES,
    YASMEEN_BOXES,
    YASMEEN_GAP_1B,
    YASMEEN_GAP_NET,
    YASMEEN_GAP_1A,
    YASMEEN_INVOICE_COUNT,
  } = useStandData()
  const company = COMPANIES.yasmeen
  const gap1a = Math.abs(YASMEEN_GAP_1A)
  const { visitorName, go, log } = useStand()
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={visitorName || DEMO.visitorDefault}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'VAT return matched to 1,912 documents', status: 'done' },
            { label: `Gap traced to ${YASMEEN_INVOICE_COUNT} invoices`, status: 'done' },
            { label: `All ${YASMEEN_INVOICE_COUNT} confirmed by buyers`, status: 'done' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="EXPLAIN" eventLabel={`Event 1 · ${company.name}`} />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm leading-6">
              {company.name} filed its VAT return for Aug–Oct 2026 on 25 November. CDP compared the return to e-invoices for the same period.
            </p>
          </Panel>
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm leading-6">
              Dubai Box 1b gap <span className="num-gap">{aed(YASMEEN_GAP_1B)}</span>. Abu Dhabi declared{' '}
              {aed(gap1a)} more than its e-invoices. Net under-declaration{' '}
              <span className="num-gold">{aed(YASMEEN_GAP_NET, true)}</span> — high risk.
            </p>
          </Panel>
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm leading-6">
              The Dubai gap traces to {YASMEEN_INVOICE_COUNT} invoices issued in October to 6 buyers. Box 9 matches.
              Numbers come from CDP tools, not the language model.
            </p>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                log(`Opened ${YASMEEN_INVOICE_COUNT} invoices`)
                go('05_c1_documents')
              }}
            >
              Show {YASMEEN_INVOICE_COUNT} invoices
            </Button>
            <Button
              onClick={() => {
                log('Opened options')
                go('06_c1_act')
              }}
            >
              What can I do?
            </Button>
          </div>
          <AskBar />
        </FadeIn>
        <FadeIn delay={0.06}>
          <Panel>
            <h2 className="mb-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
              Tax return reconciliation · Aug–Oct 2026
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Box</TableHead>
                  <TableHead>Return, AED</TableHead>
                  <TableHead>E-invoices, AED</TableHead>
                  <TableHead>Gap, AED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {YASMEEN_BOXES.map((row) => (
                  <TableRow
                    key={row.box}
                    className={row.box === '14' ? 'bg-gold/10 font-medium' : undefined}
                  >
                    <TableCell>
                      <div className="font-medium leading-5">{row.box}</div>
                      <div className="text-xs leading-5 text-muted-foreground">{row.label}</div>
                    </TableCell>
                    <TableCell className="align-middle">{aedPlain(row.declared)}</TableCell>
                    <TableCell className="align-middle">{aedPlain(row.einvoices)}</TableCell>
                    <TableCell
                      className={
                        row.gap === 0
                          ? 'align-middle'
                          : row.gap > 0
                            ? 'num-gap align-middle'
                            : 'num-ok align-middle'
                      }
                    >
                      {row.gap === 0 ? '—' : aedPlain(row.gap)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function C1DocumentsFta() {
  const { DEMO, COMPANIES } = useStandData()
  const { visitorName, go } = useStand()
  return <Shell role="FTA_SPECIALIST" visitorName={visitorName || DEMO.visitorDefault}>
    <Stepper variant="FTA" current="EXPLAIN" eventLabel={`Event 1 · ${COMPANIES.yasmeen.name}`} />
    <CaseInvoices onBack={() => go('04_c1_explain')} onContinue={() => go('06_c1_act')} />
  </Shell>
}

export function C1ActFta() {
  const { DEMO, COMPANIES } = useStandData()
  const { visitorName, go } = useStand()
  const [phase, setPhase] = useState<'DECIDE' | 'ACT' | 'FOLLOW_UP' | 'CLOSED'>('DECIDE')
  return (
    <Shell role="FTA_SPECIALIST" visitorName={visitorName || DEMO.visitorDefault}>
      <Stepper
        variant="FTA"
        current={phase === 'FOLLOW_UP' || phase === 'CLOSED' ? 'ACT' : phase}
        eventLabel={`Event 1 · ${COMPANIES.yasmeen.name}`}
      />
      <UC2Journey
        role="fta"
        onComplete={() => go('07_c1_followup')}
        onPhaseChange={setPhase}
      />
    </Shell>
  )
}

export function C1FollowupFta() {
  const { DEMO, COMPANIES } = useStandData()
  const { visitorName, go } = useStand()
  return <Shell role="FTA_SPECIALIST" visitorName={visitorName || DEMO.visitorDefault}>
    <Stepper variant="FTA" current="FOLLOW_UP" eventLabel={`Event 1 · ${COMPANIES.yasmeen.name}`} />
    <UC2Journey role="review" onComplete={() => go('07b_c1_closed')} />
    <Button variant="ghost" onClick={() => go('04_c1_explain')}>Back</Button>
  </Shell>
}

export function C1ClosedFta() {
  const {
    DEMO,
    COMPANIES,
    YASMEEN_GAP_NET,
    YASMEEN_GAP_1A,
    YASMEEN_GAP_1B,
  } = useStandData()
  const company = COMPANIES.yasmeen
  const gap1a = Math.abs(YASMEEN_GAP_1A)
  const { visitorName, go, openCase } = useStand()
  const history = [
    { date: '10 Dec', who: 'Agent', what: `Found Box 1b gap ${aed(YASMEEN_GAP_1B)}; net ${aed(YASMEEN_GAP_NET)}` },
    { date: '10 Dec', who: 'Sara', what: 'Sent request for clarification' },
    { date: '11 Dec', who: 'Taxpayer', what: `Submitted VD · net ${aed(YASMEEN_GAP_NET)}` },
    { date: '14 Dec', who: 'Agent', what: 'Reconciled VD with 38 e-invoices' },
    { date: '14 Dec', who: 'Sara', what: 'Closed the case' },
  ]
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={visitorName || DEMO.visitorDefault}
      date={DEMO.followUpToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Case closed', status: 'done' },
            { label: 'Audit log saved', status: 'done' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="CLOSED" eventLabel={`Event 1 · ${company.name}`} />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <div className="ml-auto max-w-[90%] rounded-lg bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
            YOU · Close case
          </div>
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm leading-6">
              Case {company.caseId} is closed. Net adjustment {aed(YASMEEN_GAP_NET)}; {aed(gap1a)} moved from Abu Dhabi
              to Dubai.
            </p>
          </Panel>
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm leading-6">
              Next on your list:{' '}
              <span className="font-medium text-destructive">Al Waha Electronics</span>, refund decision due 25
              December. Shall I open it?
            </p>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => openCase('waha', 'R1_refund_explain')}>Open event 2</Button>
            <Button variant="outline" onClick={() => go('03_briefing')}>
              Back to briefing
            </Button>
          </div>
          <AskBar placeholder="…or ask me anything about the data" />
        </FadeIn>
        <FadeIn delay={0.06} className="flex flex-col gap-4">
          <Panel>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Case {company.caseId}</Badge>
              <Badge variant="outline" className="text-success">
                Closed
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>What</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={`${row.date}-${row.who}-${row.what}`}>
                    <TableCell className="whitespace-nowrap">{row.date}</TableCell>
                    <TableCell>{row.who}</TableCell>
                    <TableCell>{row.what}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
          <div className="grid gap-3 sm:grid-cols-2">
            <Panel>
              <div className="text-2xl font-semibold leading-none text-success">
                + {aed(YASMEEN_GAP_NET)}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">additional VAT declared</p>
            </Panel>
            <Panel>
              <p className="text-sm leading-6">Every step, decision and letter is kept with the case.</p>
            </Panel>
          </div>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function Y1Home() {
  const {
    DEMO,
    COMPANIES,
    YASMEEN_GAP_1B,
    YASMEEN_INVOICE_COUNT,
  } = useStandData()
  const company = COMPANIES.yasmeen
  const { visitorName, go } = useStand()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      role="BUSINESS"
      visitorName={name}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: '1,912 sales e-invoices checked', status: 'done' },
            { label: 'FTA letter read', status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="stand-title">Your VAT overview</h1>
      </div>
      <Stepper variant="BUSINESS" current="CHECK" />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[320px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <SectionLabel className="text-gold">+ FTA assistant</SectionLabel>
            <p className="text-sm leading-6">
              Good day, {name}. I am the FTA Assistant for <strong>{company.name}</strong>. I check your e-invoices,
              your VAT filings and your letters from the FTA.
            </p>
          </Panel>
          <Panel>
            <SectionLabel className="text-gold">+ FTA assistant</SectionLabel>
            <p className="text-sm leading-6">
              <strong>One item needs your attention.</strong> I have already gone through the data behind it.
            </p>
          </Panel>
          <Button variant="gold" onClick={() => go('Y2_explain')}>
            Open the item
          </Button>
          <AskBar placeholder="…or ask me about your VAT data." />
        </FadeIn>
        <FadeIn delay={0.06} className="flex flex-col gap-4">
          <ActionCard
            className="border-t-2 border-t-gold bg-gold/5"
            action={<Button onClick={() => go('Y2_explain')}>Open</Button>}
          >
            <div className="flex items-center gap-2 text-[0.75rem] font-semibold tracking-wide text-destructive uppercase">
              <span className="size-1.5 rounded-full bg-destructive" aria-hidden />
              Reply due 7 Jan 2027
            </div>
            <div className="text-[0.9375rem] font-semibold leading-snug tracking-[-0.02em]">
              The FTA asks you to explain your Aug–Oct 2026 return
            </div>
            <p className="text-[0.8125rem] leading-5 text-muted-foreground">
              Your e-invoices show {aed(YASMEEN_GAP_1B)} more output VAT for Dubai than your return.
            </p>
          </ActionCard>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">Letters from the FTA and deadlines</h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>10 Dec 2026</TableCell>
                  <TableCell>Request for clarification · Ref. {company.caseId}</TableCell>
                  <TableCell className="text-destructive">07 Jan 2027</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Open</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>25 Nov 2026</TableCell>
                  <TableCell>VAT return Aug–Oct 2026</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-success">
                      Submitted
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>—</TableCell>
                  <TableCell>VAT return Nov 2026–Jan 2027</TableCell>
                  <TableCell>28 Feb 2027</TableCell>
                  <TableCell className="text-muted-foreground">Not due yet</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Panel>
          <div>
            <h2 className="mb-3 text-base font-semibold leading-snug">Your company</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Panel contentClassName="border-b-2 border-b-primary py-4">
                <div className="text-xs text-muted-foreground">Value Added Tax</div>
                <div className="mt-1 text-lg font-semibold text-success">Active</div>
                <div className="mt-1 text-xs text-muted-foreground">TRN {company.trn}</div>
              </Panel>
              <Panel contentClassName="border-b-2 border-b-primary py-4">
                <div className="text-xs text-muted-foreground">E-Invoicing</div>
                <div className="mt-1 text-lg font-semibold text-success">Active</div>
                <div className="mt-1 text-xs text-muted-foreground">Provider: Sahel Digital Invoicing</div>
              </Panel>
              <Panel contentClassName="border-b-2 border-b-primary py-4">
                <div className="text-xs text-muted-foreground">Excise Tax</div>
                <div className="mt-1 text-lg font-semibold">—</div>
                <div className="mt-1 text-xs text-muted-foreground">Not registered</div>
              </Panel>
            </div>
          </div>
          <p className="sr-only">{YASMEEN_INVOICE_COUNT} invoices available on explain</p>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function Y2Explain() {
  const {
    DEMO,
    COMPANIES,
    YASMEEN_BOXES,
    YASMEEN_GAP_1B,
    YASMEEN_GAP_NET,
    YASMEEN_GAP_1A,
    YASMEEN_INVOICE_COUNT,
  } = useStandData()
  const company = COMPANIES.yasmeen
  const gap1a = Math.abs(YASMEEN_GAP_1A)
  const { visitorName, go } = useStand()
  return (
    <Shell
      role="BUSINESS"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: 'FTA letter read', status: 'done' },
            { label: `${YASMEEN_INVOICE_COUNT} invoices matched with your ledger`, status: 'done' },
            { label: '4 invoices found in Box 1a', status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
        Request for clarification · {company.caseId}
      </div>
      <Stepper variant="BUSINESS" current="EXPLAIN" />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <SectionLabel>FTA assistant</SectionLabel>
            <p className="text-sm leading-6">
              The FTA asked you to explain a difference of <span className="font-semibold">{aed(YASMEEN_GAP_1B)}</span> in
              Dubai output VAT for Aug–Oct 2026, concerning {YASMEEN_INVOICE_COUNT} invoices from October.
            </p>
          </Panel>
          <Panel>
            <SectionLabel>FTA assistant</SectionLabel>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
              <li>
                <strong>34 invoices ({aed(YASMEEN_GAP_NET)}):</strong> dated in Oct but booked in Nov. Missing from the
                Aug–Oct return.
              </li>
              <li>
                <strong>4 invoices ({aed(gap1a)}):</strong> issued by the Dubai branch but reported in Box 1a (Abu
                Dhabi).
              </li>
            </ul>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => go('Y2b_documents')}>
              Show {YASMEEN_INVOICE_COUNT} invoices
            </Button>
            <Button variant="gold" onClick={() => go('Y3_act')}>
              What can I do?
            </Button>
          </div>
          <AskBar placeholder="Ask about this case…" />
        </FadeIn>
        <FadeIn delay={0.06} className="flex flex-col gap-4">
          <Panel className="border-l-2 border-l-gold">
            <h2 className="mb-2 text-base font-semibold leading-snug">
              From the FTA · Request for clarification · 10 Dec 2026
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Your return declared less output VAT for Dubai than your e-invoices show. Declared Box 1b is below the
              e-invoice total by {aed(YASMEEN_GAP_1B)}; net difference {aed(YASMEEN_GAP_NET)}. Please explain or submit a
              Voluntary Disclosure within 20 business days (due 07.01.2027). Ref. {company.caseId}.
            </p>
          </Panel>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">Aug–Oct 2026 return vs e-invoices (AED)</h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Box</TableHead>
                  <TableHead>Your return</TableHead>
                  <TableHead>E-invoices</TableHead>
                  <TableHead>Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {YASMEEN_BOXES.filter((row) => ['1a', '1b', '1c', '9'].includes(row.box)).map((row) => (
                  <TableRow key={row.box}>
                    <TableCell>
                      <div className="font-medium leading-5">{row.box}</div>
                      <div className="text-xs text-muted-foreground">{row.label}</div>
                    </TableCell>
                    <TableCell>{aedPlain(row.declared)}</TableCell>
                    <TableCell>{aedPlain(row.einvoices)}</TableCell>
                    <TableCell
                      className={
                        row.gap === 0 ? undefined : row.gap > 0 ? 'num-gap' : 'num-gap'
                      }
                    >
                      {row.gap === 0 ? '—' : aedPlain(row.gap)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">
              {YASMEEN_INVOICE_COUNT} invoices vs your ledger (AED)
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Group</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>In your ledger</TableHead>
                  <TableHead>What it means</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Booked in the wrong period</TableCell>
                  <TableCell>34</TableCell>
                  <TableCell>{aedPlain(YASMEEN_GAP_NET)}</TableCell>
                  <TableCell>Booked in November</TableCell>
                  <TableCell className="num-gap">Correct Aug–Oct with a VD</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Reported under Abu Dhabi</TableCell>
                  <TableCell>4</TableCell>
                  <TableCell>{aedPlain(gap1a)}</TableCell>
                  <TableCell>Box 1a</TableCell>
                  <TableCell className="num-gap">Move to Box 1b with the VD</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Panel>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function Y2bDocuments() {
  const { DEMO, COMPANIES, YASMEEN_INVOICE_COUNT } = useStandData()
  const { visitorName, go } = useStand()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      role="BUSINESS"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: `${YASMEEN_INVOICE_COUNT} invoices listed`, status: 'done' },
            { label: 'Invoice dates compared with the ledger', status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
        Request for clarification · {company.caseId}
      </div>
      <Stepper variant="BUSINESS" current="EXPLAIN" />
      <CaseInvoices business onBack={() => go('Y2_explain')} onContinue={() => go('Y3_act')} />
    </Shell>
  )
}

export function Y3Act() {
  const { DEMO, COMPANIES } = useStandData()
  const { visitorName, go } = useStand()
  const company = COMPANIES.yasmeen
  const [phase, setPhase] = useState<'DECIDE' | 'ACT' | 'FOLLOW_UP' | 'CLOSED'>('DECIDE')
  return (
    <Shell
      role="BUSINESS"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
    >
      <Stepper
        variant="BUSINESS"
        current={phase === 'FOLLOW_UP' || phase === 'CLOSED' ? 'ACT' : phase}
      />
      <UC2Journey role="business" onComplete={() => go('Y4_followup')} onPhaseChange={setPhase} />
      <Button variant="ghost" onClick={() => go('Y2_explain')}>
        Back
      </Button>
    </Shell>
  )
}

export function Y4Followup() {
  const { DEMO, COMPANIES, YASMEEN_GAP_NET } = useStandData()
  const { visitorName, go } = useStand()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      role="BUSINESS"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      date={DEMO.followUpToday}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: 'FTA decision received', status: 'done' },
            { label: 'Case closed', status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
        Request for clarification · {company.caseId}
      </div>
      <Stepper variant="BUSINESS" current="FOLLOW_UP" />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <div className="mb-2 rounded-md bg-primary px-3 py-1.5 text-[0.75rem] font-medium text-primary-foreground">
              Mon 14 Dec 2026 · the FTA replied
            </div>
            <SectionLabel>FTA assistant</SectionLabel>
            <p className="text-sm leading-6">The FTA reviewed your VD and your reply.</p>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>VD accepted: it matches the e-invoices</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>The 4 invoices are now in Dubai</span>
              </li>
            </ul>
            <p className="mt-3 text-sm leading-6">
              The case is closed. The additional VAT of {aed(YASMEEN_GAP_NET)} is in your payment summary.
            </p>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button variant="gold" onClick={() => go('Z1_summary')}>
              Finish
            </Button>
            <Button variant="outline" onClick={() => go('Z1_summary')}>
              Open payment summary
            </Button>
          </div>
          <UC2Journey role="status" onComplete={() => go('Z1_summary')} />
        </FadeIn>
        <FadeIn delay={0.06} className="flex flex-col gap-4">
          <div className="rounded-md border border-border bg-white p-5 text-[#12263a] shadow-sm">
            <p className="text-xs text-[#5b6b7c]">From the FTA · Ref. {company.caseId} · 14 Dec 2026</p>
            <p className="mt-4 text-sm leading-6">Dear Sir or Madam,</p>
            <p className="mt-3 text-sm leading-6">
              Thank you for your reply. Your Voluntary Disclosure for August–October 2026 has been reconciled with your
              electronic invoices and accepted. The case is closed.
            </p>
            <p className="mt-6 text-xs text-[#5b6b7c]">Federal Tax Authority · VAT Compliance</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Panel>
              <div className="text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Case
              </div>
              <div className="mt-2 text-xl font-semibold text-success">Closed</div>
              <p className="mt-1 text-xs text-muted-foreground">Letter 10 Dec · reply 11 Dec · closed 14 Dec</p>
            </Panel>
            <Panel>
              <div className="text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Additional VAT
              </div>
              <div className="mt-2 text-xl font-semibold text-primary">{aed(YASMEEN_GAP_NET)}</div>
              <p className="mt-1 text-xs text-muted-foreground">for Aug–Oct 2026</p>
            </Panel>
            <Panel>
              <div className="text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Reply
              </div>
              <div className="mt-2 text-xl font-semibold text-success">Early</div>
              <p className="mt-1 text-xs text-muted-foreground">27 days before the deadline</p>
            </Panel>
          </div>
        </FadeIn>
      </div>
    </Shell>
  )
}
