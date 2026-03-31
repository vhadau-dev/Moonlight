const config = require('../../config');

moon({
  name: "bank",
  category: "economy",
  description: "Check your bank balance",

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {

      const user = await findOrCreateWhatsApp(sender, pushName);

      const bank = user.bank || 0;

      const text = `
🏦 *Bank Account*

💰 *Stored Coins:* ${bank.toLocaleString()}
🔒 Your coins are safe here.
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
            title: "🏦 Bank Balance",
            body: "Secure Storage",
            thumbnailUrl: pfp,
            sourceUrl: "https://moonlight.com",
            mediaType: 2,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        }
      }, { quoted: message });

    } catch (err) {
      console.error("bank error:", err);
      reply("❌ Failed to fetch bank balance.");
    }
  }
});