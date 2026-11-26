"""UC2 tools must match B1 story numbers (Al Yasmeen)."""

from __future__ import annotations

import rules
from tools import (
    get_briefing,
    get_invoice,
    get_options,
    get_return_reconciliation,
    list_finding_invoices,
    send_letter,
)


def test_briefing_ranks_open_cases():
    out = get_briefing()
    assert out["count"] >= 2
    assert out["cases"][0]["risk_level"]
    assert "How I got this" in out["how"]["note"]


def test_yasmeen_return_reconciliation_gaps():
    recon = get_return_reconciliation(rules.YASMEEN_CASE)
    assert recon["company"]
    assert recon["box_1b_gap_aed"] == 486200
    assert recon["net_gap_aed"] == 412000
    assert recon["requires_vd"] is True
    assert recon["how"]["tool"] == "get_return_reconciliation"


def test_list_finding_invoices_f1187():
    inv = list_finding_invoices("F-1187-01", limit=5)
    assert inv["total"] >= 5
    assert inv["showing"] == 5
    assert abs(inv["total_vat_aed"] - 486200) < 1.0 or inv["total"] >= 30


def test_get_invoice_by_sample():
    inv_list = list_finding_invoices("F-1187-01", limit=1)
    sample = inv_list["invoices"][0]
    detail = get_invoice(invoice_uuid=sample["invoice_uuid"])
    assert detail["invoice_uuid"] == sample["invoice_uuid"]
    assert detail["vat_amount_aed"] is not None


def test_get_options_fta_return_case():
    opts = get_options("RETURN_VS_EINVOICES", "FTA_SPECIALIST")
    assert opts["options"]
    assert any(o.get("recommended") for o in opts["options"])


def test_send_letter_refuses_without_confirm():
    blocked = send_letter(rules.YASMEEN_CASE, confirm=False)
    assert blocked["ok"] is False
    assert blocked["requires_human_send"] is True
