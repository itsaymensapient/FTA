import type { OptionItem } from './types'

export const DEMO = {
  visitorDefault: 'Sara',
  ftaToday: 'Thu 10 Dec 2026',
  bizToday: 'Fri 11 Dec 2026',
  followUpToday: 'Mon 14 Dec 2026',
} as const

export const COMPANIES = {
  yasmeen: {
    tin: '1004821573',
    trn: '100482157390003',
    name: 'Al Yasmeen General Trading LLC',
    caseId: 'CDP-VAT-2026-1187',
    short: 'Al Yasmeen',
  },
  waha: {
    tin: '1002937461',
    trn: '100293746150003',
    name: 'Al Waha Electronics Trading LLC',
    caseId: 'CDP-REF-2026-0219',
    short: 'Al Waha',
  },
  brightLine: {
    tin: '1007283619',
    trn: '100728361940003',
    name: 'Bright Line General Trading LLC',
    caseId: 'CDP-NF-2026-0733',
    short: 'Bright Line',
  },
} as const

export const BRIEFING = [
  {
    id: 'yasmeen',
    priority: 'High',
    reason: 'AED 412,000 under-declared',
    event: 'VAT return does not match e-invoices',
    company: COMPANIES.yasmeen.name,
  },
  {
    id: 'waha',
    priority: 'High',
    reason: 'Refund decision due 25 Dec',
    event: 'VAT refund request not fully supported',
    company: COMPANIES.waha.name,
  },
] as const

export const YASMEEN_BOXES = [
  { box: '1a', label: 'Abu Dhabi · standard rated', declared: 288800, einvoices: 214600, gap: -74200 },
  { box: '1b', label: 'Dubai · standard rated', declared: 1140000, einvoices: 1626200, gap: 486200 },
  { box: '1c', label: 'Sharjah · standard rated', declared: 96300, einvoices: 96300, gap: 0 },
  { box: '9', label: 'Input tax', declared: 702000, einvoices: 702000, gap: 0 },
  { box: '14', label: 'Payable tax (net)', declared: 823100, einvoices: 1235100, gap: 412000 },
] as const

export const YASMEEN_INVOICES = [
  { number: 'AYT-2026-10-1147', date: '14 Oct', buyer: 'Marina Hospitality LLC', vat: 11300, ledger: '3 Nov' },
  { number: 'AYT-2026-10-1203', date: '21 Oct', buyer: 'Marina Hospitality LLC', vat: 9400, ledger: '3 Nov' },
  { number: 'AYT-2026-10-1216', date: '22 Oct', buyer: 'Oud Al Sharq Perfumes LLC', vat: 20625, ledger: '4 Nov' },
  { number: 'AYT-2026-10-1240', date: '26 Oct', buyer: 'Marina Hospitality LLC', vat: 15050, ledger: 'Box 1a' },
  { number: 'AYT-2026-10-1255', date: '28 Oct', buyer: 'Gulfline Catering LLC', vat: 8750, ledger: '5 Nov' },
] as const

export const YASMEEN_FTA_OPTIONS: OptionItem[] = [
  {
    id: 'OPT-FTA-REC-1',
    label: 'Ask the taxpayer to explain or correct within 20 business days',
    recommended: true,
  },
  {
    id: 'OPT-FTA-REC-2',
    label: 'Refer to audit',
    tone: 'danger',
  },
]

export const YASMEEN_BIZ_OPTIONS: OptionItem[] = [
  {
    id: 'OPT-BUS-REC-1',
    label: 'Submit a VD for AED 412,000 and reply · recommended',
    recommended: true,
  },
  {
    id: 'OPT-BUS-REC-2',
    label: 'Reply with an explanation only',
    weak: true,
    weakReply:
      'A difference above AED 10,000 must be corrected with a Voluntary Disclosure. An explanation alone will not close the case.',
  },
  {
    id: 'OPT-BUS-REC-3',
    label: 'Ask the FTA for more time',
  },
]

export const WAHA_REFUND_PARTS = [
  { part: 'Supported by e-invoices', vat: 53600, status: 'Approved 10 Dec', tone: 'ok' as const },
  {
    part: '6 paper tax invoices · Gulf Horizon / Al Noor Cables',
    vat: 150000,
    status: 'Can be supported',
    tone: 'ok' as const,
  },
  {
    part: '23 card slips and booking confirmations',
    vat: 34200,
    status: 'Not recoverable',
    tone: 'bad' as const,
  },
  {
    part: '14 invoices from Bright Line · supplier not filing',
    vat: 46800,
    status: 'At risk',
    tone: 'warn' as const,
  },
] as const

export const WAHA_FTA_OPTIONS: OptionItem[] = [
  {
    id: 'OPT-FTA-REF-1',
    label: 'Approve AED 53,600 now, request documents for AED 231,000 · recommended',
    recommended: true,
  },
  {
    id: 'OPT-FTA-REF-2',
    label: 'Hold the whole refund and request documents',
  },
  {
    id: 'OPT-FTA-REF-3',
    label: 'Refer to audit',
    tone: 'danger',
  },
]

export const WAHA_BIZ_OPTIONS: OptionItem[] = [
  {
    id: 'OPT-BUS-REF-1',
    label: 'Send 6 invoices and payment proof, accept AED 34,200 as not recoverable · recommended',
    recommended: true,
  },
  {
    id: 'OPT-BUS-REF-2',
    label: 'Send all documents, including the card slips',
    weak: true,
    weakReply:
      'Card slips are not tax invoices. The FTA will reject AED 34,200 anyway, and the return still needs a VD.',
  },
  {
    id: 'OPT-BUS-REF-3',
    label: 'Ask the FTA for more time',
  },
]

export const WAHA_PAPER_INVOICES = [
  { number: 'GHC-26-3307', supplier: 'Gulf Horizon Components', date: '22 Sep', vat: 26000 },
  { number: 'GHC-26-3412', supplier: 'Gulf Horizon Components', date: '4 Oct', vat: 18500 },
  { number: 'ANC-26-1188', supplier: 'Al Noor Cables Trading', date: '12 Sep', vat: 32000 },
  { number: 'ANC-26-1201', supplier: 'Al Noor Cables Trading', date: '29 Sep', vat: 27500 },
  { number: 'ANC-26-1220', supplier: 'Al Noor Cables Trading', date: '18 Oct', vat: 24000 },
  { number: 'GHC-26-3501', supplier: 'Gulf Horizon Components', date: '27 Oct', vat: 22000 },
] as const

export const PREP_FTA_LINES = [
  { text: 'Checked 21,480 new e-invoices against filed returns', done: true },
  { text: 'Checked 214 VAT returns for Aug–Oct 2026', done: true },
  { text: 'Checked 12 refund requests against received invoices', done: true },
  { text: 'Ranked open issues by risk and deadline', done: true },
  { text: 'Writing your briefing…', done: false },
]

export const PREP_BIZ_LINES = [
  { text: 'Received the letter from the FTA agent', done: true, time: '10 Dec, 09:04' },
  { text: 'Read the request: Box 1b, AED 486,200, 38 invoices, reply by 07.01.2027', done: true, time: '09:04' },
  { text: 'Matched the 38 invoices with your ledger', done: true, time: '09:05' },
  { text: 'Found: 34 booked in November, 4 reported under Abu Dhabi', done: true, time: '09:06' },
  { text: 'Preparing a Voluntary Disclosure and a reply…', done: false, time: 'now' },
  { text: 'Waiting for you: nothing is sent without your approval', done: false },
]
