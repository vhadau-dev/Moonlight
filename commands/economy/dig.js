const config = require('../../config');
const { addMoney } = require('../../utils/economy');

moon({
  name: 'dig',
  category: 'economy',
  description: 'Dig underground for treasure.',
  usage: '.dig',
  cooldown: 40,

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {

      const user = await findOrCreateWhatsApp(sender, pushName);

      // ---------------- COOLDOWN ----------------
      const now = Date.now();
      const last = user.lastDig || 0;
      const cooldown = 40 * 1000;

      if (now - last < cooldown) {
        const remaining = Math.ceil((cooldown - (now - last)) / 1000);
        return reply(`⏳ Wait ${remaining}s before digging again.`);
      }

      user.lastDig = now;

      // ---------------- RANDOM EVENTS ----------------
      const events = [
        { name: '🪨 Dirt', reward: 20 },
        { name: '🪙 Old Coins', reward: 80 },
        { name: '💰 Buried Cash', reward: 200 },
        { name: '💎 Hidden Gem', reward: 350 },
        { name: '💀 Nothing Found', reward: 0 }
      ];

      const event = events[Math.floor(Math.random() * events.length)];

      // Use economy helper (prevents overflow + tracks caps)
      if (event.reward > 0) {
        const win = addMoney(user, event.reward);
        user.totalEarned = (user.totalEarned || 0) + win;
      }

      await user.save();

      // ---------------- PROFILE ----------------
      let pfp;
      try {
        pfp = await sock.profilePictureUrl(sender, 'image');
      } catch {
        pfp = config.MOONLIGHT_IMAGE;
      }

      const text = `
━━━━━━━━━━━━━━━━━━
⛏️ *Digging Result*

👤 ${user.username}
📦 Found: ${event.name}

💰 Earned: ${event.reward.toLocaleString()} mc
━━━━━━━━━━━━━━━━━━
      `.trim();

      await sock.sendMessage(jid, {
        text,
        contextInfo: {
          externalAdReply: {
            title: "⛏️ Digging",
            body: "Search the underground",
            thumbnailUrl: pfp,
            sourceUrl: "https://moonlight.com",
            mediaType: 2
          }
        }
      }, { quoted: message });

    } catch (err) {
      console.error('Dig command error:', err);
      return reply('❌ Digging failed.');
    }
  }
});