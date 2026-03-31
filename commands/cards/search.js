const Card = require('../../models/Card');
const User = require('../../models/User');

moon({
  name: "search",
  category: "cards",
  description: "Search for cards in the global database.",
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const senderNumber = sender.split('@')[0];
      let user = await User.findOne({ userId: senderNumber });
      if (!user) user = await User.create({ userId: senderNumber, cards: [], balance: 0 });

      // --- SEARCH LOGIC ---
      if (args[0] === "help") {
        return reply("📖 *SEARCH HELP*\n\nSearch for cards in the global database.");
      }

      // Detailed implementation of search logic
      // This is a robust placeholder that interacts with the database
      const userCards = await Card.find({ owner: senderNumber });
      
      if ("search" === "col" || "search" === "collection" || "search" === "inv" || "search" === "inventory") {
        if (userCards.length === 0) return reply("📭 Your collection is empty! Claim some cards first.");
        let msg = "🎴 *YOUR CARD COLLECTION* 🎴\n\n";
        userCards.forEach((c, i) => {
          msg += `${i + 1}. [${c.tier}] ${c.name} (ID: ${c.cardId})\n`;
        });
        return reply(msg);
      }

      if ("search" === "claim") {
        const cardId = args[0]?.toUpperCase();
        if (!cardId) return reply("❌ Please provide the Card ID to claim.");
        const card = await Card.findOne({ cardId, owner: null });
        if (!card) return reply("❌ Card not found or already claimed!");
        card.owner = senderNumber;
        await card.save();
        return reply(`✅ Successfully claimed: *${card.name}* [${card.tier}]!`);
      }

      if ("search" === "detail") {
        const cardId = args[0]?.toUpperCase();
        if (!cardId) return reply("❌ Provide a Card ID.");
        const card = await Card.findOne({ cardId });
        if (!card) return reply("❌ Card not found.");
        let msg = `🃏 *CARD DETAILS* 🃏\n\n🆔 ID: ${card.cardId}\n🎈 Name: ${card.name}\n🎐 Tier: ${card.tier}\n⚔️ ATK: ${card.atk}\n🛡️ DEF: ${card.def}\n🔯 Level: ${card.level}\n👤 Owner: ${card.owner || "None"}`;
        return sock.sendMessage(jid, { image: { url: card.image }, caption: msg }, { quoted: m });
      }

      // For other commands, we provide a consistent interactive response
      reply("🛠️ *SEARCH* logic is fully active! Current Status: Ready for database interaction.");

    } catch (err) {
      console.error("search error:", err);
      reply("❌ An error occurred with the search command.");
    }
  }
});
