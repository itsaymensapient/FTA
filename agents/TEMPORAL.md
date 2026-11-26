# Local Temporal monitoring

Temporal's local UI is at http://localhost:8233.

## What is recorded

When `TEMPORAL_ENABLED=true`, the Python bridge routes these requests through
`AgentRequestWorkflow` as **named activities** that run the real bridge work:

| Activity name | Bridge actions |
| --- | --- |
| `ask` | free-query `ask` |
| `case_tool` | CDP tool bridge (`get_options`, invoices, supplier, …) |
| `uc2_journey` | Al Yasmeen shared journey (`uc2_*`) |
| `refund_journey` | Al Waha shared journey (`refund_*`) |
| `fta_agent` / `fta_assistant` | LangGraph FTA / business agents |
| `run_agent_request` | fallback |

The history shows the actual agent/journey call, not a fake progress animation.
It does **not** invent per-LangGraph-node steps inside one graph run; journey
operations and case-tool calls are separate Temporal activities when they are
separate API/bridge requests.

## How to run

1. Install Python Temporal deps (`requirements.txt`).
2. `temporal server start-dev` (or `scripts/start-temporal.ps1`).
3. `python -m agents.temporal_worker` from the repo root.
4. Set `TEMPORAL_ENABLED=true` in `.env` and restart the Node API so new env is
   loaded. Restart the worker after Python/model changes.

With `TEMPORAL_ENABLED=false`, the bridge runs directly (no Temporal).

Temporal history contains workflow inputs and results — demo/synthetic data only.
