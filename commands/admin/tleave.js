const GroupSettings = require('../../models/GroupSettings');
const config = require('../../config');

moon({
  name: "tleave",
  category: "group",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      if (!jid.endsWith("@g.us")) {
        return reply("❌ This command only works in groups.");
      }

      const metadata = await sock.groupMetadata(jid);

      // ---------------- ADMIN CHECK ----------------
      const user = metadata.participants.find(p => p.id === sender);
      if (!user) {
        return reply("❌ Could not verify your admin status.");
      }

      if (!["admin", "superadmin"].includes(user.admin)) {
        return reply("❌ You must be a group admin to use this command.");
      }

      // ---------------- BOT ADMIN CHECK ----------------
      const bot = metadata.participants.find(p => p.id === config.BOT_JID);
      if (!bot || !["admin", "superadmin"].includes(bot.admin)) {
        return reply("❌ Bot must be admin to manage leave messages.");
      }

      const sub = args[0];

      // ---------------- ENABLE ----------------
      if (sub === "on") {
        GroupSettings.updateGroup(jid, { leaveEnabled: true });
        return reply("✅ Leave messages enabled.");
      }

      // ---------------- DISABLE ----------------
      if (sub === "off") {
        GroupSettings.updateGroup(jid, { leaveEnabled: false });
        return reply("❌ Leave messages disabled.");
      }

      // ---------------- SET MESSAGE ----------------
      if (sub === "set") {
        const msg = args.slice(1).join(" ");

        if (!msg) {
          return reply("❌ Please provide a leave message.\nExample: .tleave set Goodbye @user!");
        }

        GroupSettings.updateGroup(jid, { leaveMessage: msg });
        return reply("✅ Leave message updated.");
      }

      return reply(
`📌 *Leave Commands*

.tleave on
.tleave off
.tleave set <message>

Tags you can use:
@user  → user mention
@gname → group name
@count → member count
@p     → user profile picture`
      );

    } catch (err) {
      console.error("❌ Leave command error:", err);
      return reply(`❌ Leave command failed.\nReason: ${err.message}`);
    }
  }
});