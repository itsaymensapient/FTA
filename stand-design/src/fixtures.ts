export const DEMO = {
  visitorDefault: 'Sara',
  ftaToday: 'Thu 10 Dec 2026',
  bizToday: 'Fri 11 Dec 2026',
  followUpToday: 'Mon 14 Dec 2026',
}

export const COMPANIES = {
  yasmeen: {
    name: 'Al Yasmeen General Trading LLC',
    trn: '100482157390003',
    caseId: 'CDP-VAT-2026-1187',
  },
  waha: {
    name: 'Al Waha Electronics Trading LLC',
    trn: '100293746150003',
    caseId: 'CDP-REF-2026-0219',
  },
}

export const YASMEEN_BOXES = [
  { box: '1a', label: 'Abu Dhabi', declared: 288800, einvoices: 214600, gap: -74200 },
  { box: '1b', label: 'Dubai', declared: 1140000, einvoices: 1626200, gap: 486200 },
  { box: '1c', label: 'Sharjah', declared: 96300, einvoices: 96300, gap: 0 },
  { box: '9', label: 'Input tax', declared: 702000, einvoices: 702000, gap: 0 },
  { box: '14', label: 'Payable tax', declared: 823100, einvoices: 1235100, gap: 412000 },
]

export const BRIEFING = [
  {
    id: 'yasmeen',
    reason: 'AED 412,000 under-declared',
    event: 'VAT return does not match e-invoices',
    company: COMPANIES.yasmeen.name,
    detail: 'Output VAT under-declared by AED 412,000 net · Aug–Oct 2026 · Dubai gap AED 486,200.',
  },
  {
    id: 'waha',
    reason: 'Refund decision due 25 Dec',
    event: 'VAT refund request not fully supported',
    company: COMPANIES.waha.name,
    detail: 'Refund claimed AED 284,600 · AED 231,000 not supported by e-invoices or by a filing supplier.',
  },
]

export const aed = (n: number) =>
  `AED ${n.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`
export const aedPlain = (n: number) =>
  n.toLocaleString('en-AE', { maximumFractionDigits: 0 })
