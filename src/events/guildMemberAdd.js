// ============================================================
// src/events/guildMemberAdd.js
// Handles two things when a new member joins:
//   1. Auto-assigns the "CHS FANS" role
//   2. Sends a professional welcome embed to "novi-chaser"
// ============================================================

const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage }                  = require('@napi-rs/canvas');

// ── Config ────────────────────────────────────────────────────
const WELCOME_CHANNEL_NAME = 'novi-chaser';
const AUTO_ROLE_NAME       = 'CHS FANS';
const BRAND_COLOR          = 0xea8527; // CHS orange
const BRAND_HEX            = '#ea8527';
const CANVAS_W             = 800;
const CANVAS_H             = 350;
const AVATAR_SIZE          = 160;

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,

  async execute(member) {
    const { guild, user } = member;

    // ── 1. AUTO-ROLE ─────────────────────────────────────────
    const role = guild.roles.cache.find(
      (r) => r.name === AUTO_ROLE_NAME
    );

    if (!role) {
      console.warn(
        `[guildMemberAdd] Role "${AUTO_ROLE_NAME}" not found in ${guild.name}.`
      );
    } else if (!guild.members.me.permissions.has('ManageRoles')) {
      console.warn(
        `[guildMemberAdd] Missing MANAGE_ROLES permission in ${guild.name}.`
      );
    } else if (role.position >= guild.members.me.roles.highest.position) {
      console.warn(
        `[guildMemberAdd] "${AUTO_ROLE_NAME}" is higher than my highest role. ` +
        `Move the bot role above it in Server Settings → Roles.`
      );
    } else {
      await member.roles.add(role).catch((err) =>
        console.error(`[guildMemberAdd] Failed to assign role:`, err)
      );
    }

    // ── 2. WELCOME CHANNEL ────────────────────────────────────
    const welcomeChannel = guild.channels.cache.find(
      (ch) =>
        ch.isTextBased() &&
        ch.name.toLowerCase() === WELCOME_CHANNEL_NAME.toLowerCase()
    );

    if (!welcomeChannel) {
      console.warn(
        `[guildMemberAdd] Channel "${WELCOME_CHANNEL_NAME}" not found in ${guild.name}.`
      );
      return;
    }

    // ── 3. GENERATE WELCOME IMAGE (Canvas) ───────────────────
    // Build a sharp 800×350 banner with the member's avatar,
    // their username, and their member number — matching the
    // style from the screenshot but cleaner and more modern.
    let attachment;

    try {
      attachment = await buildWelcomeImage(member);
    } catch (err) {
      console.error('[guildMemberAdd] Canvas render failed:', err);
      // Fall through — we'll send a text-only embed if canvas fails
    }

    // ── 4. BUILD THE EMBED ────────────────────────────────────
    const memberCount = guild.memberCount;

    const embed = new EmbedBuilder()
      .setColor(BRAND_COLOR)
      .setAuthor({
        name:    'NOVI CHASER SE PRIDRUŽIO!',
        iconURL: guild.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTitle(`${user.username} JE NOVI CHASER!`)
      .setDescription(
        `> Dobrodošao ${user}, zabavi se uz najprofesionalniji gameplay sa ekipom\n` +
        `> 🧡 **CHASERS TEAM**!`
      )
      .addFields(
        {
          name:   '👤 Korisnik',
          value:  `${user.tag}`,
          inline: true,
        },
        {
          name:   '🏷️ Broj',
          value:  `**CHASER #${memberCount}**`,
          inline: true,
        },
        {
          name:   '📅 Nalog kreiran',
          // Show how long ago their account was created
          value:  `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          inline: true,
        }
      )
      .setFooter({
        text:    `CHS BRAT • CHASERS TEAM`,
        iconURL: guild.iconURL({ dynamic: true }) ?? undefined,
      })
      .setTimestamp();

    // If canvas rendered successfully, attach the image and
    // set it as the embed's main image
    if (attachment) {
      embed.setImage('attachment://welcome.png');
    } else {
      // Fallback: use the user's avatar as a large thumbnail
      embed.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }));
    }

    // ── 5. SEND ───────────────────────────────────────────────
    const payload = {
      content:
        `Dobrodošao ${user}, zabavi se uz najprofesionalniji gameplay sa ekipom 🧡 **CHASERS TEAM**!`,
      embeds: [embed],
    };

    if (attachment) payload.files = [attachment];

    await welcomeChannel.send(payload).catch((err) =>
      console.error('[guildMemberAdd] Failed to send welcome message:', err)
    );
  },
};

// ── Canvas helper ─────────────────────────────────────────────
// Draws the welcome banner and returns a Discord AttachmentBuilder.
async function buildWelcomeImage(member) {
  const { user } = member;

  const canvas  = createCanvas(CANVAS_W, CANVAS_H);
  const ctx     = canvas.getContext('2d');

  // Background — deep dark with a subtle gradient
  const bgGrad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  bgGrad.addColorStop(0, '#0d0d0d');
  bgGrad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Subtle orange glow behind avatar (radial gradient)
  const glowX = CANVAS_W / 2;
  const glowY = CANVAS_H / 2 - 20;
  const glow  = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 180);
  glow.addColorStop(0, 'rgba(234,133,39,0.18)');
  glow.addColorStop(1, 'rgba(234,133,39,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Orange accent line — top edge
  ctx.fillStyle = BRAND_HEX;
  ctx.fillRect(0, 0, CANVAS_W, 4);

  // Orange accent line — bottom edge
  ctx.fillRect(0, CANVAS_H - 4, CANVAS_W, 4);

  // ── Avatar ───────────────────────────────────────────────
  const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
  const avatar    = await loadImage(avatarURL);

  const cx = CANVAS_W / 2;
  const cy = 130;
  const r  = AVATAR_SIZE / 2;

  // Orange ring behind avatar
  ctx.beginPath();
  ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
  ctx.fillStyle = BRAND_HEX;
  ctx.fill();

  // Dark separator ring
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();

  // Clip avatar into circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, cx - r, cy - r, AVATAR_SIZE, AVATAR_SIZE);
  ctx.restore();

  // ── Username ──────────────────────────────────────────────
  ctx.font         = 'bold 32px Sans';
  ctx.fillStyle    = BRAND_HEX;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${user.username} JE NOVI CHASER!`, cx, 245);

  // ── Member number ─────────────────────────────────────────
  ctx.font      = '20px Sans';
  ctx.fillStyle = '#cccccc';
  ctx.fillText(`CHASER #${member.guild.memberCount}`, cx, 285);

  // Return as a Discord attachment
  const buffer = canvas.toBuffer('image/png');
  return new AttachmentBuilder(buffer, { name: 'welcome.png' });
}
