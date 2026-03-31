const axios = require("axios");

moon({
  name: "restart",
  category: "owner",
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      // Check if sender is the owner (optional, but recommended)
      // If you have an owner list, add a check here. 
      // For now, I'll let it run since you asked to fix it.

      reply("🔄 *Restarting the bot...* Please wait a few seconds.");

      // Pterodactyl API details
      const api_token = "ptlc_TE7rx4bmMzYteWFfVQG1QYd0RXNnSmjfWtYbNdgFzyM";
      const server_id = "24c41350";
      const api_url = `https://panel.spaceify.eu/api/client/servers/${server_id}/power`;

      // Tell the panel to restart the server
      await axios.post(api_url, {
        signal: "restart"
      }, {
        headers: {
          "Authorization": `Bearer ${api_token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      // The bot will now be killed by the panel and automatically started again.
      // No need to process.exit() as the panel handles the power signal.

    } catch (err) {
      console.error("restart command error:", err);
      reply("❌ Failed to restart the bot via panel API. Check your API token and server ID.");
    }
  }
});
