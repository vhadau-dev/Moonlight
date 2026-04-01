const config = require('../../config');

// Keep this reasonable
const ReadMore = String.fromCharCode(8206).repeat(800); // Reduced to 800 as requested

// Format category names
const formatCategory = (cat) => {
  return cat.charAt(0) + cat.slice(1).toLowerCase();
};

// ✅ MENU CACHE
let cachedMenu = null;
let lastMenuUpdate = 0;
const MENU_CACHE_TTL = 60000; // 60 seconds

moon({
  name: 'menu',
  category: 'general',
  aliases: ['help'],
  description: 'Displays commands',
  cooldown: 5, // 5s cooldown for menu

  async execute(sock, jid, sender, args, m, { reply, commands }) {
    try {
      const now = Date.now();

      // ✅ RETURN CACHED MENU IF VALID
      if (cachedMenu && (now - lastMenuUpdate < MENU_CACHE_TTL)) {
        if (config.MENU_IMAGE) {
          return sock.sendMessage(jid, {
            image: { url: config.MENU_IMAGE },
            caption: cachedMenu
          }, { quoted: m });
        }
        return reply(cachedMenu);
      }

      if (!commands || typeof commands.values !== 'function') {
        return reply('❌ Command system error.');
      }

      const grouped = {};

      for (const cmd of commands.values()) {
        if (!cmd?.name) continue;

        // ❌ Skip commands with no category
        if (!cmd.category) continue;

        const cat = cmd.category.toUpperCase();

        // ❌ Hide OWNER + useless categories
        if (cat === 'OWNER' || cat === 'NO_CATEGORY') continue;

        if (!grouped[cat]) grouped[cat] = [];

        if (!grouped[cat].includes(cmd.name)) {
          grouped[cat].push(cmd.name);
        }
      }

      let text = `
╭━━━★ MOONLIGHT
│ꕥ Creator: ${config.OWNER_NAME}
│ꕥ Name   : ${config.BOT_NAME}
│ꕥ Prefix : ${config.PREFIX}
╰─────────────❖
${ReadMore}`.trim();

      for (const cat of Object.keys(grouped).sort()) {
        text += `\n\n*──[${formatCategory(cat)}*\n`;

        // ✅ ONLY ONE ">" here
        text += '> ' + grouped[cat]
          .sort()
          .map(c => `・${c}`)
          .join('  ');
      }

      // ✅ UPDATE CACHE
      cachedMenu = text;
      lastMenuUpdate = now;

      if (config.MENU_IMAGE) {
        return sock.sendMessage(jid, {
          image: { url: config.MENU_IMAGE },
          caption: text
        }, { quoted: m });
      }

      return reply(text);

    } catch (err) {
      console.error('Menu error:', err);
      return reply('❌ Failed to generate menu.');
    }
  }
}); 
