# FTA GITEX stand — handoff for next AI

## Latest provider status — Cursor alternative (26 November 2026)

- User requested Cursor instead of OpenAI after the OpenAI key returned exhausted API credits; ChatGPT Plus billing is separate.
- Added `cursor_llm.py` and `LLM_PROVIDER=openai|cursor`; `.env` currently selects `cursor` while preserving existing keys. Never display secret values.
- Official Windows Cursor CLI package is in `%LOCALAPPDATA%\cursor-agent\fta-demo-2026.11.22-e9042b2\dist-package`. Existing Cursor directories were preserved. No global IDE settings were changed.
- Adapter uses an isolated temporary workspace/profile, Ask mode, denied file/shell/MCP/web tools and safe bounded subprocess handling. Node API reloads agent environment settings per request and allows a longer Cursor bridge timeout.
- First Cursor key passed `GET https://api.cursor.com/v1/me` (HTTP 200), but live CLI inference timed out. User then changed a key; subsequent CLI attempts reported that the Cursor API key is invalid. A clarification is pending about whether they updated CURSOR_API_KEY or OPENAI_API_KEY. Do not claim a verified live model connection.
- Investigated the official Cursor SDK as an alternative; removed its unused npm dependency after the updated key was rejected. No SDK provider is implemented.
- **46 unit tests pass** with offline/snapshot isolation. Stand production build passed; Node API syntax checks passed. Provider probe was verified over HTTP to report errors correctly. No send/submit/close was performed during live checks.
- Main pending step: resolve provider/key choice, obtain `verified=true` from the real probe, then run unconfirmed UC2/UC3 role workflows and the AskBar through the real provider. Persistent resume/action-specific approval and UC4 remain separate pending work.

---

## Latest update — shared API integration (26 November 2026)

- Added explicit `LLM_MODE=auto|live|offline`, safe provider errors, bounded requests, per-request model-call metadata and a real connection probe.
- Shared connection is used by both LangGraph role faces. Ali's existing read-only query catalog is preserved; live AskBar requests now use the LLM to select an allowlisted read tool and explain its evidence. Offline routing/answers remain deterministic.
- Added `POST /api/agent/llm/test`; `/api/agent/health` distinguishes configuration from verification. AskBar labels live versus offline responses.
- Unit tests now isolate model calls and use snapshot data; no paid provider traffic or local demo DB mutations during the suite.
- API key has been added by Aymen to ignored `.env`. Real direct and HTTP probe requests reached the provider but returned HTTP 429, `insufficient_quota` / exhausted credit balance. Successful paid inference and live case narration remain unverified until API billing is available. Do not describe this as a successfully verified live connection.
- This update does not implement checkpointed resume, per-action approval binding, remaining fixture-screen wiring or UC4. Existing broad `auto_confirm` behavior must not be mistaken for separate action approvals.

---

**Date:** 2026-11-26 (Asia/Dubai)  
**Branch:** `db-connecting` (tracks `origin/db-connecting`)  
**Repo:** `https://github.com/itsaymensapient/fta`  
**Owner:** Aymen (Software engineer)  
**Goal of this doc:** Full status of done vs pending so the next agent can continue without re-deriving context.

---

## 1. What this project is

GITEX demo stand for UAE FTA (Federal Tax Authority) Connected Data Platform:

- **React stand** (`stand/`) — visitor walks FTA Specialist or Business paths (UC2 Al Yasmeen return vs e-invoices; UC3 Al Waha refund + Bright Line).
- **Node API** (`server/`) on `127.0.0.1:8787` — `/api/stand` payload from **local Postgres** `gitex_stand` (fallback: `db/snapshot.json`).
- **Ali lane** (`ali/`) — B1 checks + free-question ask agent (read-only query tools).
- **Sulieman lane** (`agents/`, `tools/`, `llm.py`, `rules.py`) — one shared LLM + LangGraph six-step graphs + deterministic tax tools.

**Azure / Cloudera hosting is deferred.** Local Postgres only for now.

---

## 2. How to run (verified)

### Preferred — VS Code / Cursor Run and Debug

1. Ensure `.env` exists (copy from `.env.example`). Local password is `gitex` (SCRAM cannot be blank).
2. Run and Debug → **Full Stack (local PG + API + UI)**.
3. Opens Vite at `http://localhost:5173`; API at `http://127.0.0.1:8787`.

**Important fix (2026-11-26):** Full Stack used to launch `"type": "chrome"`, but **Chrome is not installed** on Aymen’s machine (Edge is). Compound was rewritten to **API + Vite only** (no Chrome). Optional Edge UI launch remains as **Launch Stand UI**.

### Manual

```powershell
# Seed once if needed
cd db; npm run migrate:seed

# Terminal 1
cd server; npm run dev

# Terminal 2
cd stand; npm run dev
```

### Agents / tests

```powershell
python -m pytest tests ali/tests -q
python -m agents.fta_agent --case CDP-VAT-2026-1187
python -m agents.fta_agent --case CDP-VAT-2026-1187 --auto-confirm
python -m agents.fta_assistant --case CDP-VAT-2026-1187 --auto-confirm
python -m ali.agents.ask_agent "What open cases need attention?"
```

### Env keys (`.env.example`)

- `LOCAL_PGHOST/PORT/DATABASE/USER/PASSWORD/SSLMODE` → local `gitex_stand`
- `API_PORT=8787`
- Optional LLM: `OPENAI_API_KEY`, `OPENAI_MODEL` (default `gpt-4.1-mini`), `OPENAI_BASE_URL`  
  Without API key, agents use offline narration fallbacks; **numbers still come from tools**.

---

## 3. DONE

### 3.1 Stand + DB + Ali (earlier + this branch)

| Item | Status | Notes |
|------|--------|--------|
| Local Postgres `gitex_stand` | Done | Service `postgresql-x64-17`; user/password via `.env` |
| Seed / snapshot / schema | Done | `db/` migrate:seed, `db/snapshot.json` |
| Node `/api/stand`, `/health`, taxpayers, cases | Done | `server/src/index.mjs` + `stand-payload.mjs` |
| Vite proxy `/api` → 8787 | Done | `stand/vite.config.ts` |
| StandData live payload with snapshot fallback | Done | `stand/src/data/StandData.tsx` |
| VS Code tasks: PG start, free ports, full stack prep | Done | `.vscode/tasks.json`, `scripts/start-postgres.ps1`, `scripts/free-port.ps1` |
| Ali B1 checks (37+), ask agent + query tools | Done | `ali/`; tests in `ali/tests/` |
| Guide badges / public guides | Done | Earlier work under `stand/public/guides` |

### 3.2 Sulieman agentic slice (plan fully implemented)

Plan file (do not treat as todo source of truth anymore):  
`AgentStores/.../sulieman_langgraph_agents_f173d2e9.plan.md` — **all 6 todos completed**.

| Deliverable | Path | Status |
|-------------|------|--------|
| One LLM switch | `llm.py` | Done |
| Rules (thresholds, TINs, cases) | `rules.py` | Done |
| UC2 tools | `tools/uc2_return.py` | Done — Box 1b gap **486200**, net **412000** |
| UC3 tools | `tools/uc3_refund.py` | Done — claimed **284600**, supported **53600**, reject **34200**, Bright hold **46800** |
| Shared actions (options, letter, VD, submit, close) | `tools/shared_case.py` | Done — human `confirm=True` required for send/submit/close |
| Prompts | `prompts/fta_system.txt`, `prompts/business_system.txt` | Done |
| FTA LangGraph agent | `agents/fta_agent.py` | Done — six steps; gates at Decide/Act/Close |
| FTA Assistant (Business) | `agents/fta_assistant.py` | Done — same `llm.py` |
| Shared state | `agents/state.py` | Done |
| CLI docs | `agents/README.md` | Done |
| Deps | `requirements.txt` — langgraph, langchain-core, langchain-openai | Done |
| Unit tests | `tests/test_uc2_tools.py`, `test_uc3_tools.py`, `test_agents.py`, `test_bridge.py` | Done — **25** tests green with `ali/tests` |

### 3.3 Stand ↔ agent API bridge (beyond original “later” note)

| Item | Status |
|------|--------|
| `agents/bridge.py` JSON stdin/stdout | Done |
| `server/src/agent-bridge.mjs` | Done |
| `GET /api/agent/health` | Done |
| `POST /api/agent/ask` (Ali ask) | Done |
| `POST /api/agent/fta` | Done |
| `POST /api/agent/assistant` | Done |
| AskBar live → `/api/agent/ask` | Done — `stand/src/components/ui.tsx` |

### 3.4 Bugs fixed while verifying

| Bug | Fix |
|-----|-----|
| Invoice dates `"Invalid Date"` from Postgres `Date` objects in `/api/stand` | `toDate()` in `server/src/stand-payload.mjs` |
| Full Stack VS Code fail (no Chrome) | Compound uses Vite-only + Edge optional; see `.vscode/launch.json` |
| Free-port PowerShell mangling `8787,5173` | `scripts/free-port.ps1` splits ports correctly |

### 3.5 Tracker snapshot (coordinator Project)

- Completed work includes Sulieman slice + stand wire + launch fix investigation.
- **FTA-9** [for-review]: Full Stack VS Code launch error — fix landed; **waiting on Aymen to retry** Run and Debug and confirm.

---

## 4. PENDING / next AI should pick up

Ordered by usefulness for the stand demo.

### P0 — Confirm with human

1. **Aymen retries Full Stack** in VS Code after launch.json fix. If still red, capture exact Debug Console / terminal error text.
2. **Git:** large set of changes still **uncommitted** on `db-connecting` (agents/, tools/, llm.py, server bridge, tests, launch.json, etc.). Commit/PR only if Aymen asks.

### P1 — Product polish (stand UX ↔ agents)

1. **Act / Decide screens** still mostly fixture-driven. Wire buttons to call:
   - `POST /api/agent/fta` with `{ case_id, auto_confirm }`
   - `POST /api/agent/assistant` similarly  
   Show `narrative` / `messages` / `awaiting_human` in UI; only set `auto_confirm` after explicit Send/Submit/Close.
2. **Query / Summary screens** (`SummaryScreens.tsx` QueryScreen) still show hard-coded demo Q&A — optionally feed AskBar / `/api/agent/ask`.
3. **Session logging:** `send_letter` / `submit` / `close_case` try `app.session_action` with `CLI-SESSION`; may hit FK if session row missing (errors swallowed). Upsert `app.stand_session` for stand/CLI sessions.
4. **Human-in-the-loop resume:** graphs stop at Decide when `auto_confirm=False`; need a clean “resume with confirm + selected_option_id” API (today: re-invoke with `auto_confirm=True` re-runs from Signal).

### P2 — Data / narrative consistency

1. Seed shows some cases already `CLOSED` while the stand story starts “open” — decide whether reset seed for live demo or keep story timestamps as-is.
2. UC3 follow-up `approve_additional_aed` uses sum of `PAPER_TAX_INVOICE` docs (can show ~150000) — align with scripted refund story if demo script expects different split.
3. `match_ledger` Box 1b booked VAT on filtered gap invoices reported **412000** in CLI narration (not 486200) — verify against scenario intent.

### P3 — Explicitly out of scope (do not start unless asked)

- Multiple model deployments / Cloudera AI Inference hosting  
- Full Azure Gold pipeline / pointing stand at Azure PG  
- Replacing Ali’s check suite  
- Auto-Send without a person  
- Rewriting the whole stand off fixtures into agent-only UI  

---

## 5. Architecture (current)

```
Visitor (Vite :5173)
  → AskBar ─────────────── POST /api/agent/ask ──┐
  → (future Act buttons) ─ POST /api/agent/fta|assistant
StandData ← GET /api/stand ← Node API :8787
                              ├─ Postgres gitex_stand (preferred)
                              ├─ snapshot.json (fallback)
                              └─ agent-bridge.mjs → python -m agents.bridge
                                                    ├─ ali.agents.ask_agent
                                                    ├─ agents.fta_agent (LangGraph)
                                                    └─ agents.fta_assistant (LangGraph)
                                                         ├─ llm.py (optional OpenAI)
                                                         └─ tools/* + rules.py → ali.tables / PG
```

**Numbers = tools + rules only. LLM = narration only.**

### Key case IDs

| Case | ID | TIN | Company |
|------|-----|-----|---------|
| UC2 return | `CDP-VAT-2026-1187` | `1004821573` | Al Yasmeen General Trading LLC |
| UC3 refund | `CDP-REF-2026-0219` | `1002937461` | Al Waha Electronics Trading LLC |
| Non-filer | `CDP-NF-2026-0733` | `1007283619` | Bright Line General Trading LLC |

---

## 6. Key files map

```
.env.example
requirements.txt
llm.py / rules.py
agents/          fta_agent.py, fta_assistant.py, bridge.py, README.md
tools/           uc2_return.py, uc3_refund.py, shared_case.py, _data.py
prompts/         fta_system.txt, business_system.txt
tests/           test_uc2_tools.py, test_uc3_tools.py, test_agents.py, test_bridge.py
ali/             checks, ask_agent, tables, db
server/src/      index.mjs, stand-payload.mjs, agent-bridge.mjs
stand/src/       App, screens, AskBar (live), StandData
.vscode/         launch.json (Full Stack fixed), tasks.json
scripts/         start-postgres.ps1, free-port.ps1
db/              schema, seed, snapshot, checks.json
```

---

## 7. Verification checklist (last known good)

Run these after pulling / before claiming “broken”:

```powershell
python -m pytest tests ali/tests -q
# Expect: 25 passed

# With Full Stack or manual servers up:
Invoke-RestMethod http://127.0.0.1:8787/health
Invoke-RestMethod http://localhost:5173/api/stand | Select source
Invoke-RestMethod -Method POST http://127.0.0.1:8787/api/agent/ask `
  -ContentType application/json -Body '{"question":"Yasmeen box 1b gap"}'
# Expect tool yasmeen_box_gaps, gap AED 486,200
```

Invoice sample dates in `/api/stand` should look like `"2 Oct"`, not `"Invalid Date"`.

---

## 8. Suggested first actions for next AI

1. Read this file + `agents/README.md` + `.vscode/launch.json`.
2. Ask Aymen whether Full Stack launch retry succeeded (FTA-9).
3. If yes: implement **P1.1** — wire Act/Decide confirm buttons to `/api/agent/*` with real human gates in the UI.
4. If launch still fails: collect exact error; do not re-introduce Chrome debugger.
5. Do **not** invent a second DB connection story — reuse `ali/db.py` / `LOCAL_PG*`.
6. Do **not** edit old plan files under AgentStores unless asked; update **this** handoff when status changes.

---

## 9. Open uncommitted surface (as of handoff)

Modified: `.env.example`, `.vscode/launch.json`, `.vscode/tasks.json`, `db/snapshot.json`, `requirements.txt`, `server/*`, `stand/package.json`, `stand/src/components/ui.tsx`, …

Untracked: `agents/`, `llm.py`, `prompts/`, `rules.py`, `scripts/free-port.ps1`, `server/src/agent-bridge.mjs`, `tests/`, `tools/`, **this file** `HANDOFF-NEXT-AI.md`.

Nothing was committed by the Sulieman worker unless Aymen requested it.

## Scenario 2 local send-to-close journey

The Al Yasmeen FTA action screen prepares a versioned journey in local PostgreSQL (`app.uc2_journey`). Review the letter, disclosure, reply and listed actions, then approve the whole journey once. Editing the letter invalidates approval. Send records the letter locally; switch to the business view to record the disclosure and reply, then switch back to FTA to reconcile and close. These are demo records, not external delivery or real tax submissions. Retrying a completed action returns the existing operation. Database errors leave the current step available to retry; an uncertain commit can be checked with Refresh status. This demonstration does not implement authentication, production authorization, or a Temporal workflow. Existing AI question handling is separate from the deterministic journey actions.
