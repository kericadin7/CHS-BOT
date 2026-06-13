// ============================================================
// src/deploy-commands.js — Slash Command Deployment Script
//
// Run this script with:   npm run deploy
//
// • If GUILD_ID is set in .env  → deploys to that server ONLY
//   (instant update, great for testing).
// • If GUILD_ID is NOT set       → deploys globally to all servers
//   (can take up to 1 hour to propagate).
// ============================================================

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs   = require('node:fs');
const path = require('node:path');

const commands = [];

// ── Collect all command data ──────────────────────────────────
// Walk the commands directory and push each command's JSON
// definition into the array we'll send to Discord's API.
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      // .toJSON() converts the SlashCommandBuilder into a plain object
      commands.push(command.data.toJSON());
      console.log(`[DEPLOY] Queued: /${command.data.name}`);
    } else {
      console.warn(
        `[WARNING] Skipping ${filePath} — missing "data" or "execute".`
      );
    }
  }
}

// ── Configure the REST client ─────────────────────────────────
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// ── Deploy ────────────────────────────────────────────────────
(async () => {
  try {
    console.log(`\n[DEPLOY] Refreshing ${commands.length} application (/) commands...`);

    let data;

    if (process.env.GUILD_ID) {
      // Guild-scoped deployment (instant)
      data = await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      );
      console.log(
        `[DEPLOY] ✅ Successfully registered ${data.length} guild commands in server ${process.env.GUILD_ID}.`
      );
    } else {
      // Global deployment (up to 1 hour to update)
      data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log(
        `[DEPLOY] ✅ Successfully registered ${data.length} global application commands.`
      );
    }
  } catch (error) {
    console.error('[DEPLOY] ❌ Deployment failed:', error);
  }
})();
