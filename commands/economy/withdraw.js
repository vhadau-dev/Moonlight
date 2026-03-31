const config = require('../../config');

moon({
  name: "withdraw",
  category: "economy",
  description: "Withdraw coins from your bank",
  usage: ".withdraw <amount|all>",
  cooldown: 3,
  aliases: ["with"],

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {

      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) {
        return reply("❌ Usage: *.withdraw <amount|all>*");
      }

      let amount;

      if (args[0].toLowerCase() === "all") {
        amount = user.bank || 0;

        if (amount <= 0) {
          return reply("💸 You have no coins in your bank to withdraw!");
        }
      } else {
        amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0) {
          return reply("❌ Invalid amount.");
        }
      }

      if ((user.bank || 0) < amount) {
        return reply(`❌ You only have *${(user.bank || 0).toLocaleString()} coins* in your bank.`);
      }

      // ✅ DIRECT TRANSFER (NO addMoney / removeMoney)
      user.bank = (user.bank || 0) - amount;
      user.balance = (user.balance || 0) + amount;

      await user.save();

      // ---------------- MESSAGE ----------------
      const text = `
🏦 *Bank Withdrawal*

💵 *Withdrawn:* ${amount.toLocaleString()} coins
💰 *Wallet:* ${user.balance.toLocaleString()} coins
🏦 *Bank:* ${user.bank.toLocaleString()} coins
      `.trim();

      // ---------------- PROFILE ----------------
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
            title: "🏦 Withdrawal Successful",
            body: "Funds moved to wallet",
            thumbnailUrl: pfp,
            sourceUrl: "https://moonlight.com",
            mediaType: 2,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        }
      }, { quoted: message });

    } catch (err) {
      console.error("Withdraw command error:", err);
      return reply("❌ Withdrawal failed due to a system error.");
    }
  }
});