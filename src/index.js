// ============================================================
// src/index.js — Main Bot Entry Point
// Initializes the Discord client, then dynamically loads all
// command and event files from their respective folders.
// ============================================================

require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs   = require('node:fs');
const path = require('node:path');

// ── 1. Create the Discord Client ─────────────────────────────
// Add every Intent your bot needs here. Remove what you don't use
// to follow the principle of least privilege.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,           // Required for basic guild info
    GatewayIntentBits.GuildMembers,     // Required for guildMemberAdd event & kick/ban
    GatewayIntentBits.GuildMessages,    // Required for reading messages (if needed later)
    GatewayIntentBits.MessageContent,
  ],
});

// ── 2. Attach a commands Collection to the client ────────────
// This acts as a Map where we store every loaded slash command,
// keyed by the command's name (e.g. "ping", "kick").
client.commands = new Collection();

// ── 3. Dynamically Load All Commands ─────────────────────────
// Walk every sub-folder inside src/commands/ and register each
// exported command object into client.commands.
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

    // Each command file must export both `data` (SlashCommandBuilder)
    // and `execute` (the handler function). Warn and skip if missing.
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`[COMMANDS] Loaded: /${command.data.name}`);
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing "data" or "execute". Skipping.`
      );
    }
  }
}

// ── 4. Dynamically Load All Events ───────────────────────────
// Walk every file inside src/events/ and register each listener
// on the client. Supports both once-fired and recurring events.
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  // `once: true` means the handler fires only the first time the
  // event is emitted (useful for the "ready" event).
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }

  console.log(`[EVENTS]   Loaded: ${event.name}`);
}

// ── 5. Log in to Discord ─────────────────────────────────────
client.login(process.env.DISCORD_TOKEN);
