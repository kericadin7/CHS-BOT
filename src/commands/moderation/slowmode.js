// ============================================================
// src/commands/moderation/slowmode.js
// Sets or disables slowmode (rate limit per user) on the
// current channel.
// ============================================================

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Postavlja ili gasi slowmode (cooldown) za trenutni kanal.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addIntegerOption((opt) =>
      opt
        .setName('seconds')
        .setDescription('Broj sekundi za cooldown (stavi 0 ako želiš ugasiti slowmode).')
        .setMinValue(0)
        .setMaxValue(21600) // Discord's max: 6 hours
        .setRequired(true)
    ),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.channel;

    // ── Bot permission check ──────────────────────────────────
    if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        embeds: [errorEmbed('Nemam dozvolu "Manage Channels" da promijenim slowmode u ovom kanalu.')],
        ephemeral: true,
      });
    }

    // ── Apply the slowmode change ─────────────────────────────
    try {
      await channel.setRateLimitPerUser(
        seconds,
        `Slowmode promijenjen na ${seconds}s od strane ${interaction.user.tag}`
      );
    } catch (err) {
      console.error('[slowmode] Failed to set rate limit:', err);
      return interaction.reply({
        embeds: [errorEmbed('Došlo je do greške prilikom postavljanja slowmode-a.')],
        ephemeral: true,
      });
    }

    // ── Reply based on whether slowmode was disabled or set ────
    const embed = seconds === 0
      ? new EmbedBuilder()
          .setColor(0x2ecc71) // Green
          .setDescription('🔓 Slowmode je uspješno ugašen za ovaj kanal.')
      : new EmbedBuilder()
          .setColor(0x3498db) // Blue
          .setDescription(`⏳ Slowmode je postavljen na **${seconds}** sekundi.`);

    embed
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
