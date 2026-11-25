import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'extracted-screens')
const XLSX = path.join(ROOT, 'documents', 'GITEX_CDP_Stand_Data_Model_v1.2.xlsx')
const DOCX = path.join(ROOT, 'documents', 'GITEX_CDP_AI_Agents_Stand_Scenario_v2.9_EN.docx')
const xunz = path.join(OUT, '_xlsx-unz')
const sunz = path.join(OUT, '_scenario-unz')

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

function unzip(src, dest) {
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true })
  fs.mkdirSync(dest, { recursive: true })
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${src.replace(/'/g, "''")}', '${dest.replace(/'/g, "''")}')`,
    ],
    { stdio: 'pipe' },
  )
}

function loadSharedStrings(xlDir) {
  const p = path.join(xlDir, 'sharedStrings.xml')
  if (!fs.existsSync(p)) return []
  const shared = fs.readFileSync(p, 'utf8')
  return [...shared.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    decode([...m[1].matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((t) => t[1]).join('')),
  )
}

function parseSheetXml(xml, strings) {
  const rows = new Map()
  const re = /<c r="([A-Z]+)(\d+)"([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g
  let m
  while ((m = re.exec(xml))) {
    const col = m[1]
    const row = Number(m[2])
    const attrs = m[3] || ''
    const inner = m[4] || ''
    let val = ''
    if (attrs.includes('t="s"')) {
      const v = inner.match(/<v>([^<]*)<\/v>/)
      val = v ? strings[Number(v[1])] || '' : ''
    } else if (attrs.includes('t="inlineStr"') || inner.includes('<is>')) {
      val = decode([...inner.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((t) => t[1]).join(''))
    } else {
      const v = inner.match(/<v>([^<]*)<\/v>/)
      val = v ? decode(v[1]) : ''
    }
    if (!rows.has(row)) rows.set(row, [])
    rows.get(row).push([colIndex(col), val])
  }
  const ordered = []
  for (const r of [...rows.keys()].sort((a, b) => a - b)) {
    const cells = rows.get(r).sort((a, b) => a[0] - b[0])
    const max = cells.at(-1)[0]
    const arr = Array(max).fill('')
    for (const [i, v] of cells) arr[i - 1] = v
    ordered.push(arr)
  }
  return ordered
}

fs.mkdirSync(path.join(OUT, 'data-model'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'scenario-media'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'scenario-screens'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'review-contacts'), { recursive: true })

unzip(XLSX, xunz)
unzip(DOCX, sunz)

const xlDir = path.join(xunz, 'xl')
const strings = loadSharedStrings(xlDir)
const sheetsXml = fs.readFileSync(path.join(xlDir, 'workbook.xml'), 'utf8')
const rels = fs.readFileSync(path.join(xlDir, '_rels', 'workbook.xml.rels'), 'utf8')
const idToTarget = {}
for (const m of rels.matchAll(/<Relationship\b[^>]*>/g)) {
  const id = m[0].match(/\bId="([^"]+)"/)?.[1]
  const target = m[0].match(/\bTarget="([^"]+)"/)?.[1]
  if (id && target) idToTarget[id] = target
}

let screensFile = null
for (const m of sheetsXml.matchAll(/<sheet\b[^>]*>/g)) {
  const name = m[0].match(/\bname="([^"]+)"/)?.[1]
  const rid = m[0].match(/\br:id="([^"]+)"/)?.[1]
  if (name === 'Screens' && rid && idToTarget[rid]) screensFile = path.basename(idToTarget[rid])
}
if (!screensFile) throw new Error('Screens sheet missing')

const rows = parseSheetXml(
  fs.readFileSync(path.join(xlDir, 'worksheets', screensFile), 'utf8'),
  strings,
)
const header = rows[0] || []
const csv = [header.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')]
const md = [
  '# Screens (from data model v1.2)',
  '',
  '| ' + header.join(' | ') + ' |',
  '| ' + header.map(() => '---').join(' | ') + ' |',
]
for (const row of rows.slice(1)) {
  if (!row.some(Boolean)) continue
  const padded = [...row]
  while (padded.length < header.length) padded.push('')
  const cells = padded.slice(0, header.length)
  csv.push(cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
  md.push(
    '| ' + cells.map((c) => String(c).replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ') + ' |',
  )
}
fs.writeFileSync(path.join(OUT, 'data-model', 'Screens.csv'), csv.join('\n'))
fs.writeFileSync(path.join(OUT, 'data-model', 'Screens.md'), md.join('\n'))

const mediaSrc = path.join(sunz, 'word', 'media')
for (const file of fs.readdirSync(mediaSrc)) {
  fs.copyFileSync(path.join(mediaSrc, file), path.join(OUT, 'scenario-media', file))
}

const doc = fs.readFileSync(path.join(sunz, 'word', 'document.xml'), 'utf8')
const text = decode(
  doc
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:tab[^/]*\/>/g, '\t')
    .replace(/<[^>]+>/g, ''),
)
  .replace(/\n{3,}/g, '\n\n')
  .trim()
fs.writeFileSync(path.join(OUT, 'scenario-text.txt'), text)

const relsDoc = fs.readFileSync(path.join(sunz, 'word', '_rels', 'document.xml.rels'), 'utf8')
const ridToMedia = {}
for (const m of relsDoc.matchAll(/<Relationship\b[^>]*>/g)) {
  const id = m[0].match(/\bId="([^"]+)"/)?.[1]
  const target = m[0].match(/\bTarget="([^"]+)"/)?.[1]
  if (id && target && target.includes('media/')) ridToMedia[id] = path.basename(target)
}
const order = [...doc.matchAll(/r:embed="(rId\d+)"/g)].map((m) => ridToMedia[m[1]]).filter(Boolean)
const indexRows = ['| # | File |', '| --- | --- |']
order.forEach((file, i) => {
  const n = String(i + 1).padStart(2, '0')
  const destName = `${n}-${file}`
  fs.copyFileSync(path.join(OUT, 'scenario-media', file), path.join(OUT, 'scenario-screens', destName))
  indexRows.push(`| ${n} | [${destName}](scenario-screens/${destName}) |`)
})

const reviewSrc = path.join(ROOT, 'tmp', 'gitex-review')
if (fs.existsSync(reviewSrc)) {
  for (const file of fs.readdirSync(reviewSrc)) {
    fs.copyFileSync(path.join(reviewSrc, file), path.join(OUT, 'review-contacts', file))
  }
}

fs.writeFileSync(
  path.join(OUT, 'README.md'),
  [
    '# Extracted screens for review',
    '',
    'Use this folder to confirm the stand UI against source material.',
    '',
    '## Contents',
    '',
    '- `scenario-screens/` — mock-up images from the scenario docx, numbered in document order',
    '- `scenario-media/` — raw media filenames from the docx',
    '- `scenario-text.txt` — full plain-text extract of the scenario',
    '- `data-model/Screens.md` — Screens sheet from data model v1.2',
    '- `data-model/Screens.csv` — same sheet as CSV',
    '- `review-contacts/` — earlier contact/review screenshots from `tmp/gitex-review`',
    '',
    '## Scenario images (document order)',
    '',
    ...indexRows,
    '',
  ].join('\n'),
)

fs.rmSync(xunz, { recursive: true, force: true })
fs.rmSync(sunz, { recursive: true, force: true })
console.log(`OK: ${rows.length - 1} screen rows, ${order.length} images`)
