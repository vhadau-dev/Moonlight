const { addMoney, removeMoney } = require('../../utils/economy');

moon({
  name: "double",
  category: "gambling",
  description: "Double or nothing. Double your coins or lose them all!",
  usage: ".double <amount|all>",
  cooldown: 3,

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) return reply("❌ Usage: *.double <amount|all>*");

      let bet = args[0].toLowerCase() === "all" ? Math.min(user.balance, 25000) : parseInt(args[0]);

      if (!bet || bet <= 0) return reply("❌ Invalid bet amount.");

      if (bet > 25000) {
        return reply(`❌ Maximum bet is *25,000 coins*. You can't bet more than that!`);
      }
      if (bet > user.balance) {
        return reply(`❌ You only have *${user.balance.toLocaleString()} coins*.`);
      }

      // ---------------- GAMBLING ----------------
      const win = Math.random() < 0.5;
      const MAX_WIN = 35000;

      if (win) {
        // Normally double the bet
        let reward = bet * 2;

        // Apply cap
        reward = Math.min(reward, MAX_WIN);

        const winAmount = addMoney(user, reward);

        user.totalEarned = (user.totalEarned || 0) + winAmount;

      } else {
        const lossAmount = removeMoney(user, bet);

        user.totalLost = (user.totalLost || 0) + lossAmount;
      }

      await user.save();

      const text = `
💰 *Double or Nothing*

Bet: *${bet.toLocaleString()} coins*
Result: ${win ? "🎉 You doubled your bet!" : "💀 You lost your bet!"}

💵 Balance: *${user.balance.toLocaleString()} coins*

🌙 Take your chances wisely!
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("Double command error:", err);
      return reply("❌ Double game failed due to a system error.");
    }
  }
});