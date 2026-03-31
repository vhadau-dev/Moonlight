const { addMoney, removeMoney } = require('../../utils/economy');
moon({
  name: "coinflip",
  category: "gambling",
  description: "Flip a coin and gamble your coins",
  usage: ".coinflip <heads/tails> <amount|all>",
  cooldown: 3,
  aliases: ["cf"],
  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const choice = args[0]?.toLowerCase();
      if (!["heads", "tails"].includes(choice)) {
        return reply("❌ Usage: *.coinflip <heads/tails> <amount|all>*");
      }
      const user = await findOrCreateWhatsApp(sender, pushName);
      let amount;
      if (args[1]?.toLowerCase() === "all") {
        amount = Math.min(user.balance, 25000);
        if (amount <= 0) return reply("💸 You have no coins to gamble!");
      } else {
        amount = parseInt(args[1]);
      }
      if (!amount || amount <= 0) return reply("❌ Invalid bet amount.");
      if (amount > 25000) {
        return reply(`❌ Maximum bet is *25,000 coins*. You can't bet more than that!`);
      }
      if (amount > user.balance) {
        return reply(`❌ You only have *${user.balance.toLocaleString()} coins*.`);
      }
      // ---------------- FLIP ----------------
      const result = Math.random() < 0.5 ? "heads" : "tails";
      const win = choice === result;
      const MAX_WIN = 35000;
      if (win) {
        // Payout (capped)
        let reward = amount * 2;
        reward = Math.min(reward, MAX_WIN);
        const winAmount = addMoney(user, reward);
        user.totalEarned = (user.totalEarned || 0) + winAmount;
      } else {
        const lossAmount = removeMoney(user, amount);
        user.totalLost = (user.totalLost || 0) + lossAmount;
      }
      await user.save();
      const text = `
🪙 *Coin Flip* 🪙
🎯 Your Choice: *${choice}*
🪙 Result: *${result}*
${win ? "🎉 You won!" : "💀 You lost!"}
💰 Bet: *${amount.toLocaleString()} coins*
💵 Balance: *${user.balance.toLocaleString()} coins*
🌙 Try your luck again or play responsibly!
      `.trim();
      return reply(text);
    } catch (err) {
      console.error("Coinflip error:", err);
      return reply("❌ Coinflip failed due to a system error.");
    }
  }
});
