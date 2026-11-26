from ali.agents.ask_agent import answer_question, pick_tool


def test_routes_refund_question():
    assert pick_tool("What is the Al Waha refund split?") == "waha_refund_split"


def test_routes_yasmeen_gap():
    assert pick_tool("Show the Box 1b gap for Yasmeen") == "yasmeen_box_gaps"


def test_answer_open_cases():
    out = answer_question("What open cases need attention?", persist=False)
    assert out["tool"] == "list_open_cases"
    assert "CDP-VAT-2026-1187" in out["answer"]
    assert out["source"] in {"postgres", "snapshot"}


def test_business_yasmeen_refuses_waha_question():
    out = answer_question("What is the Al Waha refund split?", persist=False, demo_company="yasmeen")
    assert out["tool"] is None
    assert "own company" in out["answer"].lower()


def test_business_waha_refuses_yasmeen_question():
    out = answer_question("Show Yasmeen Box 1b gap", persist=False, demo_company="waha")
    assert out["tool"] is None
    assert "own company" in out["answer"].lower()


def test_business_yasmeen_scoped_tool():
    out = answer_question("Show the Box 1b gap for Yasmeen", persist=False, demo_company="yasmeen")
    assert out["tool"] == "yasmeen_box_gaps"
    assert "CDP-VAT-2026-1187" in out["answer"] or "Box" in out["answer"]


def test_business_unknown_company_raises():
    import pytest
    with pytest.raises(ValueError):
        answer_question("Anything", persist=False, demo_company="other")
