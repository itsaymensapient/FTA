import { RefundJourney } from '@/components/RefundJourney'
import { PaperDocumentsPanel } from '@/components/PaperDocuments'
import { SupplierStatusPanel } from '@/components/SupplierStatus'
import { useState } from 'react'
import { ActivityFooter } from '@/components/ActivityFooter'
import { Shell } from '@/components/Shell'
import { Stepper } from '@/components/Stepper'
import {
  ActionCard,
  AskBar,
  Button,
  FadeIn,
  Panel,
  PaperPanel,
  SectionLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useStandData } from '@/data/StandData'
import { aed, aedPlain } from '@/lib/format'
import { useStand } from '@/session/StandSession'

function toneClass(tone: string) {
  if (tone === 'ok') return 'num-ok'
  if (tone === 'bad') return 'num-gap'
  return 'text-gold'
}

export function R1RefundExplain() {
  const {
    DEMO,
    COMPANIES,
    WAHA_REFUND_PARTS,
    WAHA_CLAIMED,
    WAHA_ON_HOLD,
  } = useStandData()
  const company = COMPANIES.waha
  const { visitorName, go } = useStand()
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={visitorName || DEMO.visitorDefault}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Box 9 vs received e-invoices', status: 'done' },
            { label: 'Refund split prepared', status: 'done' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="EXPLAIN" eventLabel={`Event 2 · ${company.name}`} />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm leading-6">
              Box 9: AED 1,212,000 in the return, AED 1,027,800 on received e-invoices. AED 184,200 has no e-invoice.
              {aed(WAHA_ON_HOLD)} is from Bright Line, which has not filed Q2 and Q3. Fully supported: AED 53,600.
            </p>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => go('R1b_supplier_check')}>
              Supplier check
            </Button>
            <Button onClick={() => go('R2_refund_act')}>What can I do?</Button>
          </div>
          <AskBar />
        </FadeIn>
        <FadeIn delay={0.06}>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">Refund {aed(WAHA_CLAIMED)}</h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Part</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {WAHA_REFUND_PARTS.map((row) => (
                  <TableRow key={row.part}>
                    <TableCell>{row.part}</TableCell>
                    <TableCell>{aedPlain(row.vat)}</TableCell>
                    <TableCell className={toneClass(row.tone)}>{row.status}</TableCell>
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

export function R1bSupplierCheck() {
  const {
    DEMO,
    COMPANIES,
  } = useStandData()
  const company = COMPANIES.waha
  const { visitorName, go } = useStand()
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={visitorName || DEMO.visitorDefault}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Supplier registration checked', status: 'done' },
            { label: 'Supplier filing history checked', status: 'done' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="EXPLAIN" eventLabel={`Event 2 · ${company.name}`} />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <FadeIn>
          <Panel>
            <SectionLabel>You · Supplier check</SectionLabel>
            <div className="mt-2">
              <SupplierStatusPanel />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => go('R1_refund_explain')}>
                Back to the refund
              </Button>
              <Button onClick={() => go('R2_refund_act')}>What can I do?</Button>
            </div>
          </Panel>
        </FadeIn>
        <FadeIn delay={0.06}>
          <PaperPanel>
            <div className="text-[0.6875rem] font-semibold tracking-[0.1em] text-[#5b6b7c] uppercase">
              Tax invoice · Bright Line
            </div>
            <h2 className="mt-1.5 text-xl font-semibold leading-snug tracking-[-0.02em]">BLT-2026-0918</h2>
            <p className="mt-3 text-sm leading-6">
              Seller {COMPANIES.brightLine.name} · TRN {COMPANIES.brightLine.trn}
            </p>
            <p className="mt-1 text-sm leading-6">Buyer {company.name} · Issue date 16.10.2026</p>
            <div className="mt-4 rounded-lg bg-[#f4f6f8] p-4 text-sm leading-6">
              <div className="flex justify-between gap-4">
                <span>VAT</span>
                <span>3,300.00</span>
              </div>
              <div className="mt-2 flex justify-between gap-4 font-semibold">
                <span>Payable</span>
                <span>69,300.00</span>
              </div>
            </div>
          </PaperPanel>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function R2RefundAct() {
  const { DEMO, COMPANIES } = useStandData()
  const { visitorName, go } = useStand()
  const [phase, setPhase] = useState<'DECIDE' | 'ACT' | 'FOLLOW_UP' | 'CLOSED'>('DECIDE')
  return (
    <Shell role="FTA_SPECIALIST" visitorName={visitorName || DEMO.visitorDefault}>
      <Stepper
        variant="FTA"
        current={phase === 'FOLLOW_UP' || phase === 'CLOSED' ? 'ACT' : phase}
        eventLabel={`Event 2 · ${COMPANIES.waha.name}`}
      />
      <RefundJourney
        role="fta"
        onComplete={() => go('R3_refund_followup')}
        onPhaseChange={setPhase}
      />
    </Shell>
  )
}

export function R3RefundFollowup() {
  const { DEMO, COMPANIES } = useStandData()
  const { visitorName, go } = useStand()
  return <Shell role="FTA_SPECIALIST" visitorName={visitorName || DEMO.visitorDefault}>
    <Stepper variant="FTA" current="FOLLOW_UP" eventLabel={`Event 2 · ${COMPANIES.waha.name}`} />
    <RefundJourney role="review" onComplete={() => go('18_summary')} />
    <Button variant="ghost" onClick={() => go('R1_refund_explain')}>Back</Button>
  </Shell>
}

export function W1Home() {
  const { DEMO, COMPANIES, WAHA_CLAIMED } = useStandData()
  const company = COMPANIES.waha
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
            { label: 'FTA letter read', status: 'done' },
            { label: 'Refund claim checked against purchases', status: 'done' },
          ]}
        />
      }
    >
      <h1 className="stand-title mb-1">Your VAT overview</h1>
      <Stepper variant="BUSINESS" current="CHECK" />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[320px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <SectionLabel>+ FTA assistant</SectionLabel>
            <p className="text-sm leading-6">
              Good day, {name}. I am the FTA Assistant for <strong>{company.name}</strong>. I check your refund claims,
              purchase e-invoices and letters from the FTA.
            </p>
          </Panel>
          <Panel>
            <SectionLabel>+ FTA assistant</SectionLabel>
            <p className="text-sm leading-6">
              <strong>One item needs your attention.</strong> Documents are due for part of your refund claim.
            </p>
          </Panel>
          <Button variant="gold" onClick={() => go('W2_explain')}>
            Open the item
          </Button>
          <AskBar placeholder="…or ask me about your VAT data." />
        </FadeIn>
        <FadeIn delay={0.06}>
          <ActionCard
            className="border-t-2 border-t-gold bg-gold/5"
            action={<Button onClick={() => go('W2_explain')}>Open</Button>}
          >
            <div className="flex items-center gap-2 text-[0.75rem] font-semibold tracking-wide text-destructive uppercase">
              <span className="size-1.5 rounded-full bg-destructive" aria-hidden />
              Documents due 24 Dec
            </div>
            <div className="text-[0.9375rem] font-semibold leading-snug tracking-[-0.02em]">
              Refund request · {company.caseId}
            </div>
            <p className="text-[0.8125rem] leading-5 text-muted-foreground">
              Claim {aed(WAHA_CLAIMED)} · AED 53,600 approved; documents needed for AED 231,000.
            </p>
          </ActionCard>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function W2Explain() {
  const {
    DEMO,
    COMPANIES,
    WAHA_REFUND_PARTS,
    WAHA_CLAIMED,
    WAHA_REJECTED,
    WAHA_ON_HOLD,
  } = useStandData()
  const company = COMPANIES.waha
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
            { label: 'Purchase ledger matched', status: 'done' },
            { label: '6 paper invoices found', status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
        Refund request · {company.caseId}
      </div>
      <Stepper variant="BUSINESS" current="EXPLAIN" />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <SectionLabel>FTA assistant</SectionLabel>
            <p className="text-sm leading-6">
              AED 150,000: 6 paper tax invoices. AED {aedPlain(WAHA_REJECTED)}: card slips — not tax invoices. {aed(WAHA_ON_HOLD)}: Bright Line, at
              risk because the supplier is not filing.
            </p>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => go('W2b_paper_invoice')}>
              Show 6 paper invoices
            </Button>
            <Button onClick={() => go('W3_act')}>What can I do?</Button>
          </div>
          <AskBar />
        </FadeIn>
        <FadeIn delay={0.06}>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">
              Refund {aed(WAHA_CLAIMED)} — what I found in your records
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Part</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {WAHA_REFUND_PARTS.map((row) => (
                  <TableRow key={row.part}>
                    <TableCell>{row.part}</TableCell>
                    <TableCell>{aedPlain(row.vat)}</TableCell>
                    <TableCell className={toneClass(row.tone)}>{row.status}</TableCell>
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

export function W2bPaperInvoice() {
  const {
    DEMO,
    COMPANIES,
  } = useStandData()
  const company = COMPANIES.waha
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
            { label: 'Paper tax invoices loaded from CDP', status: 'done' },
            { label: "Suppliers' registration checked", status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
        Refund request · {company.caseId}
      </div>
      <Stepper variant="BUSINESS" current="EXPLAIN" />
      <FadeIn className="mt-5">
        <Panel>
          <PaperDocumentsPanel companyName={company.name} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => go('W2_explain')}>
              Back
            </Button>
            <Button onClick={() => go('W3_act')}>What can I do?</Button>
          </div>
        </Panel>
      </FadeIn>
    </Shell>
  )
}

export function W3Act() {
  const { DEMO, COMPANIES } = useStandData()
  const { visitorName, go } = useStand()
  const company = COMPANIES.waha
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
      <RefundJourney role="business" onComplete={() => go('W4_followup')} onPhaseChange={setPhase} />
      <Button variant="ghost" onClick={() => go('W2_explain')}>
        Back
      </Button>
    </Shell>
  )
}

export function W4Followup() {
  const { DEMO, COMPANIES, WAHA_CLAIMED } = useStandData()
  const { visitorName, go } = useStand()
  const company = COMPANIES.waha
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
            { label: 'Refund outcome recorded', status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
        Refund request · {company.caseId}
      </div>
      <Stepper variant="BUSINESS" current="FOLLOW_UP" />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <div className="mb-2 rounded-md bg-primary px-3 py-1.5 text-[0.75rem] font-medium text-primary-foreground">
              The FTA replied
            </div>
            <SectionLabel>FTA assistant</SectionLabel>
            <p className="text-sm leading-6">
              The FTA reviewed your documents for refund claim {aed(WAHA_CLAIMED)}. Check the decision letter and finish
              when you are ready.
            </p>
          </Panel>
          <Button variant="gold" onClick={() => go('Z1_summary')}>
            Finish
          </Button>
          <RefundJourney role="status" onComplete={() => go('Z1_summary')} />
        </FadeIn>
        <FadeIn delay={0.06}>
          <div className="rounded-md border border-border bg-white p-5 text-[#12263a] shadow-sm">
            <p className="text-xs text-[#5b6b7c]">From the FTA · Ref. {company.caseId}</p>
            <p className="mt-4 text-sm leading-6">Dear Sir or Madam,</p>
            <p className="mt-3 text-sm leading-6">
              Thank you for the documents. Your refund request has been reviewed against e-invoices and the evidence you
              submitted. See the amounts approved, rejected and held in your summary.
            </p>
            <p className="mt-6 text-xs text-[#5b6b7c]">Federal Tax Authority · VAT refund</p>
          </div>
        </FadeIn>
      </div>
    </Shell>
  )
}
