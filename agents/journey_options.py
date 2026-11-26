"""Workbook agent_option branches for UC2 / UC3 demo journeys."""

from __future__ import annotations

from typing import Any

# branch: recommended | audit | hold_all | blocked_weak | extension
FTA_RETURN = {
    "OPT-FTA-REC-1": "recommended",
    "OPT-FTA-REC-2": "audit",
}
BUS_RETURN = {
    "OPT-BUS-REC-1": "recommended",
    "OPT-BUS-REC-2": "blocked_weak",
    "OPT-BUS-REC-3": "extension",
}
FTA_REFUND = {
    "OPT-FTA-REF-1": "recommended",
    "OPT-FTA-REF-2": "hold_all",
    "OPT-FTA-REF-3": "audit",
}
BUS_REFUND = {
    "OPT-BUS-REF-1": "recommended",
    "OPT-BUS-REF-2": "blocked_weak",
    "OPT-BUS-REF-3": "extension",
}


def branch_for(case_type: str, side: str, option_id: str | None) -> str | None:
    if not option_id:
        return None
    table = {
        ("RETURN_VS_EINVOICES", "FTA_SPECIALIST"): FTA_RETURN,
        ("RETURN_VS_EINVOICES", "BUSINESS"): BUS_RETURN,
        ("REFUND_REVIEW", "FTA_SPECIALIST"): FTA_REFUND,
        ("REFUND_REVIEW", "BUSINESS"): BUS_REFUND,
    }.get((case_type, side))
    if not table:
        return None
    return table.get(option_id)


def option_meta(case_type: str, side: str, option_id: str) -> dict[str, Any]:
    from tools import get_options

    opts = get_options(case_type, side)["options"]
    match = next((o for o in opts if o["option_id"] == option_id), None)
    if not match:
        raise KeyError(f"Unknown option {option_id} for {case_type}/{side}")
    branch = branch_for(case_type, side, option_id)
    if not branch:
        raise KeyError(f"Option {option_id} is not implemented in the local demo")
    return {**match, "branch": branch}


def can_proceed(branch: str | None) -> bool:
    return branch in {"recommended", "audit", "hold_all", "extension"}
