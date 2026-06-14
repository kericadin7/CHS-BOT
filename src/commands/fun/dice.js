// ============================================================
// src/commands/fun/dice.js
// Rolls a dice with a configurable number of sides (default 6).
// Usage: /dice            → rolls a d6
//        /dice sides:20   → rolls a d20
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice. Default is 6 sides.')
    .addIntegerOption((opt) =>
      opt
        .setName('sides')
        .setDescription('Number of sides on the dice (2–100). Default: 6.')
        .setMinValue(2)
        .setMaxValue(100)
        .setRequired(false)
    ),

  async execute(interaction) {
    const sides  = interaction.options.getInteger('sides') ?? 6;
    const roll   = Math.floor(Math.random() * sides) + 1;

    // Make the embed colour reflect how high the roll is (green = high, red = low)
    const ratio  = roll / sides;
    const color  = ratio >= 0.75 ? 0x2ecc71 : ratio >= 0.4 ? 0xf1c40f : 0xe74c3c;

    // Pick a fitting emoji based on roll ratio
    const emoji  = ratio >= 0.75 ? '🎯' : ratio >= 0.4 ? '🎲' : '💀';

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} Dice Roll — d${sides}`)
      .setDescription(`You rolled a **${roll}** out of ${sides}!`)
      .addFields(
        { name: '🎲 Result',     value: `\`${roll}\``,   inline: true },
        { name: '📐 Sides',      value: `\`${sides}\``,  inline: true },
        { name: '📊 Percentile', value: `\`${Math.round(ratio * 100)}th\``, inline: true }
      )
      .setFooter({ text: `Rolled by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
