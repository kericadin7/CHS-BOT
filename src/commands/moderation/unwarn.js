// ============================================================
// src/commands/moderation/unwarn.js
// Removes a specific warning by ID, or all warnings for a
// user if no ID is given. Reads/writes the same chs-bot.sqlite
// database used by /warn.
// ============================================================

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Database = require('better-sqlite3');
const path     = require('node:path');

// ── Open the same database file used by /warn ────────────────
const db = new Database(path.join(process.cwd(), 'chs-bot.sqlite'));

// Table is created by warn.js on first load, but we guard here
// too in case this file ever loads before warn.js does.
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
const stmtDeleteOne = db.prepare(`
  DELETE FROM warnings
  WHERE id = ? AND guild_id = ? AND user_id = ?
`);

const stmtDeleteAll = db.prepare(`
  DELETE FROM warnings
  WHERE guild_id = ? AND user_id = ?
`);

const stmtCount = db.prepare(`
  SELECT COUNT(*) AS total
  FROM warnings
  WHERE guild_id = ? AND user_id = ?
`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Removes a specific warning or all warnings from a user.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addUserOption((opt) =>
      opt
        .setName('target')
        .setDescription('The user to remove warnings from.')
        .setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt
        .setName('warn_id')
        .setDescription('The specific warning ID to remove. Omit to remove ALL warnings.')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('target');
    const warnId      = interaction.options.getInteger('warn_id');
    const guildId      = interaction.guild.id;

    // ── Check if the user has any warnings at all ─────────────
    const { total: existingTotal } = stmtCount.get(guildId, targetUser.id);

    if (existingTotal === 0) {
      return interaction.editReply({
        embeds: [errorEmbed(`${targetUser.tag} has no active warnings in this server.`)],
      });
    }

    let removedCount = 0;

    if (warnId !== null) {
      // ── Remove a single specific warning ────────────────────
      const result = stmtDeleteOne.run(warnId, guildId, targetUser.id);
      removedCount = result.changes;

      if (removedCount === 0) {
        return interaction.editReply({
          embeds: [
            errorEmbed(
              `No warning with ID \`${warnId}\` was found for ${targetUser.tag}. ` +
              `Use \`/warnings\` (if available) to check valid IDs.`
            ),
          ],
        });
      }
    } else {
      // ── Remove ALL warnings for this user ───────────────────
      const result = stmtDeleteAll.run(guildId, targetUser.id);
      removedCount = result.changes;
    }

    // ── Confirmation embed ────────────────────────────────────
    const { total: remainingTotal } = stmtCount.get(guildId, targetUser.id);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71) // Green
      .setTitle('✅ Warning(s) Removed')
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'User',              value: `${targetUser.tag} (${targetUser.id})`, inline: false },
        {
          name:   'Removed',
          value:  warnId !== null
            ? `Warning \`#${warnId}\` (1 warning)`
            : `**${removedCount}** warning(s)`,
          inline: true,
        },
        { name: 'Remaining Warnings', value: `\`${remainingTotal}\``,                inline: true  },
        { name: 'Moderator',          value: interaction.user.tag,                   inline: true  }
      )
      .setFooter({ text: 'CHASERS TEAM Moderation' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

// ── Helper: consistent red error embed ───────────────────────
function errorEmbed(description) {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setDescription(`❌ ${description}`);
}
