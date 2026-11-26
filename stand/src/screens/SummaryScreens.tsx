import { Shell } from '@/components/Shell'
import {
  Button,
  FadeIn,
  Panel,
  StatTile,
  AskBar,
} from '@/components/ui'
import { useStandData } from '@/data/StandData'
import { aed } from '@/lib/format'
import { useStand } from '@/session/StandSession'
import { useEffect, useState } from 'react'

type SavedJourney = { state: string; verification?: { net?: number; approved?: number; rejected?: number; on_hold?: number } }

function useSavedJourney(endpoint: 'uc2' | 'refund', key: string) {
  const [data, setData] = useState<SavedJourney | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    const id = localStorage.getItem(key)
    if (!id) { setLoading(false); return }
    fetch(`/api/agent/${endpoint}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({operation:'get', journey_id:id}) })
      .then(async r => { const body = await r.json(); if (!r.ok || !body.ok) throw new Error(body.error || 'Unable to load status.'); return body.journey as SavedJourney })
      .then(journey => { if (active) setData(journey) })
      .catch(e => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [endpoint, key])
  return { data, error, loading }
}

export function FtaSummaryScreen() {
  const { DEMO } = useStandData()
  const { visitorName, chooseRole, reset, go } = useStand()
  const yasmeen = useSavedJourney('uc2', 'fta-uc2-journey-id')
  const waha = useSavedJourney('refund', 'fta-refund-journey-id')
  const complete = [yasmeen.data, waha.data].filter(j => j?.state === 'CLOSED').length
  useEffect(() => { const timer = setTimeout(reset, 30000); return () => clearTimeout(timer) }, [reset])
  return <Shell role="FTA_SPECIALIST" visitorName={visitorName || DEMO.visitorDefault}>
    <FadeIn className="mx-auto flex max-w-4xl flex-col gap-5">
      <h1 className="stand-title">Your demo session</h1>
      <p className="text-sm text-muted-foreground">Results shown below are saved demo actions.</p>
      {(yasmeen.error || waha.error) && <p role="alert">Could not load all case results. Refresh the page or return to the case.</p>}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <StatTile label="Cases closed" value={yasmeen.loading || waha.loading ? 'Loading…' : `${complete} of 2`} />
        <StatTile label="Al Yasmeen net adjustment" value={yasmeen.data?.state === 'CLOSED' && yasmeen.data.verification?.net != null ? aed(yasmeen.data.verification.net) : 'Not closed'} />
        <StatTile label="Al Waha refund approved" value={waha.data?.state === 'CLOSED' && waha.data.verification?.approved != null ? aed(waha.data.verification.approved) : 'Not closed'} />
      </div>
      <Panel><h2 className="mb-3 font-semibold">Case status</h2><div className="space-y-2 text-sm">
        <p>Al Yasmeen: {yasmeen.loading ? 'Loading…' : yasmeen.data?.state.replaceAll('_',' ').toLowerCase() || 'Not started'}</p>
        <p>Al Waha: {waha.loading ? 'Loading…' : waha.data?.state.replaceAll('_',' ').toLowerCase() || 'Not started'}</p>
      </div></Panel>
      <div className="flex flex-wrap gap-3"><Button variant="gold" onClick={() => chooseRole('BUSINESS')}>Try as Business</Button><Button variant="outline" onClick={reset}>Finish</Button><Button variant="ghost" onClick={() => go('03_briefing')}>Back to briefing</Button></div>
      <p className="text-xs text-muted-foreground">The stand resets in 30 seconds.</p>
    </FadeIn>
  </Shell>
}

export function BizSummaryScreen() {
  const { DEMO, COMPANIES } = useStandData()
  const { visitorName, company, chooseRole, reset, openCase } = useStand()
  const isWaha = company === 'waha'
  const selected = isWaha ? COMPANIES.waha : COMPANIES.yasmeen
  const { data, loading, error } = useSavedJourney(isWaha ? 'refund' : 'uc2', isWaha ? 'fta-refund-journey-id' : 'fta-uc2-journey-id')
  useEffect(() => { const timer = setTimeout(reset, 30000); return () => clearTimeout(timer) }, [reset])
  return <Shell role="BUSINESS" visitorName={visitorName || DEMO.visitorDefault} companyLabel={`${selected.name} · TRN ${selected.trn}`}>
    <FadeIn className="mx-auto flex max-w-4xl flex-col gap-5">
      <h1 className="stand-title">{selected.short} · demo case summary</h1>
      {error && <p role="alert">Unable to load the saved case. Return to the case to retry.</p>}
      <Panel><h2 className="font-semibold">Case status</h2><p className="mt-3 text-sm">{loading ? 'Loading…' : data?.state.replaceAll('_',' ').toLowerCase() || 'Not started'}</p>
        {data?.state === 'CLOSED' && <p className="mt-3 text-sm">{isWaha && data.verification?.approved != null ? `Demo refund decision: ${aed(data.verification.approved)} approved, ${aed(data.verification.rejected || 0)} rejected, ${aed(data.verification.on_hold || 0)} on hold.` : data.verification?.net != null ? `Verified demo net adjustment: ${aed(data.verification.net)}.` : ''}</p>}
      </Panel>
      <div className="flex flex-wrap gap-3"><Button variant="outline" onClick={() => openCase(isWaha ? 'yasmeen' : 'waha', isWaha ? 'Y1_home' : 'W1_home')}>Try the other company</Button><Button variant="gold" onClick={() => chooseRole('FTA_SPECIALIST')}>Try as FTA Specialist</Button><Button variant="ghost" onClick={reset}>Finish</Button></div>
      <p className="text-xs text-muted-foreground">The stand resets in 30 seconds.</p>
    </FadeIn>
  </Shell>
}

export function QueryScreen() {
  const { DEMO, COMPANIES } = useStandData()
  const { visitorName, role, company, go } = useStand()
  const isBiz = role === 'BUSINESS'
  const selected = company === 'waha' ? COMPANIES.waha : COMPANIES.yasmeen
  return <Shell role={isBiz ? 'BUSINESS' : 'FTA_SPECIALIST'} visitorName={visitorName || DEMO.visitorDefault}
    companyLabel={isBiz && company ? `${selected.name} · TRN ${selected.trn}` : undefined}>
    <div className="mx-auto max-w-3xl"><Panel>
      <h1 className="text-lg font-semibold">{isBiz ? 'Ask the FTA Assistant' : 'Ask the FTA agent'}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Ask about the synthetic demo data. Answers use the available case tools.</p>
      {isBiz && !company ? <p className="mt-4 text-sm">Choose a company before asking a business question.</p> : <AskBar placeholder="Ask about the demo data…" />}
      <Button className="mt-4" variant="outline" onClick={() => go(isBiz ? 'B01_company' : '03_briefing')}>Back</Button>
    </Panel></div>
  </Shell>
}
