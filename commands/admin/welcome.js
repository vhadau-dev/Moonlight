const GroupSettings = require('../../models/GroupSettings');
const config = require('../../config');

moon({
  name: "welcome",
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
        return reply("❌ Bot must be admin to manage welcome messages.");
      }

      const sub = args[0];

      // ---------------- ENABLE ----------------
      if (sub === "on") {
        GroupSettings.updateGroup(jid, { welcomeEnabled: true });
        return reply("✅ Welcome messages enabled.");
      }

      // ---------------- DISABLE ----------------
      if (sub === "off") {
        GroupSettings.updateGroup(jid, { welcomeEnabled: false });
        return reply("❌ Welcome messages disabled.");
      }

      // ---------------- SET MESSAGE ----------------
      if (sub === "set") {
        const msg = args.slice(1).join(" ");

        if (!msg) {
          return reply("❌ Please provide a welcome message.\nExample: .welcome set Welcome @user!");
        }

        GroupSettings.updateGroup(jid, { welcomeMessage: msg });
        return reply("✅ Welcome message updated.");
      }

      return reply(
`📌 *Welcome Commands*

.welcome on
.welcome off
.welcome set <message>

Tags you can use:
@user  → user mention
@gname → group name
@count → member count
@p     → user profile picture`
      );

    } catch (err) {
      console.error("❌ Welcome command error:", err);
      return reply(`❌ Welcome command failed.\nReason: ${err.message}`);
    }
  }
});