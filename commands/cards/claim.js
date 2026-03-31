const Card = require('../../models/Card');
const User = require('../../models/User');
const config = require('../../config');

moon({
  name: "claim",
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
        return reply("❌ Please provide the Card ID.\nExample: .claim ABC123");
      }

      const card = await Card.findOne({ cardId, owner: null });
      if (!card) {
        return reply("❌ Card not found or already claimed!");
      }

      // Claim card
      card.owner = senderNumber;
      await card.save();

      // Prevent duplicates in user.cards
      if (!user.cards.includes(card._id)) {
        user.cards.push(card._id);
        await user.save();
      }

      return reply(`✅ Successfully claimed: *${card.name}* [${card.tier}]!`);

    } catch (err) {
      console.error("claim error:", err);
      reply("❌ An error occurred. Please try again.");
    }
  }
});