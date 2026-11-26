import { useEffect, useState } from 'react'
import { Panel, PaperPanel, Button, SectionLabel } from '@/components/ui'
import { aedPlain } from '@/lib/format'

type InvoiceSummary = {
  invoice_uuid: string
  invoice_number: string
  issue_date: string
  buyer: string
  vat_amount_aed: number
}
type InvoiceDetail = InvoiceSummary & {
  seller: string
  seller_tin: string
  buyer_tin: string
  net_amount_aed: number
  gross_amount_aed: number
  lines: { line_id: number; item_name: string; net_amount_aed: number; vat_amount_aed: number }[]
  how: { note: string }
}

export function CaseInvoices({ onBack, onContinue, business = false }: { onBack: () => void; onContinue: () => void; business?: boolean }) {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [selected, setSelected] = useState('')
  const [detail, setDetail] = useState<InvoiceDetail | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/agent/case-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'list_finding_invoices', finding_id: 'F-1187-01' }),
    })
      .then(async (r) => {
        const b = await r.json()
        if (!r.ok || !b.ok) throw new Error(b.error || 'Could not load invoices.')
        return b.result
      })
      .then((result) => {
        if (active) {
          setInvoices(result.invoices)
          setSelected(result.invoices[0]?.invoice_uuid || '')
        }
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selected) return
    let active = true
    setDetail(null)
    setError('')
    fetch('/api/agent/case-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'get_invoice', invoice_uuid: selected }),
    })
      .then(async (r) => {
        const b = await r.json()
        if (!r.ok || !b.ok) throw new Error(b.error || 'Could not load invoice.')
        return b.result
      })
      .then((result) => {
        if (active) setDetail(result)
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    return () => {
      active = false
    }
  }, [selected])

  const shown = invoices.slice(0, 4)
  const more = Math.max(0, invoices.length - shown.length)

  return (
    <div className="mt-5 grid items-start gap-5 lg:grid-cols-[360px_1fr]">
      <div className="flex flex-col gap-3">
        <div className="ml-auto max-w-[90%] rounded-lg bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
          {business ? 'YOU · Show invoices' : `YOU · Show ${invoices.length || 38} invoices`}
        </div>
        <Panel>
          <SectionLabel>{business ? 'FTA assistant' : 'AI agent'}</SectionLabel>
          <p className="text-sm leading-6">
            {business
              ? 'The invoices from the FTA letter, with your ledger booking date. Tap one to open it.'
              : `The ${invoices.length || 38} invoices behind the gap, by date. Tap one to open it.`}
          </p>
          {loading && (
            <p role="status" className="mt-4 text-sm">
              Loading invoices…
            </p>
          )}
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[1.2fr_0.7fr_1fr_0.7fr] gap-2 bg-muted/40 px-3 py-2 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase">
              <span>Invoice</span>
              <span>Date</span>
              <span>Buyer</span>
              <span>VAT</span>
            </div>
            {shown.map((inv) => (
              <button
                type="button"
                key={inv.invoice_uuid}
                onClick={() => setSelected(inv.invoice_uuid)}
                aria-pressed={selected === inv.invoice_uuid}
                className="grid w-full grid-cols-[1.2fr_0.7fr_1fr_0.7fr] gap-2 border-t border-border px-3 py-2 text-left text-xs hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring aria-pressed:bg-gold/20"
              >
                <span className="truncate font-medium">{inv.invoice_number}</span>
                <span className="text-muted-foreground">{inv.issue_date}</span>
                <span className="truncate text-muted-foreground">{inv.buyer.split(' ')[0]}</span>
                <span>{aedPlain(inv.vat_amount_aed)}</span>
              </button>
            ))}
            {more > 0 ? (
              <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                … {more} more · Export list
              </div>
            ) : null}
          </div>
        </Panel>
        <Panel>
          <SectionLabel>{business ? 'FTA assistant' : 'AI agent'}</SectionLabel>
          <p className="text-sm leading-6">
            {business
              ? 'Invoice dates are compared with your ledger. October issues booked in November are missing from the Aug–Oct return.'
              : "Reported by the seller's provider (C2) and confirmed by the buyer's provider (C3). Both copies match."}
          </p>
        </Panel>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onContinue}>What can I do?</Button>
        </div>
      </div>
      <PaperPanel>
        {detail ? (
          <>
            <p className="text-[0.6875rem] font-semibold tracking-[0.1em] text-[#5b6b7c] uppercase">Tax invoice</p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em]">{detail.invoice_number}</h2>
            <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <p className="font-semibold">Seller</p>
                <p>{detail.seller}</p>
                <p className="text-[#5b6b7c]">TRN {detail.seller_tin}</p>
              </div>
              <div>
                <p className="font-semibold">Buyer</p>
                <p>{detail.buyer}</p>
                <p className="text-[#5b6b7c]">TRN {detail.buyer_tin}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-1 text-sm text-[#5b6b7c]">
              <div>Issue date: {detail.issue_date}</div>
              <div>Currency: AED</div>
            </div>
            <div className="mt-6 rounded-lg bg-[#f4f6f8] p-4 text-sm">
              {detail.lines.map((line) => (
                <div
                  key={line.line_id}
                  className="flex justify-between gap-4 border-b border-[#d5dee8] py-2"
                >
                  <span>{line.item_name}</span>
                  <span>{aedPlain(line.net_amount_aed)}</span>
                </div>
              ))}
              <div className="mt-3 flex justify-between">
                <span>Total VAT amount</span>
                <span>{aedPlain(detail.vat_amount_aed)}</span>
              </div>
              <div className="mt-2 flex justify-between font-semibold">
                <span>Total payable amount</span>
                <span>{aedPlain(detail.gross_amount_aed)}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-[#5b6b7c]">{detail.how.note}</p>
          </>
        ) : (
          <p role="status" className="text-sm">
            {error || 'Select an invoice to view its details.'}
          </p>
        )}
      </PaperPanel>
    </div>
  )
}
