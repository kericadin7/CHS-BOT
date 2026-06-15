// ============================================================
// src/commands/utility/poll.js
// Creates a reaction poll with 2–4 options. The bot auto-reacts
// with the corresponding number emojis so users can vote instantly.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const FOOTER = 'CHASERS TEAM Bot • Created by Kera';

// Emoji set for up to 4 options
const VOTE_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Creates a reaction poll with up to 4 options.')
    .setDMPermission(false)
    .addStringOption((opt) =>
      opt
        .setName('question')
        .setDescription('The poll question.')
        .setRequired(true)
        .setMaxLength(256)
    )
    .addStringOption((opt) =>
      opt
        .setName('option1')
        .setDescription('First option.')
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption((opt) =>
      opt
        .setName('option2')
        .setDescription('Second option.')
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption((opt) =>
      opt
        .setName('option3')
        .setDescription('Third option (optional).')
        .setRequired(false)
        .setMaxLength(100)
    )
    .addStringOption((opt) =>
      opt
        .setName('option4')
        .setDescription('Fourth option (optional).')
        .setRequired(false)
        .setMaxLength(100)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');

    // Collect only the options that were provided
    const options = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
    ].filter(Boolean);

    // Build the options list for the embed description
    const optionLines = options
      .map((opt, i) => `${VOTE_EMOJIS[i]}  ${opt}`)
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(0xea8527)
      .setAuthor({
        name:    `Poll by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle(`📊  ${question}`)
      .setDescription(optionLines)
      .addFields({
        name:   '🗳️ How to vote',
        value:  'React with the emoji that matches your choice below.',
        inline: false,
      })
      .setFooter({ text: `${FOOTER} • ${options.length} options` })
      .setTimestamp();

    // ── Send the poll ─────────────────────────────────────────
    // We reply first to satisfy Discord's 3-second interaction window,
    // then fetch the sent message so we can react to it.
    await interaction.reply({ embeds: [embed] });
    const pollMessage = await interaction.fetchReply();

    // ── Auto-react with each vote emoji ───────────────────────
    // React sequentially — parallel reacting can cause ordering issues.
    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(VOTE_EMOJIS[i]).catch((err) =>
        console.error(`[poll] Failed to react with ${VOTE_EMOJIS[i]}:`, err)
      );
    }
  },
};
