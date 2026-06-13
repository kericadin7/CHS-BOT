// ============================================================
// src/commands/utility/ping.js
// Returns the bot's WebSocket heartbeat latency and the
// round-trip API latency measured by editing the reply.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  // ── Command Definition ──────────────────────────────────────
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Checks the bot\'s current latency and API response time.'),

  // ── Command Handler ─────────────────────────────────────────
  async execute(interaction) {
    // Send an initial reply so we can measure round-trip time
    const sent = await interaction.reply({
      content: '🏓 Pinging...',
      fetchReply: true, // Returns the Message object so we can read its timestamp
    });

    // Calculate round-trip latency (time from sending to receiving the message)
    const roundTrip = sent.createdTimestamp - interaction.createdTimestamp;

    // client.ws.ping is the WebSocket heartbeat latency in milliseconds
    const wsHeartbeat = interaction.client.ws.ping;

    // Colour the embed green/yellow/red based on latency
    const colour =
      wsHeartbeat < 100 ? 0x2ecc71 : wsHeartbeat < 200 ? 0xf1c40f : 0xe74c3c;

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(colour)
      .addFields(
        {
          name: '⏱️ Round-trip Latency',
          value: `\`${roundTrip}ms\``,
          inline: true,
        },
        {
          name: '💓 WebSocket Heartbeat',
          value: `\`${wsHeartbeat}ms\``,
          inline: true,
        }
      )
      .setTimestamp();

    // Edit the original reply with the full embed
    await interaction.editReply({ content: '', embeds: [embed] });
  },
};
