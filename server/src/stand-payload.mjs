/** Build the GITEX stand UI payload from v1.2 table rows (Postgres or snapshot). */

const YASMEEN_TIN = '1004821573'
const WAHA_TIN = '1002937461'
const BRIGHT_TIN = '1007283619'
const YASMEEN_CASE = 'CDP-VAT-2026-1187'
const WAHA_CASE = 'CDP-REF-2026-0219'
const BRIGHT_CASE = 'CDP-NF-2026-0733'

function num(v) {
  if (v == null || v === '') return 0
  return typeof v === 'number' ? v : Number(v)
}

function toDate(value) {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  const raw = String(value).trim()
  // Postgres/node-pg often yields Date; snapshot JSON yields YYYY-MM-DD or ISO.
  const day = raw.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : null
  const d = day ? new Date(`${day}T00:00:00Z`) : new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

function shortDate(iso) {
  const d = toDate(iso)
  if (!d) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

function weekdayDate(iso) {
  const d = toDate(iso)
  if (!d) return ''
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function companyFrom(tp, caseId) {
  const parts = tp.legal_name.split(' ')
  const short = parts.slice(0, 2).join(' ')
  return {
    tin: tp.tin,
    trn: tp.trn,
    name: tp.legal_name,
    caseId,
    short,
  }
}

function mapOptions(rows, caseType, side) {
  return rows
    .filter((o) => o.case_type === caseType && o.side === side)
    .sort((a, b) => num(a.sort_order) - num(b.sort_order))
    .map((o) => {
      const item = {
        id: o.option_id,
        label: o.label,
      }
      if (o.recommended === 'Y' || o.recommended === 'y' || o.recommended === true) item.recommended = true
      if (o.weak_option_reply) {
        item.weak = true
        item.weakReply = o.weak_option_reply
      }
      if (/audit/i.test(o.label)) item.tone = 'danger'
      return item
    })
}

function invoiceRows(tables, findingId, limit = 5) {
  const byUuid = Object.fromEntries(tables.e_invoice.map((e) => [e.invoice_uuid, e]))
  const buyers = Object.fromEntries(tables.taxpayer.map((t) => [t.tin, t.legal_name]))
  const records = tables.taxpayer_record || []
  return tables.finding_invoice
    .filter((f) => f.finding_id === findingId)
    .slice(0, limit)
    .map((f) => {
      const e = byUuid[f.invoice_uuid]
      const rec = records.find((r) => r.invoice_uuid === f.invoice_uuid)
      let ledger = shortDate(rec?.booking_date)
      if (rec?.booked_box && rec.booked_box !== e?.seller_vat201_box) {
        ledger = `Box ${rec.booked_box}`
      }
      return {
        number: e?.invoice_number || f.invoice_number,
        date: shortDate(e?.issue_date),
        buyer: buyers[e?.buyer_tin] || 'Buyer',
        vat: num(f.vat_amount_aed),
        ledger: ledger || '—',
        net: num(e?.net_amount_aed),
        gross: num(e?.gross_amount_aed),
      }
    })
}

function yasmeenBoxes(tables) {
  const findings = tables.case_finding.filter((f) => f.case_id === YASMEEN_CASE)
  const byBox = Object.fromEntries(findings.filter((f) => f.box_code).map((f) => [f.box_code, f]))
  const ret = tables.vat_return_box.filter((b) => b.return_id === `VAT201-${YASMEEN_TIN}-2026-10`)
  const declared = Object.fromEntries(ret.map((b) => [b.box_code, num(b.vat_aed)]))
  const labels = {
    '1a': 'Abu Dhabi · standard rated',
    '1b': 'Dubai · standard rated',
    '1c': 'Sharjah · standard rated',
    '9': 'Input tax',
    '14': 'Payable tax (net)',
  }
  return ['1a', '1b', '1c', '9', '14'].map((box) => {
    const f = byBox[box]
    const decl = f?.declared_vat_aed != null ? num(f.declared_vat_aed) : declared[box] ?? 0
    const einv = f?.einvoice_vat_aed != null ? num(f.einvoice_vat_aed) : decl
    const gap = f?.gap_vat_aed != null ? num(f.gap_vat_aed) : einv - decl
    return { box, label: labels[box], declared: decl, einvoices: einv, gap }
  })
}

function wahaRefundParts(tables) {
  const findings = tables.case_finding.filter((f) => f.case_id === WAHA_CASE)
  const byId = Object.fromEntries(findings.map((f) => [f.finding_id, f]))
  const refund = tables.refund_request.find((r) => r.case_id === WAHA_CASE)
  const supported = byId['F-0219-03']
  const paper = byId['F-0219-01']
  const bright = byId['F-0219-02']
  return [
    {
      part: 'Supported by e-invoices',
      vat: num(supported?.gap_vat_aed ?? refund?.approved_aed),
      status: 'Approved 10 Dec',
      tone: 'ok',
    },
    {
      part: '6 paper tax invoices · Gulf Horizon / Al Noor Cables',
      vat: 150000,
      status: 'Can be supported',
      tone: 'ok',
    },
    {
      part: '23 card slips and booking confirmations',
      vat: num(refund?.rejected_aed ?? 34200),
      status: 'Not recoverable',
      tone: 'bad',
    },
    {
      part: '14 invoices from Bright Line · supplier not filing',
      vat: num(bright?.gap_vat_aed ?? refund?.on_hold_aed),
      status: 'At risk',
      tone: 'warn',
    },
  ].map((row, i) => {
    if (i === 1 && paper?.resolution_note) {
      const m = String(paper.resolution_note).match(/([\d,]+)\s*supported/i)
      if (m) row.vat = Number(m[1].replace(/,/g, ''))
    }
    return row
  })
}

function paperInvoices(tables) {
  const names = Object.fromEntries(tables.taxpayer.map((t) => [t.tin, t.legal_name]))
  return tables.case_document
    .filter((d) => d.case_id === WAHA_CASE && d.document_type === 'PAPER_TAX_INVOICE')
    .map((d) => ({
      number: d.document_number,
      supplier: (names[d.counterparty_tin] || 'Supplier').replace(/ LLC$/, ''),
      date: shortDate(d.document_date),
      vat: num(d.vat_amount_aed),
      net: num(d.net_amount_aed),
    }))
}

function letterMap(tables, caseId) {
  const rows = tables.letter.filter((l) => l.case_id === caseId)
  const out = {}
  for (const l of rows) {
    out[l.letter_type] = {
      id: l.letter_id,
      subject: l.subject,
      body: l.body_text,
      sentDate: l.sent_date,
      deadlineDate: l.deadline_date,
      direction: l.direction,
    }
  }
  return out
}

export function buildStandPayload(tables, meta = {}) {
  const byTin = Object.fromEntries(tables.taxpayer.map((t) => [t.tin, t]))
  const cases = Object.fromEntries(tables.fta_case.map((c) => [c.case_id, c]))
  const yasmeen = companyFrom(byTin[YASMEEN_TIN], YASMEEN_CASE)
  const waha = companyFrom(byTin[WAHA_TIN], WAHA_CASE)
  const brightLine = companyFrom(byTin[BRIGHT_TIN], BRIGHT_CASE)
  const yCase = cases[YASMEEN_CASE]
  const wCase = cases[WAHA_CASE]
  const refund = tables.refund_request.find((r) => r.case_id === WAHA_CASE)

  const yFinding1b = tables.case_finding.find((f) => f.finding_id === 'F-1187-01')

  return {
    version: '1.2',
    source: meta.source || 'unknown',
    counts: meta.counts || null,
    demo: {
      visitorDefault: 'Sara',
      ftaToday: weekdayDate(yCase?.opened_date || '2026-12-10'),
      bizToday: weekdayDate('2026-12-11'),
      followUpToday: weekdayDate(yCase?.closed_date || '2026-12-14'),
    },
    companies: { yasmeen, waha, brightLine },
    briefing: [
      {
        id: 'yasmeen',
        priority: yCase?.risk_level === 'HIGH' ? 'High' : yCase?.risk_level || 'High',
        reason: yCase?.priority_reason || 'AED 412,000 under-declared',
        event: 'VAT return does not match e-invoices',
        company: yasmeen.name,
        caseId: YASMEEN_CASE,
        amountAtStake: num(yCase?.amount_at_stake_aed),
      },
      {
        id: 'waha',
        priority: wCase?.risk_level === 'HIGH' ? 'High' : wCase?.risk_level || 'High',
        reason: wCase?.priority_reason || 'Refund decision due 25 Dec',
        event: 'VAT refund request not fully supported',
        company: waha.name,
        caseId: WAHA_CASE,
        amountAtStake: num(wCase?.amount_at_stake_aed),
      },
    ],
    yasmeen: {
      case: yCase,
      boxes: yasmeenBoxes(tables),
      invoices: invoiceRows(tables, 'F-1187-01', 5),
      invoiceCount: num(yFinding1b?.invoice_count) || 38,
      ftaOptions: mapOptions(tables.agent_option, 'RETURN_VS_EINVOICES', 'FTA_SPECIALIST'),
      bizOptions: mapOptions(tables.agent_option, 'RETURN_VS_EINVOICES', 'BUSINESS'),
      letters: letterMap(tables, YASMEEN_CASE),
      gap1b: num(yFinding1b?.gap_vat_aed),
      gapNet: num(tables.case_finding.find((f) => f.finding_id === 'F-1187-03')?.gap_vat_aed),
      gap1a: num(tables.case_finding.find((f) => f.finding_id === 'F-1187-02')?.gap_vat_aed),
    },
    waha: {
      case: wCase,
      refund,
      refundParts: wahaRefundParts(tables),
      paperInvoices: paperInvoices(tables),
      ftaOptions: mapOptions(tables.agent_option, 'REFUND_REVIEW', 'FTA_SPECIALIST'),
      bizOptions: mapOptions(tables.agent_option, 'REFUND_REVIEW', 'BUSINESS'),
      letters: letterMap(tables, WAHA_CASE),
      claimed: num(refund?.amount_claimed_aed),
      approved: num(refund?.approved_aed),
      rejected: num(refund?.rejected_aed),
      onHold: num(refund?.on_hold_aed),
    },
    prep: {
      fta: [
        { text: 'Checked 21,480 new e-invoices against filed returns', done: true },
        { text: 'Checked 214 VAT returns for Aug–Oct 2026', done: true },
        { text: 'Checked 12 refund requests against received invoices', done: true },
        { text: 'Ranked open issues by risk and deadline', done: true },
        { text: 'Writing your briefing…', done: false },
      ],
      biz: [
        { text: 'Received the letter from the FTA agent', done: true, time: '10 Dec, 09:04' },
        {
          text: `Read the request: Box 1b, AED ${num(yFinding1b?.gap_vat_aed).toLocaleString('en-AE')}, ${num(yFinding1b?.invoice_count) || 38} invoices, reply by 07.01.2027`,
          done: true,
          time: '09:04',
        },
        { text: 'Matched the 38 invoices with your ledger', done: true, time: '09:05' },
        { text: 'Found: 34 booked in November, 4 reported under Abu Dhabi', done: true, time: '09:06' },
        { text: 'Preparing a Voluntary Disclosure and a reply…', done: false, time: 'now' },
        { text: 'Waiting for you: nothing is sent without your approval', done: false },
      ],
    },
  }
}

export const KNOWN = { YASMEEN_TIN, WAHA_TIN, BRIGHT_TIN, YASMEEN_CASE, WAHA_CASE, BRIGHT_CASE }
