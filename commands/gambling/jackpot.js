const User = require('../../models/User');
const Jackpot = require('../../models/Jackpot');
const { removeMoney } = require('../../utils/economy');

moon({
  name: "jackpot",
  category: "gambling",
  description: "Enter the jackpot pool",
  usage: ".jackpot <amount|all>",
  cooldown: 3,
  aliases: ["jp"],

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) {
        return reply("❌ Usage: *.jackpot <amount|all>*");
      }

      let bet;

      if (args[0].toLowerCase() === "all") {
        bet = Math.min(user.balance, 25000);
        if (bet <= 0) return reply("💸 You have no coins to enter the jackpot!");
      } else {
        bet = parseInt(args[0]);
      }

      if (!bet || bet <= 0) {

      if (bet > 25000) {
        return reply(`❌ Maximum bet is *25,000 coins*. You can't bet more than that!`);
      }
        return reply("❌ Invalid bet amount.");
      }

      if (bet > user.balance) {
        return reply(`❌ You only have *${user.balance.toLocaleString()} coins*.`);
      }

      // ---------------- DEDUCT ENTRY ----------------
      const lossAmount = removeMoney(user, bet);
      user.totalLost = (user.totalLost || 0) + lossAmount;

      await user.save();

      // ---------------- JACKPOT POOL ----------------
      let jackpot = await Jackpot.findOne();

      if (!jackpot) {
        jackpot = new Jackpot({ pool: 0, entries: [] });
      }

      const existing = jackpot.entries.find(e => e.userId === sender);

      if (existing) {
        existing.tickets += bet;
        existing.amount += bet;
      } else {
        jackpot.entries.push({
          userId: sender,
          username: user.username,
          tickets: bet,
          amount: bet
        });
      }

      jackpot.pool += bet;

      await jackpot.save();

      const text = `
💰 *Jackpot Entry*

👤 User: ${user.username}
💵 Bet: *${bet.toLocaleString()} coins*
🏦 Current Pool: *${jackpot.pool.toLocaleString()} coins*

🌙 A winner is drawn every hour! Good luck!
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("Jackpot command error:", err);
      return reply("❌ Jackpot entry failed due to a system error.");
    }
  }
});