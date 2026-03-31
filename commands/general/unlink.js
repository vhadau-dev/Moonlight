const User = require('../../models/User');

moon({
  name: "unlink",
  category: "general",
  description: "Unlink WhatsApp from Discord and reset WhatsApp data",

  async execute(sock, jid, sender, args, message, db) {
    try {
      const waUser = await db.findOrCreateWhatsApp(sender, sender.split('@')[0]);

      if (!waUser.discordId) {
        return sock.sendMessage(jid, {
          text: "❌ Your WhatsApp is not linked to any Discord account."
        });
      }

      const discordUser = await User.findOne({
        discordId: waUser.discordId
      });

      if (!discordUser) {
        waUser.discordId = null;
        await waUser.save();

        return sock.sendMessage(jid, {
          text: "⚠️ Discord account not found. WhatsApp link reset."
        });
      }

      // ---------------- SAVE ALL WA DATA TO DISCORD ----------------

      discordUser.balance = (discordUser.balance || 0) + (waUser.balance || 0);
      discordUser.bank = (discordUser.bank || 0) + (waUser.bank || 0);
      discordUser.totalEarned = (discordUser.totalEarned || 0) + (waUser.totalEarned || 0);
      discordUser.totalLost = (discordUser.totalLost || 0) + (waUser.totalLost || 0);

      if (waUser.pet?.name && !discordUser.pet?.name) {
        discordUser.pet = waUser.pet;
      }

      if (waUser.lotteryTickets) {
        discordUser.lotteryTickets =
          (discordUser.lotteryTickets || 0) + waUser.lotteryTickets;
      }

      await discordUser.save();

      // ---------------- RESET WHATSAPP USER ----------------

      waUser.discordId = null;
      waUser.balance = 10000;
      waUser.bank = 0;
      waUser.totalEarned = 0;
      waUser.totalLost = 0;
      waUser.pet = null;
      waUser.lotteryTickets = 0;
      waUser.gamblingStats = {};
      waUser.lastDaily = null;
      waUser.lastWork = null;
      waUser.lastRob = null;

      await waUser.save();

      return sock.sendMessage(jid, {
        text:
          "✅ Successfully unlinked.\n\n" +
          "📤 Your data has been saved to Discord.\n" +
          "🔄 Your WhatsApp account has been reset (starting balance: 10000)."
      });

    } catch (err) {
      console.error("Unlink error:", err);
      return sock.sendMessage(jid, {
        text: "❌ Failed to unlink due to a system error."
      });
    }
  }
});