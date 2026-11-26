"""Shared provider behavior; no external requests or database writes."""
from types import SimpleNamespace

import pytest

import llm


@pytest.fixture(autouse=True)
def isolated_provider(monkeypatch):
    monkeypatch.setattr(llm, "load_dotenv", lambda: None)
    for key in ("OPENAI_API_KEY", "LLM_API_KEY", "OPENAI_BASE_URL", "LLM_BASE_URL"):
        monkeypatch.delenv(key, raising=False)
    monkeypatch.setenv("LLM_MODE", "auto")
    monkeypatch.setenv("LLM_PROVIDER", "openai")


def test_missing_key_is_explicitly_offline():
    assert llm.get_llm_status()["mode"] == "offline"
    assert llm.narrate("rules", "facts", fallback="tool answer") == "tool answer"


def test_live_mode_requires_key(monkeypatch):
    monkeypatch.setenv("LLM_MODE", "live")
    with pytest.raises(llm.LLMError, match="OPENAI_API_KEY"):
        llm.get_chat_model()


def test_offline_mode_never_calls_provider(monkeypatch):
    monkeypatch.setenv("LLM_MODE", "offline")
    monkeypatch.setenv("OPENAI_API_KEY", "test-secret")
    assert llm.get_chat_model() is None


def test_live_narration_uses_messages(monkeypatch):
    calls = []
    def invoke(messages):
        calls.append(messages)
        return SimpleNamespace(content="Evidence-backed explanation")
    monkeypatch.setattr(llm, "get_chat_model", lambda: SimpleNamespace(invoke=invoke))
    assert llm.narrate("approved rules", "tool evidence", fallback="offline") == "Evidence-backed explanation"
    assert calls[0][0].content == "approved rules"
    assert calls[0][1].content == "tool evidence"


def test_provider_error_never_exposes_exception_contents(monkeypatch):
    def invoke(_):
        raise RuntimeError("secret-api-key and private provider response")
    monkeypatch.setattr(llm, "get_chat_model", lambda: SimpleNamespace(invoke=invoke))
    with pytest.raises(llm.LLMError) as caught:
        llm.narrate("rules", "facts", fallback="offline")
    assert "secret-api-key" not in str(caught.value)
    assert "private provider" not in str(caught.value)


def test_empty_live_answer_is_not_a_success(monkeypatch):
    monkeypatch.setattr(llm, "get_chat_model", lambda: SimpleNamespace(invoke=lambda _: SimpleNamespace(content="")))
    with pytest.raises(llm.LLMError, match="empty"):
        llm.narrate("rules", "facts", fallback="offline")


def test_status_never_exposes_key_or_endpoint_query(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test-secret")
    monkeypatch.setenv("OPENAI_BASE_URL", "https://example.invalid/v1?secret=hidden")
    status = llm.get_llm_status()
    assert status["mode"] == "live"
    assert "test-secret" not in str(status)
    assert "hidden" not in str(status)


def test_query_choice_is_allowlisted(monkeypatch):
    monkeypatch.setattr(llm, "get_chat_model", lambda: SimpleNamespace(invoke=lambda _: SimpleNamespace(content='{"tool":"delete_all"}')))
    with pytest.raises(llm.LLMError, match="allowed"):
        llm.select_read_tool("delete records", {"read_cases": "Read cases"}, fallback="read_cases")


def test_query_choice_can_select_a_read_tool(monkeypatch):
    monkeypatch.setattr(llm, "get_chat_model", lambda: SimpleNamespace(invoke=lambda _: SimpleNamespace(content='{"tool":"read_cases"}')))
    assert llm.select_read_tool("show cases", {"read_cases": "Read cases"}, fallback="read_cases") == "read_cases"


def test_probe_requires_a_live_provider():
    result = llm.test_connection()
    assert result["ok"] is False
    assert result["verified"] is False


def test_wrapped_quota_error_has_useful_safe_message(monkeypatch):
    class WrappedProviderError(Exception):
        status_code = 429
    def invoke(_):
        raise WrappedProviderError("private provider body")
    monkeypatch.setattr(llm, "get_chat_model", lambda: SimpleNamespace(invoke=invoke))
    with pytest.raises(llm.LLMError, match="billing"):
        llm.narrate("rules", "facts", fallback="offline")


def test_cursor_provider_uses_its_own_key_and_model(monkeypatch):
    monkeypatch.setenv('LLM_PROVIDER','cursor')
    monkeypatch.setenv('CURSOR_API_KEY','cursor-secret')
    monkeypatch.setenv('OPENAI_API_KEY','openai-secret')
    monkeypatch.setenv('CURSOR_MODEL','auto')
    status=llm.get_llm_status()
    assert status['provider']=='cursor'
    assert status['model']=='auto'
    assert llm.get_llm_config()['api_key']=='cursor-secret'
