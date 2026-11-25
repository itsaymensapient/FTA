import { ActivityFooter } from '@/components/ActivityFooter'
import { Shell } from '@/components/Shell'
import {
  Button,
  FadeIn,
  Panel,
  StatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { COMPANIES, DEMO } from '@/data/fixtures'
import { useStand } from '@/session/StandSession'
import { useEffect } from 'react'

export function FtaSummaryScreen() {
  const { visitorName, chooseRole, reset, go } = useStand()
  const name = visitorName || DEMO.visitorDefault

  useEffect(() => {
    const t = setTimeout(() => reset(), 30000)
    return () => clearTimeout(t)
  }, [reset])

  return (
    <Shell
      role="FTA_SPECIALIST"
      visitorName={name}
      date={DEMO.followUpToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[{ label: 'Session log saved (demo)', status: 'done' }]}
        />
      }
    >
      <FadeIn className="mx-auto flex max-w-4xl flex-col gap-5">
        <h1 className="stand-title text-balance text-[1.75rem] sm:text-[2rem]">
          Well done, {name}. Your session in 4 minutes.
        </h1>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <StatTile label="Events closed" value="2 of 2" />
          <StatTile label="VAT secured" value="AED 412,000" tone="ok" />
          <StatTile label="Refund not paid" value="AED 81,000" />
          <StatTile label="Your time" value="4 min" />
        </div>
        <Panel>
          <h2 className="mb-3 text-base font-semibold leading-snug">Your decisions</h2>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Case</TableHead>
                <TableHead>You chose</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{COMPANIES.yasmeen.short}</TableCell>
                <TableCell>Ask taxpayer / close after VD</TableCell>
                <TableCell className="num-ok">+ AED 412,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{COMPANIES.waha.short}</TableCell>
                <TableCell>Partial approval</TableCell>
                <TableCell>203,600 approved · 81,000 not paid</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Panel>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="gold" onClick={() => chooseRole('BUSINESS')}>
            Try as Business
          </Button>
          <Button variant="outline" onClick={reset}>
            Finish
          </Button>
          <Button variant="ghost" onClick={() => go('03_briefing')}>
            Back to briefing
          </Button>
          <span className="text-xs leading-5 text-muted-foreground">The stand resets in 30 seconds</span>
        </div>
      </FadeIn>
    </Shell>
  )
}

export function BizSummaryScreen() {
  const { visitorName, company, chooseRole, reset, openCase } = useStand()
  const name = visitorName || DEMO.visitorDefault
  const isWaha = company === 'waha'
  const c = isWaha ? COMPANIES.waha : COMPANIES.yasmeen

  useEffect(() => {
    const t = setTimeout(() => reset(), 30000)
    return () => clearTimeout(t)
  }, [reset])

  return (
    <Shell
      role="BUSINESS"
      visitorName={name}
      companyLabel={`${c.name} · TRN ${c.trn}`}
      date={DEMO.followUpToday}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[{ label: 'Session log saved (demo)', status: 'done' }]}
        />
      }
    >
      <FadeIn className="mx-auto flex max-w-4xl flex-col gap-5">
        <h1 className="stand-title text-balance text-[1.75rem] sm:text-[2rem]">
          Well done, {name}. The case of {c.short} is closed.
        </h1>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {(isWaha
            ? [
                ['Your time', '3 min'],
                ['FTA case', 'Closed', 'ok'],
                ['Refund', 'AED 203,600', 'ok'],
                ['Decision', '11 days early', 'ok'],
              ]
            : [
                ['Your time', '3 min'],
                ['FTA case', 'Closed', 'ok'],
                ['VAT corrected', 'AED 412,000'],
                ['Reply', '27 days early', 'ok'],
              ]
          ).map(([k, v, tone]) => (
            <StatTile key={k} label={k} value={v} tone={tone === 'ok' ? 'ok' : 'default'} />
          ))}
        </div>
        <Panel>
          <h2 className="mb-3 text-base font-semibold leading-snug">What you did</h2>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Step</TableHead>
                <TableHead>Assistant</TableHead>
                <TableHead>You</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isWaha
                ? [
                    ['Explain', 'Matched refund parts with your records', 'Read the result'],
                    ['Decide', 'Offered 3 options', 'Chose documents + VD'],
                    ['Act', 'Drafted reply with 20 documents', 'Checked and sent'],
                    ['Follow-up', 'Read the FTA decision', 'Closed the item'],
                  ]
                : [
                    ['Explain', 'Matched 38 invoices with your ledger', 'Read the result'],
                    ['Decide', 'Offered 3 options', 'Chose VD and reply'],
                    ['Act', 'Filled in the VD and drafted the reply', 'Checked and submitted'],
                    ['Follow-up', 'Read the FTA reply', 'Closed the item'],
                  ]
              ).map((row) => (
                <TableRow key={row[0]}>
                  <TableCell>{row[0]}</TableCell>
                  <TableCell>{row[1]}</TableCell>
                  <TableCell>{row[2]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
        <Panel>
          <h2 className="mb-3 text-base font-semibold leading-snug">The same case on the FTA side</h2>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>FTA specialist</TableHead>
                <TableHead>You</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>10 Dec</TableCell>
                <TableCell>Sends the letter</TableCell>
                <TableCell>Letter arrives in the FTA Assistant</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>11 Dec</TableCell>
                <TableCell>—</TableCell>
                <TableCell>{isWaha ? 'Sends documents and VD' : 'Submits VD and reply'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>14 Dec</TableCell>
                <TableCell>Closes / decides</TableCell>
                <TableCell>Gets the decision</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Panel>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => openCase(isWaha ? 'yasmeen' : 'waha', isWaha ? 'Y1_home' : 'W1_home')}
          >
            {isWaha ? 'Al Yasmeen · return' : 'Al Waha · refund'}
          </Button>
          <Button variant="gold" onClick={() => chooseRole('FTA_SPECIALIST')}>
            Try as FTA Specialist
          </Button>
          <Button variant="ghost" onClick={reset}>
            Finish
          </Button>
          <span className="text-xs leading-5 text-muted-foreground">The stand resets in 30 seconds</span>
        </div>
      </FadeIn>
    </Shell>
  )
}

export function QueryScreen() {
  const { visitorName, role, go } = useStand()
  const isBiz = role === 'BUSINESS'
  return (
    <Shell
      role={isBiz ? 'BUSINESS' : 'FTA_SPECIALIST'}
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={isBiz ? `${COMPANIES.yasmeen.name} · TRN ${COMPANIES.yasmeen.trn}` : undefined}
      footer={
        <ActivityFooter
          label={isBiz ? 'ASSISTANT ACTIVITY' : 'AGENT ACTIVITY'}
          items={[
            { label: 'Question understood', status: 'done' },
            { label: 'Answer from CDP tools', status: 'done' },
          ]}
        />
      }
    >
      <div className="grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <FadeIn>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">
              {isBiz ? 'Ask the FTA Assistant' : 'Ask the FTA agent'}
            </h2>
            <div className="mb-3 rounded-lg border border-border bg-muted/40 px-3.5 py-3 text-sm leading-6">
              {isBiz
                ? 'Which of my November sales invoices were not confirmed by the buyer?'
                : 'Show Al Yasmeen’s invoices to Marina Hospitality in October'}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {isBiz
                ? '13 of 642 November invoices have no buyer copy yet. 11 are to one buyer.'
                : 'Al Yasmeen issued 12 invoices to Marina Hospitality in October 2026, VAT AED 168,400.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => go(isBiz ? 'B01_company' : '03_briefing')}>
                Back
              </Button>
            </div>
          </Panel>
        </FadeIn>
        <FadeIn delay={0.06}>
          <Panel>
            <h2 className="mb-3 text-base font-semibold leading-snug">
              {isBiz ? 'November 2026 · sales without buyer copy' : 'Al Yasmeen → Marina Hospitality · Oct 2026'}
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{isBiz ? 'Buyer' : 'Invoice'}</TableHead>
                  <TableHead>{isBiz ? 'Invoices' : 'Date'}</TableHead>
                  <TableHead>VAT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isBiz
                  ? [
                      ['Palm Crest Hotels LLC', '11', '23,650'],
                      ['Gulfline Catering LLC', '1', '1,240'],
                      ['Dar Al Noor Clinics LLC', '1', '860'],
                    ]
                  : [
                      ['AYT-2026-10-1147', '14 Oct', '11,300'],
                      ['AYT-2026-10-1203', '21 Oct', '9,400'],
                      ['AYT-2026-10-1216', '22 Oct', '20,625'],
                    ]
                ).map((row) => (
                  <TableRow key={row[0]}>
                    <TableCell>{row[0]}</TableCell>
                    <TableCell>{row[1]}</TableCell>
                    <TableCell>{row[2]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              How I got this: CDP query on demo data for this role only.
            </p>
          </Panel>
        </FadeIn>
      </div>
    </Shell>
  )
}
