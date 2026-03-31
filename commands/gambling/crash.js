const { addMoney, removeMoney } = require('../../utils/economy');

moon({
  name: "crash",
  category: "gambling",
  description: "Play the crash multiplier game",
  usage: ".crash <amount|all>",
  cooldown: 3,

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) return reply("❌ Usage: *.crash <amount|all>*");

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

      // ---------------- CRASH LOGIC ----------------
      const crashPoint = (Math.random() * 4 + 1).toFixed(2);

      // Simulated auto cashout (system-controlled, not user input)
      const cashout = (Math.random() * 3 + 1).toFixed(2);

      const won = parseFloat(cashout) < parseFloat(crashPoint);

      const MAX_WIN = 35000;

      if (won) {
        let payout = bet * parseFloat(cashout);

        // Apply cap
        payout = Math.min(payout, MAX_WIN);

        const winAmount = addMoney(user, payout);

        user.totalEarned = (user.totalEarned || 0) + winAmount;

      } else {
        const lossAmount = removeMoney(user, bet);

        user.totalLost = (user.totalLost || 0) + lossAmount;
      }

      await user.save();

      const text = `
📈 *Crash Game* 📈

💰 Bet: *${bet.toLocaleString()} coins*

🚀 Cashout: *${cashout}x*
💥 Crash: *${crashPoint}x*

${won ? "🎉 You survived the crash!" : "💀 You crashed!"}

💵 Balance: *${user.balance.toLocaleString()} coins*

🌙 Gamble responsibly.
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("Crash command error:", err);
      return reply("❌ Crash game failed due to a system error.");
    }
  }
});