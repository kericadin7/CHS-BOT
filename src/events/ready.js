// ============================================================
// src/events/ready.js
// Fires once when the bot has successfully logged in and its
// internal cache is populated. Sets a custom activity status.
// ============================================================

const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady, // 'ready'
  once: true,               // Only fire this event handler ONE time

  execute(client) {
    console.log(`\n✅ Bot is online! Logged in as: ${client.user.tag}`);
    console.log(`   Serving ${client.guilds.cache.size} guild(s).`);

    // ── Set the bot's activity/status ────────────────────────
    // ActivityType options: Playing, Streaming, Listening, Watching, Competing
    client.user.setPresence({
      activities: [
        {
          name: 'Mrakan YouTube Channel 🎮',
          type: ActivityType.Watching,
        },
      ],
      status: 'online', // 'online' | 'idle' | 'dnd' | 'invisible'
    });

    console.log(`   Status set to: Watching "Mrakan YouTube Channel 🎮"\n`);
  },
};
