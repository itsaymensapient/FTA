"""LangGraph agents: FTA face and Business (FTA Assistant) face — one shared LLM."""

__all__ = [
    "build_fta_graph",
    "run_fta_case",
    "build_assistant_graph",
    "run_assistant_case",
]


def __getattr__(name: str):
    if name in {"build_fta_graph", "run_fta_case"}:
        from agents.fta_agent import build_fta_graph, run_fta_case

        return {"build_fta_graph": build_fta_graph, "run_fta_case": run_fta_case}[name]
    if name in {"build_assistant_graph", "run_assistant_case"}:
        from agents.fta_assistant import build_assistant_graph, run_assistant_case

        return {
            "build_assistant_graph": build_assistant_graph,
            "run_assistant_case": run_assistant_case,
        }[name]
    raise AttributeError(name)
