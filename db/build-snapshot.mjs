/**
 * Build db/snapshot.json from the v1.2 workbook (no Postgres required).
 * Used by the API when LOCAL_PG* is missing or unreachable.
 */
import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const XLSX = path.join(ROOT, 'documents', 'GITEX_CDP_Stand_Data_Model_v1.2.xlsx')
const OUT = path.join(__dirname, 'snapshot.json')

const LOAD_ORDER = [
  'ref_vat201_box',
  'taxpayer',
  'establishment',
  'e_invoice',
  'e_invoice_line',
  'vat_return',
  'vat_return_box',
  'fta_case',
  'return_obligation',
  'voluntary_disclosure',
  'vd_box',
  'refund_request',
  'case_finding',
  'finding_invoice',
  'letter',
  'case_document',
  'case_event',
  'taxpayer_record',
  'agent_option',
  'stand_session',
  'session_action',
]

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function colIndex(col) {
  let n = 0
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n
}

function excelSerialToIso(n, asTimestamp) {
  const utc = Date.UTC(1899, 11, 30) + Math.round(Number(n) * 86400000)
  const d = new Date(utc)
  if (asTimestamp) return d.toISOString().replace('T', ' ').slice(0, 19)
  return d.toISOString().slice(0, 10)
}

function parseSheetXml(xml) {
  const rows = new Map()
  const re = /<c r="([A-Z]+)(\d+)"([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g
  let m
  while ((m = re.exec(xml))) {
    const col = m[1]
    const row = Number(m[2])
    const inner = m[4] || ''
    let val = ''
    if (inner.includes('<is>')) {
      val = [...inner.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((t) => t[1]).join('')
    } else {
      const v = inner.match(/<v>([^<]*)<\/v>/)
      val = v ? v[1] : ''
    }
    val = decode(val).trim()
    if (!rows.has(row)) rows.set(row, [])
    rows.get(row).push([colIndex(col), val])
  }
  const ordered = []
  for (const r of [...rows.keys()].sort((a, b) => a - b)) {
    const cells = rows.get(r).sort((a, b) => a[0] - b[0])
    const max = cells[cells.length - 1][0]
    const arr = Array(max).fill('')
    for (const [i, v] of cells) arr[i - 1] = v
    ordered.push(arr)
  }
  return ordered
}

function sheetRecords(xml) {
  const rows = parseSheetXml(xml)
  const headerIdx = rows.findIndex((r) => r[0] && !String(r[0]).includes('·') && r.filter(Boolean).length > 1)
  if (headerIdx < 0) return { columns: [], records: [] }
  const columns = rows[headerIdx].map((c) => c.trim()).filter(Boolean)
  const records = []
  for (const row of rows.slice(headerIdx + 1)) {
    if (!row.some((c) => c !== '')) continue
    const rec = {}
    columns.forEach((col, i) => {
      rec[col] = row[i] ?? ''
    })
    records.push(rec)
  }
  return { columns, records }
}

function unzipXlsx(xlsxPath, dest) {
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true })
  fs.mkdirSync(dest, { recursive: true })
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${xlsxPath.replace(/'/g, "''")}', '${dest.replace(/'/g, "''")}')`,
    ],
    { stdio: 'pipe' },
  )
}

function mapSheets(xlDir) {
  const wb = fs.readFileSync(path.join(xlDir, 'workbook.xml'), 'utf8')
  const rels = fs.readFileSync(path.join(xlDir, '_rels', 'workbook.xml.rels'), 'utf8')
  const idToTarget = {}
  for (const tag of rels.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = /Id="([^"]+)"/.exec(tag[0])?.[1]
    const target = /Target="([^"]+)"/.exec(tag[0])?.[1]
    if (!id || !target) continue
    idToTarget[id] = target.replace(/^\//, '').replace(/^xl\//, '')
  }
  const sheets = {}
  for (const tag of wb.matchAll(/<sheet\b[^>]*>/g)) {
    const name = /name="([^"]+)"/.exec(tag[0])?.[1]
    const rid = /r:id="([^"]+)"/.exec(tag[0])?.[1]
    if (!name || !rid) continue
    const target = idToTarget[rid]
    if (!target) continue
    sheets[name] = path.join(xlDir, target.replace(/\//g, path.sep))
  }
  return sheets
}

function coerce(col, raw) {
  if (raw === '' || raw == null) return null
  if (/_date$/.test(col) || col.endsWith('_start') || col.endsWith('_end')) {
    if (/^\d+(\.\d+)?$/.test(raw)) return excelSerialToIso(raw, false)
    return String(raw).slice(0, 10)
  }
  if (col.endsWith('_ts')) {
    if (/^\d+(\.\d+)?$/.test(raw)) return excelSerialToIso(raw, true)
    return raw
  }
  if (['line_id', 'invoice_count', 'sort_order', 'events_closed'].includes(col)) {
    return raw === '' ? null : parseInt(raw, 10)
  }
  if (/_aed$/.test(col) || col === 'quantity' || col === 'vat_rate' || col === 'unit_price_aed') {
    return raw === '' ? null : Number(raw)
  }
  return raw
}

function main() {
  if (!fs.existsSync(XLSX)) {
    console.error('Missing workbook:', XLSX)
    process.exit(1)
  }
  const unzipDir = path.join(process.env.TEMP || process.env.TMP || '.', 'gitex-xlsx-snapshot')
  unzipXlsx(XLSX, unzipDir)
  const sheets = mapSheets(path.join(unzipDir, 'xl'))
  const tables = {}
  const counts = {}
  for (const table of LOAD_ORDER) {
    const file = sheets[table]
    if (!file || !fs.existsSync(file)) throw new Error(`Missing sheet ${table}`)
    const { columns, records } = sheetRecords(fs.readFileSync(file, 'utf8'))
    tables[table] = records.map((rec) => {
      const out = {}
      for (const col of columns) out[col] = coerce(col, rec[col])
      return out
    })
    counts[table] = tables[table].length
    console.log(`  ${table}: ${counts[table]}`)
  }
  const payload = {
    version: '1.2',
    builtAt: new Date().toISOString(),
    source: 'GITEX_CDP_Stand_Data_Model_v1.2.xlsx',
    counts,
    tables,
  }
  fs.writeFileSync(OUT, JSON.stringify(payload))
  console.log('wrote', OUT, `(${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB)`)
}

main()
