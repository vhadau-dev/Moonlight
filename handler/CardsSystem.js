const Card = require('../models/Card');

let activeCard = null;
global.activeCard = null;

// Spawn settings (controlled externally by your .spawn command)
let spawnSettings = {
  enabled: true
};

function setSpawnEnabled(value) {
  spawnSettings.enabled = value;
}

function isSpawnEnabled() {
  return spawnSettings.enabled;
}

/**
 * Spawn a random UNOWNED card
 */
async function spawnCard(sock, jid) {
  try {
    if (!spawnSettings.enabled) {
      console.log("⛔ Spawn is disabled.");
      return;
    }

    // Prevent multiple active spawns
    if (global.activeCard) {
      console.log("⚠️ Card already active. Skipping spawn.");
      return;
    }

    // Only unowned cards
    const cards = await Card.find({
      image: { $ne: null },
      owner: null
    });

    if (!cards.length) {
      console.log("❌ No available cards to spawn.");
      return;
    }

    const card = cards[Math.floor(Math.random() * cards.length)];

    // Mark as spawned (source tracking instead of claimedBy)
    card.source = "spawn";
    await card.save();

    global.activeCard = card;

    console.log(`🎴 Spawned card: ${card.cardId}`);

    await sock.sendMessage(jid, {
      image: { url: card.image },
      caption: `
🎴 *𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻 Card Appeared!*

⭐ *Name:* ${card.name}
🎭 *Tier:* ${card.tier}
⚔️ *ATK:* ${card.atk}
🛡️ *DEF:* ${card.def}

🔐 *ID:* ${card.cardId}

Use *.claim ${card.cardId}* to claim!
      `.trim()
    });

  } catch (err) {
    console.error("❌ spawnCard error:", err);
  }
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

    global.activeCard = null;

    return { success: true, card };

  } catch (err) {
    console.error("❌ claimCard error:", err);
    return { error: "Claim failed." };
  }
}

/**
 * Manual spawn trigger (used by your .spawn force)
 */
async function forceSpawn(sock, jid) {
  return await spawnCard(sock, jid);
}

/**
 * Controlled auto-spawn loop (ONLY runs if enabled)
 * IMPORTANT: This does NOT restart spawning after bot restart unless you call it again
 */
function startCardSystem(sock, jid) {
  console.log("🎴 Card system initialized");

  setInterval(async () => {
    if (!spawnSettings.enabled) return;
    await spawnCard(sock, jid);
  }, 60 * 60 * 1000); // every 1 hour
}

module.exports = {
  spawnCard,
  forceSpawn,
  claimCard,
  startCardSystem,
  setSpawnEnabled,
  isSpawnEnabled
};