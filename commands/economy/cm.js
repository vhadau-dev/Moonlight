const config = require('../../config');
const { getGiveaway, clearGiveaway } = require('../../commands/owner/giveaway');

moon({
  name: "cm",
  category: "economy",
  description: "Claim giveaway prize",

  async execute(sock, jid, sender, args, message, { reply, findOrCreateWhatsApp, pushName }) {
    try {

      const id = args[0];

      if (!id) {
        return reply("❌ Usage: .cm <id>");
      }

      const giveaway = getGiveaway();

      if (!giveaway) {
        return reply("❌ No active giveaway.");
      }

      if (giveaway.claimed) {
        return reply("❌ Giveaway already claimed.");
      }

      if (id !== giveaway.id) {
        return reply("❌ Invalid giveaway ID.");
      }

      // ---------------- WINNER ----------------
      const user = await findOrCreateWhatsApp(sender, pushName);

      user.balance = (user.balance || 0) + (giveaway.amount || 0);

      await user.save();

      giveaway.claimed = true;
      clearGiveaway();

      const text = `
🏆 *WE HAVE A WINNER!*

🎉 @${sender.split('@')[0]} claimed the prize!

💰 *Won:* ${giveaway.amount.toLocaleString()} coins
      `.trim();

      // ---------------- PROFILE PICTURE ----------------
      let pfp;
      try {
        pfp = await sock.profilePictureUrl(sender, 'image');
      } catch {
        pfp = config.MOONLIGHT_IMAGE;
      }

      // ---------------- EMBED ----------------
      await sock.sendMessage(jid, {
        text,
        contextInfo: {
          externalAdReply: {
            title: "🏆 Giveaway Winner",
            body: "Congratulations!",
            thumbnailUrl: pfp,
            sourceUrl: "https://moonlight.com",
            mediaType: 2,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        }
      }, { quoted: message });

    } catch (err) {
      console.error("Claim error:", err);
      return reply("❌ Failed to claim reward.");
    }
  }
});