"""Named Temporal activities map to real bridge work types."""
from agents.temporal_workflow import activity_name_for


def test_activity_names_for_demo_actions():
    assert activity_name_for({"action": "ask"}) == "ask"
    assert activity_name_for({"action": "case_tool"}) == "case_tool"
    assert activity_name_for({"action": "uc2_step"}) == "uc2_journey"
    assert activity_name_for({"action": "refund_approve"}) == "refund_journey"
    assert activity_name_for({"action": "fta"}) == "fta_agent"
    assert activity_name_for({"action": "assistant"}) == "fta_assistant"
