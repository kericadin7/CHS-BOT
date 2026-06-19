// ============================================================
// src/commands/fun/tiktok.js
// Sends a branded embed card for Mrakan's YouTube channel.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// ── Constants ────────────────────────────────────────────────
const CHANNEL_URL  = 'https://www.tiktok.com/@mrakan_yt';
const AVATAR_URL   =
  'https://p16-common-sign.tiktokcdn.com/tos-maliva-avt-0068/67d0f54abcfa861559066b785c2c4dad~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=39a9f3ae&x-expires=1782054000&x-signature=taBUZnRWimAr71SASnKVo5punko%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my2';
const BANNER_URL = 'https://yt3.googleusercontent.com/0MgPuHTfBLogXVjDok1uq5GGXVscieIdOxODVPPiEt8HHYsNvYARbmnNBg_W4f9kPixDn4NIG6M=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj'

module.exports = {
  // ── Command Definition ──────────────────────────────────────
  data: new SlashCommandBuilder()
    .setName('tiktok')
    .setDescription('Prikazuje informacije o Mrakanovom TikTok profilu.'),

  // ── Command Handler ─────────────────────────────────────────
  async execute(interaction) {
    const embed = new EmbedBuilder()
      // Title & clickable URL
      .setTitle('Mrakanov TikTok profil')
      .setURL(CHANNEL_URL)

      // Brand colour (TikTok Razzmatazz)
      .setColor('#fe2c55')

      // Author row (name + link + avatar icon)
      .setAuthor({
        name:    'Mrakan',
        url:     CHANNEL_URL,
        iconURL: AVATAR_URL,
      })

      // Channel description
      .setDescription('Test')

      // Fields
      .addFields(
        {
          name:   '📺 Link profila',
          value:  `[Klikni da posjetis](${CHANNEL_URL})`,
          inline: false,
        },
        {
          name:   '🚀 Content',
          value:  'Gaming • Streaming • PUBG',
          inline: true,
        },
        // {
        //   name:   '💬 Support',
        //   value:  'Like, Comment & Follow',
        //   inline: true,
        // }
      )

      // Thumbnail (small image, top-right corner)
      //.setThumbnail(AVATAR_URL)

      // Large image (banner area below the description)
      //.setImage(BANNER_URL)

      // Footer with timestamp
      .setFooter({ text: 'MRXs' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
