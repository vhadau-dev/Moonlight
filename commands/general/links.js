const config = require('../../config');

moon({
  name: "links",
  category: "general",
  description: "Show all Moonlight Haven official links",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      const text = `
┌─❖
│「 🌙 𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻 」
└┬❖ 「 🔗 𝗢𝗳𝗳𝗶𝗰𝗶𝗮𝗹 𝗟inks 」

   │✑ ꕥ *Community*
   https://chat.whatsapp.com/GQcOrQiDPcLD5XbTyx7qwJ
   │✑ ꕥ *Moonlight Domain*
   https://chat.whatsapp.com/KGg9JkttZTzJPVrg5YOE6E?mode=gi_t
   │✑ ꕥ *Moonlight Casino ( I )*
   https://chat.whatsapp.com/KAG8xDAJmYODIZPWEcntCX
   │✑ ꕥ *Moonlight Casino ( II )*
   https://chat.whatsapp.com/Eplfd933NMBHCmbAg3K21N
   │✑ ꕥ *XP Playground*
    https://chat.whatsapp.com/IcQ8s0k3pBZ3zpKuZGlB74
   │✑ ꕥ *Teenage Life Campus*
   https://chat.whatsapp.com/GaTMiuJDDtB4zJDTk6IT69

   └────────────┈ ⳹

> 🌙 Stay connected with Moonlight Haven.
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("moon cmd error:", err);
      return reply("❌ Failed to load links.");
    }
  }
});