import { Building2, Landmark } from 'lucide-react'
import { ActivityFooter, Shell, Stepper } from '@/components/Shell'
import { Button, Input, Panel, SectionLabel } from '@/components/ui'
import {
  BRIEFING,
  COMPANIES,
  DEMO,
  YASMEEN_BOXES,
  aed,
  aedPlain,
} from '@/fixtures'
import type { ReactElement } from 'react'
import { useNav, type ScreenId } from '@/nav'

export function CurrentScreen() {
  const { screen } = useNav()
  const map: Record<ScreenId, () => ReactElement> = {
    '01_name': NameScreen,
    '02_role': RoleScreen,
    prep_fta: PrepFta,
    '03_briefing': Briefing,
    '04_c1_explain': ExplainFta,
    '05_c1_documents': DocumentsFta,
    '06_c1_act': ActFta,
    '07_c1_followup': FollowupFta,
    '07b_c1_closed': ClosedFta,
    B01_company: CompanyChooser,
    Y1_home: Y1Home,
    Y2_explain: Y2Explain,
    Y3_act: Y3Act,
    Y4_followup: Y4Followup,
  }
  const Screen = map[screen]
  return <Screen />
}

function NameScreen() {
  const { visitorName, setName, go } = useNav()
  return (
    <Shell
      variant="entry"
      visitorName={visitorName || 'Visitor'}
      date={DEMO.ftaToday}
      footer={<ActivityFooter label="AGENT ACTIVITY" items={[{ label: 'Waiting for a visitor', status: 'wait' }]} />}
    >
      <div className="mx-auto flex min-h-[68vh] max-w-lg flex-col justify-center gap-7 text-center">
        <div>
          <h1 className="stand-title">Welcome to the FTA Central Data Platform</h1>
          <p className="stand-subtitle mx-auto mt-3 max-w-[42ch]">
            Meet the AI agent that works with tax data. All data on this stand is synthetic.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <label className="stand-label">What is your name?</label>
          <Input value={visitorName} onChange={(e) => setName(e.target.value)} />
          <Button className="mx-auto min-w-40" disabled={!visitorName.trim()} onClick={() => go('02_role')}>
            Continue
          </Button>
        </div>
      </div>
    </Shell>
  )
}

function RoleScreen() {
  const { visitorName, go } = useNav()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      variant="entry"
      visitorName={name}
      footer={<ActivityFooter label="AGENT ACTIVITY" items={[{ label: `Visitor: ${name}`, status: 'done' }]} />}
    >
      <h1 className="stand-title mb-8 text-center">Hello, {name}. Who are you today?</h1>
      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
        <button
          className="panel border-2 border-primary text-left"
          onClick={() => go('prep_fta')}
        >
          <Landmark className="mb-3 size-5 text-primary" />
          <div className="font-semibold">FTA Specialist</div>
          <p className="mt-2 text-sm text-muted-foreground">
            The agent finds tax risks and explains them. You decide; the agent acts and follows up.
          </p>
        </button>
        <button className="panel border border-border text-left hover:border-gold/60" onClick={() => go('B01_company')}>
          <Building2 className="mb-3 size-5 text-gold" />
          <div className="font-semibold">Business</div>
          <p className="mt-2 text-sm text-muted-foreground">
            The agent checks your VAT return against your e-invoices and helps you respond to the FTA.
          </p>
        </button>
      </div>
    </Shell>
  )
}

function PrepFta() {
  const { visitorName, go } = useNav()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      variant="fta"
      visitorName={name}
      date={DEMO.ftaToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'CDP rules overnight', status: 'done' },
            { label: 'Evidence collected', status: 'done' },
            { label: 'Writing briefing', status: 'wait' },
          ]}
        />
      }
    >
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[220px_1fr] md:items-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-28 items-center justify-center rounded-full border border-gold/50 text-4xl text-gold">
            ✦
          </div>
          <div className="font-semibold text-gold">FTA agent</div>
          <p className="mt-2 text-sm text-muted-foreground">working for you since 06:00</p>
        </div>
        <Panel>
          <h2 className="mb-4 text-xl font-semibold">Good day, {name}. I prepared your day.</h2>
          <ul className="space-y-2 text-sm">
            <li>✓ 21,480 new e-invoices loaded and checked</li>
            <li>✓ 214 VAT returns reconciled, box by box</li>
            <li>✓ 12 refund requests and 1,206 suppliers checked</li>
            <li>⏳ Writing your briefing and the draft letters…</li>
          </ul>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-lg bg-muted/60 p-3"><div className="stand-label">Found</div><div className="mt-1 text-lg font-semibold">2 issues</div></div>
            <div className="rounded-lg bg-muted/60 p-3"><div className="stand-label">At stake</div><div className="mt-1 text-lg font-semibold text-gold">AED 643,000</div></div>
            <div className="rounded-lg bg-muted/60 p-3"><div className="stand-label">Waiting</div><div className="mt-1 text-lg font-semibold">2 decisions</div></div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => go('03_briefing')}>Open my briefing</Button>
            <Button variant="outline" onClick={() => go('03_briefing')}>Skip</Button>
          </div>
        </Panel>
      </div>
    </Shell>
  )
}

function Briefing() {
  const { visitorName, go } = useNav()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      variant="fta"
      visitorName={name}
      date={DEMO.ftaToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: '21,480 e-invoices checked', status: 'done' },
            { label: '2 items prioritised by risk', status: 'done' },
          ]}
        />
      }
    >
      <div className="grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <Panel>
          <SectionLabel>AI agent</SectionLabel>
          <p className="text-[0.9375rem] leading-7">
            Good day, {name}. Two items need your attention, ordered by risk. Where would you like to start?
          </p>
        </Panel>
        <div className="space-y-4">
          <div className="stand-label">2 items · ordered by risk</div>
          {BRIEFING.map((item) => (
            <Panel key={item.id} className="border-l-2 border-l-destructive">
              <div className="flex justify-between gap-4">
                <div>
                  <div className="text-[0.8125rem] font-semibold uppercase text-destructive">High · {item.reason}</div>
                  <div className="mt-1 font-semibold">{item.event}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{item.company}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <Button
                  onClick={() => go(item.id === 'yasmeen' ? '04_c1_explain' : '04_c1_explain')}
                >
                  Open
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </Shell>
  )
}

function ExplainFta() {
  const { visitorName, go } = useNav()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      variant="fta"
      visitorName={visitorName || DEMO.visitorDefault}
      date={DEMO.ftaToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'VAT return matched to 1,912 documents', status: 'done' },
            { label: 'Gap traced to 38 invoices', status: 'done' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="EXPLAIN" eventLabel={`Event 1 · ${company.name}`} />
      <div className="grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <div className="space-y-3">
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm leading-6">
              {company.name} filed its VAT return for Aug–Oct 2026. Dubai Box 1b gap {aed(486200)}. Net under-declaration{' '}
              <span className="num-gold">{aed(412000)}</span> — high risk.
            </p>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => go('05_c1_documents')}>Show 38 invoices</Button>
            <Button onClick={() => go('06_c1_act')}>What can I do?</Button>
          </div>
        </div>
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">Tax return reconciliation · Aug–Oct 2026</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Box</th>
                <th>Return</th>
                <th>E-invoices</th>
                <th>Gap</th>
              </tr>
            </thead>
            <tbody>
              {YASMEEN_BOXES.map((row) => (
                <tr key={row.box} className={row.box === '14' ? 'bg-gold/10 font-medium' : undefined}>
                  <td className="py-2">
                    <div className="font-medium">{row.box}</div>
                    <div className="text-xs text-muted-foreground">{row.label}</div>
                  </td>
                  <td>{aedPlain(row.declared)}</td>
                  <td>{aedPlain(row.einvoices)}</td>
                  <td className={row.gap ? 'num-gap' : undefined}>{row.gap ? aedPlain(row.gap) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </Shell>
  )
}

function DocumentsFta() {
  const { visitorName, go } = useNav()
  return (
    <Shell variant="fta" visitorName={visitorName || DEMO.visitorDefault} date={DEMO.ftaToday}>
      <Stepper variant="FTA" current="EXPLAIN" eventLabel={`Event 1 · ${COMPANIES.yasmeen.name}`} />
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Panel>
          <SectionLabel>AI agent</SectionLabel>
          <p className="text-sm leading-6">The 38 invoices behind the gap, by date. Tap one to open it.</p>
          <div className="mt-3 space-y-2 text-xs">
            {['AYT-2026-10-1147 · 14 Oct · Marina · 11,300', 'AYT-2026-10-1203 · 21 Oct · Marina · 9,400'].map((row) => (
              <div key={row} className="rounded-lg border border-border bg-gold/10 px-3 py-2">{row}</div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => go('04_c1_explain')}>Back</Button>
            <Button onClick={() => go('06_c1_act')}>What can I do?</Button>
          </div>
        </Panel>
        <div className="letter-sheet rounded-md border border-border p-6 text-[#12263a]">
          <div className="stand-label text-[#5b6b7c]">Tax invoice</div>
          <h2 className="mt-1 text-xl font-semibold">AYT-2026-10-1147</h2>
          <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
            <div><div className="font-semibold">Seller</div><div>{COMPANIES.yasmeen.name}</div></div>
            <div><div className="font-semibold">Buyer</div><div>Marina Hospitality LLC</div></div>
          </div>
          <div className="mt-6 rounded-lg bg-[#f4f6f8] p-4 text-sm">
            <div className="flex justify-between border-b border-[#d5dee8] py-2"><span>Combi oven CO-20</span><span>208,000</span></div>
            <div className="flex justify-between py-2"><span>Installation</span><span>18,000</span></div>
            <div className="mt-2 flex justify-between font-semibold"><span>Total payable</span><span>237,300</span></div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function ActFta() {
  const { visitorName, go } = useNav()
  return (
    <Shell
      variant="fta"
      visitorName={visitorName || DEMO.visitorDefault}
      date={DEMO.ftaToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Letter drafted', status: 'done' },
            { label: 'Waiting for the FTA specialist to send', status: 'wait' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="ACT" eventLabel={`Event 1 · ${COMPANIES.yasmeen.name}`} />
      <div className="grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm">What you can do:</p>
          </Panel>
          <button className="w-full rounded-lg bg-primary px-3.5 py-3 text-left text-sm text-primary-foreground">
            Ask the taxpayer to explain or correct (20 business days) · recommended
          </button>
          <button className="w-full rounded-lg border border-destructive/50 px-3.5 py-3 text-left text-sm">
            Refer to audit
          </button>
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm leading-6">
              Here is the draft letter, with the list of 38 invoices attached. Check it and send.
            </p>
          </Panel>
        </div>
        <div className="space-y-3">
          <div className="letter-sheet rounded-md border border-border p-5 text-[#12263a]">
            <h2 className="text-base font-semibold">
              Request for clarification · VAT return Aug–Oct 2026 · Ref. {COMPANIES.yasmeen.caseId}
            </h2>
            <p className="mt-2 text-xs text-[#5b6b7c]">
              To: {COMPANIES.yasmeen.name}, TRN {COMPANIES.yasmeen.trn} · 10 December 2026
            </p>
            <p className="mt-4 text-sm leading-6">
              Dear Sir or Madam, e-invoices show AED 1,626,200 for Dubai Box 1b versus AED 1,140,000 declared. Net
              difference AED 412,000 relating to 38 invoices.
            </p>
            <p className="mt-6 text-xs text-[#5b6b7c]">Federal Tax Authority · VAT Compliance</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => go('07_c1_followup')}>Send</Button>
            <Button variant="outline">Edit</Button>
            <Button variant="ghost" onClick={() => go('04_c1_explain')}>Cancel</Button>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function FollowupFta() {
  const { visitorName, go } = useNav()
  return (
    <Shell variant="fta" visitorName={visitorName || DEMO.visitorDefault} date={DEMO.followUpToday}>
      <Stepper variant="FTA" current="FOLLOW_UP" eventLabel={`Event 1 · ${COMPANIES.yasmeen.name}`} />
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Panel>
          <SectionLabel>AI agent</SectionLabel>
          <p className="text-sm leading-6">
            The taxpayer replied. VD matches e-invoices in every box. I recommend closing the case.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => go('07b_c1_closed')}>Close case</Button>
            <Button variant="outline">Ask for more</Button>
          </div>
        </Panel>
        <Panel>
          <div className="text-2xl font-semibold text-success">+ {aed(412000)}</div>
          <p className="mt-2 text-sm text-muted-foreground">additional VAT declared by the taxpayer</p>
        </Panel>
      </div>
    </Shell>
  )
}

function ClosedFta() {
  const { visitorName, go } = useNav()
  return (
    <Shell
      variant="fta"
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
      <Stepper variant="FTA" current="CLOSED" eventLabel={`Event 1 · ${COMPANIES.yasmeen.name}`} />
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Panel>
          <SectionLabel>AI agent</SectionLabel>
          <p className="text-sm leading-6">
            Case {COMPANIES.yasmeen.caseId} is closed. Next: Al Waha Electronics, refund decision due 25 December.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => go('03_briefing')}>Back to briefing</Button>
            <Button variant="outline" onClick={() => go('B01_company')}>Switch to business</Button>
          </div>
        </Panel>
        <Panel>
          <div className="mb-3 font-semibold">Case history</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>10 Dec · Agent · Found Box 1b gap</li>
            <li>10 Dec · Sara · Sent request</li>
            <li>11 Dec · Taxpayer · Submitted VD</li>
            <li>14 Dec · Sara · Closed the case</li>
          </ul>
        </Panel>
      </div>
    </Shell>
  )
}

function CompanyChooser() {
  const { visitorName, go } = useNav()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      variant="biz"
      visitorName={name}
      date={DEMO.bizToday}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[{ label: '2 companies checked', status: 'done' }]}
        />
      }
    >
      <h1 className="stand-title mb-2">Choose a company</h1>
      <p className="stand-subtitle mb-6 max-w-[62ch]">
        Today you are the VAT manager of one of two companies. Choose a company to start.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="border-l-2 border-l-gold">
          <div className="stand-label text-gold">Reply due 7 Jan 2027</div>
          <div className="mt-1 font-semibold text-primary">{COMPANIES.yasmeen.name}</div>
          <p className="mt-2 text-sm text-muted-foreground">Explain Aug–Oct 2026 return · Dubai gap {aed(486200)}</p>
          <Button variant="gold" className="mt-4" onClick={() => go('Y1_home')}>Open</Button>
        </Panel>
        <Panel className="border-l-2 border-l-gold">
          <div className="stand-label text-gold">Documents due 24 Dec</div>
          <div className="mt-1 font-semibold text-primary">{COMPANIES.waha.name}</div>
          <p className="mt-2 text-sm text-muted-foreground">Refund documents for AED 231,000</p>
          <Button variant="gold" className="mt-4" onClick={() => go('Y1_home')}>Open</Button>
        </Panel>
      </div>
    </Shell>
  )
}

function Y1Home() {
  const { visitorName, go } = useNav()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      variant="biz"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      date={DEMO.bizToday}
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
      <h1 className="stand-title mb-1">Your VAT overview</h1>
      <Stepper variant="BUSINESS" current="CHECK" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
        <Panel>
          <SectionLabel>+ FTA assistant</SectionLabel>
          <p className="text-sm leading-6">
            Good day. One item needs your attention. I have already gone through the data behind it.
          </p>
          <Button variant="gold" className="mt-4" onClick={() => go('Y2_explain')}>Open the item</Button>
        </Panel>
        <Panel className="border-t-2 border-t-gold">
          <div className="text-[0.75rem] font-semibold uppercase text-destructive">Reply due 7 Jan 2027</div>
          <div className="mt-1 font-semibold">The FTA asks you to explain your Aug–Oct 2026 return</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your e-invoices show {aed(486200)} more output VAT for Dubai than your return.
          </p>
        </Panel>
      </div>
    </Shell>
  )
}

function Y2Explain() {
  const { visitorName, go } = useNav()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      variant="biz"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      date={DEMO.bizToday}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: 'FTA letter read', status: 'done' },
            { label: '38 invoices matched with your ledger', status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold">Request for clarification · {company.caseId}</div>
      <Stepper variant="BUSINESS" current="EXPLAIN" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        <Panel>
          <SectionLabel>FTA assistant</SectionLabel>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
            <li><strong>34 invoices ({aed(412000)}):</strong> Oct dated, booked in Nov.</li>
            <li><strong>4 invoices ({aed(74200)}):</strong> Dubai branch reported in Box 1a.</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <Button variant="outline">Show 38 invoices</Button>
            <Button variant="gold" onClick={() => go('Y3_act')}>What can I do?</Button>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel className="border-l-2 border-l-gold">
            <h2 className="font-semibold">From the FTA · 10 Dec 2026</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explain or submit a VD by 07.01.2027. Box 1b gap {aed(486200)}; net {aed(412000)}.
            </p>
          </Panel>
          <Panel>
            <h2 className="mb-3 font-semibold">38 invoices vs your ledger</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Group</th>
                  <th>VAT</th>
                  <th>What it means</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">Booked in the wrong period</td>
                  <td>{aedPlain(412000)}</td>
                  <td className="num-gap">Correct with a VD</td>
                </tr>
                <tr>
                  <td className="py-2">Reported under Abu Dhabi</td>
                  <td>{aedPlain(74200)}</td>
                  <td className="num-gap">Move to Box 1b</td>
                </tr>
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </Shell>
  )
}

function Y3Act() {
  const { visitorName, go } = useNav()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      variant="biz"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      date={DEMO.bizToday}
    >
      <Stepper variant="BUSINESS" current="ACT" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          <Panel>
            <SectionLabel>FTA assistant</SectionLabel>
            <p className="text-sm">What you can do:</p>
          </Panel>
          <button className="w-full rounded-lg bg-gold px-3.5 py-3 text-left text-sm text-white">
            Submit a VD for AED 412,000 and reply · recommended
          </button>
          <button className="w-full rounded-lg border border-border px-3.5 py-3 text-left text-sm">
            Reply with an explanation only
          </button>
        </div>
        <Panel>
          <h2 className="font-semibold">Draft Voluntary Disclosure</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Box 1b +486,200 · Box 1a −74,200 · Box 14 +412,000. Nothing is submitted without your approval.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="gold" onClick={() => go('Y4_followup')}>Submit</Button>
            <Button variant="ghost" onClick={() => go('Y2_explain')}>Back</Button>
          </div>
        </Panel>
      </div>
    </Shell>
  )
}

function Y4Followup() {
  const { visitorName, go } = useNav()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      variant="biz"
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
      <div className="mb-3 text-lg font-semibold">Request for clarification · {company.caseId}</div>
      <Stepper variant="BUSINESS" current="FOLLOW_UP" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        <Panel>
          <div className="mb-2 rounded-md bg-primary px-3 py-1.5 text-[0.75rem] font-medium text-primary-foreground">
            Mon 14 Dec 2026 · the FTA replied
          </div>
          <SectionLabel>FTA assistant</SectionLabel>
          <p className="text-sm leading-6">VD accepted. The case is closed. Additional VAT {aed(412000)}.</p>
          <Button variant="gold" className="mt-4" onClick={() => go('01_name')}>Finish · restart walkthrough</Button>
        </Panel>
        <div className="letter-sheet rounded-md border border-border p-5 text-[#12263a]">
          <p className="text-xs text-[#5b6b7c]">From the FTA · Ref. {company.caseId} · 14 Dec 2026</p>
          <p className="mt-4 text-sm leading-6">
            Your Voluntary Disclosure has been reconciled with your electronic invoices and accepted. The case is closed.
          </p>
          <p className="mt-6 text-xs text-[#5b6b7c]">Federal Tax Authority · VAT Compliance</p>
        </div>
      </div>
    </Shell>
  )
}
