"""Unit tests are deterministic: no paid model requests or demo DB mutations."""
import pytest


@pytest.fixture(autouse=True)
def isolate_external_services(monkeypatch):
    monkeypatch.setenv("LLM_MODE", "offline")
    # The local-only DB adapter rejects this host and uses the snapshot.
    monkeypatch.setenv("LOCAL_PGHOST", "unit-test.invalid")
