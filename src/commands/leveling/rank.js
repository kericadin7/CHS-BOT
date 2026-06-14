// ============================================================
// src/commands/leveling/rank.js
// Shows a user's current level, XP, and a visual progress bar.
// Usage: /rank            → your own rank
//        /rank @someone   → that user's rank
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser }                            = require('../../utils/db');
const { xpForLevel, progressBar }            = require('../../utils/xp');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription("View your (or another user's) current level and XP.")
    .setDMPermission(false)
    .addUserOption((opt) =>
      opt
        .setName('user')
        .setDescription('The user to look up (defaults to you).')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Resolve target — defaults to the person who ran the command
    const target = interaction.options.getUser('user') ?? interaction.user;

    // Bots don't earn XP
    if (target.bot) {
      return interaction.reply({
        content: '🤖 Bots cannot earn XP.',
        ephemeral: true,
      });
    }

    await interaction.deferReply(); // Fetch from DB may take a moment

    const data        = await getUser(interaction.guild.id, target.id);
    const { level, xp } = data;
    const xpNeeded    = xpForLevel(level + 1);
    const bar         = progressBar(xp, xpNeeded);

    // Fetch guild member to get their display name / nickname
    const member = await interaction.guild.members
      .fetch(target.id)
      .catch(() => null);

    const displayName = member?.displayName ?? target.username;

    const embed = new EmbedBuilder()
      .setColor(0xea8527)
      .setTitle(`📊 ${displayName}'s Rank`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name:   '🏆 Level',
          value:  `\`${level}\``,
          inline: true,
        },
        {
          name:   '✨ Total XP',
          value:  `\`${xp.toLocaleString()} / ${xpNeeded.toLocaleString()}\``,
          inline: true,
        },
        {
          name:   '📈 Progress to Next Level',
          value:  bar,
          inline: false,
        }
      )
      .setFooter({
        text:    `CHS-BOT XP System`,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
