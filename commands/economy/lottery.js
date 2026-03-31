const Lottery = require('../../models/Lottery');
const User = require('../../models/User');

moon({
  name: "lottery",
  category: "economy",
  description: "Join or manage lottery",
  usage: ".lottery | .lottery draw",

  async execute(sock, jid, sender, args, m, { reply, pushName }) {
    try {

      let lottery = await Lottery.findOne({ active: true });

      if (!lottery) {
        lottery = new Lottery({
          active: true,
          participants: []
        });
      }

      const userId = sender;

      // =========================
      // 🎯 MANUAL DRAW
      // =========================
      if (args[0]?.toLowerCase() === "draw") {

        if (!lottery.participants || lottery.participants.length < 2) {
          return reply("❌ Not enough participants to draw.");
        }

        return await drawLottery();
      }

      // =========================
      // 🎟️ JOIN LOGIC
      // =========================

      const existing = lottery.participants.find(p => p.userId === userId);

      if (existing) {
        if (existing.entries >= 3) {
          return reply("❌ You can only join this lottery up to 3 times.");
        }
        existing.entries += 1;
      } else {
        lottery.participants.push({
          userId,
          entries: 1
        });
      }

      await lottery.save();

      const count = lottery.participants.length;

      await reply(`🎟️ Joined lottery!\n👥 Players: ${count}/5`);

      // =========================
      // 🎯 AUTO DRAW AT 5
      // =========================
      if (count >= 5) {
        return await drawLottery();
      }

      // =========================
      // 🎯 DRAW FUNCTION
      // =========================
      async function drawLottery() {

        const valid = lottery.participants.filter(p => p && p.userId);

        if (valid.length === 0) return reply("❌ No valid participants.");

        // Shuffle
        const shuffled = valid.sort(() => Math.random() - 0.5);

        const winners = shuffled.slice(0, 2);

        const firstPrize = 500000;
        const secondPrize = 250000;

        for (let i = 0; i < winners.length; i++) {
          const w = winners[i];

          const user = await User.findOne({ whatsappNumber: w.userId });

          if (user) {
            const prize = i === 0 ? firstPrize : secondPrize;
            user.balance += prize;
            await user.save();
          }
        }

        // Announce
        await sock.sendMessage(jid, {
          text: `
🏆 *Lottery Results*

🥇 1st Winner: ${winners[0].userId.split('@')[0]} → ${firstPrize.toLocaleString()}
🥈 2nd Winner: ${winners[1].userId.split('@')[0]} → ${secondPrize.toLocaleString()}

🎉 Congratulations!
          `.trim()
        });

        // Reset lottery
        lottery.participants = [];
        await lottery.save();
      }

    } catch (err) {
      console.error("lottery error:", err);
      reply("❌ Lottery command failed.");
    }
  }
});