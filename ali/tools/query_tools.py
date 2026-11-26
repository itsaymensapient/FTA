"""
Read-only query tools for free questions (Ali).

These are simple named queries over B1 tables — not Sulieman's tax-action tools.
"""

from __future__ import annotations

from typing import Any, Callable

from ali.tables import (
    BRIGHT_TIN,
    PERIOD,
    WAHA_CASE,
    WAHA_TIN,
    YASMEEN_CASE,
    YASMEEN_TIN,
    Tables,
    load_tables,
    num,
)


def _company(t: Tables, tin: str) -> dict[str, Any]:
    row = next((p for p in t.all("taxpayer") if p.get("tin") == tin), None)
    case = next((c for c in t.all("fta_case") if c.get("tin") == tin), None)
    return {
        "tin": tin,
        "name": row.get("legal_name") if row else None,
        "trn": row.get("trn") if row else None,
        "case_id": case.get("case_id") if case else None,
        "case_type": case.get("case_type") if case else None,
        "amount_at_stake_aed": num(case.get("amount_at_stake_aed")) if case else None,
        "status": case.get("status") if case else None,
    }


def list_open_cases(t: Tables) -> dict[str, Any]:
    items = []
    for c in t.all("fta_case"):
        tp = next((p for p in t.all("taxpayer") if p.get("tin") == c.get("tin")), None)
        items.append(
            {
                "case_id": c.get("case_id"),
                "case_type": c.get("case_type"),
                "company": tp.get("legal_name") if tp else c.get("tin"),
                "risk_level": c.get("risk_level"),
                "priority_reason": c.get("priority_reason"),
                "amount_at_stake_aed": num(c.get("amount_at_stake_aed")),
                "status": c.get("status"),
                "deadline_date": c.get("deadline_date"),
            }
        )
    return {"count": len(items), "cases": items}


def yasmeen_box_gaps(t: Tables) -> dict[str, Any]:
    findings = [f for f in t.all("case_finding") if f.get("case_id") == YASMEEN_CASE]
    return {
        "case_id": YASMEEN_CASE,
        "company": _company(t, YASMEEN_TIN),
        "findings": [
            {
                "finding_id": f.get("finding_id"),
                "box_code": f.get("box_code"),
                "description": f.get("description"),
                "declared_vat_aed": num(f.get("declared_vat_aed")),
                "einvoice_vat_aed": num(f.get("einvoice_vat_aed")),
                "gap_vat_aed": num(f.get("gap_vat_aed")),
                "invoice_count": f.get("invoice_count"),
            }
            for f in findings
        ],
    }


def yasmeen_gap_invoices(t: Tables, limit: int = 10) -> dict[str, Any]:
    by_uuid = {e["invoice_uuid"]: e for e in t.all("e_invoice")}
    names = {p["tin"]: p["legal_name"] for p in t.all("taxpayer")}
    rows = []
    for fi in t.all("finding_invoice"):
        if fi.get("finding_id") != "F-1187-01":
            continue
        e = by_uuid.get(fi["invoice_uuid"], {})
        rows.append(
            {
                "invoice_number": e.get("invoice_number") or fi.get("invoice_number"),
                "issue_date": e.get("issue_date"),
                "buyer": names.get(e.get("buyer_tin")),
                "vat_amount_aed": num(fi.get("vat_amount_aed")),
            }
        )
    return {
        "case_id": YASMEEN_CASE,
        "total": len(rows),
        "showing": min(limit, len(rows)),
        "invoices": rows[:limit],
    }


def waha_refund_split(t: Tables) -> dict[str, Any]:
    refund = next((r for r in t.all("refund_request") if r.get("case_id") == WAHA_CASE), None)
    findings = [f for f in t.all("case_finding") if f.get("case_id") == WAHA_CASE]
    return {
        "case_id": WAHA_CASE,
        "company": _company(t, WAHA_TIN),
        "claimed_aed": num(refund.get("amount_claimed_aed")) if refund else None,
        "approved_aed": num(refund.get("approved_aed")) if refund else None,
        "rejected_aed": num(refund.get("rejected_aed")) if refund else None,
        "on_hold_aed": num(refund.get("on_hold_aed")) if refund else None,
        "decision_due_date": refund.get("decision_due_date") if refund else None,
        "findings": [
            {
                "finding_id": f.get("finding_id"),
                "description": f.get("description"),
                "gap_vat_aed": num(f.get("gap_vat_aed")),
                "support_status": f.get("support_status"),
                "resolution": f.get("resolution"),
            }
            for f in findings
        ],
    }


def bright_line_status(t: Tables) -> dict[str, Any]:
    obligations = [o for o in t.all("return_obligation") if o.get("tin") == BRIGHT_TIN]
    vat_to_waha = sum(
        num(e.get("vat_amount_aed"))
        for e in t.all("e_invoice")
        if e.get("seller_tin") == BRIGHT_TIN
        and e.get("buyer_tin") == WAHA_TIN
        and e.get("document_type_code") == "380"
    )
    return {
        "company": _company(t, BRIGHT_TIN),
        "vat_on_invoices_to_al_waha_aed": vat_to_waha,
        "obligations": [
            {
                "obligation_id": o.get("obligation_id"),
                "period_code": o.get("period_code"),
                "due_date": o.get("due_date"),
                "status": o.get("status"),
            }
            for o in obligations
        ],
    }


def compare_return_vs_einvoices(t: Tables, tin: str = YASMEEN_TIN) -> dict[str, Any]:
    case = next((c for c in t.all("fta_case") if c.get("tin") == tin), None)
    findings = [
        f
        for f in t.all("case_finding")
        if case and f.get("case_id") == case.get("case_id") and f.get("box_code")
    ]
    return {
        "company": _company(t, tin),
        "period_code": PERIOD,
        "boxes": [
            {
                "box_code": f.get("box_code"),
                "declared_vat_aed": num(f.get("declared_vat_aed")),
                "einvoice_vat_aed": num(f.get("einvoice_vat_aed")),
                "gap_vat_aed": num(f.get("gap_vat_aed")),
            }
            for f in findings
        ],
    }


QUERY_TOOLS: dict[str, Callable[[Tables], dict[str, Any]]] = {
    "list_open_cases": list_open_cases,
    "yasmeen_box_gaps": yasmeen_box_gaps,
    "yasmeen_gap_invoices": yasmeen_gap_invoices,
    "waha_refund_split": waha_refund_split,
    "bright_line_status": bright_line_status,
    "compare_return_vs_einvoices": compare_return_vs_einvoices,
}


def run_query_tool(name: str, t: Tables | None = None, **kwargs: Any) -> dict[str, Any]:
    if name not in QUERY_TOOLS:
        raise KeyError(f"Unknown query tool: {name}. Choose from: {sorted(QUERY_TOOLS)}")
    tables = t or load_tables()
    fn = QUERY_TOOLS[name]
    if name == "yasmeen_gap_invoices":
        return fn(tables, limit=int(kwargs.get("limit", 10)))  # type: ignore[call-arg]
    if name == "compare_return_vs_einvoices":
        return fn(tables, tin=str(kwargs.get("tin", YASMEEN_TIN)))  # type: ignore[call-arg]
    return fn(tables)
