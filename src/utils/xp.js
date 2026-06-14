// ============================================================
// src/utils/xp.js — XP & Level Maths + Visual Helpers
// ============================================================

// ── Level formula ─────────────────────────────────────────────
// XP required to reach `level` from the previous level.
// Formula: level² × 100
// Examples:  Level 1 →  100 XP
//            Level 5 →  2500 XP
//            Level 10 → 10000 XP
const xpForLevel = (level) => level * level * 100;

// ── Progress bar ──────────────────────────────────────────────
// Renders a Unicode block progress bar, e.g.:  ██████░░░░  60%
const BAR_LENGTH = 10;
const FILLED     = '█';
const EMPTY      = '░';

function progressBar(current, required) {
  const pct     = Math.min(current / required, 1);
  const filled  = Math.round(pct * BAR_LENGTH);
  const empty   = BAR_LENGTH - filled;
  const percent = Math.floor(pct * 100);
  return `\`${FILLED.repeat(filled)}${EMPTY.repeat(empty)}\` **${percent}%**`;
}

// ── Random XP per message ─────────────────────────────────────
const XP_MIN = 15;
const XP_MAX = 25;

function randomXP() {
  return Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
}

// ── Cooldown duration ─────────────────────────────────────────
const COOLDOWN_MS = 60_000; // 1 minute

module.exports = { xpForLevel, progressBar, randomXP, COOLDOWN_MS };
