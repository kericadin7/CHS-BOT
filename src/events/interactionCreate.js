// ============================================================
// src/events/interactionCreate.js
// Listens for every interaction (button clicks, slash commands,
// autocomplete, etc.) and routes slash commands to their handler.
// ============================================================

const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate, // 'interactionCreate'
  once: false,                     // Fire on EVERY interaction

  async execute(interaction) {
    // We only care about chat-input (slash) commands here.
    // Other interaction types (buttons, modals, etc.) would be
    // handled by additional isChatInputCommand() checks.
    if (!interaction.isChatInputCommand()) return;

    // Look up the command in the Collection we built in index.js
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`[ERROR] No command matching "${interaction.commandName}" was found.`);
      return interaction.reply({
        content: '❌ This command does not exist or has been removed.',
        ephemeral: true,
      });
    }

    // ── Execute the command ───────────────────────────────────
    try {
      await command.execute(interaction);
    } catch (error) {
      // Log the full error for debugging in the console
      console.error(
        `[ERROR] Failed to execute /${interaction.commandName}:`,
        error
      );

      // Send a user-friendly error message.
      // Use editReply if the interaction was already deferred/replied.
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
  },
};
