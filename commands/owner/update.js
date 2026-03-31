const { exec } = require('child_process');
const config = require('../../config');
const path = require('path');

let isUpdating = false;

moon({
  name: "update",
  category: "owner",
  aliases: ["up"],
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const senderNumber = sender.split('@')[0];
      if (!config.OWNER_NUMBERS || !config.OWNER_NUMBERS.includes(senderNumber)) {
        return reply("❌ This command is strictly for owners only.");
      }

      if (isUpdating) {
        return reply("⚠️ An update is already in progress. Please wait.");
      }

      isUpdating = true;
      reply("🔄 *Updating bot from GitHub...*\nFetching latest files from the Moonlight repository. Please wait.");

      const tempDir = path.join(__dirname, '../../.temp_update');
      const botDir = path.join(__dirname, '../../');
      const repoUrl = "https://github.com/vhadau-dev/Moonlight.git";

      const cmd = `
        rm -rf "${tempDir}" &&
        git clone "${repoUrl}" "${tempDir}" &&
        cd "${tempDir}" &&
        rm -f config.js &&
        rm -rf sessions/ &&
        cp -R * "${botDir}" &&
        cd "${botDir}" &&
        rm -rf "${tempDir}"
      `;

      exec(cmd, (error, stdout, stderr) => {
        isUpdating = false;
        if (error) {
          console.error("Update error:", error);
          return reply("❌ *Update failed!*\n\n" + error.message);
        }
        
        reply("✅ *Update completed successfully!*\n\nAll files updated from the Moonlight repository (skipped config.js and sessions/).\n\nPlease use the *restart* command to apply the changes.");
      });

    } catch (err) {
      isUpdating = false;
      console.error("Update command error:", err);
      reply("❌ An error occurred while trying to update the bot.");
    }
  }
});
