"""
Local Postgres connection for the GITEX stand.

Uses LOCAL_PG* from .env (never commit secrets). Falls back to the workbook
snapshot when Postgres is not configured or unreachable.
"""

from __future__ import annotations

import json
import os
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_PATH = ROOT / "db" / "snapshot.json"
SCHEMA_B1 = ROOT / "db" / "schema.sql"
SCHEMA_APP = ROOT / "db" / "schema_app.sql"


def load_dotenv(path: Path | None = None) -> None:
    env_path = path or (ROOT / ".env")
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key, value = key.strip(), value.strip()
        if key and key not in os.environ:
            os.environ[key] = value


def is_local_host(host: str | None) -> bool:
    return not host or host in {"127.0.0.1", "localhost"}


def pg_settings() -> dict[str, Any] | None:
    """Return local Postgres DSN parts, or None if not configured."""
    load_dotenv()
    host = os.environ.get("LOCAL_PGHOST") or "127.0.0.1"
    if not is_local_host(host):
        # Explicitly local-only for now (Azure later).
        return None
    user = os.environ.get("LOCAL_PGUSER")
    # Empty password is allowed when LOCAL_PGPASSWORD is set (even to "").
    if not user or "LOCAL_PGPASSWORD" not in os.environ:
        return None
    password = os.environ.get("LOCAL_PGPASSWORD") or ""
    return {
        "host": host,
        "port": int(os.environ.get("LOCAL_PGPORT") or 5432),
        "dbname": os.environ.get("LOCAL_PGDATABASE") or "gitex_stand",
        "user": user,
        "password": password,
        "sslmode": os.environ.get("LOCAL_PGSSLMODE") or "disable",
    }


def has_postgres() -> bool:
    cfg = pg_settings()
    if not cfg:
        return False
    try:
        import psycopg

        with psycopg.connect(**cfg, connect_timeout=2) as conn:
            conn.execute("select 1")
        return True
    except Exception:
        return False


@contextmanager
def connect() -> Iterator[Any]:
    cfg = pg_settings()
    if not cfg:
        raise RuntimeError(
            "Local Postgres not configured. Add LOCAL_PGUSER and LOCAL_PGPASSWORD to .env "
            "(see .env.example), then run: cd db && npm run migrate:seed"
        )
    import psycopg

    conn = psycopg.connect(**cfg)
    try:
        yield conn
    finally:
        conn.close()


def load_snapshot() -> dict[str, Any]:
    if not SNAPSHOT_PATH.exists():
        raise FileNotFoundError(
            f"Missing {SNAPSHOT_PATH}. Run: cd db && npm run snapshot"
        )
    return json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))


def data_source() -> str:
    if has_postgres():
        return "postgres"
    if SNAPSHOT_PATH.exists():
        return "snapshot"
    return "none"


def fetch_all(sql: str, params: tuple | dict | None = None) -> list[dict[str, Any]]:
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            cols = [d.name for d in cur.description]
            return [dict(zip(cols, row)) for row in cur.fetchall()]


def execute(sql: str, params: tuple | dict | None = None) -> None:
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
        conn.commit()


def apply_app_schema() -> None:
    """Ensure app schema exists (safe to re-run)."""
    sql = SCHEMA_APP.read_text(encoding="utf-8")
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
