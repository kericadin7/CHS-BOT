// ============================================================
// src/commands/fun/youtube.js
// Sends a branded embed card for Mrakan's YouTube channel.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// ── Constants ────────────────────────────────────────────────
const CHANNEL_URL  = 'https://www.youtube.com/@MRAKAN';
const AVATAR_URL   =
  'https://yt3.googleusercontent.com/vx_bEF52bg3NeOylna7BHbvXlVM9lsfd26GlAwh5hKukmFD2TI798RADQH7bZFTqkdMyz38T=s160-c-k-c0x00ffffff-no-rj';

module.exports = {
  // ── Command Definition ──────────────────────────────────────
  data: new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('Prikazuje informacije o Mrakanovom YouTube kanalu.'),

  // ── Command Handler ─────────────────────────────────────────
  async execute(interaction) {
    const embed = new EmbedBuilder()
      // Title & clickable URL
      .setTitle('Mrakan YouTube Channel')
      .setURL(CHANNEL_URL)

      // Brand colour (Mrakan orange)
      .setColor('#ea8527')

      // Author row (name + link + avatar icon)
      .setAuthor({
        name:    'Mrakan',
        url:     CHANNEL_URL,
        iconURL: AVATAR_URL,
      })

      // Channel description
      .setDescription('Dobrodosli na Mrakanov ofisl kanal')

      // Fields
      .addFields(
        {
          name:   '📺 Link kanala',
          value:  `[Klikni da posjetis](${CHANNEL_URL})`,
          inline: false,
        },
        {
          name:   '🚀 Content',
          value:  'Gaming • Streaming • PUBG',
          inline: true,
        },
        {
          name:   '💬 Support',
          value:  'Like, Comment & Suskrajz',
          inline: true,
        }
      )

      // Thumbnail (small image, top-right corner)
      .setThumbnail(AVATAR_URL)

      // Large image (banner area below the description)
      .setImage(AVATAR_URL)

      // Footer with timestamp
      .setFooter({ text: 'MRXs' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
