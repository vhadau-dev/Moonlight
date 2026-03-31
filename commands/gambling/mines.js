const { addMoney, removeMoney } = require('../../utils/economy');

moon({
  name: "mines",
  category: "gambling",
  description: "Mines game",
  usage: ".mines <amount|all>",
  cooldown: 3,

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) {
        return reply("❌ Usage: *.mines <amount|all>*");
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

      // ---------------- GAME LOGIC ----------------
      const picks = Math.floor(Math.random() * 8) + 1;

      let hitMine = false;

      for (let i = 0; i < picks; i++) {
        if (Math.random() < 5 / (25 - i)) {
          hitMine = true;
          break;
        }
      }

      const won = !hitMine;

      const MAX_WIN = 20000;

      if (won) {
        // Multiplier based on picks
        let multiplier = 1 + picks * 0.3;

        let reward = bet * multiplier;

        // Apply cap
        reward = Math.min(reward, MAX_WIN);

        const winAmount = addMoney(user, reward);

        user.totalEarned = (user.totalEarned || 0) + winAmount;

      } else {
        const lossAmount = removeMoney(user, bet);

        user.totalLost = (user.totalLost || 0) + lossAmount;
      }

      // Gambling stats (safe init)
      if (!user.gamblingStats) user.gamblingStats = {};

      user.gamblingStats.totalBets = (user.gamblingStats.totalBets || 0) + 1;

      if (won) {
        user.gamblingStats.totalWins = (user.gamblingStats.totalWins || 0) + 1;
      } else {
        user.gamblingStats.totalLosses = (user.gamblingStats.totalLosses || 0) + 1;
      }

      await user.save();

      const multiplierDisplay = won ? (1 + picks * 0.3).toFixed(1) : "0.0";

      const text = `
💣 *Mines Game*

Picked *${picks}* tiles

${won 
  ? `✅ Safe! You won with a *${multiplierDisplay}x* multiplier` 
  : `💥 Hit a mine! You lost *${bet.toLocaleString()} coins*`}
  
💵 Balance: *${user.balance.toLocaleString()} coins*
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("Mines command error:", err);
      return reply("❌ Mines game failed due to a system error.");
    }
  }
});