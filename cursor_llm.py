"""Local-demo Cursor CLI provider. No repository access or business-action tools."""
from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import tempfile
from types import SimpleNamespace


class CursorError(RuntimeError):
    pass


def _run_cli(args, *, input, timeout, **kwargs):
    """Own the child tree so a Windows timeout cannot leave an inference worker running."""
    # Files avoid Windows pipe-reader hangs when a CLI helper inherits stdout.
    kwargs.pop("text",None)
    kwargs.pop("encoding",None)
    with tempfile.TemporaryFile(mode="w+",encoding="utf-8") as output, tempfile.TemporaryFile(mode="w+",encoding="utf-8") as errors:
        process = subprocess.Popen(args,stdin=subprocess.DEVNULL,stdout=output,stderr=errors,**kwargs)
        try:
            process.wait(timeout=timeout)
        except subprocess.TimeoutExpired:
            if os.name == "nt":
                subprocess.run(["taskkill","/PID",str(process.pid),"/T","/F"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=10,creationflags=getattr(subprocess,"CREATE_NO_WINDOW",0))
            process.kill()
            process.wait(timeout=5)
            output.seek(0); errors.seek(0)
            raise subprocess.TimeoutExpired(args,timeout,output=output.read(),stderr=errors.read()) from None
        output.seek(0); errors.seek(0)
        stdout, stderr = output.read(), errors.read()
        return subprocess.CompletedProcess(args,process.returncode,stdout,stderr)


class CursorChatModel:
    def __init__(self, *, api_key: str, model: str = "auto", timeout: float = 60):
        self.api_key, self.model, self.timeout = api_key, model, timeout

    def invoke(self, messages):
        default = Path(os.environ.get("LOCALAPPDATA", "")) / "cursor-agent" / "fta-demo-2026.11.22-e9042b2" / "dist-package"
        runtime = Path(os.environ.get("CURSOR_CLI_DIR") or default)
        node, entry = runtime / "node.exe", runtime / "index.js"
        if not node.is_file() or not entry.is_file():
            raise CursorError("Cursor CLI is unavailable. Set CURSOR_CLI_DIR to its installed dist-package directory.")
        prompt = json.dumps({
            "instruction": "Act only as the language-model component of this synthetic FTA demo. Follow the approved system messages. "
                           "Use only the supplied evidence. Do not access files, run commands, call tools or browse. "
                           "Return only the requested answer (or JSON when requested), without markdown fences. Be concise.",
            "messages": [{"role": getattr(m,"type","human"), "content": m.content} for m in messages],
        }, ensure_ascii=False)
        if len(prompt) > 24000:
            raise CursorError("The Cursor demo request is too large. Retrieve a smaller evidence summary.")
        # Do not inherit database/OpenAI credentials or the user's global CLI/MCP configuration.
        keep = {"PATH","PATHEXT","SYSTEMROOT","WINDIR","COMSPEC","TEMP","TMP","USERPROFILE","LOCALAPPDATA","APPDATA","PROGRAMFILES","PROGRAMFILES(X86)","HTTP_PROXY","HTTPS_PROXY","NO_PROXY","NODE_EXTRA_CA_CERTS"}
        env = {k:v for k,v in os.environ.items() if k.upper() in keep}
        env.update(CURSOR_API_KEY=self.api_key, NO_COLOR="1", NO_OPEN_BROWSER="1", CI="1")
        with tempfile.TemporaryDirectory(prefix="fta-cursor-",ignore_cleanup_errors=True) as temporary:
            workspace = Path(temporary) / "workspace"
            config_dir = Path(temporary) / "config"
            workspace.mkdir(); config_dir.mkdir()
            config = {
                "version": 1, "editor": {"vimMode": False},
                "network": {"useHttp1ForAgent": True},
                "permissions": {"allow": [], "deny": [
                    "Read(**)","Read(/**)","Read(C:/**)","Read(D:/**)",
                    "Write(**)","Write(/**)","Write(C:/**)","Write(D:/**)",
                    "Shell(*)","WebFetch(*)","Mcp(*:*)",
                ]},
            }
            (config_dir / "cli-config.json").write_text(json.dumps(config),encoding="utf-8")
            (workspace / ".cursor").mkdir()
            (workspace / ".cursor" / "cli.json").write_text(json.dumps({"permissions":config["permissions"]}),encoding="utf-8")
            env["CURSOR_CONFIG_DIR"] = str(config_dir)
            args = [str(node), str(entry), "--print", "--mode", "ask", "--output-format", "json", "--trust", "--model", self.model, prompt]
            try:
                completed = _run_cli(args,input=None,text=True,encoding="utf-8",
                    cwd=workspace,env=env,timeout=self.timeout,creationflags=getattr(subprocess,"CREATE_NO_WINDOW",0))
            except subprocess.TimeoutExpired:
                raise CursorError("Cursor model request timed out. Retry or adjust CURSOR_REQUEST_TIMEOUT.") from None
            except OSError:
                raise CursorError("Cursor CLI could not start. Check the installation and runtime path.") from None
            if completed.returncode:
                error = completed.stderr.lower()
                if any(s in error for s in ("unauthorized","unauthenticated","invalid key","key is invalid","authentication","not authenticated","401")):
                    raise CursorError("Cursor authentication failed. Check CURSOR_API_KEY and account access.")
                if any(s in error for s in ("quota","limit","credit","429")):
                    raise CursorError("Cursor usage limit reached. Check the Cursor account's usage and plan.")
                raise CursorError("Cursor CLI request failed. Check account access, model availability and network connectivity.")
            try:
                result = json.loads(completed.stdout)
            except ValueError:
                raise CursorError("Cursor CLI did not return valid JSON output.") from None
            if not isinstance(result,dict) or result.get("is_error") or not isinstance(result.get("result"),str) or not result["result"].strip():
                raise CursorError("Cursor CLI did not return a valid model answer.")
            return SimpleNamespace(content=result["result"].strip(),usage_metadata=None)
