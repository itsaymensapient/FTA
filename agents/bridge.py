"""
JSON stdin/stdout bridge for the Node stand API.

Usage (from repo root):
  echo {"action":"ask","question":"..."} | python -m agents.bridge
"""

from __future__ import annotations

import json
import os
import sys
from typing import Any

import rules
from llm import LLMError, get_llm_status, get_llm_trace, reset_llm_trace, test_connection


def _compact_state(state: dict[str, Any]) -> dict[str, Any]:
    tools = state.get("tool_results") or {}
    compact_tools: dict[str, Any] = {}
    if "reconciliation" in tools:
        r = tools["reconciliation"]
        compact_tools["reconciliation"] = {
            "case_id": r.get("case_id"),
            "company": r.get("company"),
            "box_1b_gap_aed": r.get("box_1b_gap_aed"),
            "net_gap_aed": r.get("net_gap_aed"),
            "requires_vd": r.get("requires_vd"),
            "how": r.get("how"),
        }
    if "refund" in tools:
        r = tools["refund"]
        compact_tools["refund"] = {
            "case_id": r.get("case_id"),
            "claimed_aed": r.get("claimed_aed"),
            "supported_by_einvoices_aed": r.get("supported_by_einvoices_aed"),
            "not_recoverable_card_slips_aed": r.get("not_recoverable_card_slips_aed"),
            "bright_line_on_hold_aed": r.get("bright_line_on_hold_aed"),
            "how": r.get("how"),
        }
    if "options" in tools:
        compact_tools["options"] = tools["options"]
    if "check_answer" in tools:
        compact_tools["check_answer"] = tools["check_answer"]
    if "close_case" in tools:
        compact_tools["close_case"] = tools["close_case"]
    if "submit" in tools:
        compact_tools["submit"] = {
            "ok": tools["submit"].get("ok"),
            "status": tools["submit"].get("status"),
            "error": tools["submit"].get("error"),
        }
    if "overview" in tools:
        o = tools["overview"]
        compact_tools["overview"] = {
            "name": o.get("name"),
            "tin": o.get("tin"),
            "cases": o.get("cases"),
            "how": o.get("how"),
        }
    if "ledger" in tools:
        l = tools["ledger"]
        compact_tools["ledger"] = {
            "company": l.get("company"),
            "booked_box_1b_vat_aed": l.get("booked_box_1b_vat_aed"),
            "record_count": l.get("record_count"),
            "how": l.get("how"),
        }
    return {
        "role": state.get("role"),
        "case_id": state.get("case_id"),
        "tin": state.get("tin"),
        "step": state.get("step"),
        "narrative": state.get("narrative"),
        "messages": state.get("messages") or [],
        "awaiting_human": state.get("awaiting_human"),
        "done": state.get("done"),
        "selected_option_id": state.get("selected_option_id"),
        "tool_results": compact_tools,
    }


def _handle(req: dict[str, Any]) -> dict[str, Any]:
    action = (req.get("action") or "").strip().lower()
    if action.startswith('refund_'):
        from agents.uc2_journey import PostgresStore, JourneyError
        from agents.refund_journey import (
            create_refund, get_refund, approve_refund, revise_refund, refund_step, select_refund_option,
        )
        store = PostgresStore()
        try:
            if action == 'refund_create': result = create_refund(store, req.get('session_id'))
            elif action == 'refund_get': result = get_refund(store, req.get('journey_id'))
            elif action == 'refund_approve': result = approve_refund(store, req.get('journey_id'), req.get('version'))
            elif action == 'refund_revise': result = revise_refund(store, req.get('journey_id'), req.get('text'))
            elif action == 'refund_select_option':
                result = select_refund_option(store, req.get('journey_id'), req.get('side'), req.get('option_id'))
            elif action == 'refund_step': result = refund_step(store, req.get('journey_id'), req.get('step'))
            else: raise JourneyError('Unknown refund journey request.')
            return {'ok': True, 'journey': result}
        except JourneyError as err:
            return {'ok': False, 'error': str(err)}
    if action == 'case_tool':
        from tools import (
            get_invoice, list_finding_invoices, get_options, get_supplier_status,
            get_refund_breakdown, get_company_overview, match_ledger, list_case_documents,
        )
        tool = req.get('tool')
        if (tool == 'get_options' and req.get('case_type') in {'RETURN_VS_EINVOICES', 'REFUND_REVIEW'}
                and req.get('side') in {'FTA_SPECIALIST', 'BUSINESS'}):
            return {'ok': True, 'result': get_options(req['case_type'], req['side'])}
        if tool == 'list_finding_invoices' and req.get('finding_id') == 'F-1187-01':
            return {'ok': True, 'result': list_finding_invoices('F-1187-01')}
        if tool == 'get_invoice':
            invoice_id = req.get('invoice_uuid')
            allowed = list_finding_invoices('F-1187-01')['invoices']
            if invoice_id and any(i['invoice_uuid'] == invoice_id for i in allowed):
                return {'ok': True, 'result': get_invoice(invoice_uuid=invoice_id)}
        if tool == 'get_supplier_status' and req.get('tin') in {rules.BRIGHT_TIN, None}:
            return {'ok': True, 'result': get_supplier_status(rules.BRIGHT_TIN)}
        if tool == 'get_refund_breakdown' and req.get('case_id') in {rules.WAHA_CASE, None}:
            return {'ok': True, 'result': get_refund_breakdown(rules.WAHA_CASE)}
        if tool == 'list_case_documents' and req.get('case_id') in {rules.WAHA_CASE, None}:
            return {
                'ok': True,
                'result': list_case_documents(
                    rules.WAHA_CASE,
                    document_type=req.get('document_type') or 'PAPER_TAX_INVOICE',
                ),
            }
        if tool == 'get_company_overview' and req.get('tin') in {rules.WAHA_TIN, rules.YASMEEN_TIN}:
            return {'ok': True, 'result': get_company_overview(req['tin'])}
        if tool == 'match_ledger' and req.get('tin') == rules.WAHA_TIN:
            return {'ok': True, 'result': match_ledger(rules.WAHA_TIN, rules.WAHA_CASE)}
        return {'ok': False, 'error': 'Tool or invoice is not available for this demo case.'}
    if action.startswith('uc2_'):
        from agents.uc2_journey import (PostgresStore, JourneyError, create_journey, get_journey,
                                        approve_journey, revise_journey, execute_step, select_option)
        store = PostgresStore()
        try:
            if action == 'uc2_create': result = create_journey(store, req.get('session_id'))
            elif action == 'uc2_get': result = get_journey(store, req.get('journey_id'))
            elif action == 'uc2_approve': result = approve_journey(store, req.get('journey_id'), req.get('version'))
            elif action == 'uc2_revise': result = revise_journey(store, req.get('journey_id'), req.get('text'))
            elif action == 'uc2_select_option':
                result = select_option(store, req.get('journey_id'), req.get('side'), req.get('option_id'))
            elif action == 'uc2_step': result = execute_step(store, req.get('journey_id'), req.get('step'))
            else: raise JourneyError('Unknown journey request.')
            return {'ok': True, 'journey': result}
        except JourneyError as err:
            return {'ok': False, 'error': str(err)}
    if action in {"ping", "health"}:
        return {"ok": True, "service": "agents.bridge"}
    if action == "llm_test":
        return {"action": "llm_test", **test_connection()}

    if action == "ask":
        from ali.agents.ask_agent import answer_question

        question = (req.get("question") or "").strip()
        if not question:
            return {"ok": False, "error": "question is required"}
        out = answer_question(
            question,
            session_id=req.get("session_id"),
            persist=bool(req.get("persist", False)),
            demo_company=req.get("demo_company"),
        )
        return {"ok": True, "action": "ask", **out}

    case_id = (req.get("case_id") or rules.YASMEEN_CASE).strip()
    auto_confirm = bool(req.get("auto_confirm", False))

    if action in {"fta", "run_fta"}:
        from agents.fta_agent import run_fta_case

        state = run_fta_case(case_id, auto_confirm=auto_confirm)
        return {"ok": True, "action": "fta", **_compact_state(state)}

    if action in {"assistant", "run_assistant", "business"}:
        from agents.fta_assistant import run_assistant_case

        state = run_assistant_case(case_id, auto_confirm=auto_confirm)
        return {"ok": True, "action": "assistant", **_compact_state(state)}

    return {
        "ok": False,
        "error": f"Unknown action: {action!r}. Use ask | fta | assistant | ping",
    }


def handle(req: dict[str, Any]) -> dict[str, Any]:
    reset_llm_trace()
    try:
        result = _handle(req)
    except LLMError as err:
        result = {"ok": False, "error_type": "llm", "error": str(err)}
    try:
        status = get_llm_status()
    except LLMError:
        status = {"mode": "error", "configured": False, "verified": False}
    trace = get_llm_trace()
    return {**result, "llm": {**status, "used": any(c.get("mode") == "live" and c.get("success") for c in trace), "calls": trace}}


def main() -> None:
    raw = sys.stdin.read()
    try:
        req = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError as err:
        json.dump({"ok": False, "error": f"Invalid JSON: {err}"}, sys.stdout)
        sys.exit(1)
    try:
        request = req if isinstance(req, dict) else {}
        action = str(request.get('action') or '').strip().lower()
        temporal_actions = {
            'ask', 'fta', 'assistant', 'run_fta', 'run_assistant', 'business', 'case_tool',
        }
        use_temporal = (
            os.environ.get('TEMPORAL_ENABLED', '').lower() == 'true'
            and (
                action in temporal_actions
                or action.startswith('uc2_')
                or action.startswith('refund_')
            )
        )
        if use_temporal:
            from agents.temporal_client import execute
            out = execute(request)
        else:
            out = handle(request)
    except Exception as err:  # noqa: BLE001
        json.dump({"ok": False, "error": str(err)}, sys.stdout, default=str)
        sys.exit(1)
    json.dump(out, sys.stdout, default=str)


if __name__ == "__main__":
    main()
