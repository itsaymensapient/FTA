import fs from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const PORT = Number(process.env.API_PORT || 8787)

function loadEnv() {
  const env = { ...process.env }
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return env
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    const k = line.slice(0, i).trim()
    const v = line.slice(i + 1).trim()
    if (!(k in env) || env[k] === '') env[k] = v
  }
  return env
}

function dbConfig(env) {
  const host = env.LOCAL_PGHOST || env.PGHOST || '127.0.0.1'
  const port = Number(env.LOCAL_PGPORT || env.PGPORT || 5432)
  const database = env.LOCAL_PGDATABASE || env.PGDATABASE || 'gitex_stand'
  const user = env.LOCAL_PGUSER || env.PGUSER
  const password = env.LOCAL_PGPASSWORD || env.PGPASSWORD
  const sslMode = env.LOCAL_PGSSLMODE || env.PGSSLMODE || 'disable'
  if (!user || !password) {
    throw new Error(
      'Set LOCAL_PGUSER and LOCAL_PGPASSWORD in .env for local Postgres (preferred). PGUSER/PGPASSWORD are accepted as fallback.',
    )
  }
  if (!env.LOCAL_PGHOST && env.PGHOST && env.PGHOST !== '127.0.0.1' && env.PGHOST !== 'localhost') {
    console.warn(
      `[warn] Using remote PGHOST=${env.PGHOST}. Prefer LOCAL_PG* for the stand API.`,
    )
  }
  return {
    host,
    port,
    database,
    user,
    password,
    ssl: sslMode === 'require' ? { rejectUnauthorized: false } : false,
  }
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body, null, 2)
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers,
  })
  res.end(payload)
}

const env = loadEnv()
const pool = new pg.Pool(dbConfig(env))

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, '')
    return
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      const result = await pool.query('select current_database() as database, now() as now')
      send(res, 200, {
        ok: true,
        service: 'gitex-stand-api',
        database: result.rows[0].database,
        now: result.rows[0].now,
      })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/taxpayers') {
      const result = await pool.query(
        `select tin, trn, legal_name, vat_status, einvoicing_status, demo_role
         from taxpayer
         order by legal_name
         limit 50`,
      )
      send(res, 200, { items: result.rows })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/cases') {
      const result = await pool.query(
        `select case_id, tin, case_type, risk_level, status, amount_at_stake_aed,
                opened_date, deadline_date, follow_up_date, closed_date, outcome
         from fta_case
         order by opened_date desc nulls last
         limit 50`,
      )
      send(res, 200, { items: result.rows })
      return
    }

    send(res, 404, { error: 'Not found' })
  } catch (err) {
    console.error(err)
    send(res, 500, { error: err instanceof Error ? err.message : String(err) })
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`gitex-stand-api listening on http://127.0.0.1:${PORT}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await pool.end().catch(() => {})
    server.close(() => process.exit(0))
  })
}
