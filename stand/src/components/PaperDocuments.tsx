import { useEffect, useState } from 'react'
import { aedPlain } from '@/lib/format'

type Doc = {
  document_id: string
  document_number: string
  supplier_name?: string | null
  issue_date?: string | null
  vat_amount_aed: number
  check_result?: string | null
}

export function PaperDocumentsPanel({ companyName }: { companyName: string }) {
  const [docs, setDocs] = useState<Doc[]>([])
  const [totalVat, setTotalVat] = useState(0)
  const [selected, setSelected] = useState(0)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  useEffect(() => {
    let active = true
    fetch('/api/agent/case-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'list_case_documents', document_type: 'PAPER_TAX_INVOICE' }),
    })
      .then(async (r) => {
        const b = await r.json()
        if (!r.ok || !b.ok) throw new Error(b.error || 'Unable to load documents.')
        return b.result as { documents: Doc[]; total_vat_aed: number; how?: { note: string } }
      })
      .then((result) => {
        if (!active) return
        setDocs(result.documents)
        setTotalVat(result.total_vat_aed)
        setNote(result.how?.note || '')
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Unable to load documents.')
      })
    return () => {
      active = false
    }
  }, [])
  const inv = docs[selected]
  if (error) return <p className="text-sm text-destructive">{error}</p>
  if (!docs.length) return <p className="text-sm">Loading paper tax invoices…</p>
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[360px_1fr]">
      <div>
        <h2 className="mb-3 text-base font-semibold leading-snug">{docs.length} paper tax invoices</h2>
        <div className="flex flex-col gap-2 text-sm">
          {docs.map((row, index) => (
            <button
              type="button"
              key={row.document_id}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              className="rounded-lg border border-border px-3.5 py-2.5 text-left hover:bg-muted/40 aria-pressed:border-primary"
            >
              <div className="font-medium leading-5">{row.document_number}</div>
              <div className="text-xs leading-5 text-muted-foreground">
                {row.supplier_name || 'Supplier'} · {row.issue_date || '—'} · VAT {aedPlain(row.vat_amount_aed)}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3 text-sm font-semibold leading-5">Total VAT {aedPlain(totalVat)}</div>
        {note ? <p className="mt-2 text-xs text-muted-foreground">{note}</p> : null}
      </div>
      {inv ? (
        <div>
          <div className="text-[0.6875rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            Tax invoice · demo record
          </div>
          <h2 className="mt-1 text-xl font-semibold leading-snug tracking-[-0.02em]">{inv.document_number}</h2>
          <p className="mt-3 text-sm leading-6">
            Seller {inv.supplier_name || 'Supplier'} · Buyer {companyName}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            VAT AED {aedPlain(inv.vat_amount_aed)}
            {inv.check_result ? ` · ${inv.check_result}` : ''}
          </p>
        </div>
      ) : null}
    </div>
  )
}
