"""Temporal workflow for real demo agent / journey calls (named activities)."""

from __future__ import annotations

from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

_TIMEOUT = timedelta(minutes=5)
_RETRY = RetryPolicy(maximum_attempts=1)


def activity_name_for(request: dict) -> str:
    action = str(request.get("action") or "").strip().lower()
    if action == "ask":
        return "ask"
    if action == "case_tool":
        return "case_tool"
    if action.startswith("uc2_"):
        return "uc2_journey"
    if action.startswith("refund_"):
        return "refund_journey"
    if action in {"fta", "run_fta"}:
        return "fta_agent"
    if action in {"assistant", "run_assistant", "business"}:
        return "fta_assistant"
    return "run_agent_request"


@workflow.defn(name="FTA Agent Request")
class AgentRequestWorkflow:
    @workflow.run
    async def run(self, request: dict) -> dict:
        name = activity_name_for(request)
        return await workflow.execute_activity(
            name,
            request,
            start_to_close_timeout=_TIMEOUT,
            retry_policy=_RETRY,
        )
