# CHASERS TEAM Discord Bot

The official, multi-purpose Discord bot built for the CHASERS TEAM server. This project handles moderation, server automation, utility features, and fun mini-games to keep the server active and organized. Built using `discord.js` (v14) and Node.js.

## Core Features

### ⚙️ Moderation & Admin
* `/kick` - Kicks a user from the server.
* `/ban` - Permanently bans a user from the server.
* `/unban` - Lifts a ban by user ID. Requires **Ban Members** permission.
* `/warn` - Issues an official warning to a user and logs it to the SQLite database.
* `/unwarn` - Removes a specific warning ID or clears all warnings for a user from the database.
* `/timeout` - Times out (mutes) a member for a specified duration (minutes, hours, days) with an optional reason.
* `/clear` - Deletes a specific number of messages from the channel (optionally from a specific user only).
* `/lock` - Locks the current channel so regular members cannot send messages.
* `/unlock` - Unlocks a previously locked channel.
* `/slowmode` - Sets or disables a message cooldown for users in the current channel.

### 🤖 Automation & Welcome System
* `Welcome Embeds` - Automatically greets new members in the `#novi-chaser` channel with a custom team embed, displaying their avatar and unique member number.
* `Auto-Role` - Instantly assigns the **CHS FANS** role to new users as soon as they join the server.
* `Daily YouTube Reminder` - Automatically posts a custom, beautifully formatted promotion embed for Mrakan's YouTube channel every day at **12:00h (CEST)**

### 📢 Utility & Info
* `/youtube` - Displays information about Mrakan's YouTube channel.
* `/instagram` - Displays information about Mrakan's Instagram profile.
* `/tiktok` - Displays information about Mrakan's TikTok profile.
* `/help` - Displays the complete list of all available commands.
* `/ping` - Checks the bot's current response latency and API status.
* `/avatar` - Displays a user's profile picture in full size with a direct download link.
* `/serverinfo` - Shows detailed statistics about the server (owner, creation date, member counts).
* `/userinfo` - Displays account creation date, server join date, and roles for a specific member.

### 🎲 Fun & Community
* `/poll` - Creates an advanced interactive poll with automatic reaction emojis for voting.
* `/coinflip` - Flips a coin (Heads or Tails) to settle arguments or make quick decisions.
* `/dice` - Rolls a standard 6-sided dice, or a custom number of sides if specified (e.g., `/dice sides:20`).

---

## Project Status
This is a private development project customized specifically for the CHASERS TEAM Discord server. The repository is public for showcase and tracking progress. 

--- 

## Legal & Compliance
To comply with Discord's Developer Policy, the official terms and data usage guidelines for this bot are fully documented below: 
* [Terms of Service](TOS.md) — Rules and conditions for using the bot on your server.
* [Privacy Policy](PRIVACY.md) — Detailed overview of what data we collect (SQLite logging) and how it is protected.

---

*Maintained exclusively by the repository owner.*