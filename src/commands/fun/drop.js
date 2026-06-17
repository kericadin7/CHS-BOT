// ============================================================
// src/commands/fun/drop.js
// Picks a random PUBG hot-drop location for the selected map.
// Replies with ONLY the location name — no embed, no extra text.
// ============================================================

const { SlashCommandBuilder } = require('discord.js');

// ── Hot drop pools per map ─────────────────────────────────────
const HOT_DROPS = {
  Erangel: [
    'Pochinki',
    'School',
    'Severny',
    'Rozhok',
    'Military Base',
    'Georgopol',
    'Novorepnoye',
    'Lipovka',
  ],
  Miramar: [
    'Pecado',
    'Hacienda del Patron',
    'Los Leones',
    'San Martin',
    'Truck Stop',
    'El Pozo',
    'Impala',
  ],
  Taego: [
    'Ho San Prison',
    'School',
    'Ho San',
    'Ha Po',
    'Buk San Sa',
    'Kang Neung',
    'Terminal',
  ],
  Rondo: [
    'Stadium',
    'NEOX Factory',
    'Jadena City',
    'Rin Jiang',
    'Tin Long Garden',
    'Yu Lin',
    'Test Track',
    'Mey Ran',
  ],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('drop')
    .setDescription('Daje random hot drop lokaciju za izabranu mapu.')
    .addStringOption((opt) =>
      opt
        .setName('mapa')
        .setDescription('Izaberi mapu.')
        .setRequired(true)
        .addChoices(
          { name: 'Erangel', value: 'Erangel' },
          { name: 'Miramar', value: 'Miramar' },
          { name: 'Taego',   value: 'Taego'   },
          { name: 'Rondo',   value: 'Rondo'   }
        )
    ),

  async execute(interaction) {
    const mapa = interaction.options.getString('mapa');
    const pool = HOT_DROPS[mapa];

    const location = pool[Math.floor(Math.random() * pool.length)];

    await interaction.reply(location);
  },
};
