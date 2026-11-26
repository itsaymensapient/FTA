"""UC3 — VAT refund review tools (Case 2 Al Waha + Bright Line)."""

from __future__ import annotations

from typing import Any

import rules
from tools._data import case_row, finding_rows, how, num, tables, taxpayer_name


def get_refund_breakdown(case_id: str = rules.WAHA_CASE) -> dict[str, Any]:
    t = tables()
    case = case_row(t, case_id)
    if not case:
        raise KeyError(f"Unknown case_id: {case_id}")
    refund = next((r for r in t.all("refund_request") if r.get("case_id") == case_id), None)
    findings = finding_rows(t, case_id)
    claimed = num(refund.get("amount_claimed_aed")) if refund else num(case.get("amount_at_stake_aed"))
    supported = next((f for f in findings if f.get("finding_id") == "F-0219-03"), None)
    without = next((f for f in findings if f.get("finding_id") == "F-0219-01"), None)
    bright = next((f for f in findings if f.get("finding_id") == "F-0219-02"), None)
    paper = sum(
        num(d.get("vat_amount_aed"))
        for d in t.all("case_document")
        if d.get("case_id") == case_id and d.get("document_type") == "PAPER_TAX_INVOICE"
    )
    rejected = num(refund.get("rejected_aed")) if refund else 34200.0
    on_hold = num(bright.get("gap_vat_aed")) if bright else (num(refund.get("on_hold_aed")) if refund else 0)
    supported_amt = num(supported.get("gap_vat_aed")) if supported else 53600.0
    return {
        "case_id": case_id,
        "tin": case.get("tin"),
        "company": taxpayer_name(t, case.get("tin")),
        "claimed_aed": claimed,
        "supported_by_einvoices_aed": supported_amt,
        "without_einvoice_aed": num(without.get("gap_vat_aed")) if without else None,
        "paper_tax_invoices_aed": paper,
        "not_recoverable_card_slips_aed": rejected,
        "bright_line_on_hold_aed": on_hold,
        "approved_aed": num(refund.get("approved_aed")) if refund else None,
        "rejected_aed": rejected,
        "on_hold_aed": on_hold,
        "decision_due_date": refund.get("decision_due_date") if refund else case.get("deadline_date"),
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
        "how": how(
            "get_refund_breakdown",
            t.source,
            "refund_request + case_finding + case_document for refund case",
        ),
    }


def list_case_documents(
    case_id: str = rules.WAHA_CASE,
    document_type: str | None = "PAPER_TAX_INVOICE",
) -> dict[str, Any]:
    t = tables()
    names = {p["tin"]: p["legal_name"] for p in t.all("taxpayer")}
    rows = []
    for d in t.all("case_document"):
        if d.get("case_id") != case_id:
            continue
        if document_type and d.get("document_type") != document_type:
            continue
        issue = d.get("document_date") or d.get("issue_date")
        rows.append(
            {
                "document_id": d.get("document_id"),
                "document_type": d.get("document_type"),
                "document_number": d.get("document_number") or d.get("file_name") or d.get("document_id"),
                "supplier_tin": d.get("counterparty_tin"),
                "supplier_name": names.get(d.get("counterparty_tin")) or d.get("counterparty_tin"),
                "issue_date": str(issue)[:10] if issue else None,
                "vat_amount_aed": num(d.get("vat_amount_aed")),
                "net_amount_aed": num(d.get("net_amount_aed")),
                "check_result": d.get("check_result"),
            }
        )
    total_vat = sum(r["vat_amount_aed"] for r in rows)
    return {
        "case_id": case_id,
        "document_type": document_type,
        "total": len(rows),
        "total_vat_aed": total_vat,
        "documents": rows,
        "how": how(
            "list_case_documents",
            t.source,
            f"case_document rows for {case_id}" + (f" type={document_type}" if document_type else ""),
        ),
    }


def get_supplier_status(tin: str = rules.BRIGHT_TIN) -> dict[str, Any]:
    t = tables()
    obligations = [o for o in t.all("return_obligation") if o.get("tin") == tin]
    unfiled = [
        o
        for o in obligations
        if (o.get("status") or "").upper() in {"NOT_FILED", "OVERDUE", "OPEN"} or not o.get("return_id")
    ]
    vat_to_waha = sum(
        num(e.get("vat_amount_aed"))
        for e in t.all("e_invoice")
        if e.get("seller_tin") == tin
        and e.get("buyer_tin") == rules.WAHA_TIN
        and e.get("document_type_code") == "380"
    )
    linked = next((c for c in t.all('fta_case') if c.get('tin') == tin and c.get('case_type') == 'NON_FILER'), None)
    return {
        "tin": tin,
        "company": taxpayer_name(t, tin),
        "non_filer_case_id": linked.get('case_id') if linked else None,
        "non_filer_status": (linked or {}).get("status"),
        "unfiled_obligation_count": len(unfiled),
        "obligations": [
            {
                "obligation_id": o.get("obligation_id"),
                "period_code": o.get("period_code"),
                "due_date": o.get("due_date"),
                "status": o.get("status"),
                "return_id": o.get("return_id"),
            }
            for o in obligations
        ],
        "vat_on_invoices_to_al_waha_aed": vat_to_waha,
        "filing": not unfiled if obligations else None,
        "how": how(
            "get_supplier_status",
            t.source,
            "return_obligation + e_invoice seller filter + non-filer case",
        ),
    }


def check_answer_refund(case_id: str = rules.WAHA_CASE) -> dict[str, Any]:
    t = tables()
    breakdown = get_refund_breakdown(case_id)
    docs = [d for d in t.all("case_document") if d.get("case_id") == case_id]
    paper = [d for d in docs if d.get("document_type") == "PAPER_TAX_INVOICE"]
    bank = [d for d in docs if d.get("document_type") == "BANK_PAYMENT_CONFIRMATION"]
    vds = [v for v in t.all("voluntary_disclosure") if v.get("case_id") == case_id or v.get("tin") == rules.WAHA_TIN]
    recommend_approve = breakdown["paper_tax_invoices_aed"]
    recommend_reject = breakdown["not_recoverable_card_slips_aed"]
    recommend_hold = breakdown["bright_line_on_hold_aed"]
    return {
        "case_id": case_id,
        "documents_received": len(docs),
        "paper_invoice_count": len(paper),
        "bank_confirmation_count": len(bank),
        "vd_present": bool(vds),
        "recommendation": {
            "approve_additional_aed": recommend_approve,
            "reject_aed": recommend_reject,
            "hold_aed": recommend_hold,
            "total_approved_aed": breakdown["supported_by_einvoices_aed"] + recommend_approve,
            "action": "PARTIAL_DECISION",
        },
        "how": how(
            "check_answer",
            t.source,
            "case_document + refund split + VD presence for follow-up decision",
        ),
    }
