// ============================================================
// src/events/interactionCreate.js
// Routes every interaction type the bot needs to handle:
//   • Slash commands       → executes the matching command file
//   • Modal submits        → handles the /suggest modal
//   • Button clicks        → handles upvote/downvote on suggestions
// ============================================================

const { Events, EmbedBuilder } = require('discord.js');

// ── Config ────────────────────────────────────────────────────
const SUGGESTIONS_CHANNEL_NAME = 'suggestions';
// If you'd rather hardcode the channel, set an ID here instead
// and the code below will use it automatically:
const SUGGESTIONS_CHANNEL_ID = null; // e.g. '123456789012345678'

module.exports = {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction) {
    // ── 1. Slash Commands ─────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      return handleSlashCommand(interaction);
    }

    // ── 2. Modal Submissions ──────────────────────────────────
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'suggest_modal') {
        return handleSuggestModal(interaction);
      }
      return; // Unknown modal — ignore
    }

    // ── 3. Button Clicks ───────────────────────────────────────
    if (interaction.isButton()) {
      if (interaction.customId === 'suggest_upvote' || interaction.customId === 'suggest_downvote') {
        return handleSuggestionVote(interaction);
      }
      return; // Unknown button — ignore
    }
  },
};

// ────────────────────────────────────────────────────────────
// Slash command execution (unchanged from your original setup)
// ────────────────────────────────────────────────────────────
async function handleSlashCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`[ERROR] No command matching "${interaction.commandName}" was found.`);
    return interaction.reply({
      content: '❌ This command does not exist or has been removed.',
      ephemeral: true,
    });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[ERROR] Failed to execute /${interaction.commandName}:`, error);

    const errorPayload = {
      content: '❌ There was an error while executing this command.',
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorPayload);
    } else {
      await interaction.reply(errorPayload);
    }
  }
}

// ────────────────────────────────────────────────────────────
// /suggest modal submission handler
// ────────────────────────────────────────────────────────────
async function handleSuggestModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const suggestionText = interaction.fields.getTextInputValue('suggestion_input');

  // ── Find the suggestions channel ───────────────────────────
  const channel = SUGGESTIONS_CHANNEL_ID
    ? interaction.guild.channels.cache.get(SUGGESTIONS_CHANNEL_ID)
    : interaction.guild.channels.cache.find(
        (ch) => ch.isTextBased() && ch.name.toLowerCase() === SUGGESTIONS_CHANNEL_NAME
      );

  if (!channel) {
    return interaction.editReply({
      content: `❌ Could not find a "${SUGGESTIONS_CHANNEL_NAME}" channel. Ask an admin to create one or set SUGGESTIONS_CHANNEL_ID.`,
    });
  }

  // ── Build the suggestion embed ──────────────────────────────
  const embed = new EmbedBuilder()
    .setColor(0x1a0000) // Sharp dark red/black, CHASERS theme
    .setAuthor({
      name:    interaction.user.tag,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle('New Server Suggestion')
    .setDescription(suggestionText)
    .setFooter({ text: `Suggested by ${interaction.user.id}` })
    .setTimestamp();

  // ── Build the vote buttons ──────────────────────────────────
  const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('suggest_upvote')
      .setLabel('Upvote (0)')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('suggest_downvote')
      .setLabel('Downvote (0)')
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({ embeds: [embed], components: [row] });

  await interaction.editReply({
    content: `✅ Your suggestion has been submitted to ${channel}!`,
  });
}

// ────────────────────────────────────────────────────────────
// Upvote / Downvote button handler
//
// NOTE: Vote counts live only in the button labels themselves
// (parsed back out of the text each click). This is the simplest
// approach with zero extra setup. If you want to prevent users
// from voting twice, you'd need a database table tracking
// (message_id, user_id) pairs — ask if you want that added.
// ────────────────────────────────────────────────────────────
async function handleSuggestionVote(interaction) {
  const message = interaction.message;
  const isUpvote = interaction.customId === 'suggest_upvote';

  // Pull the current row of buttons so we can rebuild it with new labels
  const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  const oldRow = message.components[0];
  const upvoteButton   = oldRow.components.find((c) => c.customId === 'suggest_upvote');
  const downvoteButton = oldRow.components.find((c) => c.customId === 'suggest_downvote');

  // Extract the current number out of "Upvote (3)" → 3
  const currentUpvotes   = parseInt(upvoteButton.label.match(/\d+/)?.[0]   ?? '0', 10);
  const currentDownvotes = parseInt(downvoteButton.label.match(/\d+/)?.[0] ?? '0', 10);

  const newUpvotes   = isUpvote   ? currentUpvotes + 1   : currentUpvotes;
  const newDownvotes = !isUpvote  ? currentDownvotes + 1 : currentDownvotes;

  const newRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('suggest_upvote')
      .setLabel(`Upvote (${newUpvotes})`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('suggest_downvote')
      .setLabel(`Downvote (${newDownvotes})`)
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.update({ components: [newRow] });
}
