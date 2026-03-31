const config = require('../../config');

moon({
  name: 'mods',
  category: 'general',
  description: 'Show Moonlight Haven guardians',

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      if (!config.GUARDS) {
        return reply("❌ No guardians configured in config.js");
      }

      const guardNumbers = config.GUARDS
        .split(',')
        .map(n => n.trim())
        .filter(Boolean);

      const mentions = guardNumbers.map(n => n + '@s.whatsapp.net');

      const guards = guardNumbers
        .map(n => `✦ @${n}`)
        .join('\n');

      const caption = `
*「 🌙 𝓜𝓸𝓸𝓷𝓵𝓲𝓰𝓱𝓽 𝓗𝓪𝓿𝓮𝓷 」*

⳹─❖「 👑 𝗚𝘂𝗮𝗿𝗱𝗶𝗮𝗻𝘀 」❖─⳹
${guards}

⳹─❖────「⚔️ 」────❖─⳹

> ⚠️ Use this command only when necessary.  
> Repeated usage may lead to restrictions.Don't tell us you where just testing
> Or where will test the .kick cmd on you
      `.trim();

      // ✅ Reply to the caller message (this prevents "broadcast/spawn feel")
      if (config.MOONLIGHT_IMAGE) {
        await sock.sendMessage(jid, {
          image: { url: config.MOONLIGHT_IMAGE },
          caption,
          mentions
        }, { quoted: m }); // 🔥 IMPORTANT
      } else {
        await sock.sendMessage(jid, {
          text: caption,
          mentions
        }, { quoted: m }); // 🔥 IMPORTANT
      }

    } catch (err) {
      console.error("Mods command error:", err);
      reply("❌ Failed to load guardians.");
    }
  }
});