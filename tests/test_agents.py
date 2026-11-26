"""LangGraph FTA + Assistant agents (offline LLM fallback)."""

from __future__ import annotations

import rules
from agents.fta_agent import run_fta_case
from agents.fta_assistant import run_assistant_case


def test_fta_agent_stops_for_human_at_decide():
    state = run_fta_case(rules.YASMEEN_CASE, auto_confirm=False)
    assert state["step"] == "DECIDE"
    assert state["awaiting_human"] is True
    assert any(m.startswith("[SIGNAL]") for m in state["messages"])
    assert any(m.startswith("[EXPLAIN]") for m in state["messages"])
    recon = state["tool_results"]["reconciliation"]
    assert recon["net_gap_aed"] == 412000


def test_fta_agent_stops_when_legacy_send_unavailable():
    state = run_fta_case(rules.YASMEEN_CASE, auto_confirm=True)
    assert state["done"] is False
    assert state["step"] == "ACT"
    assert state["tool_results"]["send_letter"]["ok"] is False


def test_fta_agent_uc3_refund_case():
    state = run_fta_case(rules.WAHA_CASE, auto_confirm=False)
    assert state["step"] == "DECIDE"
    assert "refund" in state["tool_results"]
    assert state["tool_results"]["refund"]["claimed_aed"]


def test_assistant_stops_for_human_at_decide():
    state = run_assistant_case(rules.YASMEEN_CASE, auto_confirm=False)
    assert state["step"] == "DECIDE"
    assert state["awaiting_human"] is True
    assert "ledger" in state["tool_results"] or "overview" in state["tool_results"]


def test_assistant_stops_when_legacy_submit_unavailable():
    state = run_assistant_case(rules.YASMEEN_CASE, auto_confirm=True)
    assert state["done"] is False
    assert state["step"] == "ACT"
    assert state["tool_results"].get("submit", {}).get("ok") is False
