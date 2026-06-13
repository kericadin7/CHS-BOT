// ============================================================
// src/commands/moderation/kick.js
// Kicks a member from the guild with permission checks on
// both the invoking user and the bot itself.
// ============================================================

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  // ── Command Definition ──────────────────────────────────────
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a member from the server.')
    // Require the invoking user to have KickMembers permission by default
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    // This command only makes sense inside a guild
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The member you want to kick.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('The reason for the kick (shown in audit log).')
        .setRequired(false)
    ),

  // ── Command Handler ─────────────────────────────────────────
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const reason     = interaction.options.getString('reason') ?? 'No reason provided.';

    // Fetch the GuildMember object (needed to call .kick())
    const targetMember = await interaction.guild.members
      .fetch(targetUser.id)
      .catch(() => null);

    // ── Guard: member not found ──
    if (!targetMember) {
      return interaction.reply({
        content: '❌ That user is not in this server.',
        ephemeral: true,
      });
    }

    // ── Guard: target cannot be kicked (higher role, etc.) ──
    if (!targetMember.kickable) {
      return interaction.reply({
        content:
          '❌ I cannot kick that member. They may have a higher role than me, or they are the server owner.',
        ephemeral: true,
      });
    }

    // ── Guard: don't kick yourself ──
    if (targetUser.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ You cannot kick yourself.',
        ephemeral: true,
      });
    }

    // ── Perform the kick ────────────────────────────────────
    await targetMember.kick(`${reason} | Actioned by: ${interaction.user.tag}`);

    // ── Build confirmation embed ────────────────────────────
    const embed = new EmbedBuilder()
      .setTitle('👢 Member Kicked')
      .setColor(0xe67e22)
      .addFields(
        { name: 'User',            value: `${targetUser.tag} (${targetUser.id})`, inline: false },
        { name: 'Moderator',       value: interaction.user.tag,                   inline: true  },
        { name: 'Reason',          value: reason,                                 inline: true  }
      )
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
