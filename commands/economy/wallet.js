const config = require('../../config');

moon({
  name: "wallet",
  category: "economy",
  description: "Check your wallet balance",
  aliases: ["bal", "money"],

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {

      const user = await findOrCreateWhatsApp(sender, pushName);

      const wallet = user.balance || 0;
      const bank = user.bank || 0;

      const text = `
💰 *Wallet Overview*

👛 *Wallet:* ${wallet.toLocaleString()} coins
🏦 *Bank:* ${bank.toLocaleString()} coins
💎 *Total:* ${(wallet + bank).toLocaleString()} coins
      `.trim();

      // profile pic
      let pfp;
      try {
        pfp = await sock.profilePictureUrl(sender, 'image');
      } catch {
        pfp = config.MOONLIGHT_IMAGE;
      }

      await sock.sendMessage(jid, {
        text,
        contextInfo: {
          externalAdReply: {
            title: "💰 Your Balance",
            body: "Moonlight Economy",
            thumbnailUrl: pfp,
            sourceUrl: "https://moonlight.com",
            mediaType: 2,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        }
      }, { quoted: message });

    } catch (err) {
      console.error("wallet error:", err);
      reply("❌ Failed to fetch wallet.");
    }
  }
});