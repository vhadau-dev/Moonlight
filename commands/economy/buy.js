const config = require('../../config');
const shopItems = require('../../data/shopItems');

moon({
  name: 'buy',
  category: 'economy',
  description: 'Buy items or stars',
  usage: '.buy <item_id> | .buy stars <amount>',

  async execute(sock, jid, sender, args, message, { reply, findOrCreateWhatsApp, pushName }) {
    try {

      if (!args[0]) {
        return reply('❌ Usage:\n.buy <item_id>\n.buy stars <amount>');
      }

      const user = await findOrCreateWhatsApp(sender, pushName);
      const balance = user.balance || 0;

      // =========================
      // ⭐ BUY STARS
      // =========================
      if (args[0].toLowerCase() === "stars") {

        const amount = parseInt(args[1]);

        if (!amount || amount <= 0) {
          return reply("❌ Usage: .buy stars <amount>");
        }

        const pricePerStar = 50000;
        const totalCost = pricePerStar * amount;

        if (balance < totalCost) {
          return reply(`❌ You need *${totalCost.toLocaleString()} coins*.\n💰 Balance: *${balance.toLocaleString()}*`);
        }

        // update
        user.balance -= totalCost;
        user.stars = (user.stars || 0) + amount;

        await user.save();

        let pfpStars;
        try {
          pfpStars = await sock.profilePictureUrl(sender, 'image');
        } catch {
          pfpStars = config.MOONLIGHT_IMAGE;
        }

        const text = `
⭐ *Stars Purchased*

✨ Amount: ${amount}
💰 Cost: ${totalCost.toLocaleString()} coins

⭐ Total Stars: ${user.stars}
💳 Balance: ${user.balance.toLocaleString()} coins
        `.trim();

        return sock.sendMessage(jid, {
          text,
          contextInfo: {
            externalAdReply: {
              title: "⭐ Moonlight Stars",
              body: "Premium currency acquired",
              thumbnailUrl: pfpStars,
              sourceUrl: "https://moonlight.com/stars",
              mediaType: 2,
              renderLargerThumbnail: false,
              showAdAttribution: false
            }
          }
        }, { quoted: message });
      }

      // =========================
      // 🛒 NORMAL SHOP ITEMS
      // =========================
      const itemId = args[0].toLowerCase();
      const item = shopItems.find(i => i.id === itemId);

      if (!item) {
        return reply('❌ Invalid item ID. Please check the shop.');
      }

      if (balance < item.price) {
        return reply(
          `❌ You need *${item.price.toLocaleString()} coins*.\n💰 Balance: *${balance.toLocaleString()}*`
        );
      }

      // deduct
      user.balance -= item.price;

      // inventory
      user.inventory = user.inventory || [];
      user.inventory.push({
        id: item.id,
        name: item.name,
        boughtAt: new Date()
      });

      await user.save();

      let pfpItem;
      try {
        pfpItem = await sock.profilePictureUrl(sender, 'image');
      } catch {
        pfpItem = config.MOONLIGHT_IMAGE;
      }

      const text = `
🛒 *Purchase Successful*

📦 Item: ${item.name}
🆔 ID: ${item.id}
💰 Price: ${item.price.toLocaleString()}

💳 Balance: ${user.balance.toLocaleString()} coins
      `.trim();

      return sock.sendMessage(jid, {
        text,
        contextInfo: {
          externalAdReply: {
            title: "🛍️ Moonlight Shop",
            body: "Item purchased successfully",
            thumbnailUrl: pfpItem,
            sourceUrl: "https://moonlight.com/shop",
            mediaType: 2,
            renderLargerThumbnail: false,
            showAdAttribution: false
          }
        }
      }, { quoted: message });

    } catch (err) {
      console.error('Buy command error:', err);
      return reply('❌ Purchase failed due to a system error.');
    }
  }
});