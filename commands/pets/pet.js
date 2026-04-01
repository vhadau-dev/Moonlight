const config = require('../../config');

// ---------------- PET IMAGES ----------------
const PET_IMAGES = {
  dog: {
    happy: "https://files.catbox.moe/7m7q7y.jpg",
    hungry: "https://files.catbox.moe/8y6v5x.jpg",
    sad: "https://files.catbox.moe/9z4w3v.jpg"
  },
  cat: {
    happy: "https://files.catbox.moe/1a2b3c.jpg",
    hungry: "https://files.catbox.moe/4d5e6f.jpg",
    sad: "https://files.catbox.moe/7g8h9i.jpg"
  }
};

// ---------------- HELPERS ----------------
function getPetImage(pet) {
  const type = pet.type?.toLowerCase() || 'dog';
  const images = PET_IMAGES[type] || PET_IMAGES.dog;
  
  if (pet.hunger < 40) return images.hungry;
  if (pet.happiness < 40) return images.sad;
  return images.happy;
}

function updatePetStatus(user) {
  if (!user.pet || !user.pet.type) return;

  const now = Date.now();
  const lastUpdate = user.updatedAt ? new Date(user.updatedAt).getTime() : now;
  const hoursPassed = Math.floor((now - lastUpdate) / (1000 * 60 * 60));

  if (hoursPassed > 0) {
    // Decay hunger and happiness by 5% per hour
    user.pet.hunger = Math.max(0, user.pet.hunger - (hoursPassed * 5));
    user.pet.happiness = Math.max(0, user.pet.happiness - (hoursPassed * 5));
  }
}

// ---------------- COMMANDS ----------------

// 1. ADOPT
moon({
  name: "adopt",
  category: "pets",
  description: "Adopt a pet (Cost: 500,000)",
  usage: ".adopt <dog|cat> <name>",
  cooldown: 10,
  async execute(sock, jid, sender, args, m, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const type = args[0]?.toLowerCase();
      const name = args.slice(1).join(" ");

      if (!["dog", "cat"].includes(type) || !name) {
        return reply("❌ Usage: .adopt <dog|cat> <name>\nExample: .adopt dog Rex");
      }

      const user = await findOrCreateWhatsApp(sender, pushName);

      if (user.pet && user.pet.type) {
        return reply(`❌ You already have a pet named *${user.pet.name}*!`);
      }

      const cost = 500000;
      if (user.balance < cost) {
        return reply(`❌ You need *500,000 coins* to adopt a pet. Your balance: ${user.balance.toLocaleString()}`);
      }

      // Deduct money and set pet
      user.balance -= cost;
      user.pet = {
        type: type,
        name: name,
        level: 1,
        xp: 0,
        hunger: 100,
        happiness: 100,
        health: 100
      };

      await user.save();

      const img = getPetImage(user.pet);
      return sock.sendMessage(jid, {
        image: { url: img },
        caption: `🎉 *Congratulations!* You have adopted a ${type} named *${name}*!\n💰 Cost: 500,000 coins`
      }, { quoted: m });

    } catch (err) {
      console.error("Adopt error:", err);
      reply("❌ Failed to adopt pet.");
    }
  }
});

// 2. PET INFO & INTERACTIONS
moon({
  name: "pet",
  category: "pets",
  description: "Manage your pet",
  usage: ".pet <info|feed|train|play|gift|sleep>",
  cooldown: 5,
  async execute(sock, jid, sender, args, m, { findOrCreateWhatsApp, reply, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      if (!user.pet || !user.pet.type) {
        return reply("❌ You don't have a pet yet! Use `.adopt <dog|cat> <name>` to get one.");
      }

      // Update status based on time passed
      updatePetStatus(user);

      const sub = args[0]?.toLowerCase() || "info";
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;

      // Interaction logic
      if (sub === "info") {
        const img = getPetImage(user.pet);
        const status = `
🐾 *PET PROFILE: ${user.pet.name.toUpperCase()}* 🐾

🧬 *Type:* ${user.pet.type}
⭐ *Level:* ${user.pet.level} (XP: ${user.pet.xp}/100)
🍗 *Hunger:* ${user.pet.hunger}%
😊 *Happiness:* ${user.pet.happiness}%
❤️ *Health:* ${user.pet.health}%

_Use .pet <feed|train|play|gift|sleep> to interact!_
        `.trim();

        return sock.sendMessage(jid, {
          image: { url: img },
          caption: status
        }, { quoted: m });
      }

      // Cooldown check for interactions
      const lastInteraction = user.pet.lastInteraction ? new Date(user.pet.lastInteraction).getTime() : 0;
      if (sub !== "info" && (now - lastInteraction < ONE_HOUR)) {
        const timeLeft = Math.ceil((ONE_HOUR - (now - lastInteraction)) / (60 * 1000));
        return reply(`⏳ *${user.pet.name}* is tired. Please wait *${timeLeft} minutes* before interacting again.`);
      }

      let msg = "";
      let xpGain = 0;

      switch (sub) {
        case "feed":
          user.pet.hunger = Math.min(100, user.pet.hunger + 30);
          user.pet.happiness = Math.min(100, user.pet.happiness + 5);
          xpGain = 10;
          msg = `😋 You fed *${user.pet.name}*! It looks happy. (+30% Hunger, +10 XP)`;
          break;
        case "train":
          if (user.pet.hunger < 30) return reply(`❌ *${user.pet.name}* is too hungry to train! Feed it first.`);
          user.pet.hunger = Math.max(0, user.pet.hunger - 20);
          user.pet.happiness = Math.max(0, user.pet.happiness - 10);
          xpGain = 25;
          msg = `💪 *${user.pet.name}* worked hard in training! (-20% Hunger, +25 XP)`;
          break;
        case "play":
          user.pet.happiness = Math.min(100, user.pet.happiness + 40);
          user.pet.hunger = Math.max(0, user.pet.hunger - 10);
          xpGain = 15;
          msg = `🎾 You played with *${user.pet.name}*! It's having a blast. (+40% Happiness, +15 XP)`;
          break;
        case "gift":
          user.pet.happiness = Math.min(100, user.pet.happiness + 50);
          xpGain = 20;
          msg = `🎁 You gave *${user.pet.name}* a special gift! (+50% Happiness, +20 XP)`;
          break;
        case "sleep":
          user.pet.health = Math.min(100, user.pet.health + 30);
          user.pet.happiness = Math.min(100, user.pet.happiness + 10);
          xpGain = 5;
          msg = `😴 *${user.pet.name}* is taking a nap. (+30% Health, +5 XP)`;
          break;
        default:
          return reply("❌ Invalid interaction. Use: .pet <feed|train|play|gift|sleep>");
      }

      // Handle Level Up
      user.pet.xp += xpGain;
      if (user.pet.xp >= 100) {
        user.pet.level += 1;
        user.pet.xp = 0;
        msg += `\n\n🎊 *LEVEL UP!* ${user.pet.name} is now level *${user.pet.level}*!`;
      }

      user.pet.lastInteraction = new Date();
      await user.save();

      const img = getPetImage(user.pet);
      return sock.sendMessage(jid, {
        image: { url: img },
        caption: msg
      }, { quoted: m });

    } catch (err) {
      console.error("Pet interaction error:", err);
      reply("❌ Failed to interact with pet.");
    }
  }
});
