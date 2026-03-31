const config = require('../../config');
const User = require('../../models/User');

let isResetRunning = false;

moon({
  name: "reset",
  category: "owner",
  description: "Reset all user balances to 50,000 (owner only)",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      // ---------------- OWNER CHECK ----------------
      const ownerNumbers = config.OWNER_NUMBERS || [];
      const senderNumber = sender.split('@')[0];

      if (!ownerNumbers.includes(senderNumber)) {
        return reply('❌ Only the owner can use this command.');
      }

      if (isResetRunning) {
        return reply('❌ Reset already in progress.');
      }

      isResetRunning = true;

      await reply('⚠️ Reset started... Wiping all balances & banks...');

      // ---------------- FULL RESET ----------------
      const result = await User.updateMany(
        {},
        {
          $set: {
            balance: 50000,
            bank: 0,
            totalEarned: 0,
            totalLost: 0
          }
        }
      );

      isResetRunning = false;

      const text = `
✅ *RESET COMPLETE*

👥 Users affected: ${result.modifiedCount}

💰 Wallet set to: 50,000
🏦 Bank set to: 0

📊 All earnings/loss stats reset.

⚠️ Economy fully wiped.
      `.trim();

      await sock.sendMessage(jid, { text }, { quoted: m });

    } catch (err) {
      isResetRunning = false;
      console.error("Reset command error:", err);
      await reply('❌ Reset failed due to a system error.');
    }
  }
});