const config = require('../../config');

moon({
  name: "invite",
  category: "group",
  description: "Get group invite link",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      // Must be group
      if (!jid.endsWith("@g.us")) {
        return reply("❌ This command only works in groups.");
      }

      const metadata = await sock.groupMetadata(jid);

      const user = metadata.participants.find(p => p.id === sender);
      const bot = metadata.participants.find(p => p.id === config.BOT_JID);

      // Admin check (recommended)
      if (!user || (user.admin !== "admin" && user.admin !== "superadmin")) {
        return reply("❌ You must be admin to use this.");
      }

      if (!bot || (bot.admin !== "admin" && bot.admin !== "superadmin")) {
        return reply("❌ Bot must be admin.");
      }

      // ✅ Fetch invite code
      const code = await sock.groupInviteCode(jid);

      const link = `https://chat.whatsapp.com/${code}`;

      // ✅ Send nicely (reply style)
      return await sock.sendMessage(jid, {
        text: `🔗 *Group Invite Link*\n\n${link}`
      }, { quoted: m });

    } catch (err) {
      console.error("Invite command error:", err);
      return reply("❌ Failed to fetch invite link.");
    }
  }
});