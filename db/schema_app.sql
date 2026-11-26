-- App-owned schema (writable). B1 workbook tables stay in public and are not modified by the stand.

CREATE SCHEMA IF NOT EXISTS app;

CREATE TABLE IF NOT EXISTS app.stand_session (
  session_id TEXT PRIMARY KEY,
  visitor_name TEXT NOT NULL,
  role TEXT NOT NULL,
  company_tin VARCHAR(10),
  started_ts TIMESTAMP NOT NULL DEFAULT now(),
  finished_ts TIMESTAMP,
  events_closed INTEGER DEFAULT 0,
  meta JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS app.session_action (
  action_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES app.stand_session (session_id) ON DELETE CASCADE,
  action_ts TIMESTAMP NOT NULL DEFAULT now(),
  case_id TEXT,
  step TEXT NOT NULL,
  action TEXT NOT NULL,
  option_id TEXT,
  question_text TEXT,
  meta JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS app.ask_log (
  ask_id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES app.stand_session (session_id) ON DELETE SET NULL,
  asked_ts TIMESTAMP NOT NULL DEFAULT now(),
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  tool_name TEXT,
  result_json JSONB
);

CREATE INDEX IF NOT EXISTS idx_app_session_action_session
  ON app.session_action (session_id, action_ts);

CREATE INDEX IF NOT EXISTS idx_app_ask_log_ts
  ON app.ask_log (asked_ts DESC);
