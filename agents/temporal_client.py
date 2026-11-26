"""Submit agent calls to the local Temporal worker."""
import asyncio
import uuid
from temporalio.client import Client
from agents.temporal_workflow import AgentRequestWorkflow

async def _execute(request: dict) -> dict:
    client = await Client.connect("127.0.0.1:7233")
    workflow_id = f"fta-{request['action']}-{uuid.uuid4()}"
    result = await client.execute_workflow(AgentRequestWorkflow.run, request, id=workflow_id, task_queue="fta-agents")
    result["temporal"] = {"workflow_id": workflow_id, "ui": "http://localhost:8233"}
    return result

def execute(request: dict) -> dict:
    return asyncio.run(_execute(request))
