# Next AI handoff — FTA stand goal

The active goal is to make the stand match `documents/GITEX_CDP_AI_Agents_Stand_Scenario_v2.9_EN.docx` and `documents/GITEX_CDP_Stand_Data_Model_v1.2.xlsx`, including functioning FTA and business workflows. Continue the existing active goal; do not mark complete until all required paths are implemented and verified. The user wants concise updates. Prior decisions: local demo database only; one approval for the whole journey; editing an approved draft invalidates approval; failures are retryable.

## This continuation

- Audited AgentTools and wrote `agents/WORKBOOK-ALIGNMENT.md`. Fixed false supplier non-filer results, missing VD boxes falsely passing checks, unrelated ledger fallback, PostgreSQL missing invoice lines, and added a draft-only extension tool. Company overview now includes registrations/returns and ledger matching lists every finding invoice. Added regression tests.
- Added `case_tool` bridge and `/api/agent/case-tool`; `CaseInvoices.tsx` displays all 38 Al Yasmeen invoices and real selected invoice line details for both roles. FTA browser path and invoice selection verified with live PostgreSQL.
- Built `agents/refund_journey.py` reusing the local transactional `app.uc2_journey` store; 1 approval binds version, role handoff records send/submit, final verifies documents, Box 9 and refund allocation. Added `refund_*` bridge, API route, `RefundJourney.tsx` and wired FTA/business Al Waha screens. Tests pass but refund UI and live API have NOT yet been end-to-end tested; backend running process may need restarting for new API routes. This implementation currently supports recommended route only; avoid claims all branches work. No actual external messages/tax filings.
- `python -m pytest tests ali/tests -q` and `npm run build` in `stand` passed after the above (64 tests). Local PostgreSQL and Temporal were running. Restart only owned project backend (check port PID/command); Vite watches changes. Temporal worker must be restarted after Python changes.

## Crucial remaining work

1. Restart API, test refund UI end-to-end FTA approve/send → business submit → FTA verify/close, check persisted Postgres and retry/idempotency/failures. Check seeded docs and VD evidence; do not mark case closed on absent/unverified evidence. Add tests as needed.
2. Implement scenario decision choices and meaningful branches on both case journeys (audit, explanation only, extension, partial/no response; card-slip branch). Respect whole-journey approval and reapproval on changed draft. Current refund replacement intentionally only supports recommended route and UC2 screens also lack decision choices.
3. Replace fixture-only Waha supplier/invoice/document screens and static FTA/business summary with real state-backed data. Ensure final summary does not claim both cases closed before they are. Route roles correctly, keep both perspectives on same persisted case.
4. Free query supports six hardcoded read tools, not all workbook requirements; business must see only own data and refuse other companies; scope must be enforced server-side, not prompted. Do not claim production authorization without real authentication. Synthetic data only.
5. Complete workbook 18-tool contracts, role scoping and provenance; `request_extension` currently draft only, no submission/grant; send/submit/close demo actions live in `app.uc2_journey` rather than underlying workbook tables. `check_answer_refund` needs stronger verification; current workflow only covers basic evidence.
6. Temporal wraps agent requests in one activity, not the case journey/per-tool steps. User requested visibility; align instrumentation with actual work, do not fabricate progress. Confirm live Grok connection as appropriate, avoid printing secrets.
7. Verify all flows, reload/resume, failures, edited drafts, and UI, then update goal complete only when actual scope is done.

Environment: PowerShell, root `C:\Users\Aymoo\OneDrive\Documents\ChatGPT\FTA`. UI http://localhost:5173, API 8787, Temporal UI 8233. VS Code launch `FTA: Full Stack` starts PostgreSQL and Temporal (server/worker are background and persist after debugging). Existing local services may occupy ports. `.env` contains secrets; never print. No permission to send actual external messages.

Read the full scenario text at `extracted-screens/scenario-text.txt`; screen-to-tools matrix at `extracted-screens/data-model/Screens.md`. `HANDOFF-NEXT-AI.md` contains older contradictory statements; this handoff supersedes those sections for current progress. Working tree has pre-existing uncommitted work; never reset/overwrite blindly.

## Update: refund UI verified

Refund journey tested through the browser on live PostgreSQL: approve, send, switch to business, submit, switch to FTA, verify, summary. Repeated send and completed DB record tested via API. Fixed role switch so the selected company follows into business. Replaced FTA/business summary fixtures with fetched persisted journey status so it cannot claim uncompleted cases are closed. Confirm a fresh build and browser check after these latest changes. Refund still has only recommended path; audit/weak option/extension branches remain. Case invoice list and individual selection verified in browser.

## Latest update — stop and handoff

User explicitly asked to stop here and hand this goal to another AI. Do not treat the goal as complete. Resume only when the user asks another AI to continue it.

- FTA and business summaries were replaced with saved-state summaries. They no longer automatically claim both cases closed. Business role handoffs set the correct company; status views have Finish when closed.
- The free-query screen now calls `AskBar` instead of showing a fixed answer. For demo business queries the selected company is passed through the API/Temporal bridge to `answer_question`, which restricts the model to company-specific read tools and refuses explicit references to the other demo company. This is demo scope only: `demo_company` is client supplied, the API has no authentication, and this is NOT a production authorization boundary. Other unsupported questions and requested free-query examples still need honest handling and implementation.
- `DecisionOptions.tsx` reads the workbook's FTA/business choices from `/api/agent/case-tool`; recommended choices allow the existing journey, weak choices show the workbook warning, and other alternatives are explicitly unavailable or cannot proceed. They do not yet execute audit/hold/extension branches. Clicking an alternative does not persist a selection or change approval. Complete these behaviors rather than treating option display as functionality.
- Al Waha paper-invoice list supports selecting an individual demo record. The selected Al Yasmeen invoice details come from the database. Original scenario asks for further document/ledger details and all choices; these are not complete.
- Last verification: `python -m pytest tests ali/tests -q` passed 67 tests; `npm run build --prefix stand` passed. Local PostgreSQL refund recommended path was tested through API and browser, including one approval, FTA send, business submit, FTA verify/close, and duplicate-send idempotency. The FTA summary showed fabricated results during that browser test; it was subsequently replaced with persisted-state summary and built, but the replacement has NOT been browser-tested. `DecisionOptions` was added afterward and built, but both journeys have NOT been browser-tested with these options. Verify these next.
- The latest `/api/agent/case-tool` option endpoint was tested against the live database. Business cross-company scoped request was rejected via live Temporal. Server was restarted after API/bridge changes. Temporal worker was restarted after the query-scope changes. Frontend is served by Vite and hot reloads.
- `request_extension` is only a draft with no submission, granting, deadline change, or UI. The whole refund workflow and summaries are demo records in `app.uc2_journey`, not updates to the workbook's normalized case/letter/VD tables. Existing selections do not yet cover all intended flows. Full 18-tool coverage, provenance, authorization, scenario paths, Temporal per-step visibility, real state on all screens, and robust error/resume behavior remain incomplete.
- Continue by reading the scenario and workbook, then prioritize: browser-test latest decisions and summaries; implement meaningful alternate FTA/business paths and extension; connect Waha supplier/docs and outcomes; harden/refine query handling and roles; complete/validate all tool contracts; and test the complete two-role, two-case workflows and failure/retry cases. Preserve one-approval-per-journey policy and invalidate approval after changes. Do not claim completion until all scope is actually done.

Current environment note: changes are uncommitted. Never expose `.env` secrets. Running UI/API/Temporal processes were started outside VS Code; `FTA: Full Stack` may conflict with occupied ports until those owned processes are stopped. Temporal and worker started by preparation task remain running when debugging stops. The local demo is synthetic only; no real FTA communication is authorized.

## Progress update — 2026-11-26 (continuation AI)

Implemented meaningful decision branches on both journeys (not display-only):

- `agents/journey_options.py` maps workbook option IDs → `recommended | audit | hold_all | blocked_weak | extension`
- UC2 + refund: `select_option` / `select_refund_option`; changing FTA option bumps version and clears approval
- Audit (FTA): approve + send → `CLOSED` / `referred_to_audit` (no business handoff)
- Hold-all refund (FTA): different draft letter; business still submits; verify uses same amount split
- Weak business options: persist selection but **block submit** with workbook weak reply
- Extension: business submit → `AWAITING_EXTENSION_DECISION`; FTA `grant_extension` / `deny_extension`
- API: `/api/agent/uc2` and `/api/agent/refund` accept `select_option`; case-tool also serves `get_supplier_status`, `get_refund_breakdown`, `get_company_overview`, `match_ledger` (Waha)
- UI: `DecisionOptions` + journeys persist options; `SupplierStatusPanel` on FTA supplier screen (live tool)
- Tests: branch coverage added; full suite **73 passed**; `npm run build --prefix stand` passed

Still NOT done (goal remains open): browser E2E of every branch; remaining fixture Waha paper/docs screens; full 18-tool workbook contracts/provenance; Temporal per-tool/step visibility; production-grade auth (out of demo scope); claiming both cases closed only from verified state across all paths under reload/failure matrices.

## Progress update — process & design alignment (2026-11-26)

Matched stand UI to scenario screenshots / Screens sheet process (see `STAND-PROCESS-ALIGNMENT.md`):

- Entry, role, FTA prep (CDP RULES / FTA AGENT lines + FOUND/AT STAKE metrics), briefing (AI left + risk cards), company chooser
- FTA Explain recon + CaseInvoices Tax Invoice chrome; Act letter preview Send/Edit/Cancel; Closed case history
- Business Y1/W1 overview (assistant bubbles, letters/company cards); Y2/W explain polish; Decide/Act stepper via `onPhaseChange`
- Build: `npm run build --prefix stand` passed; journey pytest subset passed

Still NOT done for goal complete: full browser E2E all branches; Temporal per-step; free-query evidence matrix; denser remaining mock chrome where noted in alignment doc.

## Checkpoint — 2026-11-26 14:25 Asia/Dubai (stop here)

Paused at user request for other work. Goal remains **open** (not complete).

### Landed this session
- Scenario UI/process alignment (entry→closed, business overviews, Act letter chrome, invoices) — see `STAND-PROCESS-ALIGNMENT.md`
- Temporal: named activities (`ask`, `case_tool`, `uc2_journey`, `refund_journey`, `fta_agent`, `fta_assistant`) when `TEMPORAL_ENABLED=true`; worker restarted; docs in `agents/TEMPORAL.md`
- Bridge routes `uc2_*` / `refund_*` / `case_tool` / ask / agents through Temporal when enabled
- Tests: UC2 deny-extension + option-clears-approval; refund extension grant/deny; ask `demo_company` scope; temporal activity naming
- Live API smoke (8787 + Temporal): health, UC2 audit→CLOSED, weak business block, refund hold_all, ask scope refuse cross-company, supplier status, 6 paper docs
- Pytest: `tests/test_uc2_journey.py` `tests/test_refund_journey.py` `tests/test_temporal_activities.py` `ali/tests/test_ask_agent.py` green

### Still required before goal complete
- Full browser E2E of every DecisionOptions branch (UI, not only API/unit)
- Full two-role two-case failure/retry/resume matrix in the stand UI
- Broader workbook 18-tool contracts/provenance beyond demo journey store
- Free-query evidence matrix beyond the scoped refuse/allow smoke
- Confirm Temporal worker stays running after restarts; API must load `TEMPORAL_ENABLED` from `.env`

Do not mark the goal complete from this checkpoint.
