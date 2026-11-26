"""UC3 refund tools (Al Waha + Bright Line) — amounts match B1 checks / seed."""

from __future__ import annotations

import rules
from tools import check_answer_refund, get_refund_breakdown, get_supplier_status, submit


def test_refund_breakdown_waha():
    out = get_refund_breakdown(rules.WAHA_CASE)
    assert out["claimed_aed"] == 284600
    assert out["supported_by_einvoices_aed"] == 53600
    assert out["not_recoverable_card_slips_aed"] == 34200
    assert out["bright_line_on_hold_aed"] == 46800
    assert "How I got this" in out["how"]["note"]


def test_supplier_status_bright_line():
    out = get_supplier_status(rules.BRIGHT_TIN)
    assert out["company"]
    assert out["filing"] is False
    assert out["non_filer_case_id"] == rules.BRIGHT_CASE


def test_check_answer_refund():
    out = check_answer_refund(rules.WAHA_CASE)
    assert out["recommendation"]["action"] == "PARTIAL_DECISION"
    assert out["recommendation"]["reject_aed"] == 34200
    assert out["recommendation"]["hold_aed"] == 46800


def test_submit_refuses_without_confirm():
    blocked = submit(rules.YASMEEN_CASE, confirm=False)
    assert blocked["ok"] is False
    assert blocked["requires_human_submit"] is True
