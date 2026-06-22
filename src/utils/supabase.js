import { createClient } from '@supabase/supabase-js';
import logger from './logger.js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  logger.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY');
  process.exit(1);
}

export const db = createClient(url, key, {
  auth: { persistSession: false },
});


export async function ensureSchema() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS mod_logs (
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
    )`,
    `CREATE TABLE IF NOT EXISTS warnings (
      id          BIGSERIAL PRIMARY KEY,
      guild_id    TEXT NOT NULL,
      user_id     TEXT NOT NULL,
      user_tag    TEXT NOT NULL,
      mod_id      TEXT NOT NULL,
      mod_tag     TEXT NOT NULL,
      reason      TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS note_store (
      id          BIGSERIAL PRIMARY KEY,
      guild_id    TEXT NOT NULL,
      user_id     TEXT NOT NULL,
      user_tag    TEXT NOT NULL,
      mod_id      TEXT NOT NULL,
      mod_tag     TEXT NOT NULL,
      note        TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )`,
  ];

  for (const sql of tables) {
    const { error } = await db.rpc('exec_sql', { query: sql }).catch(() => ({ error: null }));
    if (error) logger.debug(`Schema note: ${error.message}`);
  }
}


export async function logAction({ guildId, action, target, mod, reason, duration, expiresAt }) {
  const { error } = await db.from('mod_logs').insert({
    guild_id:   guildId,
    action,
    target_id:  target.id,
    target_tag: target.tag ?? target.username ?? target.id,
    mod_id:     mod.id,
    mod_tag:    mod.tag ?? mod.username ?? mod.id,
    reason:     reason ?? null,
    duration:   duration ?? null,
    expires_at: expiresAt ?? null,
  });
  if (error) logger.error(`DB logAction error: ${error.message}`);
}

export async function addWarning({ guildId, userId, userTag, modId, modTag, reason }) {
  const { error } = await db.from('warnings').insert({
    guild_id: guildId, user_id: userId, user_tag: userTag,
    mod_id: modId, mod_tag: modTag, reason,
  });
  if (error) logger.error(`DB addWarning error: ${error.message}`);
}

export async function getWarnings(guildId, userId) {
  const { data, error } = await db
    .from('warnings')
    .select('*')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { logger.error(`DB getWarnings error: ${error.message}`); return []; }
  return data ?? [];
}

export async function deleteWarning(id) {
  const { error } = await db.from('warnings').delete().eq('id', id);
  if (error) logger.error(`DB deleteWarning error: ${error.message}`);
  return !error;
}

export async function clearWarnings(guildId, userId) {
  const { error } = await db.from('warnings').delete()
    .eq('guild_id', guildId).eq('user_id', userId);
  if (error) logger.error(`DB clearWarnings error: ${error.message}`);
  return !error;
}

export async function addNote({ guildId, userId, userTag, modId, modTag, note }) {
  const { error } = await db.from('note_store').insert({
    guild_id: guildId, user_id: userId, user_tag: userTag,
    mod_id: modId, mod_tag: modTag, note,
  });
  if (error) logger.error(`DB addNote error: ${error.message}`);
}

export async function getNotes(guildId, userId) {
  const { data, error } = await db
    .from('note_store')
    .select('*')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { logger.error(`DB getNotes error: ${error.message}`); return []; }
  return data ?? [];
}

export async function getModLogs(guildId, userId, limit = 10) {
  const { data, error } = await db
    .from('mod_logs')
    .select('*')
    .eq('guild_id', guildId)
    .eq('target_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { logger.error(`DB getModLogs error: ${error.message}`); return []; }
  return data ?? [];
}
