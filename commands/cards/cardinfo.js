const Card = require('../../models/Card');
const User = require('../../models/User');
const config = require('../../config');

moon({
  name: "cardinfo",
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

      const cardId = args[0]?.toUpperCase();
      if (!cardId) {
        return reply("❌ Provide a Card ID.\nExample: .cardinfo ABC123");
      }

      const card = await Card.findOne({ cardId });
      if (!card) {
        return reply("❌ Card not found.");
      }

      const msg =
        `🃏 *CARD DETAILS* 🃏\n\n` +
        `🆔 ID: ${card.cardId}\n` +
        `🎈 Name: ${card.name}\n` +
        `🎐 Tier: ${card.tier}\n` +
        `⚔️ ATK: ${card.atk ?? 0}\n` +
        `🛡️ DEF: ${card.def ?? 0}\n` +
        `🔯 Level: ${card.level ?? 1}\n` +
        `👤 Owner: ${card.owner || "None"}`;

      return sock.sendMessage(
        jid,
        { image: { url: card.image }, caption: msg },
        { quoted: m }
      );

    } catch (err) {
      console.error("cardinfo error:", err);
      reply("❌ An error occurred. Please try again.");
    }
  }
});