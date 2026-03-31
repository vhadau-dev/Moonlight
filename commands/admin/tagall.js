const config = require('../../config');

moon({
  name: "tagall",
  category: "group",
  description: "Tag all members (admin + bot check using admincheck style)",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      if (!jid || !jid.endsWith("@g.us")) {
        return reply("❌ This command only works in groups.");
      }

      const metadata = await sock.groupMetadata(jid);

      // ---------------- USER CHECK (same style) ----------------
      const userParticipant = metadata.participants.find(p => p.id === sender);

      const isUserAdmin =
        userParticipant?.admin === "admin" ||
        userParticipant?.admin === "superadmin";

      if (!isUserAdmin) {
        return reply("❌ You must be an admin.");
      }

      // ---------------- BOT CHECK (same style as your cmd) ----------------
      const botJid = config.BOT_JID;

      const botParticipant = metadata.participants.find(p => p.id === botJid);

      const isBotAdmin =
        botParticipant?.admin === "admin" ||
        botParticipant?.admin === "superadmin";

      if (!isBotAdmin) {
        return reply("❌ Bot must be admin.");
      }

      // ---------------- MEMBERS ----------------
      const members = metadata.participants.map(p => p.id);

      // ---------------- STYLED MESSAGE ----------------
      const text = `
┌─❖
│「 🌙 𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻 」
└┬❖ 「 📢 𝗔𝗹𝗹 𝗧𝗮𝗴 」
${members.map(u => `   │ @${u.split('@')[0]}`).join('\n')}
   └────────────┈ ⳹

> ⚠️ Use this command responsibly.
      `.trim();

      // ---------------- SEND ----------------
      await sock.sendMessage(jid, {
        text,
        mentions: members
      }, { quoted: m });

    } catch (err) {
      console.error("tagall error:", err);
      return reply("❌ Failed to execute tagall.");
    }
  }
});