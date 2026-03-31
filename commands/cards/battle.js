const Card = require('../../models/Card');
const User = require('../../models/User');
const config = require('../../config');

moon({
  name: "battle",
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

      // Get mentioned user
      const mentionedJid =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

      if (!mentionedJid) {
        return reply("❌ Tag someone to battle.");
      }

      const opponentNumber = mentionedJid.split('@')[0];

      // Fetch equipped cards
      const myCard = await Card.findOne({
        owner: senderNumber,
        isEquipped: true
      });

      const enemyCard = await Card.findOne({
        owner: opponentNumber,
        isEquipped: true
      });

      if (!myCard || !enemyCard) {
        return reply("❌ Both players must have an equipped card!");
      }

      const myScore = (myCard.atk || 0) + (myCard.def || 0);
      const enemyScore = (enemyCard.atk || 0) + (enemyCard.def || 0);

      // Result
      if (myScore > enemyScore) {
        return reply(
          `🏆 *WINNER!*\n@${senderNumber} won the battle!\n\n⚔️ Your Power: ${myScore}\n🛡️ Enemy Power: ${enemyScore}`
        );
      } else if (enemyScore > myScore) {
        return reply(
          `💀 *DEFEAT!*\n@${opponentNumber} won the battle!\n\n⚔️ Your Power: ${myScore}\n🛡️ Enemy Power: ${enemyScore}`
        );
      } else {
        return reply(
          `⚖️ *DRAW!*\nBoth players have equal power.\n\n⚔️ ${myScore} vs ${enemyScore}`
        );
      }

    } catch (err) {
      console.error("battle error:", err);
      reply("❌ An error occurred. Please try again.");
    }
  }
});