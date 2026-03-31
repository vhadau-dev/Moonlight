const config = require('../../config');

moon({
  name: "deposit",
  category: "economy",
  description: "Deposit coins to your bank",
  usage: ".deposit <amount|all>",
  cooldown: 3,
  aliases: ["dep"],

  async execute(sock, jid, sender, args, message, { findOrCreateWhatsApp, reply, pushName }) {
    try {

      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!args[0]) {
        return reply('❌ Usage: *.deposit <amount|all>*');
      }

      let amount;

      if (args[0].toLowerCase() === 'all') {
        amount = user.balance || 0;

        if (amount <= 0) {
          return reply('💸 You have no coins to deposit!');
        }
      } else {
        amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0) {
          return reply('❌ Invalid amount.');
        }
      }

      if ((user.balance || 0) < amount) {
        return reply(`❌ You only have *${(user.balance || 0).toLocaleString()} coins* in your wallet.`);
      }

      // ✅ DIRECT TRANSFER (NO removeMoney / addMoney)
      user.balance = (user.balance || 0) - amount;
      user.bank = (user.bank || 0) + amount;

      await user.save();

      // ---------------- MESSAGE ----------------
      const text = `
🏦 *Bank Deposit*

💵 *Deposited:* ${amount.toLocaleString()} coins
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
            title: "🏦 Deposit Successful",
            body: "Funds moved to bank",
            thumbnailUrl: pfp,
            sourceUrl: "https://moonlight.com",
            mediaType: 2,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        }
      }, { quoted: message });

    } catch (err) {
      console.error('Deposit command error:', err);
      return reply('❌ Deposit failed due to a system error.');
    }
  }
});