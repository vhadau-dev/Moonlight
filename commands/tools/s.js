const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

moon({
  name: 's',
  category: 'tools',
  description: 'Convert an image or video to a sticker',
  usage: '.s (reply to an image or video)',
  cooldown: 5,
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const contextInfo = m.message?.extendedTextMessage?.contextInfo || 
                          m.message?.imageMessage?.contextInfo || 
                          m.message?.videoMessage?.contextInfo;
      
      const quoted = contextInfo?.quotedMessage;

      // If not a reply, check if the message itself is an image/video
      let targetMessage = quoted;
      let messageToDownload = {
        message: quoted,
        key: {
          remoteJid: jid,
          id: contextInfo?.stanzaId,
          participant: contextInfo?.participant || sender
        }
      };

      if (!quoted) {
        if (m.message?.imageMessage || m.message?.videoMessage) {
          targetMessage = m.message;
          messageToDownload = m;
        } else {
          return reply('❌ Reply to an image or video to make a sticker.');
        }
      }

      const imageMsg  = targetMessage.imageMessage;
      const videoMsg  = targetMessage.videoMessage;
      const stickerMsg = targetMessage.stickerMessage;

      if (!imageMsg && !videoMsg && !stickerMsg) {
        return reply('❌ Reply to an image, video, or sticker.');
      }

      // Download the media
      const buffer = await downloadMediaMessage(
        messageToDownload,
        'buffer',
        {},
        {
          logger: require('pino')({ level: 'silent' }),
          reuploadRequest: sock.updateMediaMessage
        }
      );

      if (!buffer) {
        return reply('❌ Failed to download media. Please try again.');
      }

      // Create and format the sticker
      const sticker = new Sticker(buffer, {
        pack: '𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻',
        author: '𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻 ✑ pack',
        type: StickerTypes.FULL,
        categories: ['🤩', '✨'],
        id: 'moonlight-sticker',
        quality: 70,
      });

      const stickerBuffer = await sticker.toBuffer();

      // Send the formatted sticker
      await sock.sendMessage(
        jid,
        { sticker: stickerBuffer },
        { quoted: m }
      );

    } catch (err) {
      console.error('Sticker cmd error:', err);
      reply('❌ Failed to create sticker. Make sure the video is short (under 10s).');
    }
  }
});
