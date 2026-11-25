import { ActivityFooter } from '@/components/ActivityFooter'
import { Shell } from '@/components/Shell'
import { Stepper } from '@/components/Stepper'
import {
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
import {
  COMPANIES,
  DEMO,
  WAHA_BIZ_OPTIONS,
  WAHA_FTA_OPTIONS,
  WAHA_PAPER_INVOICES,
  WAHA_REFUND_PARTS,
} from '@/data/fixtures'
import { aedPlain } from '@/lib/format'
import { useStand } from '@/session/StandSession'

const company = COMPANIES.waha

function toneClass(tone: string) {
  if (tone === 'ok') return 'num-ok'
  if (tone === 'bad') return 'num-gap'
  return 'text-gold'
}

export function R1RefundExplain() {
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
              AED 46,800 is from Bright Line, which has not filed Q2 and Q3. Fully supported: AED 53,600.
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
            <h2 className="mb-3 text-base font-semibold leading-snug">Refund AED 284,600</h2>
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
            <p className="text-sm leading-6">
              Bright Line General Trading LLC is VAT-registered but has not filed returns for Q2 and Q3 2026.
            </p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm leading-5">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Registration</span>
                <span className="num-ok">Active since 2021</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Q2 2026 return</span>
                <span className="num-gap">Not filed</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Q3 2026 return</span>
                <span className="num-gap">Not filed</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Invoices to Al Waha</span>
                <span>14 · VAT AED 46,800</span>
              </div>
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
  const { visitorName, go, choices, setChoice, log } = useStand()
  const selected = choices.c2_fta || 'OPT-FTA-REF-1'
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={visitorName || DEMO.visitorDefault}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Letter drafted', status: 'done' },
            { label: 'Non-filer case prepared', status: 'done' },
            { label: 'Waiting for Send', status: 'wait' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="ACT" eventLabel={`Event 2 · ${company.name}`} />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <SectionLabel>What you can do</SectionLabel>
            <OptionList
              options={WAHA_FTA_OPTIONS}
              selected={selected}
              onSelect={(id) => setChoice('c2_fta', id)}
            />
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="success"
              onClick={() => {
                log('Partial approval letter sent')
                go('R3_refund_followup')
              }}
            >
              Send
            </Button>
            <Button variant="outline">Edit</Button>
            <Button variant="ghost" onClick={() => go('R1_refund_explain')}>
              Cancel
            </Button>
          </div>
        </FadeIn>
        <FadeIn delay={0.06} className="flex flex-col gap-4">
          <PaperPanel>
            <div className="text-xs leading-5 text-[#5b6b7c]">Ref. {company.caseId}</div>
            <h2 className="mt-1.5 text-xl font-semibold leading-snug tracking-[-0.02em]">
              Partial approval and request for documents
            </h2>
            <p className="mt-3 text-sm leading-6">
              Of AED 284,600 claimed, AED 53,600 is approved. By 24 December provide tax invoices for AED 184,200 and
              proof of VAT paid to Bright Line for AED 46,800. A non-filer case {COMPANIES.brightLine.caseId} is
              suggested.
            </p>
          </PaperPanel>
          <div className="grid gap-3 md:grid-cols-2">
            <Panel>
              <div className="text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Cases
              </div>
              <div className="mt-1.5 text-sm leading-5">{company.caseId} · follow-up 24 Dec</div>
              <div className="text-sm leading-5">{COMPANIES.brightLine.caseId} · Bright Line non-filer</div>
            </Panel>
            <Panel>
              <div className="text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Payment
              </div>
              <div className="mt-1.5 text-lg font-semibold leading-snug num-ok">AED 53,600 approved</div>
            </Panel>
          </div>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function R3RefundFollowup() {
  const { visitorName, go } = useStand()
  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={visitorName || DEMO.visitorDefault}
      date={DEMO.followUpToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: '6 paper invoices checked', status: 'done' },
            { label: 'Bright Line filing rechecked', status: 'done' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="FOLLOW_UP" eventLabel={`Event 2 · ${company.name}`} />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <FadeIn>
          <Panel>
            <SectionLabel>Mon 14 Dec · follow-up</SectionLabel>
            <p className="text-sm leading-6">
              Al Waha sent 6 paper tax invoices (AED 150,000), bank confirmations for Bright Line, and a VD removing AED
              34,200. Recommend: approve 150,000, reject 34,200, hold 46,800.
            </p>
          </Panel>
        </FadeIn>
        <FadeIn delay={0.06} className="flex flex-col gap-4">
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">Refund decision (AED)</h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Part</TableHead>
                  <TableHead>Claimed</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Not paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ['Supported by e-invoices', '53,600', '53,600', '—'],
                  ['Supported by paper invoices', '150,000', '150,000', '—'],
                  ['No tax invoices · rejected', '34,200', '—', '34,200'],
                  ['Bright Line · on hold', '46,800', '—', '46,800'],
                ].map((row) => (
                  <TableRow key={row[0]}>
                    <TableCell>{row[0]}</TableCell>
                    <TableCell>{row[1]}</TableCell>
                    <TableCell className={row[2] !== '—' ? 'num-ok' : ''}>{row[2]}</TableCell>
                    <TableCell className={row[3] !== '—' ? 'num-gap' : ''}>{row[3]}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell>284,600</TableCell>
                  <TableCell className="num-ok">203,600</TableCell>
                  <TableCell className="num-gap">81,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Open 6 invoices</Button>
            <Button variant="success" onClick={() => go('18_summary')}>
              Approve as recommended
            </Button>
            <Button variant="outline">Ask for more documents</Button>
            <Button variant="destructive">Refer to audit</Button>
          </div>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function W1Home() {
  const { visitorName, go } = useStand()
  return (
    <Shell
      role="BUSINESS"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
    >
      <Stepper variant="BUSINESS" current="CHECK" />
      <FadeIn className="mx-auto mt-5 flex max-w-4xl flex-col gap-4">
        <h1 className="stand-title text-[1.5rem]">VAT overview</h1>
        <Panel className="ring-gold/40">
          <Badge variant="destructive" className="mb-2">
            Documents due 24.12.2026
          </Badge>
          <div className="text-lg font-semibold leading-snug tracking-[-0.02em]">
            Refund request · {company.caseId}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            AED 53,600 approved; documents needed for AED 231,000.
          </p>
          <Button className="mt-4" onClick={() => go('W2_explain')}>
            Open the item
          </Button>
        </Panel>
      </FadeIn>
    </Shell>
  )
}

export function W2Explain() {
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
              AED 150,000: 6 paper tax invoices. AED 34,200: card slips — not tax invoices. AED 46,800: Bright Line, at
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
              Refund AED 284,600 — what I found in your records
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
  const { visitorName, go } = useStand()
  const inv = WAHA_PAPER_INVOICES[0]
  return (
    <Shell
      role="BUSINESS"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: '6 scanned invoices found', status: 'done' },
            { label: "Suppliers' registration checked", status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
        Refund request · {company.caseId}
      </div>
      <Stepper variant="BUSINESS" current="EXPLAIN" />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <FadeIn>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">6 paper tax invoices</h2>
            <div className="flex flex-col gap-2 text-sm">
              {WAHA_PAPER_INVOICES.map((row) => (
                <div key={row.number} className="rounded-lg border border-border px-3.5 py-2.5">
                  <div className="font-medium leading-5">{row.number}</div>
                  <div className="text-xs leading-5 text-muted-foreground">
                    {row.supplier} · {row.date} · VAT {aedPlain(row.vat)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm font-semibold leading-5">Total VAT 150,000</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => go('W2_explain')}>
                Back
              </Button>
              <Button onClick={() => go('W3_act')}>What can I do?</Button>
            </div>
          </Panel>
        </FadeIn>
        <FadeIn delay={0.06}>
          <Panel>
            <div className="text-[0.6875rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              Tax invoice · paper, scanned
            </div>
            <h2 className="mt-1 text-xl font-semibold leading-snug tracking-[-0.02em]">{inv.number}</h2>
            <p className="mt-3 text-sm leading-6">
              Seller {inv.supplier} · Buyer {company.name}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              VAT AED {aedPlain(inv.vat)} · Both suppliers are VAT-registered and not yet on e-invoicing.
            </p>
          </Panel>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function W3Act() {
  const { visitorName, go, choices, setChoice, setWeakMessage, weakMessage, log } = useStand()
  const selected = choices.c2_biz || 'OPT-BUS-REF-1'
  return (
    <Shell
      role="BUSINESS"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: 'Reply drafted, 20 documents attached', status: 'done' },
            { label: 'VD for Box 9 prepared', status: 'done' },
            { label: 'Waiting for your approval', status: 'wait' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
        Refund request · {company.caseId}
      </div>
      <Stepper variant="BUSINESS" current="ACT" />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <FadeIn className="flex flex-col gap-3">
          <Panel>
            <SectionLabel>What you can do</SectionLabel>
            <OptionList
              accent="gold"
              options={WAHA_BIZ_OPTIONS}
              selected={selected}
              onSelect={(id) => {
                setChoice('c2_biz', id)
                const opt = WAHA_BIZ_OPTIONS.find((o) => o.id === id)
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
                log('Sent reply with documents')
                go('W4_followup')
              }}
            >
              Send reply
            </Button>
            <Button variant="outline">Draft note to Bright Line</Button>
            <Button variant="ghost">Edit</Button>
          </div>
        </FadeIn>
        <FadeIn delay={0.06} className="flex flex-col gap-4">
          <Panel>
            <h2 className="mb-2 text-base font-semibold leading-snug">Reply to Ref. {company.caseId}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Attached: 6 tax invoices for input VAT of AED 150,000 and 14 bank payment confirmations for Bright Line. A
              VD removes AED 34,200 from Box 9.
            </p>
          </Panel>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">What you send for AED 231,000</h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Item</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Expected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Paper tax invoices (6 PDF)</TableCell>
                  <TableCell>150,000</TableCell>
                  <TableCell className="num-ok">Supported</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Payment proof, Bright Line</TableCell>
                  <TableCell>46,800</TableCell>
                  <TableCell className="text-gold">Depends on supplier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Card slips · VD Box 9</TableCell>
                  <TableCell>34,200</TableCell>
                  <TableCell className="num-gap">Not recoverable</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Panel>
        </FadeIn>
      </div>
    </Shell>
  )
}

export function W4Followup() {
  const { visitorName, go } = useStand()
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
            { label: 'Refund AED 150,000 scheduled', status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
        Refund request · {company.caseId}
      </div>
      <Stepper variant="BUSINESS" current="FOLLOW_UP" />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <FadeIn>
          <Panel>
            <SectionLabel>Mon 14 Dec 2026 · the FTA decided</SectionLabel>
            <p className="text-sm leading-6">
              The FTA accepted your 6 paper invoices. AED 150,000 more is approved, AED 203,600 in total. AED 34,200 is
              not approved. AED 46,800 is on hold until Bright Line is verified.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="gold" onClick={() => go('Z1_summary')}>
                Finish
              </Button>
              <Button variant="outline">Remind Bright Line</Button>
            </div>
          </Panel>
        </FadeIn>
        <FadeIn delay={0.06} className="grid gap-3 md:grid-cols-3">
          <StatTile
            label="Refund approved"
            value="AED 203,600"
            hint="53,600 on 10 Dec + 150,000 on 14 Dec"
            tone="ok"
          />
          <StatTile label="Not paid now" value="AED 81,000" hint="34,200 rejected · 46,800 on hold" />
          <StatTile label="Decision" value="Early" hint="11 days before 25 Dec" tone="ok" />
        </FadeIn>
      </div>
    </Shell>
  )
}
