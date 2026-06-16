// ============================================================
// src/commands/moderation/unlock.js
// Unlocks the current channel by restoring @everyone's
// SendMessages permission to its default (inherited) state.
// ============================================================

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Otključava prethodno zaključani kanal.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const channel  = interaction.channel;
    const everyone = interaction.guild.roles.everyone;

    // ── Bot permission check ──────────────────────────────────
    if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        embeds: [errorEmbed('Nemam dozvolu "Manage Channels" da otključam ovaj kanal.')],
        ephemeral: true,
      });
    }

    // ── Already unlocked? ──────────────────────────────────────
    const currentPerms = channel.permissionOverwrites.cache.get(everyone.id);
    const isLocked = currentPerms?.deny.has(PermissionFlagsBits.SendMessages);

    if (!isLocked) {
      return interaction.reply({
        embeds: [errorEmbed('Ovaj kanal nije zaključan.')],
        ephemeral: true,
      });
    }

    // ── Lift the lock ──────────────────────────────────────────
    // Setting to `null` removes the explicit overwrite entirely,
    // letting the permission inherit from the category/role defaults.
    try {
      await channel.permissionOverwrites.edit(everyone, {
        SendMessages: null,
      });
    } catch (err) {
      console.error('[unlock] Failed to edit permissions:', err);
      return interaction.reply({
        embeds: [errorEmbed('Došlo je do greške prilikom otključavanja kanala.')],
        ephemeral: true,
      });
    }

    // ── Confirmation embed ────────────────────────────────────
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🔓 Kanal Otključan')
      .setDescription(
        `Ovaj kanal je otključan od strane ${interaction.user}.\n` +
        `Svi članovi mogu ponovo slati poruke.`
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
