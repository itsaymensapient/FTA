import fs from 'fs'
import pg from '../server/node_modules/pg/lib/index.js'

const env = {}
for (const line of fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#') || !line.includes('=')) continue
  const i = line.indexOf('=')
  env[line.slice(0, i).trim()] = line.slice(i + 1)
}

const client = new pg.Client({
  host: env.LOCAL_PGHOST || '127.0.0.1',
  port: Number(env.LOCAL_PGPORT || 5432),
  user: env.LOCAL_PGUSER,
  password: env.LOCAL_PGPASSWORD,
  database: env.LOCAL_PGDATABASE || 'gitex_stand',
  ssl: false,
})

await client.connect()
const info = await client.query('select current_database() as database, current_user as user')
const counts = await client.query(`
  select
    (select count(*)::int from taxpayer) as taxpayers,
    (select count(*)::int from e_invoice) as e_invoices,
    (select count(*)::int from fta_case) as cases,
    (select count(*)::int from agent_option) as options
`)
const app = await client.query(`select to_regclass('app.stand_session') is not null as app_schema`)
console.log({ db: info.rows[0], counts: counts.rows[0], app: app.rows[0] })
await client.end()

try {
  const h = await fetch('http://127.0.0.1:8787/health')
  console.log({ api: await h.json() })
} catch (e) {
  console.log({ api: 'down', error: e.message })
}
