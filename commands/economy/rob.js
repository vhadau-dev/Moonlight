const config = require('../../config');
const { checkCooldown, formatTime } = require('../../utils/cooldown');
const { addMoney, removeMoney } = require('../../utils/economy');

// Target resolver (mention OR reply)
function getTarget(message) {
  const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;

  return mentioned?.[0] || quoted || null;
}

moon({
  name: "rob",
  category: "economy",
  description: "Attempt to rob another user",
  usage: ".rob @user or reply to a user",
  cooldown: 3,

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {

    const ROB_CD = 30 * 60 * 1000; // 30 minutes
    const MAX_STEAL = 5000;

    try {
      const target = getTarget(message);

      if (!target) {
        return reply("❌ Mention a user or reply to their message.\nExample: *.rob @user*");
      }

      if (target === sender) {
        return reply("❌ You can't rob yourself.");
      }

      const robber = await findOrCreateWhatsApp(sender, pushName);
      const victim = await findOrCreateWhatsApp(target, target.split('@')[0]);

      // ---------------- COOLDOWN ----------------
      const { checkCooldown } = require('../../utils/cooldown');
      const { onCooldown, remaining } = checkCooldown(robber.lastRob, ROB_CD);

      if (onCooldown) {
        return reply(`⏳ You must wait *${formatTime(remaining)}* before robbing again.`);
      }

      if ((victim.balance || 0) < 100) {
        return reply(`❌ @${target.split('@')[0]} is too broke to rob.`, {
          mentions: [target]
        });
      }

      robber.lastRob = new Date();

      // ---------------- SUCCESS / FAIL ----------------
      const success = Math.random() < 0.45;

      if (success) {
        let stolen = Math.floor(
          (victim.balance || 0) * (0.05 + Math.random() * 0.15)
        );

        // Apply hard cap
        stolen = Math.min(stolen, MAX_STEAL);
        stolen = Math.min(stolen, victim.balance);

        removeMoney(victim, stolen);
        addMoney(robber, stolen);

        robber.totalEarned = (robber.totalEarned || 0) + stolen;

        await robber.save();
        await victim.save();

        const text = `
🦹 *Robbery Successful!*

You stole *${stolen.toLocaleString()} coins* from @${target.split('@')[0]}!

💵 *Your Balance:* ${robber.balance.toLocaleString()} coins
        `.trim();

        let pfp;
        try {
          pfp = await sock.profilePictureUrl(sender, 'image');
        } catch {
          pfp = config.MOONLIGHT_IMAGE;
        }

        return await sock.sendMessage(jid, {
          text,
          mentions: [target],
          contextInfo: {
            externalAdReply: {
              title: "🦹 Robbery Success",
              body: "Coins stolen successfully",
              thumbnailUrl: pfp,
              sourceUrl: "https://moonlight.com",
              mediaType: 2
            }
          }
        }, { quoted: message });

      } else {
        const MAX_FINE = 3000;

        let fine = Math.floor((robber.balance || 0) * 0.1);
        fine = Math.min(fine, MAX_FINE);
        fine = Math.min(fine, robber.balance);

        removeMoney(robber, fine);

        robber.totalLost = (robber.totalLost || 0) + fine;

        await robber.save();

        const text = `
🚔 *Robbery Failed!*

You got caught and paid a fine of *${fine.toLocaleString()} coins*!

💵 *Your Balance:* ${robber.balance.toLocaleString()} coins
        `.trim();

        let pfp;
        try {
          pfp = await sock.profilePictureUrl(sender, 'image');
        } catch {
          pfp = config.MOONLIGHT_IMAGE;
        }

        return await sock.sendMessage(jid, {
          text,
          contextInfo: {
            externalAdReply: {
              title: "🚔 Robbery Failed",
              body: "You got caught",
              thumbnailUrl: pfp,
              sourceUrl: "https://moonlight.com",
              mediaType: 2
            }
          }
        }, { quoted: message });
      }

    } catch (err) {
      console.error("Rob command error:", err);
      return reply("❌ Robbery failed due to a system error.");
    }
  }
});