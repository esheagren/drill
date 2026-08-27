import { neon } from "@neondatabase/serverless";

/** Server-only. Neon HTTP driver — one query per call, ideal for serverless routes. */
export function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS attempts (
  id          bigserial PRIMARY KEY,
  user_token  text        NOT NULL,
  skill_id    text        NOT NULL,
  prompt      text        NOT NULL,
  answer      text        NOT NULL,
  correct     boolean     NOT NULL,
  latency_ms  integer     NOT NULL,
  ts          timestamptz NOT NULL,
  client_id   text        NOT NULL,
  UNIQUE (user_token, client_id)
);
CREATE INDEX IF NOT EXISTS attempts_user_ts ON attempts (user_token, ts);
CREATE INDEX IF NOT EXISTS attempts_skill   ON attempts (user_token, skill_id);

CREATE TABLE IF NOT EXISTS sessions (
  id          bigserial PRIMARY KEY,
  user_token  text        NOT NULL,
  started_at  timestamptz NOT NULL,
  duration_ms integer     NOT NULL,
  answered    integer     NOT NULL,
  correct     integer     NOT NULL,
  by_skill    jsonb       NOT NULL,
  client_id   text        NOT NULL,
  UNIQUE (user_token, client_id)
);
CREATE INDEX IF NOT EXISTS sessions_user_ts ON sessions (user_token, started_at);

CREATE TABLE IF NOT EXISTS user_state (
  user_token  text PRIMARY KEY,
  engine      jsonb       NOT NULL,
  attempts    integer     NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
`;
