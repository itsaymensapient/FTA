import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const XLSX = path.join(ROOT, "documents", "GITEX_CDP_Stand_Data_Model_v1.2.xlsx");
const SCHEMA = path.join(__dirname, "schema.sql");

const LOAD_ORDER = [
  "ref_vat201_box",
  "taxpayer",
  "establishment",
  "e_invoice",
  "e_invoice_line",
  "vat_return",
  "vat_return_box",
  "fta_case",
  "return_obligation",
  "voluntary_disclosure",
  "vd_box",
  "refund_request",
  "case_finding",
  "finding_invoice",
  "letter",
  "case_document",
  "case_event",
  "taxpayer_record",
  "agent_option",
  "stand_session",
  "session_action",
];

const DATE_FIELDS = new Set();
const TS_FIELDS = new Set();
const INT_FIELDS = new Set(["line_id", "invoice_count", "sort_order", "events_closed"]);
const NUM_FIELDS = new Set();

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  const env = { ...process.env };
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim();
      if (!(k in env) || env[k] === "") env[k] = v;
    }
  }
  return env;
}

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function colIndex(col) {
  let n = 0;
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

function excelSerialToIso(n, asTimestamp) {
  const utc = Date.UTC(1899, 11, 30) + Math.round(Number(n) * 86400000);
  const d = new Date(utc);
  if (asTimestamp) return d.toISOString().replace("T", " ").slice(0, 19);
  return d.toISOString().slice(0, 10);
}

function parseSheetXml(xml) {
  const rows = new Map();
  const re = /<c r="([A-Z]+)(\d+)"([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let m;
  while ((m = re.exec(xml))) {
    const col = m[1];
    const row = Number(m[2]);
    const inner = m[4] || "";
    let val = "";
    if (inner.includes("<is>")) {
      val = [...inner.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((t) => t[1]).join("");
    } else {
      const v = inner.match(/<v>([^<]*)<\/v>/);
      val = v ? v[1] : "";
    }
    val = decode(val).trim();
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row).push([colIndex(col), val]);
  }
  const ordered = [];
  for (const r of [...rows.keys()].sort((a, b) => a - b)) {
    const cells = rows.get(r).sort((a, b) => a[0] - b[0]);
    const max = cells[cells.length - 1][0];
    const arr = Array(max).fill("");
    for (const [i, v] of cells) arr[i - 1] = v;
    ordered.push(arr);
  }
  return ordered;
}

function sheetRecords(xml) {
  const rows = parseSheetXml(xml);
  const headerIdx = rows.findIndex((r) => r[0] && !String(r[0]).includes("·") && r.filter(Boolean).length > 1);
  if (headerIdx < 0) return { columns: [], records: [] };
  const columns = rows[headerIdx].map((c) => c.trim()).filter(Boolean);
  const records = [];
  for (const row of rows.slice(headerIdx + 1)) {
    if (!row.some((c) => c !== "")) continue;
    const rec = {};
    columns.forEach((col, i) => {
      rec[col] = row[i] ?? "";
    });
    records.push(rec);
  }
  return { columns, records };
}

function unzipXlsx(xlsxPath, dest) {
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${xlsxPath.replace(/'/g, "''")}', '${dest.replace(/'/g, "''")}')`,
    ],
    { stdio: "pipe" }
  );
}

function mapSheets(xlDir) {
  const wb = fs.readFileSync(path.join(xlDir, "workbook.xml"), "utf8");
  const rels = fs.readFileSync(path.join(xlDir, "_rels", "workbook.xml.rels"), "utf8");
  const idToTarget = {};
  for (const m of rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
    idToTarget[m[1]] = m[2].replace(/^\//, "").replace(/^xl\//, "");
  }
  const sheets = {};
  for (const m of wb.matchAll(/name="([^"]+)"[^>]*r:id="([^"]+)"/g)) {
    sheets[m[1]] = path.join(xlDir, idToTarget[m[2]].replace(/^worksheets\//, "worksheets" + path.sep).replace(/\//g, path.sep));
    const target = idToTarget[m[2]];
    const file = target.includes("worksheets/")
      ? path.join(xlDir, "worksheets", path.basename(target))
      : path.join(xlDir, target);
    sheets[m[1]] = file;
  }
  return sheets;
}

function coerce(table, col, raw) {
  if (raw === "" || raw == null) return null;
  if (DATE_FIELDS.has(`${table}.${col}`) || /_date$/.test(col) || col.endsWith("_start") || col.endsWith("_end")) {
    if (/^\d+(\.\d+)?$/.test(raw)) return excelSerialToIso(raw, false);
    return raw.slice(0, 10);
  }
  if (TS_FIELDS.has(`${table}.${col}`) || col.endsWith("_ts")) {
    if (/^\d+(\.\d+)?$/.test(raw)) return excelSerialToIso(raw, true);
    return raw;
  }
  if (INT_FIELDS.has(col)) return raw === "" ? null : parseInt(raw, 10);
  if (/_aed$/.test(col) || col === "quantity" || col === "vat_rate" || col === "unit_price_aed") {
    return raw === "" ? null : raw;
  }
  return raw;
}

async function insertRows(client, table, columns, records) {
  if (!records.length) {
    console.log(`  ${table}: 0 rows`);
    return 0;
  }
  const cols = columns.filter((c) => records.some((r) => r[c] !== undefined));
  const batchSize = 200;
  let n = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const values = [];
    const params = [];
    let p = 1;
    for (const rec of batch) {
      const placeholders = [];
      for (const col of cols) {
        params.push(coerce(table, col, rec[col]));
        placeholders.push(`$${p++}`);
      }
      values.push(`(${placeholders.join(",")})`);
    }
    const sql = `INSERT INTO ${table} (${cols.map((c) => `"${c}"`).join(",")}) VALUES ${values.join(",")}`;
    await client.query(sql, params);
    n += batch.length;
  }
  console.log(`  ${table}: ${n} rows`);
  return n;
}

async function main() {
  const env = loadEnv();
  const host = env.LOCAL_PGHOST || "127.0.0.1";
  const port = Number(env.LOCAL_PGPORT || 5432);
  const database = env.LOCAL_PGDATABASE || "gitex_stand";
  const user = env.LOCAL_PGUSER || env.PGUSER;
  const password = env.LOCAL_PGPASSWORD;
  if (!user || !password) {
    console.error("Add LOCAL_PGUSER and LOCAL_PGPASSWORD to .env (local Postgres, not Azure).");
    process.exit(1);
  }

  const admin = new pg.Client({ host, port, user, password, database: "postgres", ssl: false });
  await admin.connect();
  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [database]);
  if (!exists.rowCount) {
    await admin.query(`CREATE DATABASE ${database}`);
    console.log("created database", database);
  } else {
    console.log("database exists", database);
  }
  await admin.end();

  const client = new pg.Client({ host, port, user, password, database, ssl: false });
  await client.connect();
  await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await client.query(fs.readFileSync(SCHEMA, "utf8"));
  console.log("schema applied");

  const unzipDir = path.join(env.TEMP || process.env.TEMP, "gitex-xlsx-seed");
  unzipXlsx(XLSX, unzipDir);
  const xlDir = path.join(unzipDir, "xl");
  const sheets = mapSheets(xlDir);

  await client.query("BEGIN");
  await client.query("SET CONSTRAINTS ALL DEFERRED");
  try {
    for (const table of LOAD_ORDER) {
      const file = sheets[table];
      if (!file || !fs.existsSync(file)) throw new Error(`Missing sheet ${table}`);
      const { columns, records } = sheetRecords(fs.readFileSync(file, "utf8"));
      await insertRows(client, table, columns, records);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }

  const checks = [
    ["taxpayers", "SELECT count(*)::int AS n FROM taxpayer"],
    ["e_invoices", "SELECT count(*)::int AS n FROM e_invoice"],
    ["e_invoice_lines", "SELECT count(*)::int AS n FROM e_invoice_line"],
    [
      "yasmeen_box_1b_einvoice",
      `SELECT coalesce(sum(vat_amount_aed),0)::numeric AS n FROM e_invoice
       WHERE seller_tin = '1004821573' AND seller_vat201_box = '1b' AND seller_period_code = '2026-08/2026-10' AND document_type_code = '380'`,
    ],
    ["refund_approved", "SELECT approved_aed::numeric AS n FROM refund_request"],
    ["cases", "SELECT count(*)::int AS n FROM fta_case"],
  ];
  console.log("checks");
  for (const [name, sql] of checks) {
    const r = await client.query(sql);
    console.log(" ", name, r.rows[0].n);
  }
  await client.end();
  console.log("done");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
