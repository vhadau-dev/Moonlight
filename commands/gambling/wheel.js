const { addMoney, removeMoney } = require('../../utils/economy');

moon({
  name: 'wheel',
  category: 'gambling',
  description: 'Spin the wheel for a chance to win!',
  usage: '.wheel <amount|all>',

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) {
        return reply('❌ Usage: .wheel <amount|all>');
      }

      let bet;

      if (args[0].toLowerCase() === 'all') {
        bet = Math.min(user.balance, 25000);
        if (bet <= 0) return reply('💸 You have no coins to gamble!');
      } else {
        bet = parseInt(args[0]);
      }

      if (!bet || bet <= 0) {

      if (bet > 25000) {
        return reply(`❌ Maximum bet is *25,000 coins*. You can't bet more than that!`);
      }
        return reply('❌ Invalid bet amount.');
      }

      if (bet > user.balance) {
        return reply(`❌ You only have *${user.balance.toLocaleString()} coins*.`);
      }

      // ---------------- WIN CHANCE ----------------
      const isWin = Math.random() < 0.40;

      let multiplier = 0;

      if (isWin) {
        const multipliers = [1.2, 1.5, 2, 3, 5];
        multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
      }

      const MAX_WIN = 35000;

      let payout = 0;

      if (isWin) {
        payout = Math.min(Math.floor(bet * multiplier), MAX_WIN);
        addMoney(user, payout);
        user.totalEarned = (user.totalEarned || 0) + payout;
      } else {
        removeMoney(user, bet);
        user.totalLost = (user.totalLost || 0) + bet;
      }

      // ---------------- STATS ----------------
      if (!user.gamblingStats) user.gamblingStats = {};

      user.gamblingStats.totalBets = (user.gamblingStats.totalBets || 0) + 1;

      if (isWin) {
        user.gamblingStats.totalWins = (user.gamblingStats.totalWins || 0) + 1;
      } else {
        user.gamblingStats.totalLosses = (user.gamblingStats.totalLosses || 0) + 1;
      }

      await user.save();

      // ---------------- RESULT ----------------
      const text = `
🎡 *Wheel Spin*

Result: *${isWin ? 'WIN' : 'LOSE'}*

${isWin
  ? `🎉 Won *${payout.toLocaleString()} coins*`
  : `❌ Lost *${bet.toLocaleString()} coins*`}

💰 Balance: *${user.balance.toLocaleString()} coins*
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("Wheel command error:", err);
      return reply("❌ Wheel game failed due to a system error.");
    }
  }
});