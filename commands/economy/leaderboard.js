const User = require('../../models/User');

moon({
  name: "lb",
  category: "economy",
  description: "View the richest users",
  usage: ".leaderboard",
  cooldown: 3,
  aliases: ["lb", "top"],

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {

    try {
      // Ensure sender exists
      await findOrCreateWhatsApp(sender, pushName);

      // Get top users sorted by TOTAL wealth
      const users = await User.find({ whatsappNumber: { $ne: null } });

      if (!users.length) {
        return reply("❌ No users found in the economy yet.");
      }

      // Sort by total (balance + bank)
      const sorted = users.sort((a, b) => {
        const totalA = (a.balance || 0) + (a.bank || 0);
        const totalB = (b.balance || 0) + (b.bank || 0);
        return totalB - totalA;
      }).slice(0, 10);

      const medals = ["🥇", "🥈", "🥉"];

      let text = `🏆 *𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻 ECONOMY LEADERBOARD* 🏆\n\n`;

      sorted.forEach((u, i) => {
        const total = (u.balance || 0) + (u.bank || 0);

        // ✅ Name fallback logic
        let name = u.username && u.username.trim();

        if (!name) {
          // fallback to phone number
          name = u.whatsappNumber
            ? u.whatsappNumber.replace(/@s\.whatsapp\.net|@lid/g, '')
            : "User";
        }

        const rank = medals[i] || `${i + 1}.`;

        text += `${rank} *${name}*\n`;
        text += `💰 Total: ${total.toLocaleString()} coins\n\n`;
      });

      text += `🌙 Use *.bal* to check your own money`;

      await reply(text);

    } catch (err) {
      console.error("Leaderboard error:", err);
      await reply("❌ Could not load leaderboard.");
    }
  }
});