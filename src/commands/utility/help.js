// ============================================================
// src/commands/utility/help.js
// Displays a clean, professional overview of all bot commands.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows a complete list of available bot commands.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xea8527)
      .setAuthor({
        name:    'CHASERS TEAM Bot',
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTitle('Commands List')
      .setDescription(
        'A complete list of available slash commands for the **CHASERS TEAM** server.'
      )

      // ── Moderation ─────────────────────────────────────────
      .addFields(
        {
          name: '⚙️  Moderation',
          value: [
            '`/kick` — Removes a member from the server. Requires **Kick Members** permission.',
            '`/ban`  — Permanently bans a member from the server. Requires **Ban Members** permission.',
            '`/unban` — Lifts a ban by user ID. Requires **Ban Members** permission.',
            '`/warn`  — Issues an official warning and logs it to the database.',
            '`/unwarn`  — Removes a specific warning ID or clears all warnings for a user from the database.',
            '`/timeout`  — Times out (mutes) a member for a specified duration (minutes, hours, days) with an optional reason.',
            '`/clear`  — Deletes a specific number of messages from the channel (optionally from a specific user only).',
            '`/lock`  — Locks the current channel so regular members cannot send messages.',
            '`/unlock`  — Unlocks a previously locked channel.',
            '`/slowmode`  — Sets or disables a message cooldown for users in the current channel.',
          ].join('\n'),
          inline: false,
        },

        // Spacer for visual breathing room
        { name: '\u200b', value: '\u200b', inline: false },

        // ── Fun & Mini-Games ──────────────────────────────────
        {
          name: '🎲  Fun & Mini-Games',
          value: [
            '`/poll`          — Creates an advanced interactive poll with automatic reaction emojis for voting.',
            '`/coinflip`      — Flips a coin. Returns **Heads** or **Tails**.',
            '`/dice`          — Rolls a dice. Default is 6 sides; use `/dice sides:20` for a custom roll.',
          ].join('\n'),
          inline: false,
        },

        { name: '\u200b', value: '\u200b', inline: false },

        // ── Leveling ──────────────────────────────────────────
        {
          name: '⭐  Leveling',
          value: [
            '`/rank`          — Shows your current level, XP, and progress to the next level.',
            '`/leaderboard`   — Displays the top 10 XP earners on this server.',
          ].join('\n'),
          inline: false,
        },

        { name: '\u200b', value: '\u200b', inline: false },

        // ── Utility & Info ────────────────────────────────────
        {
          name: '📢  Utility & Info',
          value: [
            '`/ping`          — Checks the bot\'s WebSocket latency and API response time.',
            '`/youtube`       — Displays the official Mrakan YouTube channel card.',
            '`/instaram`       — Displays the official Mrakan Instagram profile card.',
            '`/tiktok`        — Displays the official Mrakan TikTok profile card.',
            '`/clips`        — Displays the official @kera.clips TikTok profile card.',
            '`/help`          — Shows this command reference menu.',
            '`/suggest`       — Opens a pop-up window to submit your ideas for the server.',
          ].join('\n'),
          inline: false,
        }
      )

      .setFooter({
        text:    'Custom built for CHASERS TEAM • Developed by Kera',
        iconURL: interaction.guild?.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTimestamp();

    // ephemeral: true means only the user who ran /help can see it —
    // keeps the channel clean. Remove it if you want it visible to all.
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};