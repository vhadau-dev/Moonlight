moon({
  name: "support",
  category: "general",
  description: "Get support group link",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const link = "https://chat.whatsapp.com/GQcOrQiDPcLD5XbTyx7qwJ";

      await sock.sendMessage(jid, {
        text: `🌙 *Moonlight Support*\n\nJoin our support group:\n${link}`,
        contextInfo: {
          externalAdReply: {
            title: "Moonlight Support Group",
            body: "Tap to join the official support group",
            thumbnailUrl: "https://files.catbox.moe/57kr64.jpg", // group image or any image
            sourceUrl: link,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m }); // ✅ reply not spawn

    } catch (err) {
      console.error("Support command error:", err);
      return reply("❌ Failed to send support link.");
    }
  }
});