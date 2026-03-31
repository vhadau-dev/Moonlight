const { downloadMediaMessage } = require('@whiskeysockets/baileys');

moon({
  name: 's',
  category: 'tools',
  description: 'Convert an image or video to a sticker',
  usage: '.s (reply to an image or video)',
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted) {
        return reply('❌ Reply to an image or video to make a sticker.');
      }

      const imageMsg  = quoted.imageMessage;
      const videoMsg  = quoted.videoMessage;
      const stickerMsg = quoted.stickerMessage;

      if (!imageMsg && !videoMsg && !stickerMsg) {
        return reply('❌ Reply to an image, video, or sticker.');
      }

      // Download the media
      const buffer = await downloadMediaMessage(
        {
          message: quoted,
          key: m.key
        },
        'buffer',
        {},
        {
          logger: require('pino')({ level: 'silent' }),
          reuploadRequest: sock.updateMediaMessage
        }
      );

      // Send as sticker with MOONLIGHT branding
      await sock.sendMessage(
        jid,
        {
          sticker:  buffer,
          packname: '𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻',
          author:   '𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻 ✑ pack'
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('Sticker cmd error:', err);
      reply('❌ Failed to create sticker.');
    }
  }
});
