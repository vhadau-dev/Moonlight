const Card = require('../../models/Card');
const User = require('../../models/User');

moon({
  name: "setfav",
  category: "cards",
  description: "Set your favorite card to display on profile.",
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const senderNumber = sender.split('@')[0];

      let user = await User.findOne({ userId: senderNumber });
      if (!user) {
        user = await User.create({
          userId: senderNumber,
          cards: [],
          balance: 0,
          deck: []
        });
      }

      if (args[0] === "help") {
        return reply(
          "📖 *SETFAV HELP*\n\n" +
          "Usage:\n" +
          ".setfav <cardId>\n"
        );
      }

      const cardId = args[0]?.toUpperCase();
      if (!cardId) {
        return reply("❌ Provide a Card ID.\nExample: .setfav ABC123");
      }

      const card = await Card.findOne({
        cardId,
        owner: senderNumber
      });

      if (!card) {
        return reply("❌ You don't own this card.");
      }

      // Save favorite card (store cardId or card _id depending on your schema)
      user.favoriteCard = card.cardId;
      await user.save();

      return reply(`⭐ Successfully set *${card.name}* as your favorite card!`);

    } catch (err) {
      console.error("setfav error:", err);
      reply("❌ An error occurred with the setfav command.");
    }
  }
});