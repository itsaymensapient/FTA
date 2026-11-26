"""UC2 — return vs e-invoices tools (Case 1 Al Yasmeen + shared reads)."""

from __future__ import annotations

from typing import Any

import rules
from tools._data import case_row, finding_rows, how, num, tables, taxpayer_name


def get_briefing(limit: int = 10) -> dict[str, Any]:
    t = tables()
    cases = sorted(
        t.all("fta_case"),
        key=lambda c: (
            0 if (c.get("risk_level") or "").upper() == "HIGH" else 1,
            -num(c.get("amount_at_stake_aed")),
        ),
    )
    items = []
    for c in cases[:limit]:
        items.append(
            {
                "case_id": c.get("case_id"),
                "case_type": c.get("case_type"),
                "tin": c.get("tin"),
                "company": taxpayer_name(t, c.get("tin")),
                "risk_level": c.get("risk_level"),
                "priority_reason": c.get("priority_reason"),
                "amount_at_stake_aed": num(c.get("amount_at_stake_aed")),
                "status": c.get("status"),
                "deadline_date": c.get("deadline_date"),
            }
        )
    return {
        "count": len(items),
        "cases": items,
        "how": how("get_briefing", t.source, "ranked fta_case by risk_level and amount_at_stake_aed"),
    }


def get_return_reconciliation(case_id: str = rules.YASMEEN_CASE) -> dict[str, Any]:
    t = tables()
    case = case_row(t, case_id)
    if not case:
        raise KeyError(f"Unknown case_id: {case_id}")
    findings = []
    for f in finding_rows(t, case_id):
        findings.append(
            {
                "finding_id": f.get("finding_id"),
                "box_code": f.get("box_code"),
                "description": f.get("description"),
                "declared_vat_aed": num(f.get("declared_vat_aed")) if f.get("declared_vat_aed") is not None else None,
                "einvoice_vat_aed": num(f.get("einvoice_vat_aed")) if f.get("einvoice_vat_aed") is not None else None,
                "gap_vat_aed": num(f.get("gap_vat_aed")),
                "invoice_count": f.get("invoice_count"),
                "resolution": f.get("resolution"),
            }
        )
    net = next((f for f in findings if f.get("box_code") == "14"), None)
    gap1b = next((f for f in findings if f.get("box_code") == "1b"), None)
    return {
        "case_id": case_id,
        "tin": case.get("tin"),
        "company": taxpayer_name(t, case.get("tin")),
        "period_code": case.get("period_code"),
        "findings": findings,
        "net_gap_aed": num(net["gap_vat_aed"]) if net else None,
        "box_1b_gap_aed": num(gap1b["gap_vat_aed"]) if gap1b else None,
        "requires_vd": rules.requires_voluntary_disclosure(num(net["gap_vat_aed"]) if net else 0),
        "how": how(
            "get_return_reconciliation",
            t.source,
            f"case_finding rows for {case_id} (return vs e-invoice gaps by box)",
        ),
    }


def list_finding_invoices(finding_id: str = "F-1187-01", limit: int = 38) -> dict[str, Any]:
    t = tables()
    by_uuid = {e["invoice_uuid"]: e for e in t.all("e_invoice")}
    names = {p["tin"]: p["legal_name"] for p in t.all("taxpayer")}
    rows = []
    for fi in t.all("finding_invoice"):
        if fi.get("finding_id") != finding_id:
            continue
        e = by_uuid.get(fi.get("invoice_uuid"), {})
        rows.append(
            {
                "invoice_uuid": fi.get("invoice_uuid"),
                "invoice_number": e.get("invoice_number") or fi.get("invoice_number"),
                "issue_date": e.get("issue_date"),
                "buyer_tin": e.get("buyer_tin"),
                "buyer": names.get(e.get("buyer_tin")),
                "vat_amount_aed": num(fi.get("vat_amount_aed")),
                "net_amount_aed": num(e.get("net_amount_aed")),
            }
        )
    total_vat = sum(r["vat_amount_aed"] for r in rows)
    return {
        "finding_id": finding_id,
        "total": len(rows),
        "showing": min(limit, len(rows)),
        "total_vat_aed": total_vat,
        "invoices": rows[:limit],
        "how": how(
            "list_finding_invoices",
            t.source,
            f"finding_invoice joined to e_invoice for {finding_id}",
        ),
    }


def get_invoice(invoice_number: str | None = None, invoice_uuid: str | None = None) -> dict[str, Any]:
    t = tables()
    e = None
    if invoice_uuid:
        e = next((x for x in t.all("e_invoice") if x.get("invoice_uuid") == invoice_uuid), None)
    elif invoice_number:
        e = next((x for x in t.all("e_invoice") if x.get("invoice_number") == invoice_number), None)
    if not e:
        raise KeyError("Invoice not found")
    lines = [ln for ln in t.all("e_invoice_line") if ln.get("invoice_uuid") == e.get("invoice_uuid")]
    names = {p["tin"]: p["legal_name"] for p in t.all("taxpayer")}
    return {
        "invoice_uuid": e.get("invoice_uuid"),
        "invoice_number": e.get("invoice_number"),
        "issue_date": e.get("issue_date"),
        "seller": names.get(e.get("seller_tin")),
        "seller_tin": e.get("seller_tin"),
        "buyer": names.get(e.get("buyer_tin")),
        "buyer_tin": e.get("buyer_tin"),
        "vat_amount_aed": num(e.get("vat_amount_aed")),
        "net_amount_aed": num(e.get("net_amount_aed")),
        "gross_amount_aed": num(e.get("gross_amount_aed")),
        "seller_vat201_box": e.get("seller_vat201_box"),
        "lines": [
            {
                "line_id": ln.get("line_id"),
                "item_name": ln.get("item_name"),
                "vat_amount_aed": num(ln.get("vat_amount_aed")),
                "net_amount_aed": num(ln.get("net_amount_aed")),
            }
            for ln in lines
        ],
        "how": how("get_invoice", t.source, "e_invoice + e_invoice_line by uuid/number"),
    }


def get_company_overview(tin: str) -> dict[str, Any]:
    t = tables()
    tp = next((p for p in t.all("taxpayer") if p.get("tin") == tin), None)
    if not tp:
        raise KeyError(f"Unknown tin: {tin}")
    cases = [c for c in t.all("fta_case") if c.get("tin") == tin]
    letters = []
    for c in cases:
        for letter in t.all("letter"):
            if letter.get("case_id") == c.get("case_id") and letter.get("direction") == "FTA_TO_TAXPAYER":
                letters.append(
                    {
                        "letter_id": letter.get("letter_id"),
                        "case_id": letter.get("case_id"),
                        "letter_type": letter.get("letter_type"),
                        "subject": letter.get("subject"),
                        "sent_date": letter.get("sent_date"),
                        "deadline_date": letter.get("deadline_date"),
                    }
                )
    return {
        "tin": tin,
        "trn": tp.get("trn"),
        "name": tp.get("legal_name"),
        "registration": {"vat_status": tp.get("vat_status"),
                         "vat_registration_date": tp.get("vat_registration_date"),
                         "einvoicing_status": tp.get("einvoicing_status")},
        "returns": [{"return_id": r.get("return_id"), "period_code": r.get("period_code"),
                     "due_date": r.get("due_date"), "filing_date": r.get("filing_date")}
                    for r in t.all("vat_return") if r.get("tin") == tin],
        "cases": [
            {
                "case_id": c.get("case_id"),
                "case_type": c.get("case_type"),
                "status": c.get("status"),
                "priority_reason": c.get("priority_reason"),
                "amount_at_stake_aed": num(c.get("amount_at_stake_aed")),
                "deadline_date": c.get("deadline_date"),
            }
            for c in cases
        ],
        "open_letters": letters,
        "how": how("get_company_overview", t.source, "taxpayer + fta_case + letter for tin"),
    }


def match_ledger(tin: str, case_id: str | None = None) -> dict[str, Any]:
    t = tables()
    records = [r for r in t.all("taxpayer_record") if r.get("tin") == tin]
    gap = set()
    if case_id == rules.YASMEEN_CASE or tin == rules.YASMEEN_TIN:
        gap = {
            fi["invoice_uuid"]
            for fi in t.all("finding_invoice")
            if fi.get("finding_id") == "F-1187-01"
        }
        records = [r for r in records if r.get("invoice_uuid") in gap]
    booked_1b = sum(num(r.get("vat_amount_aed")) for r in records if r.get("booked_box") == "1b")
    booked_1a = sum(num(r.get("vat_amount_aed")) for r in records if r.get("booked_box") == "1a")
    by_evidence: dict[str, float] = {}
    for r in records:
        key = r.get("evidence_type") or "UNKNOWN"
        by_evidence[key] = by_evidence.get(key, 0.0) + num(r.get("vat_amount_aed"))
    invoice_names = {e.get("invoice_uuid"): e.get("invoice_number") for e in t.all("e_invoice")}
    matches = []
    for invoice_id in sorted(gap):
        matching = [r for r in records if r.get("invoice_uuid") == invoice_id]
        matches.append({"invoice_uuid": invoice_id, "invoice_number": invoice_names.get(invoice_id),
                        "in_ledger": bool(matching),
                        "records": [{"booked_period_code": r.get("booked_period_code"),
                                     "booked_box": r.get("booked_box"), "booking_date": r.get("booking_date"),
                                     "vat_amount_aed": num(r.get("vat_amount_aed"))} for r in matching]})
    return {
        "tin": tin,
        "company": taxpayer_name(t, tin),
        "record_count": len(records),
        "booked_box_1b_vat_aed": booked_1b,
        "booked_box_1a_vat_aed": booked_1a,
        "by_evidence_type": by_evidence,
        "invoices": matches,
        "sample": [
            {
                "document_number": r.get("document_number"),
                "evidence_type": r.get("evidence_type"),
                "booked_box": r.get("booked_box"),
                "booking_date": r.get("booking_date"),
                "vat_amount_aed": num(r.get("vat_amount_aed")),
                "counterparty_name": r.get("counterparty_name"),
            }
            for r in records[:8]
        ],
        "how": how("match_ledger", t.source, "taxpayer_record filtered to company / finding invoices"),
    }


def check_answer_return(case_id: str = rules.YASMEEN_CASE) -> dict[str, Any]:
    t = tables()
    vds = [v for v in t.all("voluntary_disclosure") if v.get("case_id") == case_id]
    vd_ids = {v["vd_id"] for v in vds}
    boxes = [b for b in t.all("vd_box") if b.get("vd_id") in vd_ids]
    recon = get_return_reconciliation(case_id)
    # Compare corrected VD boxes to e-invoice findings where present
    mismatches = []
    missing_boxes = []
    compared = 0
    for f in recon["findings"]:
        box = f.get("box_code")
        if not box or f.get("einvoice_vat_aed") is None:
            continue
        vd = next((b for b in boxes if b.get("box_code") == box), None)
        if not vd:
            missing_boxes.append(box)
            continue
        compared += 1
        corrected = num(vd.get("corrected_vat_aed"))
        target = num(f.get("einvoice_vat_aed"))
        if abs(corrected - target) > 0.51:
            mismatches.append({"box_code": box, "corrected": corrected, "einvoice": target})
    ok = bool(vds) and compared > 0 and not mismatches and not missing_boxes
    return {
        "case_id": case_id,
        "vd_count": len(vds),
        "vd_boxes": [
            {
                "box_code": b.get("box_code"),
                "reported_vat_aed": num(b.get("reported_vat_aed")),
                "corrected_vat_aed": num(b.get("corrected_vat_aed")),
                "change_vat_aed": num(b.get("change_vat_aed")),
            }
            for b in boxes
        ],
        "matches_einvoices": ok,
        "mismatches": mismatches,
        "missing_boxes": missing_boxes,
        "recommendation": "CLOSE" if ok else "ASK_MORE_OR_AUDIT",
        "how": how("check_answer", t.source, "voluntary_disclosure/vd_box vs case_finding e-invoice targets"),
    }
