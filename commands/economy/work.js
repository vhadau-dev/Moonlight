const config = require('../../config');
const { checkCooldown, formatTime } = require('../../utils/cooldown');
const { addMoney } = require('../../utils/economy');

moon({
  name: "work",
  category: "economy",
  description: "Work to earn coins",
  usage: ".work",
  cooldown: 3,

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {

      const WORK_CD = 60 * 60 * 1000; // 1 hour
      const user = await findOrCreateWhatsApp(sender, pushName);

      // ---------------- COOLDOWN ----------------
      const { onCooldown, remaining } = checkCooldown(user.lastWork, WORK_CD);

      if (onCooldown) {
        return reply(`⏳ You're tired!\nCome back in *${formatTime(remaining)}* to work again.`);
      }

      // ---------------- EARNINGS ----------------
      const min = 100;
      const max = 500;
      const earned = Math.floor(Math.random() * (max - min + 1)) + min;

      const jobs = [
        "Pizza Delivery Driver",
        "Software Developer",
        "Graphic Designer",
        "Street Performer",
        "Chef",
        "Dog Walker",
        "Taxi Driver",
        "Freelancer"
      ];

      const job = jobs[Math.floor(Math.random() * jobs.length)];

      // Use economy helper
      const win = addMoney(user, earned);
      user.totalEarned = (user.totalEarned || 0) + win;
      user.lastWork = new Date();

      await user.save();

      // ---------------- MESSAGE ----------------
      const text = `
💼 *Work Complete!*

👤 *Job:* ${job}
💵 *Earned:* +${earned.toLocaleString()} coins

💰 *Wallet:* ${user.balance.toLocaleString()} coins
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
            title: "💼 Work Completed",
            body: "Earnings credited",
            thumbnailUrl: pfp,
            sourceUrl: "https://moonlight.com",
            mediaType: 2,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        }
      }, { quoted: message });

    } catch (err) {
      console.error("Work command error:", err);
      return reply("❌ Work failed due to a system error.");
    }
  }
});