const config = require('../../config');

const ReadMore = String.fromCharCode(8206).repeat(4001);

// Normalize JID → number
const normalizeJid = (jid) => jid.split('@')[0];

moon({
  name: 'menu',
  category: 'general',
  aliases: ['help', 'mn'],
  description: 'Displays commands',

  async execute(sock, jid, sender, args, m, { reply, commands }) {
    try {

      if (!commands || typeof commands.values !== 'function') {
        return reply('❌ Command system error.');
      }

      const senderNumber = normalizeJid(sender);
      const isOwner = config.OWNER_NUMBERS?.includes(senderNumber);
      const invoked = m.command;

      // =========================
      // 🔐 OWNER MENU (.mn)
      // =========================
      if (invoked === 'mn') {

        if (!isOwner) return;

        const grouped = {};

        for (const cmd of commands.values()) {
          if (!cmd || !cmd.name) continue;

          const cat = (cmd.category || 'NO_CATEGORY').toUpperCase();

          if (cat !== 'OWNER' && cat !== 'NO_CATEGORY') continue;

          if (!grouped[cat]) grouped[cat] = [];

          if (!grouped[cat].includes(cmd.name)) {
            grouped[cat].push(cmd.name);
          }
        }

        let text = `
╭━━━★ 𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻
│ꕥ Creater : ${config.OWNER_NAME}
│ꕥ Name : ${config.BOT_NAME}
│ꕥ Prefix : ${config.PREFIX}
└┬────────❖
${ReadMore}
`.trim();

        for (const cat of Object.keys(grouped).sort()) {
          text += `\n\n──[ *${cat}*\n`;

          grouped[cat]
            .sort()
            .forEach(c => {
              text += `> │ ${config.PREFIX}${c}\n`;
            });
        }

        return reply(text);
      }

      // =========================
      // 📜 NORMAL MENU (.menu)
      // =========================

      const grouped = {};

      for (const cmd of commands.values()) {
        if (!cmd || !cmd.name) continue;

        const cat = (cmd.category || 'NO_CATEGORY').toUpperCase();

        if (cat === 'OWNER') continue;

        if (!grouped[cat]) grouped[cat] = [];

        if (!grouped[cat].includes(cmd.name)) {
          grouped[cat].push(cmd.name);
        }
      }

      let text = `
╭━━━★ 𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻
│ꕥ Creater : ${config.OWNER_NAME}
│ꕥ Name : ${config.BOT_NAME}
│ꕥ Prefix : ${config.PREFIX}
└┬────────❖
${ReadMore}
`.trim();

      for (const cat of Object.keys(grouped).sort()) {
        text += `\n\n──[ *${cat}*\n`;

        grouped[cat]
          .sort()
          .forEach(c => {
            text += `> │ ${config.PREFIX}${c}\n`;
          });
      }

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