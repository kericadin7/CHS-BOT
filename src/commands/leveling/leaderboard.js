// ============================================================
// src/commands/leveling/leaderboard.js
// Shows the top 10 XP earners in the server.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard }                     = require('../../utils/db');
const { xpForLevel }                         = require('../../utils/xp');

// Medal emojis for the top 3 spots
const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows the top 10 XP earners in this server.')
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply(); // Leaderboard lookup can be slow

    const top = await getLeaderboard(interaction.guild.id, 10);

    if (!top.length) {
      return interaction.editReply({
        content: '📭 No one has earned XP yet. Start chatting!',
      });
    }

    // Build each leaderboard row, resolving usernames from the cache
    // (fall back to a raw ID mention if the member left the server)
    const rows = await Promise.all(
      top.map(async (entry, index) => {
        const member = await interaction.guild.members
          .fetch(entry.userId)
          .catch(() => null);

        const name   = member?.displayName ?? `<@${entry.userId}>`;
        const medal  = MEDALS[index] ?? `\`#${index + 1}\``;
        const xpNeeded = xpForLevel(entry.level + 1);

        return (
          `${medal} **${name}**\n` +
          `┗ Level **${entry.level}** • ` +
          `${entry.xp.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`
        );
      })
    );

    const embed = new EmbedBuilder()
      .setColor(0xea8527)
      .setTitle(`🏆 ${interaction.guild.name} — XP Leaderboard`)
      .setThumbnail(
        interaction.guild.iconURL({ dynamic: true, size: 256 }) ?? null
      )
      .setDescription(rows.join('\n\n'))
      .setFooter({
        text:    `Top ${top.length} member${top.length === 1 ? '' : 's'} • CHS-BOT XP System`,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
