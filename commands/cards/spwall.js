const GroupSpawn = require('../../models/GroupSpawn');
const Card = require('../../models/Card');
const config = require('../../config');
const axios = require('axios');

// ================= ID GENERATOR =================
function generateId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ================= SPAWN LOGIC =================
async function spawnCard(sock, jid) {
  try {
    const randomId = Math.floor(Math.random() * 5000) + 1;

    const res = await axios.get(`https://api.jikan.moe/v4/characters/${randomId}/full`)
      .catch(() => null);

    if (!res?.data?.data) return;

    const char = res.data.data;

    const tiers = ["C", "B", "A", "S"];
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    const cardId = generateId();

    const exists = await Card.findOne({ cardId });
    if (exists) return;

    const newCard = await Card.create({
      cardId,
      name: char.name,
      tier,
      atk: Math.floor(Math.random() * 1000) + 500,
      def: Math.floor(Math.random() * 1000) + 500,
      level: 1,
      image: char.images?.jpg?.image_url,
      description: char.about || "No description",
      owner: null,
      isEquipped: false,
      source: "spawn"
    });

    await sock.sendMessage(jid, {
      image: { url: newCard.image },
      caption:
        `🃏 *SPAWN EVENT* 🃏\n\n` +
        `🆔 ID: ${cardId}\n` +
        `🎈 Name: ${newCard.name}\n` +
        `🎐 Tier: ${tier}\n\n` +
        `Use *.claim ${cardId}* to collect!`
    });

  } catch (err) {
    console.error("Spawn error:", err);
  }
}

// ================= CMD =================
moon({
  name: "spwall",
  category: "cards",
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const senderNumber = sender.split('@')[0];

      // ✅ Creator check
      const isCreator = config.CARDS_CREATERS?.map(String).includes(senderNumber);
      if (!isCreator) {
        return reply("❌ Only Card Creators can use this command.");
      }

      // Get all enabled groups
      const groups = await GroupSpawn.find({ enabled: true });

      if (!groups.length) {
        return reply("❌ No groups have spawning enabled.");
      }

      reply(`🚀 Spawning cards in ${groups.length} enabled group(s)...`);

      let success = 0;

      for (const g of groups) {
        try {
          await spawnCard(sock, g.jid);
          success++;
        } catch (err) {
          console.error(`Failed spawning in ${g.jid}`, err);
        }
      }

      reply(`✅ Spawn complete in ${success}/${groups.length} groups.`);

    } catch (err) {
      console.error("spwall error:", err);
      reply("❌ An error occurred.");
    }
  }
});