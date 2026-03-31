const config = require('../../config');

moon({
  name: "sts",
  category: "economy",
  description: "Check your stars",

  async execute(sock, jid, sender, args, m, { findOrCreateWhatsApp, pushName }) {
    try {

      const user = await findOrCreateWhatsApp(sender, pushName);
      const stars = user.stars || 0;

      // ✅ get profile pic (safe fallback)
      let pfp;
      try {
        pfp = await sock.profilePictureUrl(sender, 'image');
      } catch {
        pfp = config.MOONLIGHT_IMAGE;
      }

      await sock.sendMessage(jid, {
        text: "‎‎", // keep your invisible text style
        contextInfo: {
          externalAdReply: {
            title: `⭐ ${stars.toLocaleString()} Stars`,
            body: "Moonlight Currency",
            thumbnailUrl: pfp,
            sourceUrl: "https://moonlight.com",
            mediaType: 2,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.error("stars error:", err);
      // optional safe feedback
      // (doesn't affect UI unless error happens)
      await sock.sendMessage(jid, { text: "❌ Failed to fetch stars." }, { quoted: m });
    }
  }
});