const { addMoney, removeMoney } = require('../../utils/economy');

moon({
  name: "blackjack",
  category: "gambling",
  description: "Play a round of blackjack",
  usage: ".blackjack <amount|all>",
  cooldown: 3,
  aliases: ["bj"],

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) return reply("❌ Usage: *.blackjack <amount|all>*");

      let bet;

      if (args[0].toLowerCase() === "all") {
        bet = user.balance;
        if (bet <= 0) return reply("💸 You have no coins to bet!");
      } else {
        bet = parseInt(args[0]);
      }

      if (!bet || bet <= 0) return reply("❌ Invalid bet amount.");
      if (bet > user.balance) {
        return reply(`❌ You only have *${user.balance.toLocaleString()} coins*.`);
      }

      // ---------------- BLACKJACK LOGIC ----------------
      const player = Math.floor(Math.random() * 11) + 16; // 16–26
      const dealer = Math.floor(Math.random() * 11) + 16; // 16–26

      let resultText;
      let outcome = "lose"; // win | lose | tie

      if (player > 21) {
        resultText = "💥 Bust! You went over 21.";
        outcome = "lose";

      } else if (dealer > 21 || player > dealer) {
        resultText = "✅ You beat the dealer!";
        outcome = "win";

      } else if (player === dealer) {
        resultText = "🤝 It's a tie!";
        outcome = "tie";

      } else {
        resultText = "❌ Dealer wins!";
        outcome = "lose";
      }

      const MAX_WIN = 20000;

      if (outcome === "win") {
        // Win payout (capped)
        let reward = bet * 2;
        reward = Math.min(reward, MAX_WIN);

        const winAmount = addMoney(user, reward);

        user.totalEarned = (user.totalEarned || 0) + winAmount;

      } else if (outcome === "lose") {
        const lossAmount = removeMoney(user, bet);

        user.totalLost = (user.totalLost || 0) + lossAmount;
      }

      await user.save();

      const text = `
🃏 *Blackjack* 🃏

👤 Your Score: *${player}*
🤖 Dealer Score: *${dealer}*

${resultText}

💰 Bet: *${bet.toLocaleString()} coins*
💵 Balance: *${user.balance.toLocaleString()} coins*

🌙 Try again or test your luck wisely!
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("Blackjack error:", err);
      return reply("❌ Blackjack failed due to a system error.");
    }
  }
});