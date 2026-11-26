/** Set LOCAL_PG* for local Postgres (empty password allowed). Does not print secrets. */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(ROOT, '.env')

const incoming = {
  LOCAL_PGHOST: process.env.SET_LOCAL_PGHOST || '127.0.0.1',
  LOCAL_PGPORT: process.env.SET_LOCAL_PGPORT || '5432',
  LOCAL_PGDATABASE: process.env.SET_LOCAL_PGDATABASE || 'gitex_stand',
  LOCAL_PGUSER: process.env.SET_LOCAL_PGUSER || 'postgres',
  LOCAL_PGPASSWORD: process.env.SET_LOCAL_PGPASSWORD ?? '',
  LOCAL_PGSSLMODE: process.env.SET_LOCAL_PGSSLMODE || 'disable',
}

const keys = new Set(Object.keys(incoming))
const kept = []
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue
    const m = /^([A-Za-z0-9_]+)=/.exec(line)
    if (m && keys.has(m[1])) continue
    kept.push(line)
  }
}
for (const [k, v] of Object.entries(incoming)) kept.push(`${k}=${v}`)
fs.writeFileSync(envPath, `${kept.join('\n')}\n`, 'encoding' in {} ? undefined : undefined)
fs.writeFileSync(envPath, `${kept.join('\n')}\n`)
console.log('Updated LOCAL_PG* in .env (user=%s, password_empty=%s)', incoming.LOCAL_PGUSER, incoming.LOCAL_PGPASSWORD === '')
