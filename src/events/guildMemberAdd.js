// ============================================================
// src/events/guildMemberAdd.js
// Fires whenever a new member joins a guild.
// Sends a welcome embed to the guild's system channel
// (or a fallback channel named "welcome" if no system channel is set).
// ============================================================

const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd, // 'guildMemberAdd'
  once: false,

  async execute(member) {
    const { guild, user } = member;

    // ── Find the welcome channel ──────────────────────────────
    // Priority 1: the guild's configured System Channel
    // Priority 2: any channel named "welcome" or "dobrodosli"
    // Priority 3: bail out silently (no channel found)
    const welcomeChannel =
      guild.systemChannel ??
      guild.channels.cache.find(
        (ch) =>
          ch.isTextBased() &&
          (ch.name.toLowerCase().includes('welcome') ||
            ch.name.toLowerCase().includes('dobrodosli'))
      );

    if (!welcomeChannel) {
      console.warn(
        `[guildMemberAdd] No welcome channel found in guild: ${guild.name}`
      );
      return;
    }

    // ── Fetch total member count ──────────────────────────────
    // guild.memberCount is the most up-to-date count after the join
    const memberCount = guild.memberCount;

    // ── Build the welcome embed ───────────────────────────────
    const embed = new EmbedBuilder()
      .setTitle(`👋 Welcome to ${guild.name}!`)
      .setDescription(
        `Hey ${user}, dobrodošli na server!\nNadamo se da ćeš se osjećati kao kod kuće. 🏠`
      )
      .setColor(0xea8527) // Mrakan brand orange
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name:   '👤 Member',
          value:  `${user.tag}`,
          inline: true,
        },
        {
          name:   '🆔 ID',
          value:  user.id,
          inline: true,
        },
        {
          name:   '📊 You are member',
          value:  `#${memberCount}`,
          inline: true,
        }
      )
      .setImage(guild.bannerURL({ size: 1024 }) ?? null)
      .setFooter({
        text:    guild.name,
        iconURL: guild.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTimestamp();

    // ── Send the welcome message ──────────────────────────────
    try {
      await welcomeChannel.send({ content: `${user}`, embeds: [embed] });
    } catch (error) {
      console.error(
        `[guildMemberAdd] Failed to send welcome message in ${guild.name}:`,
        error
      );
    }
  },
};
