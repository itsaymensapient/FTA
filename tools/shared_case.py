"""Shared case actions: options, letters, VD/reply drafts, submit/close (human-gated)."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

import rules
from tools._data import case_row, how, num, tables, taxpayer_name


def get_options(case_type: str, side: str) -> dict[str, Any]:
    t = tables()
    rows = [
        o
        for o in t.all("agent_option")
        if o.get("case_type") == case_type and o.get("side") == side
    ]
    rows = sorted(rows, key=lambda o: int(o.get("sort_order") or 0))
    options = []
    for o in rows:
        item = {
            "option_id": o.get("option_id"),
            "label": o.get("label"),
            "recommended": str(o.get("recommended")).upper() in {"Y", "YES", "TRUE", "1"},
            "next_action": o.get("next_action"),
            "weak_option_reply": o.get("weak_option_reply"),
        }
        options.append(item)
    return {
        "case_type": case_type,
        "side": side,
        "options": options,
        "how": how("get_options", t.source, f"agent_option where case_type={case_type} side={side}"),
    }


def draft_letter(case_id: str, letter_type: str = "REQUEST") -> dict[str, Any]:
    t = tables()
    case = case_row(t, case_id)
    if not case:
        raise KeyError(f"Unknown case_id: {case_id}")
    existing = next(
        (
            l
            for l in t.all("letter")
            if l.get("case_id") == case_id
            and l.get("letter_type") == letter_type
            and l.get("direction") == "FTA_TO_TAXPAYER"
        ),
        None,
    )
    company = taxpayer_name(t, case.get("tin"))
    if existing:
        draft = {
            "letter_id": existing.get("letter_id"),
            "case_id": case_id,
            "letter_type": letter_type,
            "subject": existing.get("subject"),
            "body_text": existing.get("body_text"),
            "deadline_date": existing.get("deadline_date"),
            "from_seed": True,
        }
    else:
        draft = {
            "letter_id": f"DRAFT-{case_id}-{letter_type}",
            "case_id": case_id,
            "letter_type": letter_type,
            "subject": f"{letter_type} · {company}",
            "body_text": (
                f"To {company}. Regarding case {case_id} "
                f"({case.get('priority_reason')}). Please respond by {case.get('deadline_date')}."
            ),
            "deadline_date": case.get("deadline_date"),
            "from_seed": False,
        }
    return {
        "draft": draft,
        "status": "DRAFT",
        "requires_human_send": True,
        "how": how("draft_letter", t.source, "letter template filled from fta_case / seeded letter"),
    }


def send_letter(case_id: str, confirm: bool = False, letter_type: str = "REQUEST") -> dict[str, Any]:
    if not confirm:
        return {
            "ok": False,
            "error": "People decide: pass confirm=True to Send. Nothing was sent.",
            "requires_human_send": True,
        }
    # A session log is not a delivered message or a persisted demo operation.
    # Fail closed until the approved transactional operation flow is implemented.
    return {"ok": False, "status": "NOT_SENT", "error": "Send is unavailable until the demo operation can be persisted and verified."}


def prepare_vd(case_id: str, tin: str | None = None) -> dict[str, Any]:
    t = tables()
    case = case_row(t, case_id)
    tin = tin or (case or {}).get("tin")
    vds = [v for v in t.all("voluntary_disclosure") if v.get("case_id") == case_id or v.get("tin") == tin]
    boxes = []
    if vds:
        vd_ids = {v["vd_id"] for v in vds}
        boxes = [
            {
                "box_code": b.get("box_code"),
                "reported_vat_aed": num(b.get("reported_vat_aed")),
                "corrected_vat_aed": num(b.get("corrected_vat_aed")),
                "change_vat_aed": num(b.get("change_vat_aed")),
            }
            for b in t.all("vd_box")
            if b.get("vd_id") in vd_ids
        ]
    elif case_id == rules.YASMEEN_CASE:
        boxes = [
            {"box_code": "1a", "reported_vat_aed": 288800, "corrected_vat_aed": 214600, "change_vat_aed": -74200},
            {"box_code": "1b", "reported_vat_aed": 1140000, "corrected_vat_aed": 1626200, "change_vat_aed": 486200},
            {"box_code": "14", "reported_vat_aed": 823100, "corrected_vat_aed": 1235100, "change_vat_aed": 412000},
        ]
    return {
        "case_id": case_id,
        "tin": tin,
        "vd_draft": {"boxes": boxes, "status": "PREPARED"},
        "requires_human_submit": True,
        "how": how("prepare_vd", t.source, "vd_box seed or scenario correction draft"),
    }


def prepare_reply(case_id: str, side: str = "BUSINESS") -> dict[str, Any]:
    t = tables()
    letter = next(
        (
            l
            for l in t.all("letter")
            if l.get("case_id") == case_id and l.get("direction") == "TAXPAYER_TO_FTA"
        ),
        None,
    )
    if letter:
        body = letter.get("body_text")
        subject = letter.get("subject")
    else:
        case = case_row(t, case_id)
        body = f"Reply to {case_id}: please find our explanation / documents attached."
        subject = f"Reply to {case_id}"
    return {
        "case_id": case_id,
        "side": side,
        "reply_draft": {"subject": subject, "body_text": body},
        "requires_human_submit": True,
        "how": how("prepare_reply", t.source, "seeded taxpayer reply letter or template"),
    }


def request_extension(case_id: str) -> dict[str, Any]:
    """Prepare an extension draft. Submit/grant/deny happen on the demo journey (uc2/refund)."""
    t = tables()
    case = case_row(t, case_id)
    if not case:
        raise KeyError(f"Unknown case_id: {case_id}")
    return {
        "case_id": case_id,
        "status": "DRAFT",
        "request": {"subject": f"Request for extension · {case_id}",
                    "body_text": f"Please consider an extension to respond to case {case_id}.",
                    "current_deadline": case.get("deadline_date")},
        "requires_human_submit": True,
        "how": how(
            "request_extension",
            t.source,
            "case deadline used to prepare an extension request; grant/deny via demo journey steps",
        ),
    }


def submit(case_id: str, confirm: bool = False, include_vd: bool = True) -> dict[str, Any]:
    if not confirm:
        return {
            "ok": False,
            "error": "People decide: pass confirm=True to Submit. Nothing was submitted.",
            "requires_human_submit": True,
        }
    # A log entry alone does not prove submission; fail closed until persisted.
    return {"ok": False, "status": "NOT_SUBMITTED", "error": "Submit is unavailable until the demo operation can be persisted and verified."}


def close_case(case_id: str, confirm: bool = False, outcome: str | None = None) -> dict[str, Any]:
    if not confirm:
        return {
            "ok": False,
            "error": "People decide: pass confirm=True to Close. Case not closed.",
            "requires_human_close": True,
        }
    if case_id == rules.YASMEEN_CASE:
        return {'ok': False, 'status': 'NOT_CLOSED', 'error': 'Use the approved demo journey to verify and close this case.'}
    t = tables()
    case = case_row(t, case_id)
    outcome = outcome or (case or {}).get("outcome") or "CLOSED"
    result = {
        "ok": True,
        "case_id": case_id,
        "status": "CLOSED",
        "outcome": outcome,
        "how": how("close_case", t.source, "human-confirmed close; outcome from case or argument"),
    }
    try:
        from ali import db

        if db.has_postgres():
            db.apply_app_schema()
            action_id = f"ACT-{uuid.uuid4().hex[:12]}"
            db.execute(
                """
                insert into app.session_action
                  (action_id, session_id, action_ts, case_id, step, action, meta)
                values (%s, %s, %s, %s, %s, %s, %s::jsonb)
                """,
                (
                    action_id,
                    "CLI-SESSION",
                    datetime.now(timezone.utc).replace(tzinfo=None),
                    case_id,
                    "CLOSED",
                    "close_case",
                    json.dumps({"outcome": outcome}, default=str),
                ),
            )
    except Exception as err:  # noqa: BLE001
        result["persist_error"] = str(err)
    return result
