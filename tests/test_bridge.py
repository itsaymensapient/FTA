"""agents.bridge JSON contract used by the Node stand API."""

from __future__ import annotations

from agents.bridge import handle


def test_bridge_ping():
    assert handle({"action": "ping"})["ok"] is True


def test_bridge_ask():
    out = handle({"action": "ask", "question": "What open cases need attention?"})
    assert out["ok"] is True
    assert out["answer"]
    assert out["tool"]


def test_bridge_fta_stops_at_decide():
    out = handle({"action": "fta", "case_id": "CDP-VAT-2026-1187", "auto_confirm": False})
    assert out["ok"] is True
    assert out["step"] == "DECIDE"
    assert out["awaiting_human"] is True
    assert out["tool_results"]["reconciliation"]["net_gap_aed"] == 412000


def test_bridge_health_exposes_offline_status_without_credentials():
    out = handle({"action": "ping"})
    assert out["llm"]["mode"] == "offline"
    assert "api_key" not in out["llm"]


def test_bridge_reports_model_failure_instead_of_fake_success(monkeypatch):
    import agents.fta_agent as agent
    from llm import LLMError
    def fail(*args, **kwargs):
        raise LLMError("OpenAI API quota or rate limit reached. Check API billing and limits.")
    monkeypatch.setattr(agent, "narrate", fail)
    out = handle({"action": "fta"})
    assert out["ok"] is False
    assert out["error_type"] == "llm"
    assert "billing" in out["error"]


def test_bridge_probe_does_not_verify_offline_mode():
    out = handle({"action": "llm_test"})
    assert out["ok"] is False
    assert out["verified"] is False


def test_graph_reuses_shared_model_and_keeps_human_gate(monkeypatch):
    from types import SimpleNamespace
    import llm
    calls = []
    def invoke(messages):
        calls.append(messages)
        return SimpleNamespace(content="Evidence reviewed. Awaiting your decision.")
    monkeypatch.setattr(llm, "get_chat_model", lambda: SimpleNamespace(invoke=invoke))
    out = handle({"action": "fta", "case_id": "CDP-VAT-2026-1187"})
    assert len(calls) == 3  # Signal, Explain, Decide; no action approval.
    assert len(out["llm"]["calls"]) == 3
    assert out["llm"]["used"] is True
    assert out["awaiting_human"] is True
    assert out["tool_results"]["reconciliation"]["net_gap_aed"] == 412000


def test_bridge_reads_finding_invoices_and_invoice_detail():
    listing = handle({'action': 'case_tool', 'tool': 'list_finding_invoices', 'finding_id': 'F-1187-01'})
    assert listing['ok'] is True
    assert listing['result']['total'] == 38
    invoice_id = listing['result']['invoices'][0]['invoice_uuid']
    detail = handle({'action': 'case_tool', 'tool': 'get_invoice', 'invoice_uuid': invoice_id})
    assert detail['ok'] is True
    assert detail['result']['invoice_uuid'] == invoice_id
    assert detail['result']['lines']


def test_bridge_rejects_unknown_case_tool():
    result = handle({'action': 'case_tool', 'tool': 'send_letter'})
    assert result['ok'] is False


def test_bridge_exposes_refund_journey_lifecycle(monkeypatch):
    import agents.uc2_journey as journey
    from agents.uc2_journey import MemoryStore
    store = MemoryStore()
    monkeypatch.setattr(journey, 'PostgresStore', lambda: store)
    created = handle({'action':'refund_create', 'session_id':'test'})
    assert created['ok'] is True
    jid = created['journey']['id']
    assert handle({'action':'refund_approve','journey_id':jid,'version':1})['journey']['state'] == 'READY_TO_SEND'
    assert handle({'action':'refund_step','journey_id':jid,'step':'send'})['journey']['state'] == 'AWAITING_BUSINESS'
    assert handle({'action':'refund_step','journey_id':jid,'step':'submit'})['journey']['state'] == 'READY_FOR_REVIEW'
    assert handle({'action':'refund_step','journey_id':jid,'step':'verify'})['journey']['state'] == 'CLOSED'


def test_bridge_provides_decision_options_from_workbook():
    result = handle({'action':'case_tool','tool':'get_options','case_type':'REFUND_REVIEW','side':'BUSINESS'})
    assert result['ok'] is True
    assert any(option['recommended'] for option in result['result']['options'])
    assert any(option['weak_option_reply'] for option in result['result']['options'])
    denied = handle({'action':'case_tool','tool':'get_options','case_type':'ARBITRARY','side':'BUSINESS'})
    assert denied['ok'] is False
