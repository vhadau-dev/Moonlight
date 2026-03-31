const Card = require('../../models/Card');
const User = require('../../models/User');
const config = require('../../config');

moon({
  name: "delcds",
  category: "owner",
  description: "Delete ALL cards (owner only)",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      const senderNumber = sender.split('@')[0];

      // 🔒 OWNER CHECK
      if (!config.OWNER_NUMBERS.includes(senderNumber)) {
        return reply("⛔ You don't have permission for that.");
      }

      // ⚠️ CONFIRMATION SAFETY
      if (args[0] !== "confirm") {
        return reply("⚠️ This will DELETE ALL cards.\nType:\n.resetcards confirm");
      }

      // ---------------- DELETE ALL CARDS ----------------
      const deletedCards = await Card.deleteMany({});

      // ---------------- CLEAR USER INVENTORIES ----------------
      const users = await User.find();

      for (const user of users) {
        user.cards = [];
        await user.save();
      }

      // ---------------- RESET GLOBAL SPAWN ----------------
      global.activeCard = null;

      return reply(`
🧨 *ALL CARDS RESET*

🗑️ Deleted Cards: ${deletedCards.deletedCount}
👥 Users Cleared: ${users.length}

💰 Coins were NOT touched
⭐ Stars were NOT touched
      `.trim());

    } catch (err) {
      console.error("resetcards error:", err);
      return reply("❌ Failed to reset cards.");
    }
  }
});