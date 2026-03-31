const { addMoney, removeMoney } = require('../../utils/economy');

moon({
  name: "poker",
  category: "gambling",
  description: "Poker hand",
  usage: ".poker <amount|all>",
  cooldown: 3,

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) {
        return reply("❌ Usage: *.poker <amount|all>*");
      }

      let bet;

      if (args[0].toLowerCase() === "all") {
        bet = user.balance;
        if (bet <= 0) return reply("💸 You have no coins to bet!");
      } else {
        bet = parseInt(args[0]);
      }

      if (!bet || bet <= 0) {
        return reply("❌ Invalid bet amount.");
      }

      if (bet > user.balance) {
        return reply(`❌ You only have *${user.balance.toLocaleString()} coins*.`);
      }

      // ---------------- POKER HANDS ----------------
      const hands = [
        'High Card', 'One Pair', 'Two Pair', 'Three of a Kind', 'Straight',
        'Flush', 'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Flush'
      ];

      const multipliers = [0, 1.5, 2, 3, 4, 6, 8, 15, 25, 100];
      const weights = [35, 30, 15, 8, 5, 3, 2, 1.5, 0.4, 0.1];

      // Weighted selection
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * totalWeight;

      let idx = 0;
      for (let i = 0; i < weights.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
          idx = i;
          break;
        }
      }

      const hand = hands[idx];
      const mult = multipliers[idx];

      const won = mult > 1;

      const MAX_WIN = 20000;

      if (won) {
        let reward = bet * mult;

        // Apply cap
        reward = Math.min(reward, MAX_WIN);

        const winAmount = addMoney(user, reward);

        user.totalEarned = (user.totalEarned || 0) + winAmount;

      } else {
        const lossAmount = removeMoney(user, bet);

        user.totalLost = (user.totalLost || 0) + lossAmount;
      }

      // Stats
      if (!user.gamblingStats) user.gamblingStats = {};
      user.gamblingStats.totalBets = (user.gamblingStats.totalBets || 0) + 1;

      if (won) {
        user.gamblingStats.totalWins = (user.gamblingStats.totalWins || 0) + 1;
      } else {
        user.gamblingStats.totalLosses = (user.gamblingStats.totalLosses || 0) + 1;
      }

      await user.save();

      const text = `
🃏 *Poker Game*

Your hand: *${hand}*

${won 
  ? `✅ You won with a *${mult}x* multiplier (capped)` 
  : `❌ You lost *${bet.toLocaleString()} coins*!`}

💵 Balance: *${user.balance.toLocaleString()} coins*
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("Poker command error:", err);
      return reply("❌ Poker game failed due to a system error.");
    }
  }
});