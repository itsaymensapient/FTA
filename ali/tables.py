"""Load B1 tables from local Postgres or workbook snapshot."""

from __future__ import annotations

from typing import Any

from ali import db

YASMEEN_TIN = "1004821573"
WAHA_TIN = "1002937461"
BRIGHT_TIN = "1007283619"
PERIOD = "2026-08/2026-10"
YASMEEN_CASE = "CDP-VAT-2026-1187"
WAHA_CASE = "CDP-REF-2026-0219"
YASMEEN_RETURN = "VAT201-1004821573-2026-10"
WAHA_RETURN = "VAT201-1002937461-2026-10"


class Tables:
    def __init__(self, tables: dict[str, list[dict[str, Any]]], source: str):
        self.tables = tables
        self.source = source

    def all(self, name: str) -> list[dict[str, Any]]:
        return self.tables.get(name) or []


def load_tables() -> Tables:
    if db.has_postgres():
        names = [
            "taxpayer",
            "e_invoice",
            "vat_return",
            "vat_return_box",
            "fta_case",
            "case_finding",
            "finding_invoice",
            "refund_request",
            "voluntary_disclosure",
            "vd_box",
            "taxpayer_record",
            "case_document",
            "return_obligation",
            "letter",
            "agent_option",
        ]
        tables: dict[str, list[dict[str, Any]]] = {}
        with db.connect() as conn:
            with conn.cursor() as cur:
                for name in names:
                    cur.execute(f"select * from {name}")
                    cols = [d.name for d in cur.description]
                    tables[name] = [dict(zip(cols, row)) for row in cur.fetchall()]
        return Tables(tables, "postgres")

    snap = db.load_snapshot()
    return Tables(snap["tables"], "snapshot")


def num(v: Any) -> float:
    if v is None or v == "":
        return 0.0
    return float(v)
