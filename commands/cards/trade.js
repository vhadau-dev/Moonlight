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

      // Get target user (mention or reply)
      const contextInfo = m.message?.extendedTextMessage?.contextInfo;
      const targetJid = contextInfo?.mentionedJid?.[0] || contextInfo?.participant;

      if (!targetJid) {
        return reply("❌ Tag or reply to someone to trade with.");
      }

      const receiverNumber = targetJid.split('@')[0];

      if (receiverNumber === senderNumber) {
        return reply("❌ You cannot trade with yourself.");
      }

      // If replying, cardId is in args[0]. If mentioning, cardId is in args[1] or args[0] if mention is at end.
      // But usually it's .trade @user cardId
      const isReply = contextInfo?.participant && !contextInfo?.mentionedJid?.[0];
      const cardId = (isReply ? args[0] : (args[1] || args[0]))?.toUpperCase();
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