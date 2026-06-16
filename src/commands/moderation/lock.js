// ============================================================
// src/commands/moderation/lock.js
// Locks the current channel by denying @everyone SendMessages.
// ============================================================

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Zaključava trenutni kanal za obične članove.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const channel  = interaction.channel;
    const everyone = interaction.guild.roles.everyone;

    // ── Bot permission check ──────────────────────────────────
    if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        embeds: [errorEmbed('Nemam dozvolu "Manage Channels" da zaključam ovaj kanal.')],
        ephemeral: true,
      });
    }

    // ── Already locked? ────────────────────────────────────────
    const currentPerms = channel.permissionOverwrites.cache.get(everyone.id);
    const alreadyLocked = currentPerms?.deny.has(PermissionFlagsBits.SendMessages);

    if (alreadyLocked) {
      return interaction.reply({
        embeds: [errorEmbed('Ovaj kanal je već zaključan.')],
        ephemeral: true,
      });
    }

    // ── Apply the lock ────────────────────────────────────────
    try {
      await channel.permissionOverwrites.edit(everyone, {
        SendMessages: false,
      });
    } catch (err) {
      console.error('[lock] Failed to edit permissions:', err);
      return interaction.reply({
        embeds: [errorEmbed('Došlo je do greške prilikom zaključavanja kanala.')],
        ephemeral: true,
      });
    }

    // ── Confirmation embed ────────────────────────────────────
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🔒 Kanal Zaključan')
      .setDescription(
        `Ovaj kanal je zaključan od strane ${interaction.user}.\n` +
        `Obični članovi trenutno ne mogu slati poruke.`
      )
      .setFooter({ text: 'CHASERS TEAM Moderation' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

// ── Helper: consistent red error embed ───────────────────────
function errorEmbed(description) {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setDescription(`❌ ${description}`);
}
