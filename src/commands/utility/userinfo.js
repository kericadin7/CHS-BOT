// ============================================================
// src/commands/utility/userinfo.js
// Displays detailed account and server info for a user.
// ============================================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const FOOTER = 'CHASERS TEAM Bot • Created by Kera';

// Role list truncation — Discord embed field limit is 1024 chars
const MAX_ROLES_CHARS = 900;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription("Displays detailed information about a user.")
    .setDMPermission(false)
    .addUserOption((opt) =>
      opt
        .setName('user')
        .setDescription('The user to look up (defaults to you).')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getUser('user') ?? interaction.user;

    // Force-fetch to get the banner and full profile
    const user   = await interaction.client.users.fetch(target.id, { force: true });
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    // Timestamps
    const createdAt = Math.floor(user.createdTimestamp / 1000);
    const joinedAt  = member?.joinedTimestamp
      ? Math.floor(member.joinedTimestamp / 1000)
      : null;

    // Roles — filter out @everyone, sort by position (highest first)
    let rolesField = 'None';
    if (member) {
      const roles = member.roles.cache
        .filter((r) => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map((r) => `${r}`)
        .join(' ');

      if (roles.length === 0) {
        rolesField = 'No roles';
      } else if (roles.length > MAX_ROLES_CHARS) {
        // Truncate gracefully so the field doesn't exceed Discord's limit
        rolesField = roles.slice(0, MAX_ROLES_CHARS) + '…';
      } else {
        rolesField = roles;
      }
    }

    // Highest role (for colour accent and display)
    const highestRole = member?.roles.highest.id !== interaction.guild.id
      ? member?.roles.highest
      : null;

    // Acknowledgements (owner / admin / mod)
    let acknowledgement = 'Member';
    if (user.id === interaction.guild.ownerId) {
      acknowledgement = '👑 Server Owner';
    } else if (member?.permissions.has('Administrator')) {
      acknowledgement = '🛡️ Administrator';
    } else if (member?.permissions.has('ModerateMembers')) {
      acknowledgement = '⚙️ Moderator';
    }

    const embed = new EmbedBuilder()
      .setColor(highestRole?.color || 0xea8527)
      .setAuthor({
        name:    user.tag,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle('User Information')
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        {
          name:   '🆔 User ID',
          value:  `\`${user.id}\``,
          inline: true,
        },
        {
          name:   '🏷️ Nickname',
          value:  member?.nickname ?? 'None',
          inline: true,
        },
        {
          name:   '🎖️ Acknowledgement',
          value:  acknowledgement,
          inline: true,
        },

        { name: '\u200b', value: '\u200b', inline: false },

        {
          name:   '📅 Account Created',
          value:  `<t:${createdAt}:F>\n<t:${createdAt}:R>`,
          inline: true,
        },
        {
          name:   '📥 Joined Server',
          value:  joinedAt
            ? `<t:${joinedAt}:F>\n<t:${joinedAt}:R>`
            : 'Not in server',
          inline: true,
        },

        { name: '\u200b', value: '\u200b', inline: false },

        {
          name:   `🎭 Roles (${member ? member.roles.cache.size - 1 : 0})`,
          value:  rolesField,
          inline: false,
        }
      )
      .setFooter({ text: FOOTER })
      .setTimestamp();

    // Show banner if the user has one (requires force-fetch above)
    if (user.banner) {
      embed.setImage(user.bannerURL({ size: 1024 }));
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
