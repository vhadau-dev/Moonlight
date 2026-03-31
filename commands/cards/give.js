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

      const mentionedJid =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!mentionedJid) {
        return reply("❌ Tag a user to give a card.");
      }

      const targetNumber = mentionedJid.split('@')[0];
      const cardId = args[1]?.toUpperCase();

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