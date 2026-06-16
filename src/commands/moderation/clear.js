// ============================================================
// src/commands/moderation/clear.js
// Bulk-deletes messages from a channel, optionally filtered
// by a specific user. Replies ephemerally, then posts a
// short-lived public confirmation.
// ============================================================

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');

// How long the public confirmation embed stays visible before self-deleting
const CONFIRMATION_LIFETIME_MS = 5_000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Briše određeni broj poruka iz kanala.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addIntegerOption((opt) =>
      opt
        .setName('amount')
        .setDescription('Broj poruka koje želiš obrisati (1-100).')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption((opt) =>
      opt
        .setName('target')
        .setDescription('Izaberi korisnika ako želiš obrisati samo njegove poruke (opcionalno).')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Defer ephemerally right away — bulk fetch + delete can take
    // a moment, and we don't want this visible to everyone anyway.
    await interaction.deferReply({ ephemeral: true });

    const amount = interaction.options.getInteger('amount');
    const target = interaction.options.getUser('target');
    const channel = interaction.channel;

    // ── Bot permission check ──────────────────────────────────
    if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageMessages)) {
      return interaction.editReply({
        embeds: [errorEmbed('Nemam dozvolu "Manage Messages" u ovom kanalu.')],
      });
    }

    // ── Fetch recent messages ─────────────────────────────────
    // Discord's fetch limit is 100 per call, which matches our max.
    const fetched = await channel.messages.fetch({ limit: 100 }).catch(() => null);

    if (!fetched || fetched.size === 0) {
      return interaction.editReply({
        embeds: [errorEmbed('Nema poruka za brisanje u ovom kanalu.')],
      });
    }

    // ── Filter by target user (if provided), then cap at `amount` ──
    let messagesToDelete = target
      ? fetched.filter((msg) => msg.author.id === target.id)
      : fetched;

    messagesToDelete = [...messagesToDelete.values()].slice(0, amount);

    if (messagesToDelete.length === 0) {
      return interaction.editReply({
        embeds: [
          errorEmbed(
            target
              ? `Nisu pronađene poruke od ${target.tag} u zadnjih 100 poruka.`
              : 'Nisu pronađene poruke za brisanje.'
          ),
        ],
      });
    }

    // ── Bulk delete ────────────────────────────────────────────
    // bulkDelete's second arg (filterOld = true) silently skips
    // messages older than 14 days instead of throwing — but we
    // still wrap in try/catch for any other API errors (rate limits, etc).
    let deletedCount = 0;

    try {
      const deleted = await channel.bulkDelete(messagesToDelete, true);
      deletedCount = deleted.size;
    } catch (err) {
      console.error('[clear] bulkDelete failed:', err);
      return interaction.editReply({
        embeds: [
          errorEmbed(
            'Došlo je do greške prilikom brisanja poruka. Diskord ne dozvoljava brisanje poruka starijih od 14 dana.'
          ),
        ],
      });
    }

    // ── Warn if some messages were skipped (too old) ────────────
    const skippedOld = messagesToDelete.length - deletedCount;

    // ── Ephemeral success reply to the moderator ────────────────
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x2f3136)
          .setDescription(
            `✅ Obrisano **${deletedCount}** poruka${target ? ` od **${target.tag}**` : ''}.` +
            (skippedOld > 0
              ? `\n⚠️ ${skippedOld} poruka je preskočena (starije od 14 dana).`
              : '')
          ),
      ],
    });

    // ── Public confirmation embed (auto-deletes after 5s) ───────
    const publicEmbed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setDescription(
        `🧹 **${deletedCount}** poruka${target ? ` od ${target}` : ''} je obrisano od strane ${interaction.user}.`
      )
      .setFooter({ text: 'Ova poruka će se sama obrisati za 5 sekundi.' });

    const publicMessage = await channel.send({ embeds: [publicEmbed] }).catch(() => null);

    if (publicMessage) {
      setTimeout(() => {
        publicMessage.delete().catch(() => null); // Ignore if already gone
      }, CONFIRMATION_LIFETIME_MS);
    }
  },
};

// ── Helper: consistent red error embed ───────────────────────
function errorEmbed(description) {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setDescription(`❌ ${description}`);
}
