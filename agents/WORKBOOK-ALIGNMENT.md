# AgentTools workbook alignment — initial audit

Source: `documents/GITEX_CDP_Stand_Data_Model_v1.2.xlsx`, AgentTools sheet.
The workbook describes 18 named tools. This file records implementation status;
a Python function existing does not mean that every workbook input, output,
role boundary, screen, or persistence requirement is complete.

- `get_briefing`, `get_return_reconciliation`, `list_finding_invoices`, `get_invoice`,
  `get_refund_breakdown`, `get_supplier_status`, `get_options`, `draft_letter`,
  `get_company_overview`, `match_ledger`, `prepare_vd`, `prepare_reply`: implemented
  in `tools/`; still require a full contract and role-scope audit.
- `check_answer`: scenario-specific `check_answer_return` and `check_answer_refund`.
  Return checks require evidence for every comparable box. The Scenario 2 demo
  separately verifies its saved submission against reconciliation data.
- `request_extension`: prepares a reviewable draft only. Submission, approval,
  persistence and the demo follow-up decision are not yet implemented.
- `send_letter`, `submit`, `close_case`: the approved Scenario 2 journey records
  demo actions transactionally in `app.uc2_journey`; these are not yet the
  workbook's changes to `letter`, `voluntary_disclosure`, `fta_case`, and
  `case_event`. Legacy direct send/submit are deliberately unavailable.
- `query_data`: the question assistant exposes six allowlisted read tools, not
  arbitrary questions against every role-authorized table or generated SQL.

Security: the local demo has no authenticated role or taxpayer enforcement.
Do not treat the workbook's role-scope requirements as production-complete.
Temporal runs the AI request as one activity, not one activity per workbook tool.
