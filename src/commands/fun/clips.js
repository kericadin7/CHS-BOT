// ============================================================
// src/commands/fun/clips.js
// Sends a branded embed card for @kera.clips TikTok channel.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// ── Constants ────────────────────────────────────────────────
const CHANNEL_URL  = 'https://www.tiktok.com/@kera.clips';
const AVATAR_URL   =
  'https://yt3.googleusercontent.com/4IZD901Q8Arntja6EcPwOsFqi4QBBuA0KYCvDrgX0wos8aQlZE3px32jrP1Peoy5Z9nuw0HS=s160-c-k-c0x00ffffff-no-rj';
const BANNER_URL = 'https://yt3.googleusercontent.com/4oe9WyA5sCOZNV0mwYoRXu9p2o_g7liUIoZW7DbIib7IQTJ5QdPa06uopWJ1glLq4fFQifolOA=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj'

module.exports = {
  // ── Command Definition ──────────────────────────────────────
  data: new SlashCommandBuilder()
    .setName('clips')
    .setDescription('Prikazuje informacije o @kera.clips TikTok profilu'),

  // ── Command Handler ─────────────────────────────────────────
  async execute(interaction) {
    const embed = new EmbedBuilder()
      // Title & clickable URL
      .setTitle('@kera.clips TikTok profil')
      .setURL(CHANNEL_URL)

      // Brand colour ()
      .setColor('#ff501a')

      // Author row (name + link + avatar icon)
      .setAuthor({
        name:    'Kera Clips',
        url:     CHANNEL_URL,
        iconURL: AVATAR_URL,
      })

      // Channel description
      //.setDescription('Udji dublje u zivot naseg strimera 🧡')

      // Fields
      .addFields(
        {
          //name:   '📱 Link tiktok profila',
          name:   'Klipovani momenti naseg strimera 🧡',
          value:  `[Klikni da posjetis profil](${CHANNEL_URL})`,
          inline: false,
        },
      )

      // Thumbnail (small image, top-right corner)
      //.setThumbnail(AVATAR_URL)

      // Large image (banner area below the description)
      .setImage(BANNER_URL)

      // Footer with timestamp
      .setFooter({ text: 'MRXs' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
