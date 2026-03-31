const Card = require('../../models/Card');
const User = require('../../models/User');
const config = require('../../config');

moon({
  name: "sellcard",
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
        return reply("❌ Provide a Card ID.\nExample: .sellcard ABC123");
      }

      const card = await Card.findOne({
        cardId,
        owner: senderNumber
      });

      if (!card) {
        return reply("❌ You don't own this card.");
      }

      // Simple pricing logic (you can improve later)
      const price = Math.floor(((card.atk || 0) + (card.def || 0)) / 4);

      // Update user balance
      user.balance += price;

      // Remove ownership
      card.owner = null;
      card.isEquipped = false;

      await card.save();
      await user.save();

      return reply(`💰 Sold *${card.name}* for ${price}!`);

    } catch (err) {
      console.error("sellcard error:", err);
      reply("❌ An error occurred. Please try again.");
    }
  }
});