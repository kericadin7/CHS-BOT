# Privacy Policy

**Midnight Coding** ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains what data the **CHASERS TEAM Discord Bot** ("the Bot") collects, how it is stored, and how it is used.

## 1. Data We Collect
To function properly, perform moderation tasks, and run automation features, the Bot processes and stores the following information:
* **User IDs & Usernames:** Collected when a moderation command (such as `/warn`, `/timeout`, `/kick`, `/ban`) is executed, or when a user triggers automated filters.
* **Guild (Server) IDs:** Stored to log configuration data and ensure features like Auto-Role and Welcome Embeds function in the correct server channels.
* **Moderation Logs (Infractions):** Specific details including warning reasons, timestamps, and warning IDs are securely stored in a local SQLite database to track user infractions.

## 2. Data We DO NOT Collect
* The Bot **does not** read, log, or store your private text messages, direct messages (DMs), images, or voice chat audio.
* We do not collect any personal real-world information (such as names, emails, or locations).

## 3. How Data is Used & Stored
* **Usage:** All collected data is used strictly for server utility, automated moderation, and analytical features (e.g., displaying server info or tracking active warnings).
* **Storage:** Data is securely stored within a local SQLite database hosted on our private deployment infrastructure. 
* **Sharing:** We **never** sell, trade, or share your data with any third parties.

## 4. Data Retention & Deletion (Your Rights)
* **Automated Removal:** Data regarding kicks/bans is handled natively through Discord.
* **Manual Removal:** Moderators can clear infraction data using the `/unwarn` command.
* **Data Erasure Requests:** If you wish to have all your stored data permanently removed from our SQLite database, please contact the repository owner or a server administrator, and your data will be deleted within 30 days.

---
*Last updated: June 2026*