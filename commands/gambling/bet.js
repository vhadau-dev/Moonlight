const { addMoney, removeMoney } = require('../../utils/economy');

moon({
  name: "bet",
  category: "gambling",
  description: "Bet your coins for a chance to win",
  usage: ".bet <amount|all>",
  cooldown: 3,

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) return reply("❌ Usage: *.bet <amount|all>*");

      let bet;

      if (args[0].toLowerCase() === "all") {
        bet = Math.min(user.balance, 25000);
        if (bet <= 0) return reply("💸 You have no coins to bet!");
      } else {
        bet = parseInt(args[0]);
      }

      if (!bet || bet <= 0) return reply("❌ Invalid bet amount.");

      if (bet > 25000) {
        return reply(`❌ Maximum bet is *25,000 coins*. You can't bet more than that!`);
      }
      if (bet > user.balance) {
        return reply(`❌ You only have *${user.balance.toLocaleString()} coins*.`);
      }

      // ---------------- GAMBLING LOGIC ----------------
      const winChance = 0.45;
      const won = Math.random() < winChance;

      const MAX_WIN = 35000;

      if (won) {
        // Calculate reward (double bet but capped)
        let reward = bet * 2;

        // Apply max win cap
        reward = Math.min(reward, MAX_WIN);

        const winAmount = addMoney(user, reward);

        user.totalEarned = (user.totalEarned || 0) + winAmount;

        await user.save();

        const text = `
🎰 *Casino Bet* 🎰

💰 Bet: *${bet.toLocaleString()} coins*
✅ You won *${winAmount.toLocaleString()} coins!*

💵 Balance: *${user.balance.toLocaleString()} coins*
        `.trim();

        return reply(text);

      } else {
        const lossAmount = removeMoney(user, bet);

        user.totalLost = (user.totalLost || 0) + lossAmount;

        await user.save();

        const text = `
🎰 *Casino Bet* 🎰

💰 Bet: *${bet.toLocaleString()} coins*
❌ You lost *${lossAmount.toLocaleString()} coins*

💵 Balance: *${user.balance.toLocaleString()} coins*
        `.trim();

        return reply(text);
      }

    } catch (err) {
      console.error("Bet command error:", err);
      return reply("❌ Bet failed due to a system error.");
    }
  }
});