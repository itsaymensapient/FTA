import fs from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import { runAgentBridge } from './agent-bridge.mjs'
import { buildStandPayload } from './stand-payload.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const SNAPSHOT_PATH = path.join(ROOT, 'db', 'snapshot.json')
const PORT = Number(process.env.API_PORT || 8787)

const TABLE_NAMES = [
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
]

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

function isLocalHost(host) {
  return !host || host === '127.0.0.1' || host === 'localhost'
}

function dbConfig(env) {
  // Prefer LOCAL_PG* for the stand. Never point Azure PGUSER/PGPASSWORD at localhost.
  const host = env.LOCAL_PGHOST || (isLocalHost(env.PGHOST) ? env.PGHOST : null) || '127.0.0.1'
  const port = Number(env.LOCAL_PGPORT || (isLocalHost(host) ? env.PGPORT : null) || 5432)
  const database = env.LOCAL_PGDATABASE || 'gitex_stand'
  const user = env.LOCAL_PGUSER || (isLocalHost(host) && isLocalHost(env.PGHOST) ? env.PGUSER : null)
  const hasLocalPass = Object.prototype.hasOwnProperty.call(env, 'LOCAL_PGPASSWORD')
  const password = hasLocalPass
    ? env.LOCAL_PGPASSWORD
    : isLocalHost(host) && isLocalHost(env.PGHOST)
      ? env.PGPASSWORD
      : null
  const sslMode = env.LOCAL_PGSSLMODE || 'disable'
  // Empty password is valid when LOCAL_PGPASSWORD= is present in .env
  if (!user || (!hasLocalPass && (password === undefined || password === null))) return null
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
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers,
  })
  res.end(payload)
}

function readJsonBody(req, limitBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limitBytes) {
        reject(new Error('Request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim()
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch (err) {
        reject(new Error(`Invalid JSON body: ${err instanceof Error ? err.message : String(err)}`))
      }
    })
    req.on('error', reject)
  })
}

function loadSnapshot() {
  if (!fs.existsSync(SNAPSHOT_PATH)) return null
  return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'))
}

async function loadTablesFromPg(pool) {
  const tables = {}
  const counts = {}
  for (const name of TABLE_NAMES) {
    const result = await pool.query(`select * from ${name}`)
    tables[name] = result.rows
    counts[name] = result.rows.length
  }
  return { tables, counts }
}

const env = loadEnv()
const cfg = dbConfig(env)
let pool = null
let pgReady = false
let pgError = null
const snapshot = loadSnapshot()

if (cfg) {
  pool = new pg.Pool({ ...cfg, max: 4, connectionTimeoutMillis: 2500 })
  pool
    .query('select 1 as ok')
    .then(async () => {
      const check = await pool.query(
        `select to_regclass('public.taxpayer') as taxpayer, to_regclass('public.fta_case') as fta_case`,
      )
      if (!check.rows[0].taxpayer) {
        pgReady = false
        pgError = 'Schema missing — run npm run migrate:seed in db/'
        console.warn(`[warn] Postgres reachable but empty: ${pgError}`)
        return
      }
      pgReady = true
      console.log(`[ok] Postgres ${cfg.host}:${cfg.port}/${cfg.database}`)
    })
    .catch((err) => {
      pgReady = false
      pgError = err.message
      console.warn(`[warn] Postgres unavailable (${err.message}). Serving workbook snapshot.`)
    })
} else {
  console.warn('[warn] No LOCAL_PGUSER/LOCAL_PGPASSWORD — serving workbook snapshot.')
}

if (!snapshot) {
  console.warn('[warn] Missing db/snapshot.json — run: cd db && npm run snapshot')
}

async function getStandPayload() {
  if (pgReady && pool) {
    try {
      const { tables, counts } = await loadTablesFromPg(pool)
      return buildStandPayload(tables, { source: 'postgres', counts })
    } catch (err) {
      console.error('[pg] stand payload failed, falling back to snapshot:', err.message)
    }
  }
  if (snapshot?.tables) {
    return buildStandPayload(snapshot.tables, {
      source: 'snapshot',
      counts: snapshot.counts,
    })
  }
  return null
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, '')
    return
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      let database = null
      if (pgReady && pool) {
        const result = await pool.query('select current_database() as database, now() as now')
        database = result.rows[0]
      }
      send(res, 200, {
        ok: true,
        service: 'gitex-stand-api',
        source: pgReady ? 'postgres' : snapshot ? 'snapshot' : 'none',
        postgres: pgReady,
        postgresError: pgError,
        snapshot: Boolean(snapshot),
        database: database?.database ?? null,
        now: database?.now ?? new Date().toISOString(),
      })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/stand') {
      const payload = await getStandPayload()
      if (!payload) {
        send(res, 503, {
          error: 'No data source. Run: cd db && npm run snapshot  (or migrate:seed with LOCAL_PG*).',
        })
        return
      }
      send(res, 200, payload)
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/taxpayers') {
      const payload = await getStandPayload()
      if (!payload) {
        send(res, 503, { error: 'No data source' })
        return
      }
      send(res, 200, {
        source: payload.source,
        items: Object.values(payload.companies),
      })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/cases') {
      const payload = await getStandPayload()
      if (!payload) {
        send(res, 503, { error: 'No data source' })
        return
      }
      send(res, 200, {
        source: payload.source,
        items: [payload.yasmeen.case, payload.waha.case].filter(Boolean),
      })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/agent/health') {
      const ping = await runAgentBridge({ action: 'ping' }, loadEnv())
      send(res, ping.ok ? 200 : 503, ping)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/agent/llm/test') {
      const result = await runAgentBridge({ action: 'llm_test' }, loadEnv())
      send(res, result.ok ? 200 : 503, result)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/agent/case-tool') {
      const body = await readJsonBody(req)
      const result = await runAgentBridge({
        action: 'case_tool',
        tool: body.tool,
        finding_id: body.finding_id,
        invoice_uuid: body.invoice_uuid,
        case_type: body.case_type,
        side: body.side,
        tin: body.tin,
        case_id: body.case_id,
        document_type: body.document_type,
      }, loadEnv())
      send(res, result.ok ? 200 : 400, result)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/agent/refund') {
      const body = await readJsonBody(req)
      if (!new Set(['create', 'get', 'approve', 'revise', 'step', 'select_option']).has(body.operation)) {
        send(res, 400, { ok: false, error: 'Unknown journey operation.' }); return
      }
      const result = await runAgentBridge({
        action: `refund_${body.operation}`,
        session_id: body.session_id,
        journey_id: body.journey_id,
        version: body.version,
        text: body.text,
        step: body.step,
        side: body.side,
        option_id: body.option_id,
      }, loadEnv(), 90000)
      send(res, result.ok ? 200 : 400, result)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/agent/uc2') {
      const body = await readJsonBody(req)
      const permitted = new Set(['create', 'get', 'approve', 'revise', 'step', 'select_option'])
      if (!permitted.has(body.operation)) {
        send(res, 400, { ok: false, error: 'Unknown journey operation.' })
        return
      }
      const result = await runAgentBridge({
        action: `uc2_${body.operation}`,
        session_id: body.session_id,
        journey_id: body.journey_id,
        version: body.version,
        text: body.text,
        step: body.step,
        side: body.side,
        option_id: body.option_id,
      }, loadEnv(), 90000)
      send(res, result.ok ? 200 : 400, result)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/agent/ask') {
      const body = await readJsonBody(req)
      const result = await runAgentBridge(
        {
          action: 'ask',
          question: body.question,
          demo_company: body.demo_company,
          session_id: body.session_id,
          persist: body.persist === true,
        },
        loadEnv(),
      )
      send(res, result.ok ? 200 : result.error_type === 'llm' ? 502 : 400, result)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/agent/fta') {
      const body = await readJsonBody(req)
      const result = await runAgentBridge(
        {
          action: 'fta',
          case_id: body.case_id,
          auto_confirm: body.auto_confirm === true,
        },
        loadEnv(),
        90000,
      )
      send(res, result.ok ? 200 : result.error_type === 'llm' ? 502 : 400, result)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/agent/assistant') {
      const body = await readJsonBody(req)
      const result = await runAgentBridge(
        {
          action: 'assistant',
          case_id: body.case_id,
          auto_confirm: body.auto_confirm === true,
        },
        loadEnv(),
        90000,
      )
      send(res, result.ok ? 200 : result.error_type === 'llm' ? 502 : 400, result)
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
  console.log(`  /api/stand  /api/taxpayers  /api/cases  /api/agent/*  /health`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    if (pool) await pool.end().catch(() => {})
    server.close(() => process.exit(0))
  })
}
