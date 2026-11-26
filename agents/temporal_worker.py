"""Local Temporal worker. Records real bridge work as named activities."""

from __future__ import annotations

import asyncio
import json

from temporalio import activity
from temporalio.client import Client
from temporalio.worker import Worker

from agents.temporal_workflow import AgentRequestWorkflow


async def _run(request: dict) -> dict:
    from agents.bridge import handle

    result = await asyncio.to_thread(handle, request)
    return json.loads(json.dumps(result, default=str))


@activity.defn(name="run_agent_request")
async def run_agent_request(request: dict) -> dict:
    return await _run(request)


@activity.defn(name="ask")
async def ask_activity(request: dict) -> dict:
    return await _run(request)


@activity.defn(name="case_tool")
async def case_tool_activity(request: dict) -> dict:
    return await _run(request)


@activity.defn(name="uc2_journey")
async def uc2_journey_activity(request: dict) -> dict:
    return await _run(request)


@activity.defn(name="refund_journey")
async def refund_journey_activity(request: dict) -> dict:
    return await _run(request)


@activity.defn(name="fta_agent")
async def fta_agent_activity(request: dict) -> dict:
    return await _run(request)


@activity.defn(name="fta_assistant")
async def fta_assistant_activity(request: dict) -> dict:
    return await _run(request)


ACTIVITIES = [
    run_agent_request,
    ask_activity,
    case_tool_activity,
    uc2_journey_activity,
    refund_journey_activity,
    fta_agent_activity,
    fta_assistant_activity,
]


async def main() -> None:
    client = await Client.connect("127.0.0.1:7233")
    worker = Worker(
        client,
        task_queue="fta-agents",
        workflows=[AgentRequestWorkflow],
        activities=ACTIVITIES,
    )
    print("FTA Temporal worker ready", flush=True)
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
