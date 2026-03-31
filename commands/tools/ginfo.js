const config = require('../../config');

moon({
  name: "ginfo",
  category: "tools",
  description: "Get group information",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      if (!jid.endsWith("@g.us")) {
        return reply("❌ This command only works in groups.");
      }

      const metadata = await sock.groupMetadata(jid);

      const groupName = metadata.subject;
      const groupId = metadata.id;
      const membersCount = metadata.participants.length;

      // ---------------- BOT ADMIN CHECK (YOUR METHOD) ----------------
      const botJid = config.BOT_JID;

      const botParticipant = metadata.participants.find(p => p.id === botJid);

      const isBotAdmin =
        botParticipant?.admin === "admin" ||
        botParticipant?.admin === "superadmin";

      // ---------------- GROUP LINK ----------------
      let groupLink = "❌ Bot is not admin";

      if (isBotAdmin) {
        try {
          const code = await sock.groupInviteCode(jid);
          groupLink = `https://chat.whatsapp.com/${code}`;
        } catch {
          groupLink = "❌ Failed to get link";
        }
      }

      // ---------------- PROFILE PIC ----------------
      let pfp;
      try {
        pfp = await sock.profilePictureUrl(jid, "image");
      } catch {
        pfp = null;
      }

      // ---------------- MESSAGE ----------------
      const text = `
👥 *Group Info*

📛 Name: ${groupName}
🆔 ID: ${groupId}
👤 Members: ${membersCount}
🤖 Bot Admin: ${isBotAdmin ? "✅ Yes" : "❌ No"}

🔗 Link: ${groupLink}
      `.trim();

      await sock.sendMessage(jid, {
        text,
        contextInfo: {
          externalAdReply: {
            title: groupName,
            body: "Moonlight Group Info",
            thumbnailUrl: pfp || undefined,
            sourceUrl: groupLink.startsWith("http") ? groupLink : "",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.error("ginfo error:", err);
      return reply("❌ Failed to fetch group info.");
    }
  }
});