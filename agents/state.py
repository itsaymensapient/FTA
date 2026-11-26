"""Shared LangGraph state for FTA and Business faces."""

from __future__ import annotations

from typing import Any, Literal, TypedDict


Step = Literal["SIGNAL", "EXPLAIN", "DECIDE", "ACT", "FOLLOW_UP", "CLOSED", "DONE"]


class AgentState(TypedDict, total=False):
    role: Literal["FTA_SPECIALIST", "BUSINESS"]
    case_id: str
    tin: str
    step: Step
    tool_results: dict[str, Any]
    narrative: str
    draft: dict[str, Any]
    selected_option_id: str
    awaiting_human: bool
    human_confirm: bool
    messages: list[str]
    done: bool
