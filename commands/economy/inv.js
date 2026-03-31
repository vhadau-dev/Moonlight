const config = require('../../config');

moon({
  name: 'inv',
  category: 'economy',
  description: 'View your inventory',

  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp, pushName }) {
    try {
      const user = await findOrCreateWhatsApp(sender, pushName);

      const ReadMore = String.fromCharCode(8206).repeat(4001);

      if (!user.inventory || user.inventory.length === 0) {
        return reply("📦 You have no items in your inventory.");
      }

      let text = `
🎒 *YOU INVENTORY*
${ReadMore}
      `.trim();

      user.inventory.forEach((item, index) => {
        text += `\n${index + 1}. ${item.name} (*${item.id}*)`;
      });

      text += `\n\n💡 Use *.use <item_id>* to use an item`;

      return reply(text);

    } catch (err) {
      console.error("Inventory command error:", err);
      return reply("❌ Failed to load inventory.");
    }
  }
});