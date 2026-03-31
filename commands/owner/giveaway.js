const config = require('../../config');

let activeGiveaway = null;

moon({
  name: "gvw",
  category: "owner",
  description: "Start a giveaway",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      // ---------------- OWNER CHECK ----------------
      const ownerNumbers = config.OWNER_NUMBERS || [];
      const senderNumber = sender.split('@')[0];

      if (!ownerNumbers.includes(senderNumber)) {
        return reply('⛔ You don't have permission for that.');
      }

      // ---------------- VALIDATION ----------------
      if (!args[0]) {
        return reply("❌ Usage: .gvw <amount>");
      }

      const amount = parseInt(args[0]);

      if (!amount || amount <= 0) {
        return reply("❌ Invalid giveaway amount.");
      }

      // Optional safety cap (prevents economy abuse)
      const MAX_GIVEAWAY = 1_000_000;
      if (amount > MAX_GIVEAWAY) {
        return reply(`❌ Giveaway too large. Max allowed is ${MAX_GIVEAWAY.toLocaleString()} coins.`);
      }

      // ---------------- ACTIVE CHECK ----------------
      if (activeGiveaway) {
        return reply("❌ A giveaway is already running.");
      }

      // ---------------- CREATE GIVEAWAY ----------------
      const id = Math.floor(100000 + Math.random() * 900000).toString();

      const duration = 5 * 60 * 1000; // 5 minutes

      activeGiveaway = {
        id,
        amount,
        claimed: false,
        createdAt: Date.now(),
        expiresAt: Date.now() + duration,
        winner: null
      };

      // Auto-expire giveaway
      setTimeout(() => {
        if (activeGiveaway && activeGiveaway.id === id && !activeGiveaway.claimed) {
          activeGiveaway = null;
        }
      }, duration);

      const text = `
🎉 *GIVEAWAY STARTED!* 🎉

💰 Prize: *${amount.toLocaleString()} coins*
⏳ Duration: *5 minutes*

⚡ First person to claim wins!

👉 Claim with:
*.cm ${id}*
      `.trim();

      await sock.sendMessage(jid, { text }, { quoted: m });

    } catch (err) {
      console.error("Giveaway error:", err);
      return reply("❌ Failed to start giveaway.");
    }
  }
});

// exports
module.exports.getGiveaway = () => activeGiveaway;
module.exports.clearGiveaway = () => (activeGiveaway = null);