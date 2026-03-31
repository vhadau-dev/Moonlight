const config = require('../../config');
const { checkCooldown, formatTime } = require('../../utils/cooldown');

moon({
  name: "daily",
  category: "economy",
  description: "Claim your daily reward",
  usage: ".daily",
  cooldown: 3,
  aliases: ["claim"],

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {

    let user;

    try {
      user = await findOrCreateWhatsApp(sender, pushName);
    } catch (err) {
      console.error('DB error in daily command:', err);
      return reply('❌ Could not access your account.');
    }

    // ---------------- COOLDOWN ----------------
    const { onCooldown, remaining } = checkCooldown(
      user.lastDaily,
      24 * 60 * 60 * 1000
    );

    if (onCooldown) {
      return reply(
        `⏳ You have already claimed your daily reward!\nTry again in *${formatTime(remaining)}*`
      );
    }

    // ---------------- REWARD ----------------
    const reward = Math.floor(Math.random() * 300) + 400;

    // Safe update
    user.balance = (user.balance || 0) + reward;
    user.lastDaily = new Date();

    // Optional tracking
    user.totalEarned = (user.totalEarned || 0) + reward;

    await user.save();

    // ---------------- MESSAGE ----------------
    const text = `
🎉 *Daily Reward Claimed!*

👤 *User:* ${user.username || sender.split('@')[0]}
💵 *Reward:* +${reward.toLocaleString()} coins
💰 *New Balance:* ${user.balance.toLocaleString()} coins
    `.trim();

    // ---------------- PROFILE PICTURE ----------------
    let pfp;
    try {
      pfp = await sock.profilePictureUrl(sender, 'image');
    } catch {
      pfp = config.MOONLIGHT_IMAGE;
    }

    // ---------------- EMBED ----------------
    await sock.sendMessage(jid, {
      text,
      contextInfo: {
        externalAdReply: {
          title: "🎁 Daily Reward",
          body: "Claim successful",
          thumbnailUrl: pfp,
          sourceUrl: "https://moonlight.com",
          mediaType: 2,
          renderLargerThumbnail: false,
          showAdAttribution: false
        }
      }
    }, { quoted: message });

  }
});