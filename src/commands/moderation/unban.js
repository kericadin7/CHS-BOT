// ============================================================
// src/commands/moderation/unban.js
// Lifts a ban by user ID with full error handling.
// Usage: /unban userid:123456789012345678
// ============================================================

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Lifts a ban from a user by their ID.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addStringOption((opt) =>
      opt
        .setName('userid')
        .setDescription('The Discord ID of the user to unban (e.g. 123456789012345678).')
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('reason')
        .setDescription('Reason for the unban (shown in audit log).')
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.options.getString('userid').trim();
    const reason = interaction.options.getString('reason') ?? 'No reason provided.';

    // ── Validate: must be a numeric snowflake ─────────────────
    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({
        content: '❌ That does not look like a valid Discord user ID. IDs are 17–20 digit numbers.',
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    // ── Check bot permission ──────────────────────────────────
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.editReply({
        content: '❌ I do not have the **Ban Members** permission needed to unban users.',
      });
    }

    // ── Fetch the ban entry ───────────────────────────────────
    const banEntry = await interaction.guild.bans.fetch(userId).catch(() => null);

    if (!banEntry) {
      return interaction.editReply({
        content: `❌ No ban was found for user ID \`${userId}\`. They may not be banned or the ID is wrong.`,
      });
    }

    // ── Lift the ban ──────────────────────────────────────────
    await interaction.guild.bans.remove(
      userId,
      `${reason} | Actioned by: ${interaction.user.tag}`
    );

    // ── Confirmation embed ────────────────────────────────────
    const embed = new EmbedBuilder()
      .setColor(0xea8527)
      .setTitle('🔓 User Unbanned')
      .setThumbnail(banEntry.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'User',      value: `${banEntry.user.tag} (\`${userId}\`)`, inline: false },
        { name: 'Moderator', value: interaction.user.tag,                   inline: true  },
        { name: 'Reason',    value: reason,                                 inline: true  }
      )
      .setFooter({ text: 'CHASERS TEAM Moderation' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
