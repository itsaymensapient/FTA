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
