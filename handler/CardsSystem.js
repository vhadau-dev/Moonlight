const Card = require('../models/Card');
const GroupSpawn = require('../models/GroupSpawn');
const config = require('../config');
const axios = require('axios');
const { generateCardImage } = require('../utils/cardGenerator');

// ================= ID GENERATOR =================
function generateId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Spawn a card in a specific group
 * @param {Object} sock - Baileys socket
 * @param {string} jid - Group JID
 * @param {Object} card - Optional pre-generated card to spawn the same one in multiple groups
 */
async function spawnCard(sock, jid, card = null) {
  try {
    let targetCard = card;
    
    if (!targetCard) {
      // Fetch random character from Jikan API
      const randomId = Math.floor(Math.random() * 5000) + 1;
      const res = await axios.get(`https://api.jikan.moe/v4/characters/${randomId}/full`).catch(() => null);
      if (!res?.data?.data) return null;

      const char = res.data.data;
      const tiers = ["1", "2", "3", "4", "5", "6"];
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const cardId = generateId();

      const exists = await Card.findOne({ cardId });
      if (exists) return null;

      targetCard = await Card.create({
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
    }

    // Generate the card image
    const cardBuffer = await generateCardImage(targetCard);

    // Send the card to the group
    await sock.sendMessage(jid, {
      image: cardBuffer,
      caption: `🃏 *${config.BOT_NAME} SPAWN EVENT* 🃏\n\nUse *.claim ${targetCard.cardId}* to collect it!`
    });

    return targetCard;

  } catch (err) {
    console.error(`[CardsSystem] Spawn error in ${jid}:`, err);
    return null;
  }
}

/**
 * Automatically spawns cards in all enabled groups every 35 minutes.
 */
function startCardSystem(sock) {
  console.log("🎴 Card Auto-Spawn System started (Interval: 35m)");

  setInterval(async () => {
    try {
      // Find all groups that have spawning enabled in database/group.json (via GroupSpawn model)
      const enabledGroups = await GroupSpawn.find({ enabled: true });
      
      if (enabledGroups.length === 0) {
        console.log("[CardsSystem] No groups have spawning enabled. Skipping.");
        return;
      }

      console.log(`[CardsSystem] Spawning cards in ${enabledGroups.length} groups...`);

      let spawnedCard = null;
      for (const group of enabledGroups) {
        // Spawn the SAME card in all groups for this interval
        spawnedCard = await spawnCard(sock, group.jid, spawnedCard);
      }
    } catch (err) {
      console.error("[CardsSystem] Error in auto-spawn interval:", err);
    }
  }, 35 * 60 * 1000); // 35 minutes
}

/**
 * Claim a card
 */
async function claimCard(cardId, userId) {
  try {
    const card = await Card.findOne({ cardId });

    if (!card) return { error: "Card not found." };

    if (card.owner) {
      return { error: "This card has already been claimed." };
    }

    card.owner = userId;
    card.claimedAt = new Date();
    card.source = "claimed";

    await card.save();

    return { success: true, card };

  } catch (err) {
    console.error("[CardsSystem] Claim failed:", err);
    return { error: "Claim failed." };
  }
}

module.exports = {
  spawnCard,
  startCardSystem,
  claimCard
};
