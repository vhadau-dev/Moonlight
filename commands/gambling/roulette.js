const { addMoney, removeMoney } = require('../../utils/economy');

moon({
  name: "roulette",
  category: "gambling",
  description: "Roulette game",
  usage: ".roulette <choice> <amount|all>",
  cooldown: 3,
  aliases: ["r"],

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      const choice = (args[0] || '').toLowerCase();

      if (!choice) {
        return reply('❌ Usage: *.roulette <choice> <amount|all>*');
      }

      const bet = args[1]?.toLowerCase() === 'all'
        ? Math.min(user.balance, 25000)
        : parseInt(args[1]);

      const validChoices = [
        'red', 'black', 'green', 'odd', 'even',
        ...Array.from({ length: 37 }, (_, i) => String(i))
      ];

      if (!validChoices.includes(choice)) {
        return reply('❌ Choose: red, black, green, odd, even, or number 0-36');
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

      // ---------------- ROULETTE SPIN ----------------
      const spin = Math.floor(Math.random() * 37);

      const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

      const spinColor =
        spin === 0 ? 'green' :
        redNumbers.includes(spin) ? 'red' : 'black';

      const spinEmoji =
        spinColor === 'green' ? '🟢' :
        spinColor === 'red' ? '🔴' : '⚫';

      // ---------------- WIN LOGIC ----------------
      let won = false;
      let mult = 0;

      if (choice === 'green' && spin === 0) {
        won = true;
        mult = 14;

      } else if (choice === 'red' && spinColor === 'red') {
        won = true;
        mult = 2;

      } else if (choice === 'black' && spinColor === 'black') {
        won = true;
        mult = 2;

      } else if (choice === 'odd' && spin !== 0 && spin % 2 !== 0) {
        won = true;
        mult = 2;

      } else if (choice === 'even' && spin !== 0 && spin % 2 === 0) {
        won = true;
        mult = 2;

      } else if (!isNaN(parseInt(choice)) && parseInt(choice) === spin) {
        won = true;
        mult = 36;
      }

      const MAX_WIN = 35000;

      if (won) {
        let reward = bet * mult;

        // Net profit (since bet is returned inside multiplier concept)
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
🎡 *Roulette*

${spinEmoji} Ball landed on *${spin}* (${spinColor})
You bet on: *${choice}*

${won 
  ? `✅ You won (capped payout)` 
  : `❌ You lost *${bet.toLocaleString()} coins*!`}

💵 Balance: *${user.balance.toLocaleString()} coins*
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("Roulette command error:", err);
      return reply("❌ Roulette game failed due to a system error.");
    }
  }
});