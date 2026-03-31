const Card = require('../../models/Card');
const GroupSpawn = require('../../models/GroupSpawn');
const config = require('../../config');
const axios = require('axios');
const { generateCardImage } = require('../../utils/cardGenerator');

// ================= ID GENERATOR =================
function generateId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ================= CHECK SPAWN STATUS =================
async function isSpawnEnabled(jid) {
  const settings = await GroupSpawn.findOne({ jid });
  if (!settings) return true; // default ON
  return settings.enabled;
}

// ================= CARD SPAWN =================
async function spawnCard(sock, jid) {
  try {
    const enabled = await isSpawnEnabled(jid);
    if (!enabled) return;

    const randomId = Math.floor(Math.random() * 5000) + 1;
    const res = await axios.get(`https://api.jikan.moe/v4/characters/${randomId}/full`).catch(() => null);
    if (!res?.data?.data) return;

    const char = res.data.data;
    const tiers = ["1", "2", "3", "4", "5", "6"];
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    const cardId = generateId();

    const exists = await Card.findOne({ cardId });
    if (exists) return;

    const newCard = await Card.create({
      cardId,
      name: char.name,
      tier,
      atk: Math.floor(Math.random() * 5000) + 1000,
      def: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      image: char.images?.jpg?.image_url,
      description: char.about || "No description available.",
      owner: null,
      isEquipped: false,
      source: "spawn"
    });

    const cardBuffer = await generateCardImage(newCard);

    await sock.sendMessage(jid, {
      image: cardBuffer,
      caption: `🃏 *${config.BOT_NAME} SPAWN EVENT* 🃏\n\nUse *.claim ${cardId}* to collect it!`
    });

  } catch (err) {
    console.error("Spawn error:", err);
  }
}

// ================= COMMAND =================
moon({
  name: "spawn",
  category: "cards",
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const senderNumber = sender.split('@')[0];

      const isCreator = config.CARDS_CREATERS?.map(String).includes(senderNumber);
      if (!isCreator) {
        return reply("⛔ You don't have permission for that.");
      }

      // Get or create group settings
      let settings = await GroupSpawn.findOne({ jid });

      if (!settings) {
        settings = await GroupSpawn.create({
          jid,
          enabled: true
        });
      }

      const action = args[0]?.toLowerCase();

      // ================= ON =================
      if (action === "on") {
        settings.enabled = true;
        await settings.save();
        return reply("✅ Spawn enabled for this group.");
      }

      // ================= OFF =================
      if (action === "off") {
        settings.enabled = false;
        await settings.save();
        return reply("❌ Spawn disabled for this group.");
      }

      // ================= FORCE =================
      if (action === "force") {
        reply("🚀 Forcing spawn...");
        await spawnCard(sock, jid);
        return;
      }

      // ================= STATUS =================
      if (action === "status") {
        return reply(`📊 Spawn is ${settings.enabled ? "ON ✅" : "OFF ❌"}`);
      }

      return reply(
        "❓ Usage:\n" +
        ".spawn on\n" +
        ".spawn off\n" +
        ".spawn force\n" +
        ".spawn status"
      );

    } catch (err) {
      console.error("spawn command error:", err);
      reply("❌ An error occurred.");
    }
  }
});

// ================= AUTO SPAWN =================
function startAutoSpawn(sock) {
  const groupId = "120363422547731424@g.us";

  console.log("🎴 Card system started");

  setInterval(async () => {
    await spawnCard(sock, groupId);
  }, 90 * 60 * 1000);
}

module.exports = {
  spawnCard,
  startAutoSpawn
};