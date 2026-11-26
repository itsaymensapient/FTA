/** Dump the Checks sheet from the v1.2 workbook to db/checks.json */
import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const XLSX = path.join(ROOT, 'documents', 'GITEX_CDP_Stand_Data_Model_v1.2.xlsx')
const OUT = path.join(__dirname, 'checks.json')

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
    ordered.push({ excelRow: r, cells: arr })
  }
  return ordered
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
    if (!name || !rid || !idToTarget[rid]) continue
    sheets[name] = path.join(xlDir, idToTarget[rid].replace(/\//g, path.sep))
  }
  return sheets
}

const dest = path.join(process.env.TEMP || '.', 'gitex-checks-xlsx')
if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true })
fs.mkdirSync(dest, { recursive: true })
execFileSync(
  'powershell',
  [
    '-NoProfile',
    '-Command',
    `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${XLSX.replace(/'/g, "''")}', '${dest.replace(/'/g, "''")}')`,
  ],
  { stdio: 'pipe' },
)

const sheets = mapSheets(path.join(dest, 'xl'))
const rows = parseSheetXml(fs.readFileSync(sheets.Checks, 'utf8'))
const headerRow = rows.find((r) => /^(case)$/i.test(r.cells[0] || '') && /check/i.test(r.cells[1] || ''))
if (!headerRow) throw new Error('Checks header row not found')
const header = ['case', 'check', 'expected', 'from_data', 'ok']
const checks = []
let n = 0
for (const row of rows) {
  if (row.excelRow <= headerRow.excelRow) continue
  const [caseName, check, expected, fromData, ok] = row.cells
  if (!caseName && !check) continue
  if (!/^Case\s+\d+/i.test(caseName || '')) continue
  n += 1
  checks.push({
    id: n,
    case: caseName.trim(),
    check: (check || '').trim(),
    expected: expected === '' || expected == null ? null : expected,
    from_data: fromData === '' || fromData == null ? null : fromData,
    ok: (ok || '').trim() || null,
  })
}

fs.writeFileSync(OUT, JSON.stringify({ source: 'Checks sheet · v1.2', count: checks.length, checks }, null, 2))
console.log('wrote', OUT, 'checks:', checks.length)
checks.forEach((c) => console.log(String(c.id).padStart(2), c.case, '|', c.check, '|', c.expected))
