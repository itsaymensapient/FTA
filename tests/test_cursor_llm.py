"""Cursor adapter isolation and output contract, without external model usage."""
import json
import subprocess
from types import SimpleNamespace

import pytest

import cursor_llm


@pytest.fixture
def runtime(tmp_path, monkeypatch):
    directory = tmp_path / "cli"
    directory.mkdir()
    (directory / "node.exe").touch()
    (directory / "index.js").touch()
    monkeypatch.setenv("CURSOR_CLI_DIR", str(directory))
    return directory


def test_cursor_uses_isolated_ask_mode_and_environment_key(runtime, monkeypatch):
    seen = {}
    def run(args, **kwargs):
        seen.update(args=args, **kwargs)
        config = json.loads((__import__('pathlib').Path(kwargs['env']['CURSOR_CONFIG_DIR'])/'cli-config.json').read_text())
        assert 'Shell(*)' in config['permissions']['deny']
        assert 'Write(**)' in config['permissions']['deny']
        return SimpleNamespace(returncode=0, stdout=json.dumps({'type':'result','is_error':False,'result':'Actual model reply'}), stderr='')
    monkeypatch.setattr(cursor_llm, '_run_cli', run)
    model = cursor_llm.CursorChatModel(api_key='cursor-secret', model='auto', timeout=60)
    response = model.invoke([SimpleNamespace(type='system',content='approved rules'),SimpleNamespace(type='human',content='tool evidence')])
    assert response.content == 'Actual model reply'
    assert seen['env']['CURSOR_API_KEY'] == 'cursor-secret'
    assert 'OPENAI_API_KEY' not in seen['env']
    assert 'LOCAL_PGPASSWORD' not in seen['env']
    assert 'cursor-secret' not in ' '.join(seen['args'])
    assert '--mode' in seen['args'] and 'ask' in seen['args']
    assert '--force' not in seen['args']
    assert '--yolo' not in seen['args']
    assert 'tool evidence' in seen['args'][-1]


def test_cursor_errors_do_not_leak_provider_output(runtime, monkeypatch):
    monkeypatch.setattr(cursor_llm,'_run_cli',lambda *a,**k:SimpleNamespace(returncode=1,stdout='',stderr='The provided API key is invalid. cursor-secret'))
    with pytest.raises(cursor_llm.CursorError) as caught:
        cursor_llm.CursorChatModel(api_key='cursor-secret').invoke([])
    assert 'cursor-secret' not in str(caught.value)
    assert 'authentication' in str(caught.value).lower()


def test_cursor_timeout_is_clear(runtime, monkeypatch):
    def run(*a,**k):
        raise subprocess.TimeoutExpired('node',60)
    monkeypatch.setattr(cursor_llm,'_run_cli',run)
    with pytest.raises(cursor_llm.CursorError,match='timed out'):
        cursor_llm.CursorChatModel(api_key='test').invoke([])


def test_cursor_invalid_json_is_not_a_success(runtime, monkeypatch):
    monkeypatch.setattr(cursor_llm,'_run_cli',lambda *a,**k:SimpleNamespace(returncode=0,stdout='not JSON',stderr=''))
    with pytest.raises(cursor_llm.CursorError,match='valid'):
        cursor_llm.CursorChatModel(api_key='test').invoke([])


def test_cursor_missing_runtime_is_clear(tmp_path, monkeypatch):
    monkeypatch.setenv('CURSOR_CLI_DIR',str(tmp_path/'missing'))
    with pytest.raises(cursor_llm.CursorError,match='CLI'):
        cursor_llm.CursorChatModel(api_key='test').invoke([])
