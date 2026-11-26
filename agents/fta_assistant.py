"""
FTA Assistant (Business face) — LangGraph six steps, same llm.py as FTA agent.
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
    get_company_overview,
    get_options,
    get_refund_breakdown,
    match_ledger,
    prepare_reply,
    prepare_vd,
    submit,
)

ROOT = Path(__file__).resolve().parents[1]
BUSINESS_PROMPT = (ROOT / "prompts" / "business_system.txt").read_text(encoding="utf-8")


def _default_tin(case_id: str) -> str:
    if case_id == rules.WAHA_CASE:
        return rules.WAHA_TIN
    return rules.YASMEEN_TIN


def node_signal(state: AgentState) -> AgentState:
    tin = state.get("tin") or _default_tin(state.get("case_id") or rules.YASMEEN_CASE)
    overview = get_company_overview(tin)
    text = narrate(
        BUSINESS_PROMPT,
        "Summarise what needs attention for this company today:\n"
        + json.dumps(overview, default=str)[:5000],
        fallback=(
            f"{overview['name']}: {len(overview['cases'])} open case(s), "
            f"{len(overview['open_letters'])} letter(s) from FTA. {overview['how']['note']}"
        ),
    )
    msgs = list(state.get("messages") or [])
    msgs.append(f"[SIGNAL] {text}")
    return {
        **state,
        "step": "SIGNAL",
        "tin": tin,
        "tool_results": {**(state.get("tool_results") or {}), "overview": overview},
        "narrative": text,
        "awaiting_human": False,
        "messages": msgs,
    }


def node_explain(state: AgentState) -> AgentState:
    case_id = state.get("case_id") or rules.YASMEEN_CASE
    tin = state.get("tin") or _default_tin(case_id)
    tools_out: dict[str, Any] = dict(state.get("tool_results") or {})
    if case_id == rules.WAHA_CASE:
        refund = get_refund_breakdown(case_id)
        tools_out["refund"] = refund
        payload = refund
        fallback = (
            f"FTA letter on refund claim AED {refund['claimed_aed']:,.0f}: "
            f"AED {refund['supported_by_einvoices_aed']:,.0f} already supported; "
            f"AED {refund['bright_line_on_hold_aed']:,.0f} held for Bright Line; "
            f"card slips AED {refund['not_recoverable_card_slips_aed']:,.0f} not recoverable. "
            f"{refund['how']['note']}"
        )
    else:
        ledger = match_ledger(tin, case_id)
        tools_out["ledger"] = ledger
        payload = ledger
        fallback = (
            f"{ledger['company']}: ledger shows Box 1b booked VAT AED "
            f"{ledger['booked_box_1b_vat_aed']:,.0f} on the gap invoices. "
            f"{ledger['how']['note']}"
        )
    text = narrate(
        BUSINESS_PROMPT,
        "Explain the FTA letter using the company's own records:\n"
        + json.dumps(payload, default=str)[:6000],
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
    case_type = "REFUND_REVIEW" if case_id == rules.WAHA_CASE else "RETURN_VS_EINVOICES"
    opts = get_options(case_type, "BUSINESS")
    if not opts["options"]:
        # Seed may only list FTA options; offer a practical business default
        recommended = {
            "option_id": "BIZ-VD-REPLY",
            "label": "Prepare Voluntary Disclosure and reply",
            "recommended": True,
        }
        opts = {
            **opts,
            "options": [recommended],
        }
    else:
        recommended = next((o for o in opts["options"] if o.get("recommended")), opts["options"][0])
    lines = "\n".join(
        f"- {o['option_id']}: {o['label']}" + (" (recommended)" if o.get("recommended") else "")
        for o in opts["options"]
    )
    text = narrate(
        BUSINESS_PROMPT,
        f"Recommend one action for the VAT manager:\n{lines}",
        fallback=f"Recommended: {recommended['label']}. {opts.get('how', {}).get('note', '')}",
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
    vd = prepare_vd(case_id)
    reply = prepare_reply(case_id)
    submitted = None
    if state.get("human_confirm"):
        submitted = submit(case_id, confirm=True, include_vd=True)
        if not submitted.get("ok"):
            return {**state, "step":"ACT", "awaiting_human":True, "human_confirm":False,
                    "narrative":submitted.get("error"), "tool_results":{**(state.get("tool_results") or {}), "submit":submitted}}
    text = narrate(
        BUSINESS_PROMPT,
        "Describe the VD and reply pack ready for the manager to Submit:\n"
        + json.dumps({"vd": vd, "reply": reply}, default=str)[:5000],
        fallback=(
            f"VD draft with {len(vd['vd_draft']['boxes'])} box correction(s) and reply ready. "
            f"Waiting for Submit. {vd['how']['note']}"
        ),
    )
    msgs = list(state.get("messages") or [])
    msgs.append(f"[ACT] {text}")
    return {
        **state,
        "step": "ACT",
        "draft": {"vd": vd, "reply": reply},
        "tool_results": {
            **(state.get("tool_results") or {}),
            "prepare_vd": vd,
            "prepare_reply": reply,
            "submit": submitted,
        },
        "narrative": text,
        "awaiting_human": not bool(state.get("human_confirm")),
        "messages": msgs,
    }


def node_follow_up(state: AgentState) -> AgentState:
    case_id = state.get("case_id") or rules.YASMEEN_CASE
    # Business follow-up: confirm what was submitted
    submitted = (state.get("tool_results") or {}).get("submit") or submit(case_id, confirm=False)
    text = narrate(
        BUSINESS_PROMPT,
        "Confirm to the VAT manager what happens next after submit:\n"
        + json.dumps(submitted, default=str)[:4000],
        fallback=(
            "After Submit, FTA will check your VD against e-invoices. "
            "Keep the letter deadline in view."
        ),
    )
    msgs = list(state.get("messages") or [])
    msgs.append(f"[FOLLOW_UP] {text}")
    return {
        **state,
        "step": "FOLLOW_UP",
        "narrative": text,
        "awaiting_human": False,
        "messages": msgs,
    }


def node_closed(state: AgentState) -> AgentState:
    text = (
        f"Business pack for {state.get('case_id')} is submitted and the assistant step is complete. "
        "FTA closes the case on their side after review."
    )
    msgs = list(state.get("messages") or [])
    msgs.append(f"[CLOSED] {text}")
    return {
        **state,
        "step": "CLOSED",
        "narrative": text,
        "awaiting_human": False,
        "done": True,
        "messages": msgs,
    }


def build_assistant_graph():
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

    g.add_conditional_edges("decide", after_decide, {END: END, "act": "act"})
    g.add_conditional_edges("act", after_act, {END: END, "follow_up": "follow_up"})
    g.add_edge("follow_up", "closed")
    g.add_edge("closed", END)
    return g.compile()


def run_assistant_case(
    case_id: str = rules.YASMEEN_CASE,
    *,
    auto_confirm: bool = False,
) -> AgentState:
    graph = build_assistant_graph()
    state: AgentState = {
        "role": "BUSINESS",
        "case_id": case_id,
        "tin": _default_tin(case_id),
        "step": "SIGNAL",
        "tool_results": {},
        "messages": [],
        "human_confirm": auto_confirm,
        "awaiting_human": False,
        "done": False,
    }
    return graph.invoke(state)


def main() -> None:
    parser = argparse.ArgumentParser(description="FTA Assistant LangGraph agent (Business face)")
    parser.add_argument("--case", default=rules.YASMEEN_CASE, help="Case id")
    parser.add_argument("--auto-confirm", action="store_true", help="Pre-approve Submit for CLI demo")
    args = parser.parse_args()
    result = run_assistant_case(args.case, auto_confirm=args.auto_confirm)
    print(f"step={result.get('step')} awaiting_human={result.get('awaiting_human')} done={result.get('done')}")
    print(result.get("narrative") or "")
    print("--- messages ---")
    for m in result.get("messages") or []:
        print(m)
        print()


if __name__ == "__main__":
    main()
