// ============================================================
// src/utils/scheduler.js — Daily Scheduled Messages
//
// Uses node-cron to fire tasks on a schedule.
// This file exports a single function: startScheduler(client)
// Call it once from the ready event so the client is guaranteed
// to be logged in before any tasks run.
//
// Install:  npm install node-cron
// ============================================================

const cron = require('node-cron');

// ── Config ────────────────────────────────────────────────────
const TIMEZONE       = 'Europe/Sarajevo';
const TARGET_CHANNEL = 'chat'; // Channel name to search for (case-insensitive)

// ── Footer icon — paste your team logo URL here ───────────────
const FOOTER_ICON_URL = 'YOUR_FOOTER_ICON_URL_HERE';

// ── Banner image — paste your image URL here when ready ───────
const BANNER_IMAGE_URL = '( treba biti online moze imgur)';

// =============================================================

/**
 * Starts all cron jobs. Call this inside the ready event:
 *
 *   const { startScheduler } = require('../utils/scheduler');
 *   startScheduler(client);
 */
function startScheduler(client) {
  // ── Task 1: Daily YouTube reminder — every day at 12:00 PM ──
  cron.schedule(
    '0 12 * * *',
    async () => {
      console.log('[SCHEDULER] Firing daily YouTube reminder...');
      await sendYouTubeReminder(client);
    },
    { timezone: TIMEZONE }
  );

  console.log(
    `[SCHEDULER] ✅ Daily YouTube reminder scheduled for 12:00 PM (${TIMEZONE}).`
  );

  // ── Add more cron.schedule() blocks here for future tasks ───
}

// ── Task handler ──────────────────────────────────────────────
async function sendYouTubeReminder(client) {
  try {
    // Search all guilds the bot is in for the target channel
    const channel = client.channels.cache.find(
      (ch) =>
        ch.isTextBased() &&
        ch.name.toLowerCase() === TARGET_CHANNEL.toLowerCase()
    );

    if (!channel) {
      console.warn(
        `[SCHEDULER] Channel "${TARGET_CHANNEL}" not found. ` +
        `Make sure the bot has access to it.`
      );
      return;
    }

    // ── Build the embed ───────────────────────────────────────
    const { EmbedBuilder } = require('discord.js');

    const embed = new EmbedBuilder()
      .setColor(0xff0000) // YouTube red
      .setTitle('MRAKAN YouTube')
      .setDescription(
        'Chasersi, ukoliko još niste bacili subscribe kod Mrakana – obavezno to uradite! 🔥\n\n' +
        '👉 https://www.youtube.com/@MRAKAN'
      )

      // ── Uncomment and replace the URL below when you have your image ready ──
      //.setImage("src\images\channel.png")

      .setFooter({
        text:    'Hvala puno svima koji su to već uradili. ❤️',
        iconURL: FOOTER_ICON_URL !== 'YOUR_FOOTER_ICON_URL_HERE'
          ? FOOTER_ICON_URL
          : undefined, // Skips the icon gracefully if placeholder not replaced yet
      })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    console.log(`[SCHEDULER] ✅ YouTube reminder sent to #${channel.name}.`);

  } catch (err) {
    console.error('[SCHEDULER] ❌ Failed to send YouTube reminder:', err);
  }
}

module.exports = { startScheduler };
