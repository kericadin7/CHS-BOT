// ============================================================
// src/utils/db.js — Database Layer (better-sqlite3, direct)
//
// Uses better-sqlite3 directly — no wrapper needed.
// All operations are synchronous (no await required internally),
// but we keep async signatures so the rest of the code is
// unchanged and forward-compatible.
//
// The database file is created at the project root:  chs-bot.sqlite
// ============================================================

const Database = require('better-sqlite3');
const path     = require('node:path');

// Open (or create) the SQLite file
const db = new Database(path.join(process.cwd(), 'chs-bot.sqlite'));

// ── Create tables if they don't exist ────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    guild_id  TEXT NOT NULL,
    user_id   TEXT NOT NULL,
    xp        INTEGER NOT NULL DEFAULT 0,
    level     INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS cooldowns (
    guild_id   TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    last_msg   INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );
`);

// ── Prepared statements (compiled once, reused on every call) ─
const stmtGetUser = db.prepare(
  'SELECT xp, level FROM users WHERE guild_id = ? AND user_id = ?'
);
const stmtSetUser = db.prepare(`
  INSERT INTO users (guild_id, user_id, xp, level)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(guild_id, user_id) DO UPDATE SET xp = excluded.xp, level = excluded.level
`);
const stmtGetCooldown = db.prepare(
  'SELECT last_msg FROM cooldowns WHERE guild_id = ? AND user_id = ?'
);
const stmtSetCooldown = db.prepare(`
  INSERT INTO cooldowns (guild_id, user_id, last_msg)
  VALUES (?, ?, ?)
  ON CONFLICT(guild_id, user_id) DO UPDATE SET last_msg = excluded.last_msg
`);
const stmtLeaderboard = db.prepare(`
  SELECT user_id, xp, level
  FROM users
  WHERE guild_id = ?
  ORDER BY level DESC, xp DESC
  LIMIT ?
`);

// ── Public API (async signatures kept for drop-in compatibility) ──

async function getUser(guildId, userId) {
  return stmtGetUser.get(guildId, userId) ?? { xp: 0, level: 0 };
}

async function setUser(guildId, userId, { xp, level }) {
  stmtSetUser.run(guildId, userId, xp, level);
}

async function getCooldown(guildId, userId) {
  const row = stmtGetCooldown.get(guildId, userId);
  return row?.last_msg ?? 0;
}

async function setCooldown(guildId, userId) {
  stmtSetCooldown.run(guildId, userId, Date.now());
}

async function getLeaderboard(guildId, limit = 10) {
  return stmtLeaderboard.all(guildId, limit).map((row) => ({
    userId: row.user_id,
    xp:     row.xp,
    level:  row.level,
  }));
}

module.exports = { getUser, setUser, getCooldown, setCooldown, getLeaderboard };
