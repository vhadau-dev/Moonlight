const { downloadMediaMessage } = require('@whiskeysockets/baileys');

moon({
  name: "s",
  category: "tools",
  description: "Convert image to sticker",
  usage: ".s (reply to image)",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted) {
        return reply("❌ Reply to an image.");
      }

      const imageMsg =
        quoted.imageMessage ||
        quoted.stickerMessage;

      if (!imageMsg) {
        return reply("❌ Reply to an image or sticker.");
      }

      // ✅ Download media correctly (NEW WAY)
      const buffer = await downloadMediaMessage(
        {
          message: quoted,
          key: m.key
        },
        "buffer",
        {},
        {
          logger: require("pino")({ level: "silent" }),
          reuploadRequest: sock.updateMediaMessage
        }
      );

      // ✅ Send sticker (NO EMBED)
      await sock.sendMessage(jid, {
        sticker: buffer,
        packname: "𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻 ✑ pack",
        author: sender.split('@')[0]
      }, { quoted: m });

    } catch (err) {
      console.error("Sticker cmd error:", err);
      reply("❌ Failed to create sticker.");
    }
  }
});