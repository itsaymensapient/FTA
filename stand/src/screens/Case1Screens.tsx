import { ActivityFooter } from '@/components/ActivityFooter'
import { Shell } from '@/components/Shell'
import { Stepper } from '@/components/Stepper'
import {
  ActionCard,
  AskBar,
  Button,
  DangerNote,
  FadeIn,
  OptionList,
  Panel,
  PaperPanel,
  SectionLabel,
  StatTile,
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
            { label: 'Return vs e-invoices by box', status: 'done' },
            { label: `${YASMEEN_INVOICE_COUNT} invoices listed`, status: 'done' },
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
              Box 1b (Dubai): VAT {aedPlain(1140000)} declared, {aedPlain(1626200)} on e-invoices — a gap of{' '}
              <span className="num-gap">{aed(YASMEEN_GAP_1B)}</span> from {YASMEEN_INVOICE_COUNT} October invoices.
            </p>
          </Panel>
          <Panel>
            <p className="text-sm leading-6">
              Box 1a is overstated by {aed(gap1a)}. Box 14 net gap is{' '}
              <span className="num-gold">{aed(YASMEEN_GAP_NET, true)}</span>.
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
              VAT201 · Aug–Oct 2026 (AED)
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Box</TableHead>
                  <TableHead>Return</TableHead>
                  <TableHead>E-invoices</TableHead>
                  <TableHead>Gap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {YASMEEN_BOXES.map((row) => (
                  <TableRow key={row.box}>
                    <TableCell>
                      <div className="font-medium leading-5">{row.box}</div>
                      <div className="text-xs leading-5 text-muted-foreground">{row.label}</div>
                    </TableCell>
                    <TableCell className="align-middle">{aedPlain(row.declared)}</TableCell>
                    <TableCell className="align-middle">{aedPlain(row.einvoices)}</TableCell>
                    <TableCell
                      className={
                        row.gap === 0 ? 'align-middle' : row.gap > 0 ? 'num-gap align-middle' : 'num-ok align-middle'
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
  const {
    DEMO,
    COMPANIES,
    YASMEEN_INVOICES,
    YASMEEN_INVOICE_COUNT,
  } = useStandData()
  const company = COMPANIES.yasmeen
  const { visitorName, go } = useStand()
  const selected = YASMEEN_INVOICES[0]
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={visitorName || DEMO.visitorDefault}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Invoice list attached', status: 'done' },
            { label: 'Tax invoice form ready', status: 'done' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="EXPLAIN" eventLabel={`Event 1 · ${company.name}`} />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <FadeIn>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">{YASMEEN_INVOICE_COUNT} invoices behind the gap</h2>
            <div className="flex flex-col gap-2 text-sm">
              {YASMEEN_INVOICES.map((inv) => (
                <div key={inv.number} className="rounded-lg border border-border px-3.5 py-2.5">
                  <div className="font-medium leading-5">{inv.number}</div>
                  <div className="text-xs leading-5 text-muted-foreground">
                    {inv.date} · {inv.buyer} · VAT {aedPlain(inv.vat)}
                  </div>
                </div>
              ))}
              <div className="text-xs leading-5 text-muted-foreground">… 33 more</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => go('04_c1_explain')}>
                Back
              </Button>
              <Button onClick={() => go('06_c1_act')}>What can I do?</Button>
            </div>
          </Panel>
        </FadeIn>
        <FadeIn delay={0.06}>
          <PaperPanel>
            <div className="text-[0.6875rem] font-semibold tracking-[0.1em] text-[#5b6b7c] uppercase">
              Tax invoice · e-invoice
            </div>
            <h2 className="mt-1.5 text-xl font-semibold leading-snug tracking-[-0.02em]">{selected.number}</h2>
            <div className="mt-4 grid gap-4 text-sm leading-6 md:grid-cols-2">
              <div>
                <div className="font-semibold">Seller</div>
                <div>{company.name}</div>
                <div className="text-[#5b6b7c]">TRN {company.trn}</div>
              </div>
              <div>
                <div className="font-semibold">Buyer</div>
                <div>{selected.buyer}</div>
                <div className="text-[#5b6b7c]">Issue date {selected.date} 2026</div>
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-[#f4f6f8] p-4 text-sm leading-6">
              <div className="flex justify-between gap-4">
                <span>Net</span>
                <span>{aedPlain(selected.vat * 20)}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <span>VAT 5%</span>
                <span>{aedPlain(selected.vat)}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4 font-semibold">
                <span>Payable</span>
                <span>{aedPlain(selected.vat * 21)}</span>
              </div>
            </div>
          </PaperPanel>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function C1ActFta() {
  const {
    DEMO,
    COMPANIES,
    YASMEEN_FTA_OPTIONS,
    YASMEEN_GAP_1B,
    YASMEEN_INVOICE_COUNT,
  } = useStandData()
  const company = COMPANIES.yasmeen
  const { visitorName, go, choices, setChoice, log, flashMessage } = useStand()
  const selected = choices.c1_fta || 'OPT-FTA-REC-1'
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={visitorName || DEMO.visitorDefault}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Letter drafted', status: 'done' },
            { label: 'Waiting for Send', status: 'wait' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="ACT" eventLabel={`Event 1 · ${company.name}`} />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <SectionLabel>What you can do</SectionLabel>
            <OptionList
              options={YASMEEN_FTA_OPTIONS}
              selected={selected}
              onSelect={(id) => setChoice('c1_fta', id)}
            />
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="success"
              onClick={() => {
                log('Letter sent CDP-VAT-2026-1187')
                go('07_c1_followup')
              }}
            >
              Send
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                log('Opened letter editor')
                flashMessage('Draft letter opened for edit. Adjust the text, then Send.')
              }}
            >
              Edit
            </Button>
            <Button variant="ghost" onClick={() => go('04_c1_explain')}>
              Cancel
            </Button>
          </div>
        </FadeIn>
        <FadeIn delay={0.06}>
          <PaperPanel>
            <div className="text-xs leading-5 text-[#5b6b7c]">Draft letter · Ref. {company.caseId}</div>
            <h2 className="mt-2 text-xl font-semibold leading-snug tracking-[-0.02em]">
              Request for clarification · VAT return Aug–Oct 2026
            </h2>
            <p className="mt-4 text-sm leading-6">
              To {company.name}, TRN {company.trn}. The CDP compared your return with e-invoices. Box 1b shows a gap of
              {aed(YASMEEN_GAP_1B)} from {YASMEEN_INVOICE_COUNT} invoices. Please explain or submit a Voluntary Disclosure within 20 business days
              (follow-up 7 January 2027). The invoice list is attached.
            </p>
          </PaperPanel>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function C1FollowupFta() {
  const {
    DEMO,
    COMPANIES,
    YASMEEN_GAP_1B,
    YASMEEN_GAP_NET,
    YASMEEN_GAP_1A,
  } = useStandData()
  const company = COMPANIES.yasmeen
  const gap1a = Math.abs(YASMEEN_GAP_1A)
  const { visitorName, go, log, flashMessage } = useStand()
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={visitorName || DEMO.visitorDefault}
      date={DEMO.followUpToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Reply received', status: 'done' },
            { label: 'VD reconciled', status: 'done' },
            { label: 'Emirate allocation checked', status: 'done' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="FOLLOW_UP" eventLabel={`Event 1 · ${company.name}`} />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <FadeIn>
          <Panel>
            <SectionLabel>Mon 14 Dec 2026 · the taxpayer replied</SectionLabel>
            <p className="text-sm leading-6">
              Al Yasmeen replied on 11 December. {aed(YASMEEN_GAP_NET)} is a cut-off error; {aed(gap1a)} was reported under Abu Dhabi.
              The whole difference is explained. I recommend closing the case.
            </p>
          </Panel>
        </FadeIn>
        <FadeIn delay={0.06} className="flex flex-col gap-4">
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">Agent check (AED)</h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Difference</TableHead>
                  <TableHead>Explained by</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Check</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{aedPlain(YASMEEN_GAP_1B)} (Dubai)</TableCell>
                  <TableCell>VD 11 Dec: 34 invoices added</TableCell>
                  <TableCell>{aedPlain(YASMEEN_GAP_NET)}</TableCell>
                  <TableCell className="num-ok">matches</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>—</TableCell>
                  <TableCell>4 invoices moved from Box 1a</TableCell>
                  <TableCell>{aedPlain(gap1a)}</TableCell>
                  <TableCell className="num-ok">matches</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Remaining</TableCell>
                  <TableCell />
                  <TableCell className="font-semibold">0</TableCell>
                  <TableCell className="num-ok">fully explained</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Panel>
          <Panel className="ring-success/35">
            <div className="text-xl font-semibold leading-snug tracking-[-0.02em] num-ok">
              {aed(YASMEEN_GAP_NET, true)} additional VAT declared by the taxpayer.
            </div>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                log('Opened Voluntary Disclosure')
                flashMessage(`VD opened: ${aed(YASMEEN_GAP_NET)} cut-off + ${aed(gap1a)} emirate move.`)
                go('05_c1_documents')
              }}
            >
              Open VD
            </Button>
            <Button
              variant="success"
              onClick={() => {
                log('Case closed')
                go('07b_c1_closed')
              }}
            >
              Close case
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                log('Asked for more information')
                go('16_query_table')
              }}
            >
              Ask for more information
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!window.confirm('Refer this case to audit? This ends the FTA follow-up path.')) return
                log('Referred to audit')
                flashMessage('Case referred to audit. Session continues to summary.')
                go('18_summary')
              }}
            >
              Refer to audit
            </Button>
          </div>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function C1ClosedFta() {
  const {
    DEMO,
    COMPANIES,
    YASMEEN_GAP_1B,
    YASMEEN_GAP_NET,
    YASMEEN_GAP_1A,
    YASMEEN_INVOICE_COUNT,
  } = useStandData()
  const company = COMPANIES.yasmeen
  const gap1a = Math.abs(YASMEEN_GAP_1A)
  const { visitorName, go, openCase } = useStand()
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
        <FadeIn>
          <Panel>
            <p className="text-sm leading-6">
              Case {company.caseId} is closed. Al Yasmeen declared {aed(YASMEEN_GAP_NET)} more VAT and moved {aed(gap1a)} to Dubai.
            </p>
            <p className="mt-3 text-sm leading-6">
              Next on your list: <span className="font-medium text-destructive">Al Waha Electronics</span>, refund
              decision due 25 December. Shall I open it?
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => openCase('waha', 'R1_refund_explain')}>Open event 2</Button>
              <Button variant="outline" onClick={() => go('03_briefing')}>
                Back to briefing
              </Button>
            </div>
          </Panel>
        </FadeIn>
        <FadeIn delay={0.06}>
          <Panel>
            <div className="mb-3 flex items-center gap-2">
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
                {[
                  ['10 Dec', 'Agent', `Gap of ${aed(YASMEEN_GAP_1B)} in Dubai found, letter drafted`],
                  ['10 Dec', 'Sara', 'Letter sent, follow-up set for 7 Jan'],
                  ['11 Dec', 'Taxpayer', 'Reply and Voluntary Disclosure'],
                  ['14 Dec', 'Agent', `VD reconciled with the ${YASMEEN_INVOICE_COUNT} e-invoices`],
                  ['14 Dec', 'Sara', 'Case closed'],
                ].map((row) => (
                  <TableRow key={row.join()}>
                    <TableCell>{row[0]}</TableCell>
                    <TableCell>{row[1]}</TableCell>
                    <TableCell>{row[2]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-lg font-semibold leading-snug num-ok">
              {aed(YASMEEN_GAP_NET, true)} additional VAT declared.
            </div>
          </Panel>
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
    YASMEEN_GAP_NET,
  } = useStandData()
  const company = COMPANIES.yasmeen
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
            { label: 'Open letter ready', status: 'done' },
            { label: 'Ledger match prepared', status: 'done' },
          ]}
        />
      }
    >
      <Stepper variant="BUSINESS" current="CHECK" />
      <FadeIn className="mx-auto mt-5 flex max-w-4xl flex-col gap-4">
        <h1 className="stand-title">VAT overview</h1>
        <ActionCard
          className="ring-gold/40"
          action={<Button onClick={() => go('Y2_explain')}>Open the item</Button>}
        >
          <Badge variant="destructive" className="w-fit">
            Reply due 07.01.2027
          </Badge>
          <div className="text-[0.9375rem] font-semibold leading-snug tracking-[-0.02em]">
            Request for clarification · {company.caseId}
          </div>
          <p className="text-[0.8125rem] leading-5 text-muted-foreground">
            The FTA asks about {aed(YASMEEN_GAP_1B)} more VAT for Dubai on e-invoices, {aed(YASMEEN_GAP_NET)} net.
          </p>
        </ActionCard>
        <div className="grid gap-3 md:grid-cols-3">
          {['VAT · Active', 'E-invoicing · Active', 'Excise · Not registered'].map((card) => (
            <Panel key={card} contentClassName="py-4">
              <div className="text-sm font-medium leading-5">{card}</div>
            </Panel>
          ))}
        </div>
      </FadeIn>
    </Shell>
  )
}

export function Y2Explain() {
  const {
    DEMO,
    COMPANIES,
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
            { label: 'FTA letter explained', status: 'done' },
            { label: `${YASMEEN_INVOICE_COUNT} invoices traced in ledger`, status: 'done' },
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
              From your ledger: 34 invoices with VAT of {aed(YASMEEN_GAP_NET)} are dated October but booked in November; 4 invoices
              with VAT of {aed(gap1a)} were issued by the Dubai branch but reported in Box 1a.
            </p>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => go('Y2b_documents')}>
              Show {YASMEEN_INVOICE_COUNT} invoices
            </Button>
            <Button onClick={() => go('Y3_act')}>What can I do?</Button>
          </div>
          <AskBar />
        </FadeIn>
        <FadeIn delay={0.06} className="flex flex-col gap-4">
          <Panel>
            <h2 className="mb-2 text-base font-semibold leading-snug">From the FTA · 10 Dec 2026</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Explain the difference or submit a VD by 07.01.2027. Box 1b gap {aed(YASMEEN_GAP_1B)}; net {aed(YASMEEN_GAP_NET)}.
            </p>
          </Panel>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">In your ledger</h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Finding</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>34 invoices booked in November</TableCell>
                  <TableCell>{aedPlain(YASMEEN_GAP_NET)}</TableCell>
                  <TableCell>Correct with a VD</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>4 invoices reported under Abu Dhabi</TableCell>
                  <TableCell>{aedPlain(gap1a)}</TableCell>
                  <TableCell>Move to Box 1b</TableCell>
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
  const {
    DEMO,
    COMPANIES,
    YASMEEN_INVOICES,
    YASMEEN_INVOICE_COUNT,
  } = useStandData()
  const company = COMPANIES.yasmeen
  const { visitorName, go } = useStand()
  const inv = YASMEEN_INVOICES[0]
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
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <FadeIn>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">The {YASMEEN_INVOICE_COUNT} invoices from the FTA letter</h2>
            <div className="flex flex-col gap-2 text-sm">
              {YASMEEN_INVOICES.map((row) => (
                <div key={row.number} className="rounded-lg border border-border px-3.5 py-2.5">
                  <div className="font-medium leading-5">{row.number}</div>
                  <div className="text-xs leading-5 text-muted-foreground">
                    {row.date} · {row.buyer} · ledger {row.ledger}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Invoice {inv.number} was issued on 14 October, but your ledger booked it on 3 November.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => go('Y2_explain')}>
                Back
              </Button>
              <Button onClick={() => go('Y3_act')}>What can I do?</Button>
            </div>
          </Panel>
        </FadeIn>
        <FadeIn delay={0.06}>
          <Panel>
            <div className="text-[0.6875rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              Tax invoice
            </div>
            <h2 className="mt-1 text-xl font-semibold leading-snug tracking-[-0.02em]">{inv.number}</h2>
            <p className="mt-4 text-sm leading-6">
              Seller {company.name} · Buyer {inv.buyer}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              VAT AED {aedPlain(inv.vat)} · Issued 14.10.2026 · Booked 03.11.2026
            </p>
          </Panel>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function Y3Act() {
  const {
    DEMO,
    COMPANIES,
    YASMEEN_BIZ_OPTIONS,
    YASMEEN_GAP_1A,
    YASMEEN_GAP_1B,
    YASMEEN_GAP_NET,
  } = useStandData()
  const company = COMPANIES.yasmeen
  const gap1a = Math.abs(YASMEEN_GAP_1A)
  const { visitorName, go, choices, setChoice, setWeakMessage, weakMessage, log, flashMessage } =
    useStand()
  const selected = choices.c1_biz || 'OPT-BUS-REC-1'
  return (
    <Shell
      role="BUSINESS"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: 'VD pre-filled from e-invoices', status: 'done' },
            { label: 'Reply drafted', status: 'done' },
            { label: 'Waiting for your approval', status: 'wait' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
        Request for clarification · {company.caseId}
      </div>
      <Stepper variant="BUSINESS" current="ACT" />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <SectionLabel>What you can do</SectionLabel>
            <OptionList
              accent="gold"
              options={YASMEEN_BIZ_OPTIONS}
              selected={selected}
              onSelect={(id) => {
                setChoice('c1_biz', id)
                const opt = YASMEEN_BIZ_OPTIONS.find((o) => o.id === id)
                if (opt?.weak && opt.weakReply) setWeakMessage(opt.weakReply)
                else setWeakMessage(null)
              }}
            />
            {weakMessage ? <DangerNote>{weakMessage}</DangerNote> : null}
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="success"
              disabled={Boolean(weakMessage)}
              onClick={() => {
                log('Submitted VD and reply')
                go('Y4_followup')
              }}
            >
              Submit VD and reply
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                log('Editing VD and reply')
                flashMessage('Edit mode: review the VD table and reply, then submit.')
              }}
            >
              Edit
            </Button>
            <Button variant="ghost" onClick={() => go('Y2_explain')}>
              Cancel
            </Button>
          </div>
        </FadeIn>
        <FadeIn delay={0.06} className="flex flex-col gap-4">
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">
              Voluntary Disclosure · VAT return Aug–Oct 2026 (AED)
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Box</TableHead>
                  <TableHead>As reported</TableHead>
                  <TableHead>As corrected</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ['1a VAT', '288,800', '214,600', `−${aedPlain(gap1a)}`],
                  ['1b VAT', '1,140,000', '1,626,200', `+${aedPlain(YASMEEN_GAP_1B)}`],
                  ['14', '823,100', '1,235,100', `+${aedPlain(YASMEEN_GAP_NET)}`],
                ].map((row) => (
                  <TableRow key={row[0]}>
                    <TableCell>{row[0]}</TableCell>
                    <TableCell>{row[1]}</TableCell>
                    <TableCell>{row[2]}</TableCell>
                    <TableCell className="num-gap">{row[3]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
          <Panel>
            <h2 className="mb-2 text-base font-semibold leading-snug">Reply to Ref. {company.caseId}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              The 34 October invoices were booked in November. The 4 Abu Dhabi invoices belong to the Dubai
              establishment. One VD corrects both. Do not count the 34 invoices again in the next return.
            </p>
          </Panel>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function Y4Followup() {
  const {
    DEMO,
    COMPANIES,
    YASMEEN_GAP_NET,
  } = useStandData()
  const company = COMPANIES.yasmeen
  const { visitorName, go, flashMessage, log } = useStand()
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
        <FadeIn>
          <Panel>
            <SectionLabel>Mon 14 Dec 2026 · the FTA replied</SectionLabel>
            <p className="text-sm leading-6">
              The FTA reviewed your VD and your reply. VD accepted: it matches the e-invoices. The case is closed. The
              additional VAT of {aed(YASMEEN_GAP_NET)} is in your payment summary.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="gold" onClick={() => go('Z1_summary')}>
                Finish
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  log('Opened payment summary')
                  flashMessage(`Payment summary: additional VAT ${aed(YASMEEN_GAP_NET)} for Aug–Oct 2026.`)
                  go('Z1_summary')
                }}
              >
                Open payment summary
              </Button>
            </div>
          </Panel>
        </FadeIn>
        <FadeIn delay={0.06} className="grid gap-3 md:grid-cols-3">
          <StatTile label="Case" value="Closed" hint="Letter 10 Dec · reply 11 Dec · closed 14 Dec" tone="ok" />
          <StatTile label="Additional VAT" value={aed(YASMEEN_GAP_NET)} hint="for Aug–Oct 2026" />
          <StatTile label="Reply" value="Early" hint="27 days before the deadline" tone="ok" />
        </FadeIn>
      </div>
    </Shell>
  )
}
