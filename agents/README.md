# Sulieman agentic slice

One shared LLM (`llm.py`) + LangGraph six-step graphs + deterministic tax tools against local Postgres `gitex_stand`.

## CLI

```bash
# FTA face — UC2 Al Yasmeen (stops at Decide until confirm)
python -m agents.fta_agent --case CDP-VAT-2026-1187

# Full demo with human gates pre-approved
python -m agents.fta_agent --case CDP-VAT-2026-1187 --auto-confirm
python -m agents.fta_agent --case CDP-REF-2026-0219 --auto-confirm

# Business face (FTA Assistant)
python -m agents.fta_assistant --case CDP-VAT-2026-1187 --auto-confirm
```

Without `OPENAI_API_KEY`, narration uses offline fallbacks; numbers always come from tools.

## Shared ChatGPT API connection

Set `OPENAI_API_KEY` in the ignored project `.env`, with `OPENAI_MODEL=gpt-4.1-mini` (or another compatible, accessible model).
`LLM_MODE=auto` uses the configured provider when a key exists; `offline` explicitly disables API calls; `live` requires a key.
Restart the Node API after changing `.env`. ChatGPT app subscriptions and API billing are separate.

Both role graphs use this connection for narration. The AskBar also uses it to choose from the fixed read-only tool catalog and explain the returned evidence. It cannot generate or execute arbitrary SQL through this selector. The six workflow stages are not six separate models. The existing graph order and action confirmation behavior are otherwise unchanged; persistent stage-by-stage resume remains pending.

- `GET /api/agent/health` shows safe configuration status; it does not claim a successful model call.
- `POST /api/agent/llm/test` performs one small real provider request; `verified=true` means it succeeded.
- Agent responses include per-request `llm.used` and call metadata. Keys/prompts are not returned in this metadata.
- The UI identifies live AI responses versus offline tool answers and announces request errors.
- Provider failures (including exhausted API credits) are reported instead of silently substituted with offline text.
- Defaults: 15-second provider timeout, no automatic retry, 700 output tokens. Configure `LLM_REQUEST_TIMEOUT` / `LLM_MAX_OUTPUT_TOKENS` if needed; keep bridge timeouts in mind.

Unit tests force offline mode and snapshot data to avoid paid requests and mutation of the demonstration database. Live verification must use the explicit probe and unconfirmed case runs.

### Cursor alternative for the local demo

Set `LLM_PROVIDER=cursor`, `CURSOR_API_KEY` to a personal Cursor API key, and optionally `CURSOR_MODEL=auto` / `CURSOR_REQUEST_TIMEOUT=60` in `.env`.
Cursor keys are not OpenAI-compatible model API keys; the adapter invokes the documented Cursor CLI print interface.
The CLI package used for this machine is installed separately at `%LOCALAPPDATA%\cursor-agent\fta-demo-2026.11.22-e9042b2\dist-package`; override `CURSOR_CLI_DIR` for another installation.

Each request runs in a temporary workspace/config with Ask mode and file, shell, MCP and web tool permissions denied. Only our Python tools handle data and actions. Provider credentials travel in the child environment, not the prompt or command arguments. The CLI's model output is parsed and checked before returning. Timeouts stop the owned CLI process tree. The Node bridge allows extra time for CLI startup across graph steps.

Cursor remains a local-demo agent adapter, not the production Cloudera serving solution. Its account/model access and usage limits apply. A configured key or successful identity check does not prove model inference works: use `/api/agent/llm/test` and require `verified=true`.

Latest verification: original Cursor key passed the official `/v1/me` identity check but CLI model requests timed out. After the key changed, the CLI explicitly reported an invalid key. Successful Cursor inference is not yet verified. OpenAI previously returned insufficient quota. Do not silently switch providers or present fallback narration as live AI.

## Stand API (Node → Python bridge)

With the stand API on `:8787` (Vite proxies `/api`):

```bash
# Health
curl http://127.0.0.1:8787/api/agent/health

# Free ask (Ali tools)
curl -X POST http://127.0.0.1:8787/api/agent/ask -H "Content-Type: application/json" -d "{\"question\":\"What open cases need attention?\"}"

# FTA / Assistant LangGraph runs
curl -X POST http://127.0.0.1:8787/api/agent/fta -H "Content-Type: application/json" -d "{\"case_id\":\"CDP-VAT-2026-1187\"}"
curl -X POST http://127.0.0.1:8787/api/agent/assistant -H "Content-Type: application/json" -d "{\"case_id\":\"CDP-VAT-2026-1187\",\"auto_confirm\":true}"
```

AskBar in the React stand posts to `/api/agent/ask` by default.

## Tests

```bash
python -m pytest tests ali/tests -q
```
