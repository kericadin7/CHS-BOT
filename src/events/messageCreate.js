// ============================================================
// src/events/messageCreate.js — XP Tracking & Level-Up Handler
//
// Fires on every message. Awards XP to the author if:
//  • The message is inside a guild (not a DM)
//  • The author is not a bot
//  • The user is not on cooldown (1 minute between XP gains)
// ============================================================

const { Events, EmbedBuilder } = require('discord.js');
const { getUser, setUser, getCooldown, setCooldown } = require('../utils/db');
const { xpForLevel, randomXP, COOLDOWN_MS }          = require('../utils/xp');

module.exports = {
  name: Events.MessageCreate, // 'messageCreate'
  once: false,

  async execute(message) {
    // ── Ignore bots and DMs ───────────────────────────────────
    if (message.author.bot)  return;
    if (!message.guild)      return;

    const { guild, author, channel } = message;

    // ── Cooldown check ────────────────────────────────────────
    const lastMessage = await getCooldown(guild.id, author.id);
    const now         = Date.now();

    if (now - lastMessage < COOLDOWN_MS) return; // Still on cooldown — do nothing

    // ── Award XP ─────────────────────────────────────────────
    await setCooldown(guild.id, author.id); // Reset the 1-minute cooldown

    const userData  = await getUser(guild.id, author.id);
    const earned    = randomXP();
    userData.xp    += earned;

    // ── Check for level-up ────────────────────────────────────
    // Keep levelling up as long as the user has enough XP.
    // (handles the edge case where one message bridges multiple levels)
    let levelledUp = false;

    while (userData.xp >= xpForLevel(userData.level + 1)) {
      userData.xp    -= xpForLevel(userData.level + 1);
      userData.level += 1;
      levelledUp      = true;
    }

    // ── Save updated data ─────────────────────────────────────
    await setUser(guild.id, author.id, userData);

    // ── Send level-up notification ────────────────────────────
    if (!levelledUp) return;

    const embed = new EmbedBuilder()
      .setColor(0xea8527) // CHS-BOT brand orange
      .setTitle('⬆️ Level Up!')
      .setDescription(
        `Nice work, ${author}! You've reached **Level ${userData.level}**! 🎉`
      )
      .addFields(
        {
          name:   '📊 New Level',
          value:  `\`${userData.level}\``,
          inline: true,
        },
        {
          name:   '✨ XP to Next Level',
          value:  `\`${xpForLevel(userData.level + 1).toLocaleString()} XP\``,
          inline: true,
        }
      )
      .setThumbnail(author.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Keep chatting to level up further!` })
      .setTimestamp();

    // Send the embed to the channel where the message was posted.
    // We catch silently in case the bot lost Send Messages permission.
    channel.send({ embeds: [embed] }).catch(() => null);
  },
};
