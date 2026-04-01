const config = require('../../config');

moon({
  name: "pay",
  category: "economy",
  description: "Give coins to someone",
  usage: ".pay @user <amount>",
  cooldown: 3,
  aliases: ["give"],

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {

      const contextInfo = message.message?.extendedTextMessage?.contextInfo;
      const target = contextInfo?.mentionedJid?.[0] || contextInfo?.participant;

      if (!target) {
        return reply("❌ Mention or reply to someone to pay.\nExample: *.pay @user 500*");
      }

      // If replying, amount is in args[0]. If mentioning, amount is in args[1].
      const isReply = contextInfo?.participant && !contextInfo?.mentionedJid?.[0];
      const amount = parseInt(isReply ? args[0] : (args[1] || args[0]));

      if (!amount || amount <= 0) {
        return reply("❌ Enter a valid amount of coins.");
      }

      if (target === sender) {
        return reply("❌ You can't pay yourself.");
      }

      // ---------------- USERS ----------------
      const senderUser = await findOrCreateWhatsApp(sender, pushName);
      const targetUser = await findOrCreateWhatsApp(target, target.split('@')[0]);

      const senderBalance = senderUser.balance || 0;

      if (senderBalance < amount) {
        return reply(`❌ You only have *${senderBalance.toLocaleString()} coins* in your wallet.`);
      }

      // ---------------- TRANSFER ----------------
      senderUser.balance = senderBalance - amount;
      targetUser.balance = (targetUser.balance || 0) + amount;

      await senderUser.save();
      await targetUser.save();

      // ---------------- MESSAGE ----------------
      const text = `
💸 *Payment Sent*

👤 *From:* ${senderUser.username || sender.split('@')[0]}
👤 *To:* ${targetUser.username || target.split('@')[0]}

💰 *Amount:* ${amount.toLocaleString()} coins
💵 *Your Balance:* ${senderUser.balance.toLocaleString()} coins
      `.trim();

      // ---------------- PROFILE PICTURE ----------------
      let pfp;
      try {
        pfp = await sock.profilePictureUrl(sender, 'image');
      } catch {
        pfp = config.MOONLIGHT_IMAGE;
      }

      // ---------------- EMBED + PROPER REPLY ----------------
      await sock.sendMessage(jid, {
        text,
        contextInfo: {
          externalAdReply: {
            title: "💸 Payment Successful",
            body: "Coins transferred",
            thumbnailUrl: pfp,
            sourceUrl: "https://moonlight.com",
            mediaType: 2,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        }
      }, { quoted: message });

    } catch (err) {
      console.error("Pay command error:", err);
      return reply("❌ Payment failed due to a system error.");
    }
  }
});