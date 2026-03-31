const User = require('../../models/User');

moon({
  name: 'link',
  category: 'general',
  description: 'Link WhatsApp account to Discord (persistent & real-time)',

  async execute(sock, jid, sender, args, m, db) {
    const code = args[0]?.toUpperCase();

    if (!code) {
      return sock.sendMessage(jid, {
        text: '❌ Usage: .link <code>'
      });
    }

    try {
      // Find Discord user by valid code
      const discordUser = await User.findOne({
        linkCode: code,
        linkCodeExpiry: { $gt: new Date() }
      });

      if (!discordUser) {
        return sock.sendMessage(jid, {
          text: '❌ Invalid or expired linking code.'
        });
      }

      // Find WhatsApp user (same collection)
      let waUser = await User.findOne({ whatsappNumber: sender });

      // If not exists, create one
      if (!waUser) {
        waUser = new User({
          whatsappNumber: sender,
          username: sender.split('@')[0]
        });
      }

      // 🔴 Already linked check
      if (waUser.discordId) {
        return sock.sendMessage(jid, {
          text:
            '❌ This WhatsApp account is already linked to a Discord account.\n' +
            'Use .unlink first before linking again.'
        });
      }

      // ---------------- MERGE DATA ----------------

      discordUser.balance = (discordUser.balance || 0) + (waUser.balance || 0);
      discordUser.bank = (discordUser.bank || 0) + (waUser.bank || 0);
      discordUser.totalEarned = (discordUser.totalEarned || 0) + (waUser.totalEarned || 0);
      discordUser.totalLost = (discordUser.totalLost || 0) + (waUser.totalLost || 0);

      // Pet
      if (waUser.pet?.name && !discordUser.pet?.name) {
        discordUser.pet = waUser.pet;
      }

      // Lottery
      if (waUser.lotteryTickets) {
        discordUser.lotteryTickets =
          (discordUser.lotteryTickets || 0) + waUser.lotteryTickets;
      }

      // Gambling stats
      if (waUser.gamblingStats) {
        discordUser.gamblingStats = discordUser.gamblingStats || {};
        for (const key in waUser.gamblingStats) {
          discordUser.gamblingStats[key] =
            (discordUser.gamblingStats[key] || 0) + waUser.gamblingStats[key];
        }
      }

      // Cooldowns
      if (waUser.lastDaily && (!discordUser.lastDaily || waUser.lastDaily > discordUser.lastDaily)) {
        discordUser.lastDaily = waUser.lastDaily;
      }
      if (waUser.lastWork && (!discordUser.lastWork || waUser.lastWork > discordUser.lastWork)) {
        discordUser.lastWork = waUser.lastWork;
      }
      if (waUser.lastRob && (!discordUser.lastRob || waUser.lastRob > discordUser.lastRob)) {
        discordUser.lastRob = waUser.lastRob;
      }

      // Clear link code
      discordUser.linkCode = undefined;
      discordUser.linkCodeExpiry = undefined;

      // ---------------- LINK IDENTITIES ----------------

      // 🔴 CRITICAL: keep BOTH identities on the same document
      discordUser.whatsappNumber = sender;

      await discordUser.save();

      // Optional: remove old WA-only record if it exists separately
      if (waUser._id.toString() !== discordUser._id.toString()) {
        await User.deleteOne({ _id: waUser._id });
      }

      return sock.sendMessage(jid, {
        text:
          '✅ *Linked Successfully*\n\n' +
          'Your WhatsApp and Discord accounts are now connected.\n' +
          'Your data is now synchronized in real time.'
      });

    } catch (err) {
      console.error('❌ Link error:', err);

      return sock.sendMessage(jid, {
        text: `❌ Linking failed:\n${err.message}`
      });
    }
  }
});