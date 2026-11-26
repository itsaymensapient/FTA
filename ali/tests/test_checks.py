"""B1 Checks sheet — recompute story numbers from seed data."""

from __future__ import annotations

from ali.checks import run_checks, summarize
from ali.tables import load_tables


def test_data_source_available():
    t = load_tables()
    assert t.source in {"postgres", "snapshot"}
    assert t.all("taxpayer")
    assert t.all("e_invoice")


def test_all_b1_checks_pass():
    results = run_checks()
    summary = summarize(results)
    assert summary["total"] >= 37
    assert summary["failed"] == 0, summary["failures"]


def test_case1_net_gap_is_412000():
    results = {r["id"]: r for r in run_checks()}
    assert results[12]["expected"] == 412000
    assert results[12]["ok"]


def test_case2_refund_parts_sum_to_claimed():
    results = {r["id"]: r for r in run_checks()}
    assert results[37]["ok"]
