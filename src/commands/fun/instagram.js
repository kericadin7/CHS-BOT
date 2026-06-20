// ============================================================
// src/commands/fun/youtube.js
// Sends a branded embed card for Mrakan's YouTube channel.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// ── Constants ────────────────────────────────────────────────
const CHANNEL_URL  = 'https://www.instagram.com/_mrakan_/';
const AVATAR_URL   =
  'https://instagram.fsjj3-1.fna.fbcdn.net/v/t51.82787-19/721601514_18443087428139690_1691280190142366755_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fsjj3-1.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2gHyvgFnsjSOX_ZaIHIxBC2UHYWzFKRpW35LqzofjE2RXz16MaNsgMivHcF-7JEL_kk&_nc_ohc=3dHdBdCRa5MQ7kNvwEYVgYO&_nc_gid=yFDf2ZQ93gJOuWFmMs6u8Q&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Af_qjS3zAkDmxoonn7wHcMw39yZY4tbTfc1-BOD8l48ANg&oe=6A3C4AEF&_nc_sid=7a9f4b';
const BANNER_URL = ''

module.exports = {
  // ── Command Definition ──────────────────────────────────────
  data: new SlashCommandBuilder()
    .setName('instagram')
    .setDescription('Prikazuje informacije o Mrakanovom Instagram profilu.'),

  // ── Command Handler ─────────────────────────────────────────
  async execute(interaction) {
    const embed = new EmbedBuilder()
      // Title & clickable URL
      //.setTitle('Mrakanov Instagram profil')
      //.setURL(CHANNEL_URL)

      // Brand colour (Ig blue)
      .setColor('#405DE6')

      // Author row (name + link + avatar icon)
      .setAuthor({
        name:    'Mrakan',
        url:     CHANNEL_URL,
        iconURL: AVATAR_URL,
      })

      // Channel description
      //.setDescription('Dobrodosli na Mrakanov ofisl ig profil')

      // Fields
      .addFields(
        {
          name:   '11 posts',
          value:  ` `,
          inline: true,
        },
        {
          name:   '1789 followers',
          value:  ` `,
          inline: true,
        },
        {
          name:   '942 following',
          value:  ` `,
          inline: true,
        },
        {
          name:   'Gaming video creator',
          value:  ' ',
          inline: false,
        },
        {
          name: '',
          value:  'YouTube Streamer | Graphic Designer\nVideo Editor | Digital Marketing Enthusiast',
          inline: false,
        },
        {
          name:   ' ',
          value:  `[Klikni da posjetis profil](${CHANNEL_URL})`,
          inline: false,
        },
      )

      // Thumbnail (small image, top-right corner)
      .setThumbnail(AVATAR_URL)

      // Large image (banner area below the description)
      //.setImage(BANNER_URL)

      // Footer with timestamp
      .setFooter({ text: 'MRXs' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
