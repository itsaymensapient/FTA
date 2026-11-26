"""
Tax rules in code (R01–R13 groups) — not in the LLM.

Known stand thresholds from scenario v2.9 / data model v1.2.
"""

from __future__ import annotations

VD_THRESHOLD_AED = 10_000
REFUND_DECISION_BUSINESS_DAYS = 20
CLARIFICATION_BUSINESS_DAYS = 20

YASMEEN_TIN = "1004821573"
WAHA_TIN = "1002937461"
BRIGHT_TIN = "1007283619"

YASMEEN_CASE = "CDP-VAT-2026-1187"
WAHA_CASE = "CDP-REF-2026-0219"
BRIGHT_CASE = "CDP-NF-2026-0733"

PERIOD_AUG_OCT_2026 = "2026-08/2026-10"


def requires_voluntary_disclosure(gap_vat_aed: float) -> bool:
    """Differences above AED 10,000 must be corrected with a VD."""
    return abs(gap_vat_aed) > VD_THRESHOLD_AED


def is_tax_invoice_evidence(evidence_type: str | None) -> bool:
    """Card slips / booking confirmations are not tax invoices for input VAT."""
    t = (evidence_type or "").upper()
    return t in {"PAPER_TAX_INVOICE", "E_INVOICE", "TAX_INVOICE"}


def recoverable_input_vat(evidence_type: str | None, supplier_filing: bool) -> bool:
    if not is_tax_invoice_evidence(evidence_type):
        return False
    return supplier_filing


def weak_option_vd_only_explanation() -> str:
    return (
        "A difference above AED 10,000 must be corrected with a Voluntary Disclosure. "
        "An explanation alone will not close the case."
    )


def weak_option_card_slips() -> str:
    return (
        "Card slips are not tax invoices. The FTA will reject AED 34,200 anyway, "
        "and the return still needs a VD."
    )
