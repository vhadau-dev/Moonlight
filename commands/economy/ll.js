const Lottery = require('../../models/Lottery');

moon({
  name: "ll",
  category: "Economy",
  description: "Show current lottery participants",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      const lottery = await Lottery.findOne({ active: true });

      if (!lottery || !lottery.participants || lottery.participants.length === 0) {
        return reply("🎟️ No active lottery.\nUse *.lottery* to join.");
      }

      const required = 5;
      const participants = lottery.participants.filter(p => p && p.userId);
      const current = participants.length;

      const text = `
🎟️ *Lottery Status*

👥 Players: ${current}/${required}
⭐ Do `.lottery`to join
`.trim();

      await reply(text);

    } catch (err) {
      console.error("ll command error:", err);
      reply("❌ Failed to load lottery status.");
    }
  }
});