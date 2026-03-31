const Card = require('../../models/Card');
const User = require('../../models/User');
const config = require('../../config');

moon({
  name: "deck",
  category: "cards",
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const senderNumber = sender.split('@')[0];

      let user = await User.findOne({ userId: senderNumber });
      if (!user) {
        user = await User.create({
          userId: senderNumber,
          cards: [],
          balance: 1000,
          deck: []
        });
      }

      const cards = await Card.find({ owner: senderNumber, isEquipped: true });

      if (!cards || cards.length === 0) {
        return reply("📭 Your deck is empty. Equip cards first.");
      }

      let msg = `🎒 *YOUR DECK* 🎒\n\n`;

      cards.forEach((c, i) => {
        msg += `${i + 1}. [${c.tier}] ${c.name} (ATK: ${c.atk ?? 0}, DEF: ${c.def ?? 0})\n`;
      });

      return reply(msg);

    } catch (err) {
      console.error("deck error:", err);
      reply("❌ An error occurred. Please try again.");
    }
  }
});