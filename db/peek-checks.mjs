import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const XLSX = path.join(ROOT, 'documents', 'GITEX_CDP_Stand_Data_Model_v1.2.xlsx')
const dest = path.join(process.env.TEMP || '.', 'gitex-peek-checks')
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

const wb = fs.readFileSync(path.join(dest, 'xl', 'workbook.xml'), 'utf8')
const rels = fs.readFileSync(path.join(dest, 'xl', '_rels', 'workbook.xml.rels'), 'utf8')
const idTo = {}
for (const tag of rels.matchAll(/<Relationship\b[^>]*>/g)) {
  const id = /Id="([^"]+)"/.exec(tag[0])?.[1]
  const target = /Target="([^"]+)"/.exec(tag[0])?.[1]
  if (id && target) idTo[id] = target.replace(/^\//, '').replace(/^xl\//, '')
}
let file
for (const tag of wb.matchAll(/<sheet\b[^>]*>/g)) {
  const name = /name="([^"]+)"/.exec(tag[0])?.[1]
  const rid = /r:id="([^"]+)"/.exec(tag[0])?.[1]
  if (name === 'Checks') file = path.join(dest, 'xl', idTo[rid].replace(/\//g, path.sep))
}
const xml = fs.readFileSync(file, 'utf8')
console.log('file', file)
console.log('xml length', xml.length)
console.log('sample cells:')
const cells = [...xml.matchAll(/<c r="([A-Z]+\d+)"[^>]*(?:\/>|>([\s\S]*?)<\/c>)/g)].slice(0, 80)
for (const c of cells) {
  const inner = c[2] || ''
  const t = [...inner.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((x) => x[1]).join('')
  const v = inner.match(/<v>([^<]*)<\/v>/)?.[1] || ''
  console.log(c[1], JSON.stringify(t || v))
}
