const Card = require('../../models/Card');
const User = require('../../models/User');

moon({
  name: "give",
  category: "cards",
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const senderNumber = sender.split('@')[0];

      if (args[0] === "help") {
        return reply(
          "📖 *GIVE HELP*\n\n" +
          "Usage:\n" +
          ".give @user <cardId>\n"
        );
      }

      // Get target user (mention or reply)
      const contextInfo = m.message?.extendedTextMessage?.contextInfo;
      const targetJid = contextInfo?.mentionedJid?.[0] || contextInfo?.participant;

      if (!targetJid) {
        return reply("❌ Tag or reply to a user to give a card.");
      }

      const targetNumber = targetJid.split('@')[0];
      
      // If replying, cardId is in args[0]. If mentioning, cardId is in args[1].
      const isReply = contextInfo?.participant && !contextInfo?.mentionedJid?.[0];
      const cardId = (isReply ? args[0] : (args[1] || args[0]))?.toUpperCase();

      if (!cardId) {
        return reply("❌ Provide a Card ID.\nExample: .give @user ABC123");
      }

      // Find the card owned by sender
      const card = await Card.findOne({
        cardId,
        owner: senderNumber
      });

      if (!card) {
        return reply("❌ You don't own this card.");
      }

      // Transfer ownership
      card.owner = targetNumber;
      card.isEquipped = false; // unequip on transfer
      await card.save();

      return reply(
        `✅ Card *${card.name}* has been given to @${targetNumber}`
      );

    } catch (err) {
      console.error("give error:", err);
      reply("❌ An error occurred with the give command.");
    }
  }
});