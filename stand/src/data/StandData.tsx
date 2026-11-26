import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { OptionItem } from './types'
import {
  BRIEFING as FIX_BRIEFING,
  COMPANIES as FIX_COMPANIES,
  DEMO as FIX_DEMO,
  PREP_BIZ_LINES,
  PREP_FTA_LINES,
  WAHA_BIZ_OPTIONS,
  WAHA_FTA_OPTIONS,
  WAHA_PAPER_INVOICES,
  WAHA_REFUND_PARTS,
  YASMEEN_BOXES,
  YASMEEN_BIZ_OPTIONS,
  YASMEEN_FTA_OPTIONS,
  YASMEEN_INVOICES,
} from './fixtures'

export type DataSource = 'loading' | 'postgres' | 'snapshot' | 'fixtures'

export type Company = {
  tin: string
  trn: string
  name: string
  caseId: string
  short: string
}

export type StandDemo = {
  source: DataSource
  demo: {
    visitorDefault: string
    ftaToday: string
    bizToday: string
    followUpToday: string
  }
  companies: {
    yasmeen: Company
    waha: Company
    brightLine: Company
  }
  briefing: {
    id: string
    priority: string
    reason: string
    event: string
    company: string
  }[]
  yasmeen: {
    boxes: { box: string; label: string; declared: number; einvoices: number; gap: number }[]
    invoices: {
      number: string
      date: string
      buyer: string
      vat: number
      ledger: string
      net?: number
      gross?: number
    }[]
    invoiceCount: number
    ftaOptions: OptionItem[]
    bizOptions: OptionItem[]
    gap1b: number
    gapNet: number
    gap1a: number
    letters: Record<string, { subject?: string; body?: string }>
  }
  waha: {
    refundParts: { part: string; vat: number; status: string; tone: 'ok' | 'bad' | 'warn' }[]
    paperInvoices: { number: string; supplier: string; date: string; vat: number; net?: number }[]
    ftaOptions: OptionItem[]
    bizOptions: OptionItem[]
    claimed: number
    approved: number
    rejected: number
    onHold: number
    letters: Record<string, { subject?: string; body?: string }>
  }
  prep: {
    fta: { text: string; done: boolean; time?: string; group?: string }[]
    biz: { text: string; done: boolean; time?: string; group?: string }[]
  }
}

const fixtureDemo: StandDemo = {
  source: 'fixtures',
  demo: { ...FIX_DEMO },
  companies: {
    yasmeen: { ...FIX_COMPANIES.yasmeen },
    waha: { ...FIX_COMPANIES.waha },
    brightLine: { ...FIX_COMPANIES.brightLine },
  },
  briefing: FIX_BRIEFING.map((b) => ({ ...b })),
  yasmeen: {
    boxes: YASMEEN_BOXES.map((b) => ({ ...b })),
    invoices: YASMEEN_INVOICES.map((i) => ({ ...i })),
    invoiceCount: 38,
    ftaOptions: YASMEEN_FTA_OPTIONS,
    bizOptions: YASMEEN_BIZ_OPTIONS,
    gap1b: 486200,
    gapNet: 412000,
    gap1a: -74200,
    letters: {},
  },
  waha: {
    refundParts: WAHA_REFUND_PARTS.map((r) => ({ ...r })),
    paperInvoices: WAHA_PAPER_INVOICES.map((p) => ({ ...p })),
    ftaOptions: WAHA_FTA_OPTIONS,
    bizOptions: WAHA_BIZ_OPTIONS,
    claimed: 284600,
    approved: 203600,
    rejected: 34200,
    onHold: 46800,
    letters: {},
  },
  prep: {
    fta: PREP_FTA_LINES.map((l) => ({ ...l })),
    biz: PREP_BIZ_LINES.map((l) => ({ ...l })),
  },
}

type Api = StandDemo & { ready: boolean }

const Ctx = createContext<Api | null>(null)

function adaptPayload(raw: Record<string, unknown>): StandDemo {
  const source = (raw.source as DataSource) || 'snapshot'
  const demo = raw.demo as StandDemo['demo']
  const companies = raw.companies as StandDemo['companies']
  const briefing = raw.briefing as StandDemo['briefing']
  const yasmeen = raw.yasmeen as StandDemo['yasmeen']
  const waha = raw.waha as StandDemo['waha']
  const prep = (raw.prep as StandDemo['prep']) || fixtureDemo.prep
  return {
    source: source === 'postgres' || source === 'snapshot' ? source : 'snapshot',
    demo,
    companies,
    briefing,
    yasmeen: {
      ...yasmeen,
      ftaOptions: yasmeen.ftaOptions?.length ? yasmeen.ftaOptions : fixtureDemo.yasmeen.ftaOptions,
      bizOptions: yasmeen.bizOptions?.length ? yasmeen.bizOptions : fixtureDemo.yasmeen.bizOptions,
    },
    waha: {
      ...waha,
      ftaOptions: waha.ftaOptions?.length ? waha.ftaOptions : fixtureDemo.waha.ftaOptions,
      bizOptions: waha.bizOptions?.length ? waha.bizOptions : fixtureDemo.waha.bizOptions,
    },
    prep,
  }
}

export function StandDataProvider({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState<StandDemo>({ ...fixtureDemo, source: 'loading' })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/stand')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as Record<string, unknown>
        if (cancelled) return
        setDemo(adaptPayload(json))
      } catch {
        if (cancelled) return
        setDemo(fixtureDemo)
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const api = useMemo(() => ({ ...demo, ready }), [demo, ready])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useDemo() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDemo must be used inside StandDataProvider')
  return ctx
}

/** Convenience aliases matching the old fixture exports. */
export function useStandData() {
  const d = useDemo()
  return {
    ready: d.ready,
    source: d.source,
    DEMO: d.demo,
    COMPANIES: d.companies,
    BRIEFING: d.briefing,
    PREP_FTA_LINES: d.prep.fta,
    PREP_BIZ_LINES: d.prep.biz,
    YASMEEN_BOXES: d.yasmeen.boxes,
    YASMEEN_INVOICES: d.yasmeen.invoices,
    YASMEEN_FTA_OPTIONS: d.yasmeen.ftaOptions,
    YASMEEN_BIZ_OPTIONS: d.yasmeen.bizOptions,
    YASMEEN_INVOICE_COUNT: d.yasmeen.invoiceCount,
    YASMEEN_GAP_1B: d.yasmeen.gap1b,
    YASMEEN_GAP_NET: d.yasmeen.gapNet,
    YASMEEN_GAP_1A: d.yasmeen.gap1a,
    YASMEEN_LETTERS: d.yasmeen.letters,
    WAHA_REFUND_PARTS: d.waha.refundParts,
    WAHA_PAPER_INVOICES: d.waha.paperInvoices,
    WAHA_FTA_OPTIONS: d.waha.ftaOptions,
    WAHA_BIZ_OPTIONS: d.waha.bizOptions,
    WAHA_CLAIMED: d.waha.claimed,
    WAHA_APPROVED: d.waha.approved,
    WAHA_REJECTED: d.waha.rejected,
    WAHA_ON_HOLD: d.waha.onHold,
    WAHA_LETTERS: d.waha.letters,
  }
}
