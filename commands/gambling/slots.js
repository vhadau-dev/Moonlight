const { addMoney, removeMoney } = require('../../utils/economy');

moon({
  name: 'slots',
  category: 'gambling',
  description: 'Play the slot machine.',
  usage: '.slots <amount|all>',
  cooldown: 3,

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) {
        return reply('❌ Usage: .slots <amount|all>');
      }

      let bet;

      if (args[0].toLowerCase() === 'all') {
        bet = user.balance;
        if (bet <= 0) return reply('💸 You have no coins to gamble!');
      } else {
        bet = parseInt(args[0]);
      }

      if (!bet || bet <= 0) {
        return reply('❌ Invalid bet amount.');
      }

      if (bet > user.balance) {
        return reply(`❌ You only have *${user.balance.toLocaleString()} coins*.`);
      }

      // ---------------- SLOT SYMBOLS ----------------
      const emojis = ['🍒', '🍋', '🍇', '🍊', '🔔', '💎', '7️⃣'];

      const slots = Array.from({ length: 3 }, () =>
        emojis[Math.floor(Math.random() * emojis.length)]
      );

      const [s1, s2, s3] = slots;

      // ---------------- RESULT LOGIC ----------------
      let multiplier = 0;

      if (s1 === s2 && s2 === s3) multiplier = 10;          // jackpot
      else if (s1 === s2 || s2 === s3 || s1 === s3) multiplier = 2;

      const MAX_WIN = 20000;

      let won = false;
      let payout = 0;

      if (multiplier > 0) {
        payout = Math.min(bet * multiplier, MAX_WIN);
        addMoney(user, payout);
        user.totalEarned = (user.totalEarned || 0) + payout;
        won = true;
      } else {
        removeMoney(user, bet);
        user.totalLost = (user.totalLost || 0) + bet;
      }

      // ---------------- STATS ----------------
      if (!user.gamblingStats) user.gamblingStats = {};

      user.gamblingStats.totalBets = (user.gamblingStats.totalBets || 0) + 1;

      if (won) {
        user.gamblingStats.totalWins = (user.gamblingStats.totalWins || 0) + 1;
        user.gamblingStats.slotsWins = (user.gamblingStats.slotsWins || 0) + 1;
      } else {
        user.gamblingStats.totalLosses = (user.gamblingStats.totalLosses || 0) + 1;
      }

      await user.save();

      const text = `
🎰 *Slots*

[ ${s1} | ${s2} | ${s3} ]

${won 
  ? `🎉 You won *${payout.toLocaleString()} coins*!` 
  : `❌ You lost *${bet.toLocaleString()} coins*!`}

💵 Balance: *${user.balance.toLocaleString()} coins*
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("Slots command error:", err);
      return reply("❌ Slots game failed due to a system error.");
    }
  }
});