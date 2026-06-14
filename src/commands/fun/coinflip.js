// ============================================================
// src/commands/fun/coinflip.js
// Flips a coin and returns Heads or Tails in a clean embed.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const OUTCOMES = [
  { result: 'Heads', emoji: '🪙', color: 0xf1c40f },
  { result: 'Tails', emoji: '⚪', color: 0x95a5a6 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin and get Heads or Tails.'),

  async execute(interaction) {
    const { result, emoji, color } = OUTCOMES[Math.floor(Math.random() * 2)];

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} Coin Flip`)
      .setDescription(`The coin landed on... **${result}**!`)
      .setFooter({ text: `Flipped by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
