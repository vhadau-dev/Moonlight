const Card = require('../../models/Card');
const User = require('../../models/User');
const config = require('../../config');

moon({
  name: "trade",
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

      const mentionedJid =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!mentionedJid) {
        return reply("❌ Tag someone to trade with.");
      }

      const receiverNumber = mentionedJid.split('@')[0];

      if (receiverNumber === senderNumber) {
        return reply("❌ You cannot trade with yourself.");
      }

      const cardId = args[0]?.toUpperCase();
      if (!cardId) {
        return reply("❌ Provide a Card ID.\nExample: .trade @user ABC123");
      }

      const card = await Card.findOne({
        cardId,
        owner: senderNumber
      });

      if (!card) {
        return reply("❌ You don't own this card.");
      }

      // Transfer ownership
      card.owner = receiverNumber;
      card.isEquipped = false; // unequip on trade
      await card.save();

      return reply(
        `🤝 Successfully traded *${card.name}* to @${receiverNumber}`
      );

    } catch (err) {
      console.error("trade error:", err);
      reply("❌ An error occurred. Please try again.");
    }
  }
});