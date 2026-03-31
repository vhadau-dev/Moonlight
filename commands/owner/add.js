const config = require('../../config');

moon({
  name: "add",
  category: "owner",
  description: "Add a user to the group (Owner only)",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      if (!jid.endsWith('@g.us')) {
        return reply("❌ This command only works in groups.");
      }

      // ---------------- TARGET ----------------
      const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      let target = mentioned?.[0];

      // allow number input (same flow, just extended)
      if (!target && args[0]) {
        let num = args[0].replace(/[^0-9]/g, '');
        if (!num) return reply("❌ Invalid number.");
        target = num + '@s.whatsapp.net';
      }

      if (!target) return reply("❌ Mention a user or give number.");

      const metadata = await sock.groupMetadata(jid);

      // ---------------- OWNER CHECK ----------------
      const senderNumber = sender.split('@')[0];
      const isOwner = (config.OWNER_NUMBERS || []).includes(senderNumber);

      if (!isOwner) {
        return reply("❌ Only owner can use this.");
      }

      // ---------------- BOT CHECK (SAME STYLE AS YOUR PROMOTE) ----------------
      const bot = metadata.participants.find(p => p.id === config.BOT_JID);

      if (!bot || (bot.admin !== "admin" && bot.admin !== "superadmin")) {
        return reply("❌ Bot must be admin.");
      }

      // ---------------- ADD ----------------
      await sock.groupParticipantsUpdate(jid, [target], "add");

      return reply(
        `✅ Added @${target.split('@')[0]}`,
        { mentions: [target] }
      );

    } catch (err) {
      console.error(err);
      return reply("❌ Failed to add user.");
    }
  }
});