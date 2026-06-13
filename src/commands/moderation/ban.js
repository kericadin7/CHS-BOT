// ============================================================
// src/commands/moderation/ban.js
// Bans a member from the guild with permission checks on
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
    .setName('ban')
    .setDescription('Bans a member from the server.')
    // Require the invoking user to have BanMembers permission by default
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The member you want to ban.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('The reason for the ban (shown in audit log).')
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('delete_days')
        .setDescription('Number of days of messages to delete (0–7). Default: 0.')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  // ── Command Handler ─────────────────────────────────────────
  async execute(interaction) {
    const targetUser  = interaction.options.getUser('target');
    const reason      = interaction.options.getString('reason')      ?? 'No reason provided.';
    const deleteDays  = interaction.options.getInteger('delete_days') ?? 0;

    // Fetch the GuildMember (may not exist if already left)
    const targetMember = await interaction.guild.members
      .fetch(targetUser.id)
      .catch(() => null);

    // ── Guard: don't ban yourself ──
    if (targetUser.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ You cannot ban yourself.',
        ephemeral: true,
      });
    }

    // ── Guard: check the member is bannable (role hierarchy) ──
    // Note: guild.bans.create also works on users not in the guild,
    // so we only run this check when the member IS in the guild.
    if (targetMember && !targetMember.bannable) {
      return interaction.reply({
        content:
          '❌ I cannot ban that member. They may have a higher role than me, or they are the server owner.',
        ephemeral: true,
      });
    }

    // ── Perform the ban ─────────────────────────────────────
    // deleteMessageSeconds converts days → seconds for the API
    await interaction.guild.bans.create(targetUser.id, {
      reason:               `${reason} | Actioned by: ${interaction.user.tag}`,
      deleteMessageSeconds: deleteDays * 86400,
    });

    // ── Build confirmation embed ────────────────────────────
    const embed = new EmbedBuilder()
      .setTitle('🔨 Member Banned')
      .setColor(0xe74c3c)
      .addFields(
        { name: 'User',            value: `${targetUser.tag} (${targetUser.id})`, inline: false },
        { name: 'Moderator',       value: interaction.user.tag,                   inline: true  },
        { name: 'Reason',          value: reason,                                 inline: true  },
        { name: 'Messages Deleted', value: `${deleteDays} day(s)`,               inline: true  }
      )
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
