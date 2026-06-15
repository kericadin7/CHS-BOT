// ============================================================
// src/commands/moderation/warn.js
// Issues a warning, saves it to chs-bot.sqlite, DMs the user,
// and replies with a professional confirmation embed.
// ============================================================

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Database = require('better-sqlite3');
const path     = require('node:path');

// ── Open the same database file used by the XP system ────────
const db = new Database(path.join(process.cwd(), 'chs-bot.sqlite'));

// ── Create warnings table if it doesn't exist ────────────────
// Runs once at startup when the file is first require()'d.
db.exec(`
  CREATE TABLE IF NOT EXISTS warnings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id     TEXT    NOT NULL,
    user_id      TEXT    NOT NULL,
    reason       TEXT    NOT NULL,
    moderator_id TEXT    NOT NULL,
    timestamp    INTEGER NOT NULL
  );
`);

// ── Prepared statements ───────────────────────────────────────
const stmtInsert = db.prepare(`
  INSERT INTO warnings (guild_id, user_id, reason, moderator_id, timestamp)
  VALUES (?, ?, ?, ?, ?)
`);

const stmtCount = db.prepare(`
  SELECT COUNT(*) AS total
  FROM warnings
  WHERE guild_id = ? AND user_id = ?
`);

// ── Command definition ────────────────────────────────────────
module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issues an official warning to a server member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((opt) =>
      opt
        .setName('target')
        .setDescription('The member to warn.')
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('reason')
        .setDescription('The reason for the warning.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const reason     = interaction.options.getString('reason');

    // ── Guards ────────────────────────────────────────────────
    if (targetUser.bot) {
      return interaction.reply({ content: '❌ You cannot warn a bot.', ephemeral: true });
    }
    if (targetUser.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot warn yourself.', ephemeral: true });
    }

    await interaction.deferReply();

    // ── Save warning to database ──────────────────────────────
    stmtInsert.run(
      interaction.guild.id,
      targetUser.id,
      reason,
      interaction.user.id,
      Date.now()
    );

    // Get total warning count for this user in this guild
    const { total } = stmtCount.get(interaction.guild.id, targetUser.id);

    // ── DM the warned user ────────────────────────────────────
    const dmEmbed = new EmbedBuilder()
      .setColor(0xea8527)
      .setTitle('⚠️ You Have Been Warned')
      .setDescription(
        `You received an official warning in **${interaction.guild.name}**.`
      )
      .addFields(
        { name: 'Reason',        value: reason,                  inline: false },
        { name: 'Moderator',     value: interaction.user.tag,    inline: true  },
        { name: 'Total Warnings', value: `\`${total}\``,         inline: true  }
      )
      .setFooter({ text: 'Please review the server rules to avoid further action.' })
      .setTimestamp();

    // Attempt DM — silently ignore if user has DMs closed
    const dmSent = await targetUser
      .send({ embeds: [dmEmbed] })
      .then(() => true)
      .catch(() => false);

    // ── Channel confirmation embed ────────────────────────────
    const confirmEmbed = new EmbedBuilder()
      .setColor(0xea8527)
      .setTitle('⚠️ Member Warned')
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'User',           value: `${targetUser.tag} (${targetUser.id})`, inline: false },
        { name: 'Reason',         value: reason,                                 inline: false },
        { name: 'Moderator',      value: interaction.user.tag,                   inline: true  },
        { name: 'Total Warnings', value: `\`${total}\``,                         inline: true  },
        { name: 'DM Delivered',   value: dmSent ? '✅ Yes' : '❌ No (DMs closed)', inline: true }
      )
      .setFooter({ text: 'CHASERS TEAM Moderation' })
      .setTimestamp();

    await interaction.editReply({ embeds: [confirmEmbed] });
  },
};
