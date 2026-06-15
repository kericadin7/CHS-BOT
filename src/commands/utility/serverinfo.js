// ============================================================
// src/commands/utility/serverinfo.js
// Displays detailed information about the current server.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const FOOTER = 'CHASERS TEAM Bot • Created by Kera';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays detailed information about this server.')
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply();

    const { guild } = interaction;

    // Fetch all members so counts are accurate
    await guild.members.fetch();

    const owner = await guild.fetchOwner();

    // Member breakdown
    const totalMembers  = guild.memberCount;
    const botCount      = guild.members.cache.filter((m) => m.user.bot).size;
    const humanCount    = totalMembers - botCount;

    // Channel breakdown
    const textChannels  = guild.channels.cache.filter((c) => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter((c) => c.type === 2).size;
    const categories    = guild.channels.cache.filter((c) => c.type === 4).size;

    // Boost info
    const boostLevel = guild.premiumTier;          // 0–3
    const boostCount = guild.premiumSubscriptionCount ?? 0;

    // Creation timestamp (Unix seconds for Discord formatting)
    const createdAt = Math.floor(guild.createdTimestamp / 1000);

    const embed = new EmbedBuilder()
      .setColor(0xea8527)
      .setAuthor({
        name:    guild.name,
        iconURL: guild.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTitle('Server Information')
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name:   '👑 Owner',
          value:  `${owner.user.tag}`,
          inline: true,
        },
        {
          name:   '🆔 Server ID',
          value:  `\`${guild.id}\``,
          inline: true,
        },
        {
          name:   '📅 Created',
          value:  `<t:${createdAt}:F>\n<t:${createdAt}:R>`,
          inline: false,
        },

        // Spacer
        { name: '\u200b', value: '\u200b', inline: false },

        {
          name:   '👥 Members',
          value:  [
            `**Total:** ${totalMembers.toLocaleString()}`,
            `**Humans:** ${humanCount.toLocaleString()}`,
            `**Bots:** ${botCount.toLocaleString()}`,
          ].join('\n'),
          inline: true,
        },
        {
          name:   '💬 Channels',
          value:  [
            `**Text:** ${textChannels}`,
            `**Voice:** ${voiceChannels}`,
            `**Categories:** ${categories}`,
          ].join('\n'),
          inline: true,
        },
        {
          name:   '✨ Boosts',
          value:  [
            `**Level:** ${boostLevel}`,
            `**Boosts:** ${boostCount}`,
          ].join('\n'),
          inline: true,
        },

        { name: '\u200b', value: '\u200b', inline: false },

        {
          name:   '🎭 Roles',
          value:  `${guild.roles.cache.size - 1} roles`, // -1 to exclude @everyone
          inline: true,
        },
        {
          name:   '😀 Emojis',
          value:  `${guild.emojis.cache.size} emojis`,
          inline: true,
        },
        {
          name:   '🔒 Verification',
          value:  capitalise(guild.verificationLevel.toString()),
          inline: true,
        }
      )
      .setImage(guild.bannerURL({ size: 1024 }) ?? null)
      .setFooter({ text: FOOTER })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
