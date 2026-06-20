// ============================================================
// src/commands/utility/suggest.js
// Opens a modal for the user to type their suggestion.
// The actual submission is handled in interactionCreate.js
// since modal submits arrive as a separate interaction type.
// ============================================================

const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion for the server.'),

  async execute(interaction) {
    // ── Build the modal ────────────────────────────────────────
    const modal = new ModalBuilder()
      .setCustomId('suggest_modal')
      .setTitle('Submit a Suggestion');

    // Paragraph-style text input (multi-line)
    const suggestionInput = new TextInputBuilder()
      .setCustomId('suggestion_input')
      .setLabel('What is your suggestion for the server?')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Type your idea here...')
      .setMinLength(10)
      .setMaxLength(1000)
      .setRequired(true);

    // Modals require each input wrapped in its own ActionRow
    const row = new ActionRowBuilder().addComponents(suggestionInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  },
};
