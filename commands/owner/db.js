const config = require('../../config');
const mongoose = require('mongoose');
const User = require('../../models/User');

moon({
  name: 'db',
  category: 'owner',
  description: 'Check database usage (owner only)',

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      // ---------------- OWNER CHECK (FIXED) ----------------
      const ownerNumbers = config.OWNER_NUMBERS || [];
      const senderNumber = sender.split('@')[0];

      const isOwner = ownerNumbers.includes(senderNumber);

      if (!isOwner) {
        return reply("⛔ You don't have permission for that.");
      }

      // ---------------- SETTINGS ----------------
      const MAX_USERS = 10000;

      // ---------------- DATA ----------------
      const totalUsers = await User.countDocuments({ whatsappNumber: { $ne: null } });

      // ---------------- TOTAL ECONOMY VALUE ----------------
      const users = await User.find({}, 'balance bank');

      let totalMoney = 0;

      users.forEach(u => {
        totalMoney += (u.balance || 0) + (u.bank || 0);
      });

      // ---------------- FORMAT MONEY ----------------
      function formatLargeNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + ' Trillion';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + ' Billion';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + ' Million';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toString();
      }

      // ---------------- PERCENTAGE ----------------
      const usedPercent = Math.min((totalUsers / MAX_USERS) * 100, 100);
      const leftPercent = Math.max(100 - usedPercent, 0);

      // ---------------- DB STATS ----------------
      const db = mongoose.connection.db;
      const stats = await db.stats();

      const toMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

      const text = `
🗄️ *Moonlight Database Status*

👥 *Economy Users:* ${totalUsers}

💰 *Total Economy Value:* ${formatLargeNumber(totalMoney)}

📊 *Capacity:* ${MAX_USERS} users

📈 *Space Used:* ${usedPercent.toFixed(2)}%
📉 *Space Left:* ${leftPercent.toFixed(2)}%

💾 *DB Data Size:* ${toMB(stats.dataSize)} MB
🧱 *Storage Size:* ${toMB(stats.storageSize)} MB

⚠️ Note:
"Space" is a simulated metric based on user capacity.
      `.trim();

      return reply(text);

    } catch (err) {
      console.error('DB command error:', err);
      return reply('❌ Failed to fetch database stats.');
    }
  }
});