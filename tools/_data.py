"""Shared table access for tax tools (Postgres or workbook snapshot)."""

from __future__ import annotations

from typing import Any

from ali.tables import Tables, load_tables, num


def tables() -> Tables:
    return load_tables()


def how(tool: str, source: str, detail: str) -> dict[str, str]:
    return {
        "tool": tool,
        "source": source,
        "note": f"How I got this: {detail} (data source={source})",
    }


def taxpayer_name(t: Tables, tin: str) -> str:
    row = next((p for p in t.all("taxpayer") if p.get("tin") == tin), None)
    return (row or {}).get("legal_name") or tin


def case_row(t: Tables, case_id: str) -> dict[str, Any] | None:
    return next((c for c in t.all("fta_case") if c.get("case_id") == case_id), None)


def finding_rows(t: Tables, case_id: str) -> list[dict[str, Any]]:
    return [f for f in t.all("case_finding") if f.get("case_id") == case_id]


__all__ = ["tables", "how", "num", "taxpayer_name", "case_row", "finding_rows", "Tables"]
