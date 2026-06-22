CREATE TABLE IF NOT EXISTS mod_logs (
  id          BIGSERIAL PRIMARY KEY,
  guild_id    TEXT NOT NULL,
  action      TEXT NOT NULL,
  target_id   TEXT NOT NULL,
  target_tag  TEXT NOT NULL,
  mod_id      TEXT NOT NULL,
  mod_tag     TEXT NOT NULL,
  reason      TEXT,
  duration    TEXT,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warnings (
  id          BIGSERIAL PRIMARY KEY,
  guild_id    TEXT NOT NULL,
  user_id     TEXT NOT NULL,
  user_tag    TEXT NOT NULL,
  mod_id      TEXT NOT NULL,
  mod_tag     TEXT NOT NULL,
  reason      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS note_store (
  id          BIGSERIAL PRIMARY KEY,
  guild_id    TEXT NOT NULL,
  user_id     TEXT NOT NULL,
  user_tag    TEXT NOT NULL,
  mod_id      TEXT NOT NULL,
  mod_tag     TEXT NOT NULL,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mod_logs_guild_target  ON mod_logs  (guild_id, target_id);
CREATE INDEX IF NOT EXISTS idx_warnings_guild_user    ON warnings  (guild_id, user_id);
CREATE INDEX IF NOT EXISTS idx_note_store_guild_user  ON note_store (guild_id, user_id);
