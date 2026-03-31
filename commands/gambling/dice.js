const { addMoney, removeMoney } = require('../../utils/economy');

moon({
  name: "dice",
  category: "gambling",
  description: "Roll dice against the bot",
  usage: ".dice <amount|all>",
  cooldown: 3,

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) return reply("❌ Usage: *.dice <amount|all>*");

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

      // ---------------- ROLL ----------------
      const playerRoll = Math.floor(Math.random() * 6) + 1;
      const botRoll = Math.floor(Math.random() * 6) + 1;

      let result;
      const MAX_WIN = 35000;

      if (playerRoll > botRoll) {
        // Win → capped payout
        let reward = bet * 2;
        reward = Math.min(reward, MAX_WIN);

        const winAmount = addMoney(user, reward);
        user.totalEarned = (user.totalEarned || 0) + winAmount;

        result = "🎉 You win!";

      } else if (playerRoll < botRoll) {
        const lossAmount = removeMoney(user, bet);
        user.totalLost = (user.totalLost || 0) + lossAmount;

        result = "💀 You lose!";

      } else {
        result = "🤝 It's a tie!";
        // no balance change
      }

      await user.save();

      const text = `
🎲 *Dice Roll*

👤 Your Roll: *${playerRoll}*
🤖 Bot Roll: *${botRoll}*

${result}

💰 Bet: *${bet.toLocaleString()} coins*
💵 Balance: *${user.balance.toLocaleString()} coins*

🌙 Try your luck again!
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("Dice command error:", err);
      return reply("❌ Dice game failed due to a system error.");
    }
  }
});