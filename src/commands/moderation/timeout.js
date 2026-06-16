// ============================================================
// src/commands/moderation/timeout.js
// Times out (mutes) a member for a configurable duration.
// ============================================================

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');

// Discord's native timeout cap is 28 days
const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;

// Conversion factors to milliseconds
const UNIT_TO_MS = {
  m: 60_000,        // minutes
  h: 60 * 60_000,   // hours
  d: 24 * 60 * 60_000, // days
};

const UNIT_LABELS = {
  m: 'minute(s)',
  h: 'hour(s)',
  d: 'day(s)',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Mutes/timeouts a user for a specific duration.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((opt) =>
      opt
        .setName('target')
        .setDescription('The member to timeout.')
        .setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt
        .setName('duration')
        .setDescription('The length of the timeout.')
        .setMinValue(1)
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('unit')
        .setDescription('The unit of time for the duration.')
        .addChoices(
          { name: 'Minutes', value: 'm' },
          { name: 'Hours',   value: 'h' },
          { name: 'Days',    value: 'd' }
        )
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('reason')
        .setDescription('The reason for the timeout.')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('target');
    const duration    = interaction.options.getInteger('duration');
    const unit        = interaction.options.getString('unit');
    const reason       = interaction.options.getString('reason') ?? 'No reason provided.';

    // ── Guards ────────────────────────────────────────────────
    if (targetUser.bot) {
      return interaction.editReply({ embeds: [errorEmbed('You cannot timeout a bot.')] });
    }
    if (targetUser.id === interaction.user.id) {
      return interaction.editReply({ embeds: [errorEmbed('You cannot timeout yourself.')] });
    }

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!member) {
      return interaction.editReply({ embeds: [errorEmbed('That user is not in this server.')] });
    }

    if (!member.moderatable) {
      return interaction.editReply({
        embeds: [
          errorEmbed(
            'I cannot timeout that member. They may have a higher role than me, or they are the server owner.'
          ),
        ],
      });
    }

    // ── Calculate duration in ms ──────────────────────────────
    let ms = duration * UNIT_TO_MS[unit];

    if (ms > MAX_TIMEOUT_MS) {
      return interaction.editReply({
        embeds: [
          errorEmbed(
            'Timeout duration cannot exceed Discord\'s 28-day limit. Please choose a shorter duration.'
          ),
        ],
      });
    }

    // ── Apply the timeout ──────────────────────────────────────
    try {
      await member.timeout(ms, `${reason} | Actioned by: ${interaction.user.tag}`);
    } catch (err) {
      console.error('[timeout] Failed to apply timeout:', err);
      return interaction.editReply({
        embeds: [errorEmbed('Something went wrong while applying the timeout.')],
      });
    }

    // ── Confirmation embed ────────────────────────────────────
    const embed = new EmbedBuilder()
      .setColor(0x992d22) // Dark red
      .setTitle('🔇 Member Timed Out')
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'User',       value: `${targetUser.tag} (${targetUser.id})`,    inline: false },
        { name: 'Duration',   value: `${duration} ${UNIT_LABELS[unit]}`,        inline: true  },
        { name: 'Moderator',  value: interaction.user.tag,                     inline: true  },
        { name: 'Reason',     value: reason,                                   inline: false },
        {
          name: 'Expires',
          value: `<t:${Math.floor((Date.now() + ms) / 1000)}:R>`,
          inline: false,
        }
      )
      .setFooter({ text: 'CHASERS TEAM Moderation' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

// ── Helper: consistent red error embed ───────────────────────
function errorEmbed(description) {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setDescription(`❌ ${description}`);
}
