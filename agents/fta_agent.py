"""
FTA specialist LangGraph agent — six steps, one shared LLM, CDP tools for numbers.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import rules
from agents.state import AgentState
from llm import narrate
from tools import (
    check_answer_return,
    close_case,
    draft_letter,
    get_briefing,
    get_options,
    get_refund_breakdown,
    get_return_reconciliation,
    get_supplier_status,
    list_finding_invoices,
    send_letter,
)

ROOT = Path(__file__).resolve().parents[1]
FTA_PROMPT = (ROOT / "prompts" / "fta_system.txt").read_text(encoding="utf-8")


def _case_type(case_id: str) -> str:
    if case_id == rules.WAHA_CASE:
        return "REFUND_REVIEW"
    if case_id == rules.BRIGHT_CASE:
        return "NON_FILER"
    return "RETURN_VS_EINVOICES"


def _fallback_explain(recon: dict[str, Any]) -> str:
    company = recon.get("company")
    net = recon.get("net_gap_aed")
    b1b = recon.get("box_1b_gap_aed")
    return (
        f"{company}: return vs e-invoices shows a Box 1b gap of AED {b1b:,.0f} "
        f"and a net Box 14 gap of AED {net:,.0f}. "
        f"{recon.get('how', {}).get('note', '')}"
    )


def node_signal(state: AgentState) -> AgentState:
    briefing = get_briefing()
    text = narrate(
        FTA_PROMPT,
        "Summarise this overnight briefing for the FTA specialist in 3 short sentences:\n"
        + json.dumps(briefing["cases"][:3], default=str),
        fallback=(
            f"Two high-risk items need attention. "
            f"First: {briefing['cases'][0]['company']} — {briefing['cases'][0]['priority_reason']}. "
            f"{briefing['how']['note']}"
        ),
    )
    msgs = list(state.get("messages") or [])
    msgs.append(f"[SIGNAL] {text}")
    return {
        **state,
        "step": "SIGNAL",
        "tool_results": {**(state.get("tool_results") or {}), "briefing": briefing},
        "narrative": text,
        "awaiting_human": False,
        "messages": msgs,
    }


def node_explain(state: AgentState) -> AgentState:
    case_id = state.get("case_id") or rules.YASMEEN_CASE
    tools_out: dict[str, Any] = dict(state.get("tool_results") or {})
    if _case_type(case_id) == "REFUND_REVIEW":
        recon = get_return_reconciliation(case_id)
        refund = get_refund_breakdown(case_id)
        supplier = get_supplier_status(rules.BRIGHT_TIN)
        tools_out.update({"reconciliation": recon, "refund": refund, "supplier": supplier})
        fallback = (
            f"{refund['company']}: claimed AED {refund['claimed_aed']:,.0f}; "
            f"supported AED {refund['supported_by_einvoices_aed']:,.0f}; "
            f"Bright Line on hold AED {refund['bright_line_on_hold_aed']:,.0f}. "
            f"{refund['how']['note']}"
        )
        payload = {"refund": refund, "supplier": supplier}
    else:
        recon = get_return_reconciliation(case_id)
        invoices = list_finding_invoices("F-1187-01", limit=5)
        tools_out.update({"reconciliation": recon, "invoices": invoices})
        fallback = _fallback_explain(recon)
        payload = {"reconciliation": recon, "invoice_sample": invoices}
    text = narrate(
        FTA_PROMPT,
        "Explain these tool results to the FTA specialist:\n" + json.dumps(payload, default=str)[:6000],
        fallback=fallback,
    )
    msgs = list(state.get("messages") or [])
    msgs.append(f"[EXPLAIN] {text}")
    return {
        **state,
        "step": "EXPLAIN",
        "tool_results": tools_out,
        "narrative": text,
        "awaiting_human": False,
        "messages": msgs,
    }


def node_decide(state: AgentState) -> AgentState:
    case_id = state.get("case_id") or rules.YASMEEN_CASE
    opts = get_options(_case_type(case_id), "FTA_SPECIALIST")
    recommended = next((o for o in opts["options"] if o.get("recommended")), opts["options"][0])
    lines = "\n".join(
        f"- {o['option_id']}: {o['label']}" + (" (recommended)" if o.get("recommended") else "")
        for o in opts["options"]
    )
    text = narrate(
        FTA_PROMPT,
        f"Recommend one option and say why briefly.\n{lines}",
        fallback=f"Recommended: {recommended['label']}. {opts['how']['note']}",
    )
    msgs = list(state.get("messages") or [])
    msgs.append(f"[DECIDE] {text}")
    return {
        **state,
        "step": "DECIDE",
        "tool_results": {**(state.get("tool_results") or {}), "options": opts},
        "selected_option_id": state.get("selected_option_id") or recommended["option_id"],
        "narrative": text,
        "awaiting_human": not bool(state.get("human_confirm")),
        "messages": msgs,
    }


def node_act(state: AgentState) -> AgentState:
    case_id = state.get("case_id") or rules.YASMEEN_CASE
    letter_type = "PARTIAL_APPROVAL_AND_REQUEST" if _case_type(case_id) == "REFUND_REVIEW" else "REQUEST"
    draft = draft_letter(case_id, letter_type=letter_type)
    sent = None
    if state.get("human_confirm"):
        sent = send_letter(case_id, confirm=True, letter_type=letter_type)
        if not sent.get("ok"):
            return {**state, "step":"ACT", "awaiting_human":True, "human_confirm":False,
                    "narrative":sent.get("error"), "tool_results":{**(state.get("tool_results") or {}), "send_letter":sent}}
    text = narrate(
        FTA_PROMPT,
        "Describe the draft letter the specialist should review before Send:\n"
        + json.dumps(draft["draft"], default=str)[:4000],
        fallback=f"Draft ready: {draft['draft'].get('subject')}. Waiting for Send. {draft['how']['note']}",
    )
    msgs = list(state.get("messages") or [])
    msgs.append(f"[ACT] {text}")
    return {
        **state,
        "step": "ACT",
        "draft": draft,
        "tool_results": {**(state.get("tool_results") or {}), "draft_letter": draft, "send_letter": sent},
        "narrative": text,
        "awaiting_human": not bool(state.get("human_confirm")),
        "messages": msgs,
    }


def node_follow_up(state: AgentState) -> AgentState:
    case_id = state.get("case_id") or rules.YASMEEN_CASE
    if _case_type(case_id) == "REFUND_REVIEW":
        from tools import check_answer_refund

        check = check_answer_refund(case_id)
        fallback = (
            f"Follow-up: approve extra AED {check['recommendation']['approve_additional_aed']:,.0f}, "
            f"reject AED {check['recommendation']['reject_aed']:,.0f}, "
            f"hold AED {check['recommendation']['hold_aed']:,.0f}. {check['how']['note']}"
        )
    else:
        check = check_answer_return(case_id)
        fallback = (
            f"Follow-up: VD matches e-invoices={check['matches_einvoices']}; "
            f"recommend {check['recommendation']}. {check['how']['note']}"
        )
    text = narrate(
        FTA_PROMPT,
        "Summarise the follow-up check for the specialist:\n" + json.dumps(check, default=str)[:5000],
        fallback=fallback,
    )
    msgs = list(state.get("messages") or [])
    msgs.append(f"[FOLLOW_UP] {text}")
    return {
        **state,
        "step": "FOLLOW_UP",
        "tool_results": {**(state.get("tool_results") or {}), "check_answer": check},
        "narrative": text,
        "awaiting_human": not bool(state.get("human_confirm")),
        "messages": msgs,
    }


def node_closed(state: AgentState) -> AgentState:
    case_id = state.get("case_id") or rules.YASMEEN_CASE
    closed = close_case(case_id, confirm=bool(state.get("human_confirm")))
    text = (
        f"Case {case_id} closed."
        if closed.get("ok")
        else closed.get("error") or "Waiting for Close confirmation."
    )
    msgs = list(state.get("messages") or [])
    msgs.append(f"[CLOSED] {text}")
    return {
        **state,
        "step": "CLOSED",
        "tool_results": {**(state.get("tool_results") or {}), "close_case": closed},
        "narrative": text,
        "awaiting_human": not bool(closed.get("ok")),
        "done": bool(closed.get("ok")),
        "messages": msgs,
    }


def build_fta_graph():
    from langgraph.graph import END, StateGraph

    g = StateGraph(AgentState)
    g.add_node("signal", node_signal)
    g.add_node("explain", node_explain)
    g.add_node("decide", node_decide)
    g.add_node("act", node_act)
    g.add_node("follow_up", node_follow_up)
    g.add_node("closed", node_closed)
    g.set_entry_point("signal")
    g.add_edge("signal", "explain")
    g.add_edge("explain", "decide")

    def after_decide(state: AgentState):
        if state.get("awaiting_human") and not state.get("human_confirm"):
            return END
        return "act"

    def after_act(state: AgentState):
        if state.get("awaiting_human") and not state.get("human_confirm"):
            return END
        return "follow_up"

    def after_follow_up(state: AgentState):
        if state.get("awaiting_human") and not state.get("human_confirm"):
            return END
        return "closed"

    g.add_conditional_edges("decide", after_decide, {END: END, "act": "act"})
    g.add_conditional_edges("act", after_act, {END: END, "follow_up": "follow_up"})
    g.add_conditional_edges("follow_up", after_follow_up, {END: END, "closed": "closed"})
    g.add_edge("closed", END)
    return g.compile()


def run_fta_case(
    case_id: str = rules.YASMEEN_CASE,
    *,
    auto_confirm: bool = False,
) -> AgentState:
    """Run the FTA graph. With auto_confirm=True, human gates are pre-approved for CLI demos."""
    graph = build_fta_graph()
    state: AgentState = {
        "role": "FTA_SPECIALIST",
        "case_id": case_id,
        "tin": rules.WAHA_TIN if case_id == rules.WAHA_CASE else rules.YASMEEN_TIN,
        "step": "SIGNAL",
        "tool_results": {},
        "messages": [],
        "human_confirm": auto_confirm,
        "awaiting_human": False,
        "done": False,
    }
    # First pass may stop at DECIDE if not confirmed
    state = graph.invoke(state)
    if auto_confirm and not state.get("done"):
        state = {**state, "human_confirm": True, "awaiting_human": False}
        # Resume from ACT onward by re-invoking with confirm already set —
        # re-enter at decide with confirm so edges continue.
        state = graph.invoke(state)
    return state


def main() -> None:
    parser = argparse.ArgumentParser(description="FTA LangGraph agent (UC2/UC3 demo)")
    parser.add_argument("--case", default=rules.YASMEEN_CASE, help="Case id")
    parser.add_argument("--auto-confirm", action="store_true", help="Pre-approve Send/Close for CLI demo")
    args = parser.parse_args()
    result = run_fta_case(args.case, auto_confirm=args.auto_confirm)
    print(f"step={result.get('step')} awaiting_human={result.get('awaiting_human')} done={result.get('done')}")
    print(result.get("narrative") or "")
    print("--- messages ---")
    for m in result.get("messages") or []:
        print(m)
        print()


if __name__ == "__main__":
    main()
