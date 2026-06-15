// ============================================================
// src/events/ready.js
// Fires once when the bot is fully logged in and cached.
// Also starts all scheduled cron jobs via the scheduler utility.
// ============================================================

const { Events, ActivityType } = require('discord.js');
const { startScheduler }       = require('../utils/scheduler');

module.exports = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    console.log(`\n✅ Bot is online! Logged in as: ${client.user.tag}`);
    console.log(`   Serving ${client.guilds.cache.size} guild(s).`);

    // ── Set activity status ───────────────────────────────────
    client.user.setPresence({
      activities: [{ name: 'Mrakan YouTube Channel 🎮', type: ActivityType.Watching }],
      status: 'online',
    });

    // ── Start all scheduled tasks ─────────────────────────────
    // Called here (inside ready) so the client is guaranteed to
    // be fully logged in before any cron jobs can fire.
    startScheduler(client);
  },
};
