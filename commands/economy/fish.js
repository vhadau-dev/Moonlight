const config = require('../../config');
const { addMoney } = require('../../utils/economy');

moon({
  name: 'fish',
  category: 'economy',
  description: 'Go fishing and earn rewards.',
  usage: '.fish',
  cooldown: 30,

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {

      const user = await findOrCreateWhatsApp(sender, pushName);

      // ---------------- COOLDOWN ----------------
      const now = Date.now();
      const last = user.lastFish || 0;
      const cooldown = 30 * 1000;

      if (now - last < cooldown) {
        const remaining = Math.ceil((cooldown - (now - last)) / 1000);
        return reply(`⏳ Wait ${remaining}s before fishing again.`);
      }

      user.lastFish = now;

      // ---------------- RANDOM EVENTS ----------------
      const events = [
        { name: '🐟 Small Fish', reward: 50 },
        { name: '🐠 Rare Fish', reward: 120 },
        { name: '🦈 Big Catch', reward: 250 },
        { name: '🗑️ Trash', reward: 10 },
        { name: '💎 Treasure Chest', reward: 400 }
      ];

      const event = events[Math.floor(Math.random() * events.length)];

      // Use economy helper
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
🎣 *Fishing Result*

👤 ${user.username}
🎯 You caught: ${event.name}

💰 Earned: ${event.reward.toLocaleString()} mc
━━━━━━━━━━━━━━━━━━
      `.trim();

      await sock.sendMessage(jid, {
        text,
        contextInfo: {
          externalAdReply: {
            title: "🎣 Fishing",
            body: "Cast your luck into the waters",
            thumbnailUrl: pfp,
            sourceUrl: "https://moonlight.com",
            mediaType: 2
          }
        }
      }, { quoted: message });

    } catch (err) {
      console.error('Fish command error:', err);
      return reply('❌ Fishing failed.');
    }
  }
});