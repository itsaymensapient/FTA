import { useEffect, useState } from 'react'
import { aed } from '@/lib/format'

type Supplier = {
  company: string
  tin: string
  filing: boolean
  non_filer_case_id: string
  vat_on_invoices_to_al_waha_aed: number
  obligations: { period_code: string; status: string; due_date?: string }[]
  how?: { note: string }
}

export function SupplierStatusPanel() {
  const [data, setData] = useState<Supplier | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    fetch('/api/agent/case-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'get_supplier_status' }),
    })
      .then(async (r) => {
        const b = await r.json()
        if (!r.ok || !b.ok) throw new Error(b.error || 'Unable to load supplier status.')
        return b.result as Supplier
      })
      .then((result) => {
        if (active) setData(result)
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Unable to load supplier status.')
      })
    return () => {
      active = false
    }
  }, [])
  if (error) return <p className="text-sm text-destructive">{error}</p>
  if (!data) return <p className="text-sm">Loading supplier status…</p>
  return (
    <div className="flex flex-col gap-2.5 text-sm leading-5">
      <p className="leading-6">
        {data.company} is VAT-registered but {data.filing ? 'is filing' : 'has not filed'} the required returns (
        case {data.non_filer_case_id}).
      </p>
      {data.obligations.map((o) => (
        <div key={o.period_code} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{o.period_code} return</span>
          <span className={data.filing ? 'num-ok' : 'num-gap'}>{o.status || 'Not filed'}</span>
        </div>
      ))}
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Invoices to Al Waha</span>
        <span>VAT {aed(data.vat_on_invoices_to_al_waha_aed)}</span>
      </div>
      {data.how?.note ? <p className="mt-2 text-xs text-muted-foreground">{data.how.note}</p> : null}
    </div>
  )
}
