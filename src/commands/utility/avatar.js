// ============================================================
// src/commands/utility/avatar.js
// Displays a user's avatar at full 4096px resolution with a
// direct download link.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const FOOTER = 'CHASERS TEAM Bot • Created by Kera';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Displays a user's avatar at full resolution.")
    .setDMPermission(false)
    .addUserOption((opt) =>
      opt
        .setName('user')
        .setDescription('The user whose avatar you want to view (defaults to you).')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;

    // Fetch the full User object to ensure we have the global avatar
    const user = await interaction.client.users.fetch(target.id, { force: true });

    // Member-specific (server) avatar takes priority over global avatar
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const serverAvatarURL = member?.displayAvatarURL({ dynamic: true, size: 4096 }) ?? null;
    const globalAvatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

    // Build format links for the global avatar (png / jpg / webp)
    const formats = ['png', 'jpg', 'webp']
      .map((ext) => {
        const url = user.displayAvatarURL({ extension: ext, size: 4096 });
        return `[${ext.toUpperCase()}](${url})`;
      })
      .join('  •  ');

    const embed = new EmbedBuilder()
      .setColor(0xea8527)
      .setTitle(`${user.username}'s Avatar`)
      .setImage(serverAvatarURL ?? globalAvatarURL)
      .setFooter({ text: FOOTER })
      .setTimestamp();

    // Show both server and global avatars if they differ
    if (serverAvatarURL && serverAvatarURL !== globalAvatarURL) {
      embed.setDescription(
        `**Server Avatar** — [Open in browser](${serverAvatarURL})\n` +
        `**Global Avatar** — [Open in browser](${globalAvatarURL})\n\n` +
        `**Download as:** ${formats}`
      );
    } else {
      embed.setDescription(
        `**[Click to open full size](${globalAvatarURL})**\n\n` +
        `**Download as:** ${formats}`
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};
