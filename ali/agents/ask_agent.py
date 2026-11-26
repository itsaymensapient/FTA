"""
Free-question agent (Ali).

Routes a natural-language question to a read-only query tool and formats
the answer. No LangGraph / FTA action tools (those stay with Sulieman).
"""

from __future__ import annotations

import json
import re
import uuid
from typing import Any

from ali import db
from ali.tables import load_tables
from ali.tools.query_tools import QUERY_TOOLS, run_query_tool

ROUTES: list[tuple[str, re.Pattern[str]]] = [
    ("bright_line_status", re.compile(r"bright\s*line|non[-\s]?filer|supplier\s+not\s+fil", re.I)),
    ("waha_refund_split", re.compile(r"waha|refund|partial\s+approv|on\s+hold", re.I)),
    ("yasmeen_gap_invoices", re.compile(r"invoice\s+list|38\s+invoice|gap\s+invoice|show\s+invoice", re.I)),
    ("yasmeen_box_gaps", re.compile(r"yasmeen|box\s*1b|under[-\s]?declar|return\s+vs|e-?invoice\s+gap", re.I)),
    ("compare_return_vs_einvoices", re.compile(r"compar(e|ison)|reconcil|by\s+box", re.I)),
    ("list_open_cases", re.compile(r"open\s+cases|what\s+cases|briefing|high\s+risk|list\s+cases", re.I)),
]


def pick_tool(question: str) -> str:
    for name, pattern in ROUTES:
        if pattern.search(question):
            return name
    return "list_open_cases"


def _fmt_money(n: Any) -> str:
    try:
        return f"AED {float(n):,.0f}"
    except (TypeError, ValueError):
        return str(n)


def format_answer(tool: str, data: dict[str, Any]) -> str:
    if tool == "list_open_cases":
        lines = [f"There are {data['count']} demo cases:"]
        for c in data["cases"]:
            lines.append(
                f"- {c['case_id']} · {c['company']} · {c['priority_reason']} · {_fmt_money(c['amount_at_stake_aed'])}"
            )
        return "\n".join(lines)

    if tool == "yasmeen_box_gaps":
        co = data["company"]["name"]
        lines = [f"{co} · case {data['case_id']}"]
        for f in data["findings"]:
            lines.append(
                f"- Box {f['box_code']}: gap {_fmt_money(f['gap_vat_aed'])} "
                f"(return {_fmt_money(f['declared_vat_aed'])} vs e-invoices {_fmt_money(f['einvoice_vat_aed'])})"
            )
        return "\n".join(lines)

    if tool == "yasmeen_gap_invoices":
        lines = [f"{data['total']} invoices behind the Box 1b gap (showing {data['showing']}):"]
        for inv in data["invoices"]:
            lines.append(
                f"- {inv['invoice_number']} · {inv['issue_date']} · {inv['buyer']} · {_fmt_money(inv['vat_amount_aed'])}"
            )
        return "\n".join(lines)

    if tool == "waha_refund_split":
        co = data["company"]["name"]
        lines = [
            f"{co} refund claim {_fmt_money(data['claimed_aed'])} "
            f"(due {data['decision_due_date']}):",
            f"- Approved {_fmt_money(data['approved_aed'])}",
            f"- Rejected {_fmt_money(data['rejected_aed'])}",
            f"- On hold {_fmt_money(data['on_hold_aed'])}",
        ]
        return "\n".join(lines)

    if tool == "bright_line_status":
        co = data["company"]["name"]
        lines = [
            f"{co}: {_fmt_money(data['vat_on_invoices_to_al_waha_aed'])} VAT on invoices to Al Waha.",
            "Return obligations:",
        ]
        for o in data["obligations"]:
            lines.append(f"- {o['period_code']} · {o['status']} · due {o['due_date']}")
        return "\n".join(lines)

    if tool == "compare_return_vs_einvoices":
        co = data["company"]["name"]
        lines = [f"{co} · period {data['period_code']}"]
        for b in data["boxes"]:
            lines.append(
                f"- Box {b['box_code']}: {_fmt_money(b['gap_vat_aed'])} gap"
            )
        return "\n".join(lines)

    return json.dumps(data, indent=2, default=str)


def answer_question(question: str, session_id: str | None = None, persist: bool = True) -> dict[str, Any]:
    tables = load_tables()
    tool = pick_tool(question)
    raw = run_query_tool(tool, t=tables)
    answer = format_answer(tool, raw)
    result = {
        "question": question,
        "tool": tool,
        "source": tables.source,
        "answer": answer,
        "data": raw,
        "available_tools": sorted(QUERY_TOOLS),
    }

    if persist and db.has_postgres():
        ask_id = f"ASK-{uuid.uuid4().hex[:12]}"
        try:
            db.apply_app_schema()
            db.execute(
                """
                insert into app.ask_log (ask_id, session_id, question_text, answer_text, tool_name, result_json)
                values (%s, %s, %s, %s, %s, %s::jsonb)
                """,
                (
                    ask_id,
                    session_id,
                    question,
                    answer,
                    tool,
                    json.dumps(raw, default=str),
                ),
            )
            result["ask_id"] = ask_id
        except Exception as err:  # noqa: BLE001 — demo path should still answer
            result["persist_error"] = str(err)

    return result


def main() -> None:
    import sys

    q = " ".join(sys.argv[1:]).strip() or "What open cases need attention?"
    out = answer_question(q, persist=False)
    print(f"[{out['source']} · {out['tool']}]\n")
    print(out["answer"])


if __name__ == "__main__":
    main()
